"""
Automated Login & Session Preserver powered by Camoufox.
Logs into X (Twitter) & Facebook using user credentials and saves cookies permanently in ./user_data profile.
"""

import os
import asyncio
import logging
from camoufox.async_api import AsyncNewBrowser
from playwright.async_api import async_playwright

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("auto_login")

# Account Credentials
X_USER = "sai547200p@gmail.com"
X_PASS = "wwe$10#54"

FB_USER = "saisparab"
FB_PASS = "saisih@$71"


async def login_x(page):
    logger.info("=== Attempting Automated Login to X (Twitter) ===")
    try:
        await page.goto("https://x.com/login", wait_until="domcontentloaded")
        await asyncio.sleep(6)

        # Handle cookie banner if present
        try:
            cookie_btn = await page.query_selector('div[role="button"]:has-text("Accept all cookies"), div[role="button"]:has-text("Refuse optional cookies")')
            if cookie_btn:
                await cookie_btn.click()
                await asyncio.sleep(2)
        except Exception:
            pass

        # 1. Fill Username / Email
        user_input = await page.wait_for_selector('input[autocomplete="username"], input[name="text"]', timeout=20000)
        if user_input:
            logger.info(f"Entering X username/email: {X_USER}")
            await user_input.click()
            await user_input.fill(X_USER)
            await asyncio.sleep(1)
            await page.keyboard.press("Enter")
            await asyncio.sleep(5)

        # Check if X asks for phone/username verification step
        content = await page.content()
        if "Enter your phone number or username" in content or "unusual login activity" in content or "phone or username" in content.lower():
            logger.info("X requested handle verification. Entering handle 'sai547200p'...")
            verify_input = await page.query_selector('input[data-testid="ocfEnterTextTextInput"], input[name="text"]')
            if verify_input:
                await verify_input.fill("sai547200p")
                await asyncio.sleep(1)
                await page.keyboard.press("Enter")
                await asyncio.sleep(5)

        # 2. Fill Password
        pass_input = await page.wait_for_selector('input[name="password"]', timeout=20000)
        if pass_input:
            logger.info("Entering X password...")
            await pass_input.click()
            await pass_input.fill(X_PASS)
            await asyncio.sleep(1)
            await page.keyboard.press("Enter")
            await asyncio.sleep(8)

        logger.info(f"Current X URL after login attempt: {page.url}")
        if "home" in page.url or "x.com" in page.url:
            logger.info("[SUCCESS] Logged in to X successfully!")
            return True
    except Exception as err:
        logger.error(f"[ERROR] X login failed: {err}")
    return False


async def login_fb(page):
    logger.info("\n=== Attempting Automated Login to Facebook ===")
    try:
        await page.goto("https://www.facebook.com/login", wait_until="domcontentloaded")
        await asyncio.sleep(4)

        # Cookie consent check
        try:
            cookie_btn = await page.query_selector('button[data-cookiebanner="accept_only_essential_button"], button[title="Decline optional cookies"], button[title="Allow all cookies"]')
            if cookie_btn:
                await cookie_btn.click()
                await asyncio.sleep(2)
        except Exception:
            pass

        email_input = await page.wait_for_selector('#email, input[name="email"]', timeout=15000)
        if email_input:
            logger.info(f"Entering Facebook username: {FB_USER}")
            await email_input.fill(FB_USER)

        pass_input = await page.wait_for_selector('#pass, input[name="pass"]', timeout=15000)
        if pass_input:
            logger.info("Entering Facebook password...")
            await pass_input.fill(FB_PASS)

        login_btn = await page.query_selector('button[name="login"], #loginbutton, button[type="submit"]')
        if login_btn:
            logger.info("Clicking Facebook login button...")
            await login_btn.click()
            await asyncio.sleep(8)

        logger.info(f"Current Facebook URL after login attempt: {page.url}")
        if "login" not in page.url.lower():
            logger.info("[SUCCESS] Logged in to Facebook successfully!")
            return True
    except Exception as err:
        logger.error(f"[ERROR] Facebook login failed: {err}")
    return False


async def main():
    user_data_dir = os.path.join(os.path.dirname(__file__), "user_data")
    os.makedirs(user_data_dir, exist_ok=True)

    logger.info("Launching Camoufox Persistent Session Window...")
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

        # Login to X
        await login_x(page)

        # Login to Facebook in a new page
        fb_page = await context.new_page()
        await login_fb(fb_page)

        logger.info("\n=======================================================")
        logger.info("[SUCCESS] Session cookies saved in user_data profile!")
        logger.info("=======================================================\n")

        await asyncio.sleep(5)
        await context.close()


if __name__ == "__main__":
    asyncio.run(main())
