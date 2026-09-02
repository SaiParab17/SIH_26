"""
Resilient Interactive Camoufox Browser Launcher.
Launches visible Camoufox anti-detect browser with persistent ./user_data context directory.
Leaves browser open for 5 minutes so you can navigate and log in manually without script interruption.
"""

import os
import asyncio
import logging
from camoufox.async_api import AsyncNewBrowser
from playwright.async_api import async_playwright

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("camoufox_interactive")


async def main():
    user_data_dir = os.path.join(os.path.dirname(__file__), "user_data")
    os.makedirs(user_data_dir, exist_ok=True)

    print("\n=======================================================================")
    print("=== CAMOUFOX ANTI-DETECT BROWSER - MANUAL INTERACTIVE SESSION       ===")
    print("=======================================================================")
    print(" Opening visible browser context.")
    print(f" Session profile directory: {user_data_dir}")
    print(" All authenticated cookies will be saved permanently for scraping!")
    print("=======================================================================\n")

    async with async_playwright() as p:
        browser = await AsyncNewBrowser(
            p,
            headless=False,
            persistent_context=True,
            user_data_dir=user_data_dir,
            viewport={"width": 1280, "height": 850},
            locale="en-US",
            humanize=0.8,
        )

        context = browser if hasattr(browser, "pages") else await browser.new_context()
        page = context.pages[0] if context.pages else await context.new_page()

        # Open X.com safely
        logger.info("Opening https://x.com ...")
        try:
            await page.goto("https://x.com", timeout=30000)
        except Exception as e:
            logger.info(f"Initial navigation status: {e}")

        # Open Facebook safely in a second tab
        logger.info("Opening https://www.facebook.com in second tab...")
        try:
            fb_page = await context.new_page()
            await fb_page.goto("https://www.facebook.com", timeout=30000)
        except Exception as e:
            logger.info(f"Facebook navigation status: {e}")

        print("\n[READY] Camoufox browser window is live!")
        print("Please log in to your accounts manually in the browser window now.")
        print("Keeping window open for 5 minutes (300 seconds)...\n")

        for remaining in range(300, 0, -15):
            logger.info(f"Browser active... ({remaining}s remaining for manual login)")
            await asyncio.sleep(15)

        logger.info("\n[SUCCESS] Preserving session cookies in ./user_data...")
        await context.close()


if __name__ == "__main__":
    asyncio.run(main())
