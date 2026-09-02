"""
Facebook Collector implementation.
Implements BaseSocialCollector using Playwright and BrowserManager.
Enforces ITEM-COUNT target loops for public Facebook pages, controlled scrolling, and safe wall handling.
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
from app.facebook.selectors import FacebookSelectors
from app.facebook.parser import FacebookParser
from app.facebook.normalizer import normalize_facebook_post

logger = logging.getLogger("facebook_collector")


class FacebookCollector(BaseSocialCollector):
    """Collector for public Facebook content."""

    def __init__(self, headless: bool = True, timeout_ms: int = 30000):
        super().__init__(platform_name="facebook", headless=headless, timeout_ms=timeout_ms)
        self.browser_mgr = BrowserManager(headless=headless, use_camoufox=False, timeout_ms=timeout_ms, platform_name="facebook")
        self.deduplicator = Deduplicator()

    def use_existing_session(self, browser_mgr: BrowserManager, page: Any) -> None:
        """Reuse an already open BrowserManager and page session."""
        self.browser_mgr = browser_mgr
        self.page = page
        self.session_active = True
        self.is_external_session = True

    async def start_session(self) -> None:
        """Launch browser context if not already active."""
        if self.session_active and self.page and not self.page.is_closed():
            return
        logger.info("Starting Facebook collector session...")
        _, self.page = await self.browser_mgr.launch()
        self.session_active = True

    async def close_session(self) -> None:
        """Close browser session unless shared across multi-platform run."""
        if getattr(self, "is_external_session", False):
            logger.info("Skipping Facebook session close (shared active session).")
            return
        if self.browser_mgr:
            await self.browser_mgr.close()
        self.session_active = False

    async def search_or_discover(self, query: str, sort: str = "recent") -> bool:
        """Navigate to public Facebook search page using authenticated session."""
        if not self.session_active or not self.page:
            await self.start_session()

        try:
            # Go to home first to ensure session is active
            logger.info("Opening Facebook home feed to verify session...")
            await self.page.goto("https://www.facebook.com/", wait_until="domcontentloaded")
            await self.browser_mgr.pace(2.0)

            # Check if hit login wall
            if "login" in self.page.url.lower():
                logger.warning("Facebook session is not authenticated. Please run: python setup_platform_sessions.py facebook")
                return False

            # Navigate to Facebook search
            encoded_query = urllib.parse.quote(query)
            search_url = f"https://www.facebook.com/search/posts/?q={encoded_query}"
            logger.info(f"Navigating to Facebook search URL: {search_url}")
            await self.page.goto(search_url, wait_until="domcontentloaded")
            await self.browser_mgr.pace(4.0)  # Give React time to render posts

            # Initial scroll to trigger lazy content loading
            await self.page.evaluate("window.scrollBy(0, 300)")
            await self.browser_mgr.pace(1.5)
            await self.page.evaluate("window.scrollBy(0, -300)")
            await self.browser_mgr.pace(1.0)

            page_title = await self.page.title()
            logger.info(f"FB search page title: {page_title}")
            return True
        except Exception as err:
            logger.error(f"Error navigating to Facebook search: {err}")
            return False

    async def collect_posts(
        self,
        query: str,
        target_count: int = 1000,
        max_pages: int = 100,
        comments_per_post: int = 5,
        job_status: Optional[CollectionJobStatus] = None,
    ) -> List[CanonicalSocialEvent]:
        """
        Collect public Facebook posts up to target_count valid unique items.
        Item-count target loop with controlled scrolling and loop detection.
        """
        events: List[CanonicalSocialEvent] = []

        success = await self.search_or_discover(query)
        if not success:
            if job_status:
                job_status.status = "blocked"
                job_status.message = "Access restricted: Facebook requires authentication or private context for guest session."
            return events

        if job_status:
            job_status.status = "running"
            job_status.message = f"Collecting public Facebook posts for query '{query}'..."

        page_count = 0
        consecutive_no_change = 0
        last_seen_count = 0

        while self.deduplicator.count() < target_count and page_count < max_pages:
            page_count += 1
            logger.info(f"Facebook scroll iteration {page_count}/{max_pages} (Items: {self.deduplicator.count()}/{target_count})")

            try:
                post_elements = await self.page.query_selector_all(FacebookSelectors.POST_CONTAINER)
                if job_status:
                    job_status.discovered += len(post_elements)

                for elem in post_elements:
                    if self.deduplicator.count() >= target_count:
                        break

                    try:
                        html = await elem.inner_html()
                        raw_post = FacebookParser.parse_post_html(html)
                        if not raw_post:
                            continue

                        if job_status:
                            job_status.fetched += 1

                        post_id = raw_post["post_id"]
                        if self.deduplicator.is_duplicate(f"fb_post_{post_id}"):
                            if job_status:
                                job_status.duplicates += 1
                            continue

                        # Normalize
                        event = normalize_facebook_post(raw_post, query=query)
                        if self.deduplicator.mark_seen(event.event_id):
                            events.append(event)
                            if job_status:
                                job_status.unique_valid += 1
                                job_status.update_progress()

                    except Exception as parse_err:
                        logger.warning(f"Error parsing Facebook post element: {parse_err}")
                        if job_status:
                            job_status.failed += 1

                # Check progress
                current_count = self.deduplicator.count()
                if current_count == last_seen_count:
                    consecutive_no_change += 1
                    if consecutive_no_change >= 4:
                        logger.info("No new Facebook items discovered after 4 consecutive scrolls. Ending collection loop.")
                        break
                else:
                    consecutive_no_change = 0
                    last_seen_count = current_count

                # Scroll down
                await self.page.evaluate("window.scrollBy(0, 800)")
                await self.browser_mgr.pace(1.2)

            except Exception as scroll_err:
                logger.error(f"Error during Facebook scroll loop: {scroll_err}")
                break

        # Final status check
        if job_status:
            if self.deduplicator.count() >= target_count:
                job_status.status = "completed"
                job_status.message = f"Successfully collected target {target_count} valid unique Facebook posts."
            elif self.deduplicator.count() > 0:
                job_status.status = "partial"
                job_status.message = f"Collected partial result of {self.deduplicator.count()} valid unique Facebook posts (target was {target_count})."
            else:
                job_status.status = "blocked"
                job_status.message = "No Facebook items could be retrieved from guest public discovery interface."

        return events

    async def collect_comments(
        self,
        post_url: str,
        parent_event_id: str,
        limit: int = 5,
    ) -> List[CanonicalSocialEvent]:
        """Collect public comments for a specific Facebook post URL."""
        comments: List[CanonicalSocialEvent] = []
        if not self.page:
            return comments

        try:
            await self.page.goto(post_url, wait_until="domcontentloaded")
            await self.browser_mgr.pace(2.0)

            # Scroll to trigger comment loading
            await self.page.evaluate("window.scrollBy(0, 600)")
            await self.browser_mgr.pace(1.5)

            # Try multiple comment selectors
            comment_elements = []
            for sel in [
                'div[aria-label*="Comment"]',
                'ul[aria-label*="Comment"] > li',
                'div[data-testid*="comment"]',
            ]:
                comment_elements = await self.page.query_selector_all(sel)
                if comment_elements:
                    logger.info(f"Found {len(comment_elements)} comments with selector: {sel}")
                    break

            for elem in comment_elements[:limit]:
                try:
                    html = await elem.inner_html()
                    raw_comment = FacebookParser.parse_post_html(html, is_comment=True, parent_post_id=parent_event_id)
                    if raw_comment:
                        event = normalize_facebook_post(raw_comment)
                        if self.deduplicator.mark_seen(event.event_id):
                            comments.append(event)
                except Exception as ce:
                    logger.warning(f"Error parsing FB comment element: {ce}")

        except Exception as err:
            logger.warning(f"Error collecting comments for Facebook post {post_url}: {err}")

        return comments


    def normalize(self, raw_item: Dict[str, Any], event_type: str = "post") -> CanonicalSocialEvent:
        """Convert raw dict to CanonicalSocialEvent."""
        return normalize_facebook_post(raw_item)

    async def close_session(self) -> None:
        """Close browser resources."""
        await self.browser_mgr.close()
        self.session_active = False
