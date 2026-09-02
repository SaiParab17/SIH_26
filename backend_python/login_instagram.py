"""
Interactive Instagram 3-Minute Login Setup Script.
Launches Playwright Chromium with persistent user profile in 'user_data/instagram'.
Gives the user 3 minutes to log into Instagram and saves cookies/session automatically.
"""

import os
import sys
import time
import asyncio

# Ensure UTF-8 output encoding for Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from playwright.async_api import async_playwright

USER_DATA_DIR = os.path.join(os.path.dirname(__file__), "user_data", "shared_chrome")

async def main():
    print("=" * 70)
    print("[Instagram Login Setup] Playwright Chromium Session Setup")
    print("=" * 70)
    print(f"Profile Storage Directory: {USER_DATA_DIR}")
    print("Launching visible Chromium browser... Please complete your Instagram login.")
    print("=" * 70)

    os.makedirs(USER_DATA_DIR, exist_ok=True)

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=False,
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            locale="en-US",
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
            ignore_default_args=["--enable-automation"],
        )

        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        """)

        page = context.pages[0] if context.pages else await context.new_page()
        await page.goto("https://www.instagram.com/accounts/login/", wait_until="domcontentloaded")

        total_seconds = 600
        start_time = time.time()

        print("\n[INFO] You have 10 minutes (600 seconds) to receive your code and log in on the opened Chromium window...")

        while True:
            elapsed = int(time.time() - start_time)
            remaining = total_seconds - elapsed

            if remaining <= 0:
                break

            current_url = page.url.lower()
            if (
                "instagram.com" in current_url
                and "login" not in current_url
                and "emailsignup" not in current_url
                and "recaptcha" not in current_url
                and "auth_platform" not in current_url
                and "challenge" not in current_url
                and "password" not in current_url
                and "reset" not in current_url
            ):
                print(f"\n[SUCCESS] Detected logged-in Instagram session! (URL: {page.url[:60]})")
                break

            sys.stdout.write(f"\r[TIMER] Time remaining: {remaining}s | Page: {current_url[:55]}...   ")
            sys.stdout.flush()
            await asyncio.sleep(2)

        print("\n\n[INFO] Saving persistent Instagram login session cookies...")
        await context.close()
        print("[SUCCESS] Done! Instagram session saved to 'user_data/instagram'. Future scraping will use this login!")

if __name__ == "__main__":
    asyncio.run(main())
