"""
Platform Session Setup Helper for One-Time Logins.
Launches Camoufox for a specific social platform (X, Facebook, Instagram, Reddit).
Saves session cookies into an isolated directory: ./user_data/<platform_name>
You only need to log in ONCE per platform!
"""

import sys
import os
import asyncio
import logging
from camoufox.async_api import AsyncNewBrowser
from playwright.async_api import async_playwright

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("platform_session_setup")

PLATFORM_URLS = {
    "x": "https://x.com/login",
    "facebook": "https://www.facebook.com/login",
    "instagram": "https://www.instagram.com/accounts/login/",
    "reddit": "https://www.reddit.com/login",
    "youtube": "https://www.youtube.com",
}


async def setup_platform(platform: str):
    platform_key = platform.lower().strip()
    target_url = PLATFORM_URLS.get(platform_key, f"https://www.{platform_key}.com")

    base_dir = os.path.join(os.path.dirname(__file__), "user_data")
    profile_dir = os.path.join(base_dir, platform_key)
    os.makedirs(profile_dir, exist_ok=True)

    print("\n=======================================================================")
    print(f"=== CAMOUFOX ONE-TIME SESSION SETUP FOR: {platform_key.upper()} ===")
    print("=======================================================================")
    print(f" Target Login URL : {target_url}")
    print(f" Profile Directory: {profile_dir}")
    print(" Log in once in the opened window. Session will be saved permanently!")
    print("=======================================================================\n")

    async with async_playwright() as p:
        browser = await AsyncNewBrowser(
            p,
            headless=False,
            persistent_context=True,
            user_data_dir=profile_dir,
            viewport={"width": 1280, "height": 850},
            locale="en-US",
            humanize=0.8,
        )

        context = browser if hasattr(browser, "pages") else await browser.new_context()
        page = context.pages[0] if context.pages else await context.new_page()

        logger.info(f"Navigating to {target_url} ...")
        try:
            await page.goto(target_url, timeout=30000)
        except Exception as err:
            logger.info(f"Navigation status: {err}")

        print(f"\n[READY] Camoufox window is open for {platform_key.upper()}!")
        print("Log in to your account. Keeping window active for 3 minutes (180s)...\n")

        for remaining in range(180, 0, -15):
            logger.info(f"[{platform_key.upper()} Session Active] ({remaining}s remaining to log in)")
            await asyncio.sleep(15)

        logger.info(f"[SUCCESS] Cookies and local state saved in ./user_data/{platform_key}")
        await context.close()


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "x"
    asyncio.run(setup_platform(target))
