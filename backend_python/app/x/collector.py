"""
X (Twitter) Collector implementation.
Implements BaseSocialCollector using Playwright and BrowserManager.
Enforces ITEM-COUNT target loops, controlled scrolling, and safe access wall handling.
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
from app.x.selectors import XSelectors
from app.x.parser import XParser
from app.x.normalizer import normalize_x_tweet

logger = logging.getLogger("x_collector")


class XCollector(BaseSocialCollector):
    """Collector for public X (Twitter) content."""

    def __init__(self, headless: bool = True, timeout_ms: int = 30000):
        super().__init__(platform_name="x", headless=headless, timeout_ms=timeout_ms)
        self.browser_mgr = BrowserManager(headless=headless, use_camoufox=False, timeout_ms=timeout_ms, platform_name="x")
        self.deduplicator = Deduplicator()
        self.page = None

    def use_existing_session(self, browser_mgr: BrowserManager, page: Any) -> None:
        """Reuse an already open BrowserManager and page session."""
        self.browser_mgr = browser_mgr
        self.page = page
        self.session_active = True
        self.is_external_session = True

    async def start_session(self) -> None:
        """Launch Chromium browser context if not already active."""
        if self.session_active and self.page and not self.page.is_closed():
            return
        logger.info("Starting X (Twitter) Playwright Chromium collector session...")
        _, self.page = await self.browser_mgr.launch()
        self.session_active = True

    async def close_session(self) -> None:
        """Close browser session unless shared across multi-platform run."""
        if getattr(self, "is_external_session", False):
            logger.info("Skipping X session close (shared active session).")
            return
        if self.browser_mgr:
            await self.browser_mgr.close()
        self.session_active = False

    async def search_or_discover(self, query: str, sort: str = "recent") -> bool:
        """Navigate to X search results using the search box (forces React client-side routing)."""
        if not self.session_active or not self.page:
            await self.start_session()

        try:
            logger.info("Opening X home feed...")
            await self.page.goto("https://x.com/home", wait_until="domcontentloaded")
            await self.browser_mgr.pace(3.0)

            if "login" in self.page.url.lower():
                logger.warning("X session not authenticated — please re-run setup_platform_sessions.py x")
                return False

            # Use the correct search input selector (data-testid confirmed via live DOM)
            search_input = await self.page.query_selector(XSelectors.SEARCH_INPUT)
            if search_input:
                logger.info(f"Searching for: '{query}' via search box")
                await search_input.click()
                await self.browser_mgr.pace(0.5)
                await search_input.fill(query)
                await self.browser_mgr.pace(0.5)
                await self.page.keyboard.press("Enter")
                logger.info("Search submitted via search box")
            else:
                # Fallback: direct URL
                encoded_query = urllib.parse.quote(query)
                fallback_url = f"https://x.com/search?q={encoded_query}&src=typed_query"
                logger.warning(f"Search box not found — using goto fallback: {fallback_url}")
                await self.page.goto(fallback_url, wait_until="domcontentloaded")

            # Give X time to make API calls and render search results (longer than before)
            await self.browser_mgr.pace(8.0)

            page_title = await self.page.title()
            logger.info(f"Search page: '{page_title}' | {self.page.url}")

            # Try clicking the "Latest" tab to get real-time tweets
            try:
                latest_tab = await self.page.query_selector('a[href*="f=live"], [role="tab"]:has-text("Latest")')
                if latest_tab:
                    await latest_tab.click()
                    logger.info("Clicked 'Latest' tab for real-time results")
                    await self.browser_mgr.pace(3.0)
            except Exception:
                pass

            if "login" in self.page.url.lower():
                logger.warning("X search hit login wall.")
                return False

            return True

        except Exception as err:
            logger.error(f"Error during X search: {err}")
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
        Collect public tweets up to target_count valid unique items.
        Item-count target loop with controlled scrolling and loop detection.
        """
        events: List[CanonicalSocialEvent] = []

        need_navigate = (
            not self.page
            or "x.com" not in self.page.url
            or "/search" not in self.page.url
        )
        if need_navigate:
            success = await self.search_or_discover(query)
            if not success:
                if job_status:
                    job_status.status = "blocked"
                    job_status.message = "Access restricted: X requires user authentication for this query."
                return events

        # Initial scroll to trigger React content loading
        await self.page.evaluate("window.scrollBy(0, 200)")
        await self.browser_mgr.pace(1.5)
        await self.page.evaluate("window.scrollBy(0, -200)")
        await self.browser_mgr.pace(1.0)

        if job_status:
            job_status.status = "running"
            job_status.message = f"Collecting public tweets for query '{query}'..."

        page_count = 0
        consecutive_no_change = 0
        last_seen_count = 0

        while self.deduplicator.count() < target_count and page_count < max_pages:
            page_count += 1
            logger.info(f"Page scroll iteration {page_count}/{max_pages} (Items: {self.deduplicator.count()}/{target_count})")

            # Extract tweet articles currently in DOM
            try:
                tweet_elements = await self.page.query_selector_all(XSelectors.TWEET_ARTICLE)
                if job_status:
                    job_status.discovered += len(tweet_elements)

                new_found_in_iteration = 0
                for elem in tweet_elements:
                    if self.deduplicator.count() >= target_count:
                        break

                    try:
                        html = await elem.inner_html()
                        raw_tweet = XParser.parse_tweet_html(html)
                        if not raw_tweet:
                            continue

                        if job_status:
                            job_status.fetched += 1

                        tweet_id = raw_tweet["tweet_id"]
                        if self.deduplicator.is_duplicate(f"x_post_{tweet_id}"):
                            if job_status:
                                job_status.duplicates += 1
                            continue

                        # Normalize
                        event = normalize_x_tweet(raw_tweet, query=query)
                        if self.deduplicator.mark_seen(event.event_id):
                            events.append(event)
                            new_found_in_iteration += 1
                            if job_status:
                                job_status.unique_valid += 1
                                job_status.update_progress()

                    except Exception as parse_err:
                        logger.warning(f"Error parsing tweet element: {parse_err}")
                        if job_status:
                            job_status.failed += 1

                # Check progress
                current_count = self.deduplicator.count()
                if current_count == last_seen_count:
                    consecutive_no_change += 1
                    if consecutive_no_change >= 5:
                        logger.info("No new items discovered after 5 consecutive scrolls. Ending collection loop.")
                        break
                else:
                    consecutive_no_change = 0
                    last_seen_count = current_count

                # Scroll down
                await self.page.evaluate("window.scrollBy(0, 800)")
                await self.browser_mgr.pace(1.0)

            except Exception as scroll_err:
                logger.error(f"Error during scroll loop: {scroll_err}")
                break

        # Final status check
        if job_status:
            if self.deduplicator.count() >= target_count:
                job_status.status = "completed"
                job_status.message = f"Successfully collected target {target_count} valid unique items."
            elif self.deduplicator.count() > 0:
                job_status.status = "partial"
                job_status.message = f"Collected partial result of {self.deduplicator.count()} valid unique items (target was {target_count})."
            else:
                job_status.status = "blocked"
                job_status.message = "No items could be retrieved from X search interface."

        return events

    async def collect_comments(
        self,
        post_url: str,
        parent_event_id: str,
        limit: int = 5,
    ) -> List[CanonicalSocialEvent]:
        """Collect top-level comments/replies for a specific tweet URL."""
        comments: List[CanonicalSocialEvent] = []
        if not self.page:
            return comments

        try:
            await self.page.goto(post_url, wait_until="domcontentloaded")

            # Wait for React to mount tweet articles — try each selector variant
            mounted = False
            for selector in [
                'article[data-testid="tweet"]',
                'div[data-testid="cellInnerFrame"]',
                'article',
            ]:
                try:
                    await self.page.wait_for_selector(selector, timeout=12000)
                    mounted = True
                    break
                except Exception:
                    continue

            if not mounted:
                # Final fallback: just wait a bit and hope
                await self.browser_mgr.pace(3.0)

            # Scroll slightly to trigger lazy-load of replies
            await self.page.evaluate("window.scrollBy(0, 400)")
            await self.browser_mgr.pace(1.5)

            reply_elements = await self.page.query_selector_all(XSelectors.TWEET_ARTICLE)
            logger.info(f"Found {len(reply_elements)} elements on thread page {post_url}")

            # Skip first element (the main post itself)
            for elem in reply_elements[1: limit + 1]:
                html = await elem.inner_html()
                raw_tweet = XParser.parse_tweet_html(html, is_reply=True, parent_tweet_id=parent_event_id)
                if raw_tweet:
                    event = normalize_x_tweet(raw_tweet)
                    if self.deduplicator.mark_seen(event.event_id):
                        comments.append(event)
        except Exception as err:
            logger.warning(f"Error collecting comments for tweet {post_url}: {err}")

        return comments


    def normalize(self, raw_item: Dict[str, Any], event_type: str = "post") -> CanonicalSocialEvent:
        """Convert raw dict to CanonicalSocialEvent."""
        return normalize_x_tweet(raw_item)

    async def close_session(self) -> None:
        """Close browser resources."""
        await self.browser_mgr.close()
        self.session_active = False
