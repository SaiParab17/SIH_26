"""
Browser Manager module.
Wraps Playwright launcher behind a clean interface with support for CDP connection to your running Chrome
and persistent local profile for live web scraping.
"""

import os
import logging
import asyncio
from typing import Tuple, Optional, Any
from playwright.async_api import async_playwright, Playwright, Browser, BrowserContext, Page

logger = logging.getLogger("browser_manager")

try:
    from camoufox.async_api import AsyncNewBrowser
except ImportError:  # pragma: no cover - optional dependency on non-Camoufox setups
    AsyncNewBrowser = None


class BrowserManager:
    """Manages Playwright and Camoufox browser lifecycle with isolated platform persistent contexts."""

    def __init__(
        self,
        headless: Optional[bool] = None,
        use_camoufox: bool = True,
        timeout_ms: int = 75000,
        pacing_delay_ms: int = 3500,
        cdp_url: str = "http://localhost:9222",
        platform_name: Optional[str] = None,
        user_data_dir: Optional[str] = None,
    ):
        env_headless = os.getenv("HEADLESS", "false").lower()
        self.headless = env_headless == "true" if headless is None else headless
        env_use_camoufox = os.getenv("USE_CAMOUFOX", "true").strip().lower() != "false"
        self.use_camoufox = True if use_camoufox else env_use_camoufox
        self.browser_backend = "camoufox"
        self.timeout_ms = timeout_ms
        self.pacing_delay_ms = pacing_delay_ms
        self.cdp_url = os.getenv("CHROME_CDP_URL", cdp_url)
        self.platform_name = platform_name or "default"

        base_data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "user_data")
        if user_data_dir:
            self.user_data_dir = user_data_dir
        elif platform_name:
            self.user_data_dir = os.path.join(base_data_dir, platform_name)
        else:
            self.user_data_dir = os.getenv("CHROME_USER_DATA_DIR", base_data_dir)

        self._playwright: Optional[Playwright] = None
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None

    async def launch(self) -> Tuple[BrowserContext, Page]:
        """Launch or attach to browser session for live scraping."""
        self._playwright = await async_playwright().start()

        if self.use_camoufox:
            return await self._launch_camoufox()

        # 1. Try attaching to existing logged-in Chrome via CDP on port 9222
        try:
            logger.info(f"Attempting connection to active Chrome via CDP ({self.cdp_url})...")
            self._browser = await self._playwright.chromium.connect_over_cdp(self.cdp_url, timeout=5000)
            contexts = self._browser.contexts
            self._context = contexts[0] if contexts else await self._browser.new_context()
            pages = self._context.pages
            self._page = pages[0] if pages else await self._context.new_page()
            self._page.set_default_timeout(self.timeout_ms)
            logger.info("Successfully connected to active logged-in Chrome session via CDP!")
            return self._context, self._page
        except Exception as cdp_err:
            logger.info(f"CDP connection unavailable ({cdp_err}). Launching persistent Chromium profile...")

        # 2. Launch persistent local profile
        os.makedirs(self.user_data_dir, exist_ok=True)
        self._context = await self._playwright.chromium.launch_persistent_context(
            user_data_dir=self.user_data_dir,
            headless=self.headless,
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            locale="en-US",
            args=["--disable-blink-features=AutomationControlled"],
        )
        pages = self._context.pages
        self._page = pages[0] if pages else await self._context.new_page()
        self._page.set_default_timeout(self.timeout_ms)
        return self._context, self._page

    async def _launch_camoufox(self) -> Tuple[BrowserContext, Page]:
        if AsyncNewBrowser is None:
            raise RuntimeError("Camoufox is not installed in this environment.")

        logger.info("Launching Camoufox browser for live anti-bot social scraping...")
        os.makedirs(self.user_data_dir, exist_ok=True)
        self._browser = await AsyncNewBrowser(
            self._playwright,
            headless=self.headless,
            persistent_context=True,
            user_data_dir=self.user_data_dir,
            viewport={"width": 1280, "height": 800},
            locale="en-US",
            humanize=0.8,
        )

        if isinstance(self._browser, BrowserContext):
            self._context = self._browser
        else:
            self._context = await self._browser.new_context()

        pages = self._context.pages
        self._page = pages[0] if pages else await self._context.new_page()
        self._page.set_default_timeout(self.timeout_ms)
        logger.info("Camoufox browser session created successfully.")
        return self._context, self._page

    async def pace(self, multiplier: float = 1.0) -> None:
        """Apply configurable pacing delay between browser actions."""
        delay = (self.pacing_delay_ms / 1000.0) * multiplier
        await asyncio.sleep(delay)

    async def close(self) -> None:
        """Safely close context, browser, and playwright instance."""
        try:
            if self._page and not self._page.is_closed():
                await self._page.close()
            if self._context and not self._context.is_closed():
                await self._context.close()
            if self._browser and getattr(self._browser, "close", None) and not isinstance(self._browser, BrowserContext):
                await self._browser.close()
            if self._playwright:
                await self._playwright.stop()
        except Exception as err:
            logger.warning(f"Error during browser teardown: {err}")
        finally:
            self._page = None
            self._context = None
            self._browser = None
            self._playwright = None
