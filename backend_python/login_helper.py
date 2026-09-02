"""
Interactive Login Helper for X (Twitter) & Facebook.
Launches Camoufox Anti-Detect Browser with persistent ./user_data profile.
Pre-fills your provided credentials and keeps the browser open to save your session cookies permanently!
"""

import asyncio
import os
import logging
from camoufox.async_api import AsyncNewBrowser
from playwright.async_api import async_playwright

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("login_helper")

X_USER = "sai547200p@gmail.com"
X_PASS = "wwe$10#54"

FB_USER = "saisparab"
FB_PASS = "saiaih@$71"


async def main():
    user_data_dir = os.path.join(os.path.dirname(__file__), "user_data")
    os.makedirs(user_data_dir, exist_ok=True)

    print("\n=======================================================")
    print("[LOGIN HELPER] Opening Camoufox Anti-Detect Browser Window")
    print(f"X (Twitter) Login Account: {X_USER}")
    print(f"Facebook Login Account   : {FB_USER}")
    print("Your login cookies will be saved in ./user_data permanently.")
    print("=======================================================\n")

    async with async_playwright() as p:
        browser = await AsyncNewBrowser(
            p,
            headless=False,
            persistent_context=True,
            user_data_dir=user_data_dir,
            viewport={"width": 1280, "height": 800},
            locale="en-US",
            humanize=0.8,
        )

        context = browser if hasattr(browser, "pages") else await browser.new_context()
        page = context.pages[0] if context.pages else await context.new_page()

        # 1. Navigate to X
        logger.info("Opening X (Twitter) login page: https://x.com/login")
        await page.goto("https://x.com/login", wait_until="domcontentloaded")
        await asyncio.sleep(4)

        try:
            user_elem = await page.query_selector('input[autocomplete="username"], input[name="text"]')
            if user_elem:
                await user_elem.fill(X_USER)
                logger.info("Filled X username.")
        except Exception as e:
            logger.warning(f"Note: {e}")

        # 2. Open new tab for Facebook
        logger.info("Opening Facebook login page: https://www.facebook.com/login")
        fb_page = await context.new_page()
        await fb_page.goto("https://www.facebook.com/login", wait_until="domcontentloaded")
        await asyncio.sleep(3)

        try:
            email_elem = await fb_page.query_selector('#email, input[name="email"]')
            pass_elem = await fb_page.query_selector('#pass, input[name="pass"]')
            if email_elem:
                await email_elem.fill(FB_USER)
            if pass_elem:
                await pass_elem.fill(FB_PASS)
            logger.info("Filled Facebook credentials.")
        except Exception as e:
            logger.warning(f"Note: {e}")

        print("\n[INFO] Camoufox window is open! Completing login and saving session...")
        print("Waiting 40 seconds to finalize session...\n")
        await asyncio.sleep(40)

        print("[SUCCESS] Session cookies saved successfully in ./user_data!")
        await context.close()


if __name__ == "__main__":
    asyncio.run(main())
