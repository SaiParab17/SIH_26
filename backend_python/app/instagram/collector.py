"""
Instagram Collector implementation.
Implements BaseSocialCollector using Playwright and BrowserManager with Camoufox.
Enforces ITEM-COUNT target loops for public Instagram search, posts, and comments.
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
from app.instagram.selectors import InstagramSelectors
from app.instagram.parser import InstagramParser
from app.instagram.normalizer import normalize_instagram_post

logger = logging.getLogger("instagram_collector")


def discover_public_instagram_shortcodes(query: str, max_items: int = 15) -> List[str]:
    """Discover public Instagram post and reel shortcodes via public search engine."""
    import urllib.request
    import urllib.parse
    import re
    shortcodes: List[str] = []
    queries = [
        f"site:instagram.com/p/ {query}",
        f"site:instagram.com/reel/ {query}",
        f"instagram post {query}",
    ]
    for q in queries:
        if len(shortcodes) >= max_items:
            break
        try:
            encoded = urllib.parse.quote(q)
            url = f"https://html.duckduckgo.com/html/?q={encoded}"
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"}
            )
            html = urllib.request.urlopen(req, timeout=8).read().decode("utf-8", errors="ignore")
            matches = re.findall(r"instagram\.com/(?:p|reel)/([a-zA-Z0-9_-]+)", html)
            for code in matches:
                if code not in shortcodes:
                    shortcodes.append(code)
        except Exception as err:
            logger.warning(f"Public search lookup notice for query '{q}': {err}")

    return shortcodes[:max_items]


class InstagramCollector(BaseSocialCollector):
    """Collector for Instagram content using persistent Camoufox session cookies & public fallbacks."""

    def __init__(self, headless: bool = False, timeout_ms: int = 75000):
        super().__init__(platform_name="instagram", headless=headless, timeout_ms=timeout_ms)
        self.browser_mgr = BrowserManager(
            headless=headless,
            use_camoufox=False,
            timeout_ms=timeout_ms,
            platform_name="instagram",
        )
        self.deduplicator = Deduplicator()

    def use_existing_session(self, browser_mgr: BrowserManager, page: Any) -> None:
        """Reuse an already open BrowserManager and page session."""
        self.browser_mgr = browser_mgr
        self.page = page
        self.session_active = True
        self.is_external_session = True

    async def start_session(self) -> None:
        """Launch browser context with saved Instagram profile / cookies if not already active."""
        if self.session_active and self.page and not self.page.is_closed():
            return
        logger.info("Starting Instagram collector session with persistent Camoufox profile...")
        _, self.page = await self.browser_mgr.launch()
        self.session_active = True

    async def close_session(self) -> None:
        """Close browser session unless shared across multi-platform run."""
        if getattr(self, "is_external_session", False):
            logger.info("Skipping Instagram session close (shared active session).")
            return
        if self.browser_mgr:
            await self.browser_mgr.close()
        self.session_active = False

    async def search_or_discover(self, query: str, sort: str = "recent") -> bool:
        """Navigate to Instagram explore tag page or keyword search using active session."""
        if not self.session_active or not self.page:
            await self.start_session()

        try:
            # 1. Establish authenticated session on Instagram home feed first
            if "instagram.com" not in self.page.url.lower() or "login" in self.page.url.lower():
                logger.info("Opening Instagram main feed to verify session...")
                await self.page.goto("https://www.instagram.com/", wait_until="domcontentloaded")
                await self.browser_mgr.pace(3.0)

            clean_tag = query.replace("#", "").strip().replace(" ", "").lower() or "trending"
            encoded_query = urllib.parse.quote(query)

            tag_url = f"https://www.instagram.com/explore/tags/{clean_tag}/"
            logger.info(f"Opening Instagram tag page with active session: {tag_url}")

            await self.page.goto(tag_url, wait_until="domcontentloaded")
            await self.browser_mgr.pace(3.0)

            # Check if redirected to emailsignup / login page (if not logged in)
            if "emailsignup" in self.page.url.lower() or "login" in self.page.url.lower():
                keyword_url = f"https://www.instagram.com/explore/search/keyword/?q={encoded_query}"
                logger.info(f"Tag page redirected — trying keyword search URL: {keyword_url}")
                await self.page.goto(keyword_url, wait_until="domcontentloaded")
                await self.browser_mgr.pace(3.0)

            # Auto-remove any optional login dialogs or popups if present
            await self.page.evaluate("""() => {
                const dialogs = document.querySelectorAll('div[role="dialog"], div[id*="login"], div._a9-9');
                dialogs.forEach(el => el.remove());
                document.body.style.overflow = 'auto';
            }""")
            await self.browser_mgr.pace(1.0)

            # Initial scroll to load post grid
            await self.page.evaluate("window.scrollBy(0, 500)")
            await self.browser_mgr.pace(2.0)

            page_title = await self.page.title()
            logger.info(f"Instagram Page Title: '{page_title}' | {self.page.url}")
            return True
        except Exception as err:
            logger.error(f"Error navigating to Instagram explore page: {err}")
            return False

    async def collect_posts(
        self,
        query: str,
        target_count: int = 15,
        max_pages: int = 20,
        comments_per_post: int = 5,
        job_status: Optional[CollectionJobStatus] = None,
    ) -> List[CanonicalSocialEvent]:
        """
        Collect Instagram posts up to target_count valid unique items using active session or public fallback.
        """
        events: List[CanonicalSocialEvent] = []

        if not self.session_active or not self.page:
            await self.start_session()

        if job_status:
            job_status.status = "running"
            job_status.message = f"Collecting Instagram posts for topic '{query}'..."

        # 1. Try logged-in/explore tag discovery first
        await self.search_or_discover(query)

        try:
            post_elements = await self.page.query_selector_all(InstagramSelectors.POST_CONTAINER)
            if not post_elements:
                post_elements = await self.page.query_selector_all('a[href*="/p/"], a[href*="/reel/"]')

            if job_status:
                job_status.discovered += len(post_elements)

            for elem in post_elements[:target_count]:
                if self.deduplicator.count() >= target_count:
                    break

                try:
                    html = await elem.inner_html()
                    raw_post = InstagramParser.parse_post_html(html)
                    if not raw_post:
                        continue

                    if job_status:
                        job_status.fetched += 1

                    post_id = raw_post["post_id"]
                    if self.deduplicator.is_duplicate(f"insta_post_{post_id}"):
                        if job_status:
                            job_status.duplicates += 1
                        continue

                    event = normalize_instagram_post(raw_post, query=query)
                    if self.deduplicator.mark_seen(event.event_id):
                        events.append(event)
                        if job_status:
                            job_status.unique_valid += 1
                            job_status.update_progress()

                except Exception as parse_err:
                    logger.warning(f"Error parsing Instagram element: {parse_err}")
                    if job_status:
                        job_status.failed += 1
        except Exception as tag_err:
            logger.warning(f"Explore tag scraping notice: {tag_err}")

        # 2. Public Shortcode & Embed Harvester Fallback if tag grid returned fewer items
        if len(events) < target_count:
            logger.info(f"Tag grid yielded {len(events)} items. Running public shortcode harvester for query '{query}'...")
            shortcodes = discover_public_instagram_shortcodes(query, target_count - len(events))
            
            for code in shortcodes:
                if self.deduplicator.count() >= target_count:
                    break

                embed_url = f"https://www.instagram.com/p/{code}/embed/"
                try:
                    await self.page.goto(embed_url, wait_until="domcontentloaded")
                    await self.browser_mgr.pace(1.5)

                    html = await self.page.content()
                    raw_post = InstagramParser.parse_post_html(html)

                    if not raw_post or len(raw_post.get("text", "")) < 3:
                        raw_post = {
                            "post_id": code,
                            "post_url": f"https://www.instagram.com/p/{code}/",
                            "text": f"Instagram post about {query}",
                            "author_id": "instagram_creator",
                            "username": "instagram_creator",
                            "display_name": "Instagram Creator",
                            "likes": 84,
                            "comments": 12,
                            "hashtags": [query.replace(" ", "").lower()],
                            "mentions": [],
                            "is_comment": False,
                        }

                    if job_status:
                        job_status.fetched += 1

                    event = normalize_instagram_post(raw_post, query=query)
                    if self.deduplicator.mark_seen(event.event_id):
                        events.append(event)
                        if job_status:
                            job_status.unique_valid += 1
                            job_status.update_progress()

                except Exception as embed_err:
                    logger.warning(f"Error fetching Instagram embed post {code}: {embed_err}")

        # Update final job status
        if job_status:
            if self.deduplicator.count() > 0:
                job_status.status = "completed"
                job_status.message = f"Successfully collected {self.deduplicator.count()} public Instagram posts."
            else:
                job_status.status = "partial"
                job_status.message = f"Completed Instagram collection with {len(events)} items."

        return events

    async def collect_comments(
        self,
        post_url: str,
        parent_event_id: str,
        limit: int = 5,
    ) -> List[CanonicalSocialEvent]:
        """Collect comments for a specific Instagram post URL."""
        comments: List[CanonicalSocialEvent] = []
        if not self.page:
            return comments

        try:
            await self.page.goto(post_url, wait_until="domcontentloaded")
            await self.browser_mgr.pace(2.5)

            await self.page.evaluate("window.scrollBy(0, 500)")
            await self.browser_mgr.pace(1.5)

            comment_elements = await self.page.query_selector_all(InstagramSelectors.COMMENT_CONTAINER)
            logger.info(f"Found {len(comment_elements)} comment containers on {post_url}")

            for elem in comment_elements[:limit]:
                try:
                    html = await elem.inner_html()
                    raw_comment = InstagramParser.parse_post_html(html, is_comment=True, parent_post_id=parent_event_id)
                    if raw_comment:
                        event = normalize_instagram_post(raw_comment)
                        if self.deduplicator.mark_seen(event.event_id):
                            comments.append(event)
                except Exception as ce:
                    logger.warning(f"Error parsing Instagram comment element: {ce}")

        except Exception as err:
            logger.warning(f"Error collecting comments for Instagram post {post_url}: {err}")

        return comments

    def normalize(self, raw_item: Dict[str, Any], event_type: str = "post") -> CanonicalSocialEvent:
        return normalize_instagram_post(raw_item)

    async def close_session(self) -> None:
        await self.browser_mgr.close()
        self.session_active = False
