"""
Instagram Login Helper Script
Launches headful Camoufox browser with persistent profile for 3 minutes
allowing the user to log in and save session cookies locally.
"""

import os
import sys
import time
import asyncio
import logging
from playwright.async_api import async_playwright
from camoufox.async_api import AsyncNewBrowser

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("instagram_login")

USER_DATA_DIR = os.path.join(os.path.dirname(__file__), "user_data", "instagram")
os.makedirs(USER_DATA_DIR, exist_ok=True)

async def main():
    print("\n" + "="*70)
    print(" INSTAGRAM CAMOUFOX LOGIN SESSION (3 MINUTES)")
    print("="*70)
    print(f"Profile Storage Path: {USER_DATA_DIR}")
    print("Opening headful Camoufox browser to Instagram Login page...")
    print("Please enter your Instagram credentials and log in.")
    print("All session cookies and state will be saved locally for automated scraping.")
    print("="*70 + "\n")

    async with async_playwright() as p:
        # Launch headful browser with persistent profile directory
        try:
            context = await p.firefox.launch_persistent_context(
                user_data_dir=USER_DATA_DIR,
                headless=False,
                viewport={"width": 1280, "height": 800},
                args=["--no-sandbox"]
            )
        except Exception:
            # Fallback to Camoufox engine
            context = await AsyncNewBrowser(
                p,
                headless=False,
                persistent_context=True,
                user_data_dir=USER_DATA_DIR
            )

        page = context.pages[0] if context.pages else await context.new_page()
        page.set_default_timeout(60000)

        logger.info("Navigating to Instagram Login page: https://www.instagram.com/accounts/login/")
        await page.goto("https://www.instagram.com/accounts/login/", wait_until="domcontentloaded")

        duration_seconds = 180  # 3 minutes
        start_time = time.time()

        while True:
            elapsed = int(time.time() - start_time)
            remaining = duration_seconds - elapsed
            if remaining <= 0:
                break

            mins = remaining // 60
            secs = remaining % 60
            print(f"\rTime remaining to log in & save cookies: {mins:02d}m {secs:02d}s (Keep browser open)...", end="", flush=True)
            await asyncio.sleep(2)

        print("\n\n" + "="*70)
        print(" SUCCESS: 3 minutes elapsed. Saving Instagram cookies and profile...")
        print("="*70 + "\n")

        await context.close()
        logger.info("Instagram login profile saved successfully!")

if __name__ == "__main__":
    asyncio.run(main())
