"""
Reddit Collector implementation.
Implements BaseSocialCollector using Playwright and BrowserManager (Camoufox engine).
Enforces ITEM-COUNT target loops for public search posts and comment extraction.
"""

import logging
import asyncio
import urllib.parse
from typing import List, Dict, Any, Optional
from app.core.base_collector import BaseSocialCollector
from app.core.browser_manager import BrowserManager
from app.core.deduplicator import Deduplicator
from app.core.job_manager import CollectionJobStatus
from app.models.social_event import CanonicalSocialEvent
from app.reddit.selectors import RedditSelectors
from app.reddit.parser import RedditParser
from app.reddit.normalizer import normalize_reddit_post, normalize_reddit_comment

logger = logging.getLogger("reddit_collector")


class RedditCollector(BaseSocialCollector):
    """Collector for public Reddit content via Camoufox."""

    def __init__(self, headless: bool = True, timeout_ms: int = 30000):
        super().__init__(platform_name="reddit", headless=headless, timeout_ms=timeout_ms)
        self.browser_mgr = BrowserManager(headless=headless, timeout_ms=timeout_ms, platform_name="reddit")
        self.deduplicator = Deduplicator()

    async def start_session(self) -> None:
        """Launch browser context."""
        logger.info("Starting Reddit collector session...")
        _, self.page = await self.browser_mgr.launch()
        self.session_active = True

    async def search_or_discover(self, query: str, sort: str = "recent") -> bool:
        """Navigate to Reddit public search."""
        if not self.session_active or not self.page:
            await self.start_session()

        encoded_query = urllib.parse.quote(query)
        search_url = f"https://old.reddit.com/search?q={encoded_query}&sort=new"
        logger.info(f"Navigating to Reddit search URL: {search_url}")

        try:
            response = await self.page.goto(search_url, wait_until="domcontentloaded")
            await self.browser_mgr.pace(1.5)
            return response is not None and response.status < 400
        except Exception as err:
            logger.error(f"Error navigating to Reddit search: {err}")
            return False

    async def collect_posts(
        self,
        query: str,
        target_count: int = 20,
        max_pages: int = 10,
        comments_per_post: int = 3,
        job_status: Optional[CollectionJobStatus] = None,
    ) -> List[CanonicalSocialEvent]:
        """Collect public posts up to target_count valid unique items."""
        events: List[CanonicalSocialEvent] = []

        success = await self.search_or_discover(query)
        if not success:
            if job_status:
                job_status.status = "blocked"
                job_status.message = "Failed to access Reddit search interface."
            return events

        if job_status:
            job_status.status = "running"
            job_status.message = f"Collecting public Reddit posts for query '{query}'..."

        page_count = 0
        while self.deduplicator.count() < target_count and page_count < max_pages:
            page_count += 1
            logger.info(f"Reddit page iteration {page_count}/{max_pages} (Items: {self.deduplicator.count()}/{target_count})")

            try:
                post_elements = await self.page.query_selector_all(RedditSelectors.POST_CONTAINER)
                if job_status:
                    job_status.discovered += len(post_elements)

                for elem in post_elements:
                    if self.deduplicator.count() >= target_count:
                        break

                    try:
                        html = await elem.inner_html()
                        raw_post = RedditParser.parse_post_html(html)
                        if not raw_post:
                            continue

                        if job_status:
                            job_status.fetched += 1

                        post_id = raw_post["post_id"]
                        if self.deduplicator.is_duplicate(f"reddit_post_{post_id}"):
                            if job_status:
                                job_status.duplicates += 1
                            continue

                        event = normalize_reddit_post(raw_post, query=query)
                        if self.deduplicator.mark_seen(event.event_id):
                            events.append(event)
                            if job_status:
                                job_status.unique_valid += 1
                                job_status.update_progress()

                    except Exception as parse_err:
                        logger.warning(f"Error parsing Reddit post element: {parse_err}")
                        if job_status:
                            job_status.failed += 1

                # Find next page link if target not reached
                if self.deduplicator.count() < target_count:
                    next_btn = await self.page.query_selector('a[rel*="next"]')
                    if next_btn:
                        await next_btn.click()
                        await self.browser_mgr.pace(2.0)
                    else:
                        logger.info("No next page link found on Reddit. Ending scroll loop.")
                        break

            except Exception as page_err:
                logger.error(f"Error during Reddit pagination loop: {page_err}")
                break

        return events

    async def collect_comments(
        self,
        post_url: str,
        parent_event_id: str,
        limit: int = 3,
    ) -> List[CanonicalSocialEvent]:
        """Collect top-level comments for a given Reddit post URL."""
        comments: List[CanonicalSocialEvent] = []
        if not self.page:
            return comments

        try:
            # Ensure old.reddit URL for fast DOM parsing
            target_url = post_url.replace("www.reddit.com", "old.reddit.com")
            await self.page.goto(target_url, wait_until="domcontentloaded")
            await self.browser_mgr.pace(1.0)

            comment_elements = await self.page.query_selector_all(RedditSelectors.COMMENT_CONTAINER)
            for elem in comment_elements[:limit]:
                try:
                    html = await elem.inner_html()
                    raw_comment = RedditParser.parse_comment_html(html, parent_post_id=parent_event_id)
                    if raw_comment:
                        event = normalize_reddit_comment(raw_comment, post_url=target_url)
                        if self.deduplicator.mark_seen(event.event_id):
                            comments.append(event)
                except Exception as c_err:
                    logger.warning(f"Error parsing comment element: {c_err}")

        except Exception as err:
            logger.warning(f"Error collecting comments for Reddit post {post_url}: {err}")

        return comments

    def normalize(self, raw_item: Dict[str, Any], event_type: str = "post") -> CanonicalSocialEvent:
        """Convert raw dict to CanonicalSocialEvent."""
        if event_type == "comment":
            return normalize_reddit_comment(raw_item)
        return normalize_reddit_post(raw_item)

    async def close_session(self) -> None:
        """Close browser resources."""
        await self.browser_mgr.close()
        self.session_active = False
