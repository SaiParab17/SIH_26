"""
Unified 3-Minute Login Setup Script for Facebook, Instagram & X (Twitter).
Launches a single Playwright Chromium browser with shared profile 'user_data/shared_chrome'.
Opens all 3 platforms in separate tabs in ONE browser window for easy 3-minute login!
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
    print("[Unified Social Login Setup] Single Playwright Chromium Session")
    print("=" * 70)
    print(f"Shared Profile Directory: {USER_DATA_DIR}")
    print("Launching ONE visible Chromium browser window with tabs for Facebook, Instagram & X...")
    print("=" * 70)

    os.makedirs(USER_DATA_DIR, exist_ok=True)

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=False,
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            locale="en-US",
            args=["--disable-blink-features=AutomationControlled"],
        )

        page_fb = context.pages[0] if context.pages else await context.new_page()
        page_insta = await context.new_page()
        page_x = await context.new_page()

        print("\n[INFO] Opening tabs for Facebook, Instagram, and X...")
        await page_fb.goto("https://www.facebook.com/", wait_until="domcontentloaded")
        await page_insta.goto("https://www.instagram.com/accounts/login/", wait_until="domcontentloaded")
        await page_x.goto("https://x.com/i/flow/login", wait_until="domcontentloaded")

        total_seconds = 180
        start_time = time.time()

        print("\n[INFO] You have 3 minutes (180 seconds) to log in to Facebook, Instagram & X in this single browser window...")

        while True:
            elapsed = int(time.time() - start_time)
            remaining = total_seconds - elapsed

            if remaining <= 0:
                break

            fb_status = "LoggedIn" if "login" not in page_fb.url.lower() else "LoginNeeded"
            insta_status = "LoggedIn" if ("login" not in page_insta.url.lower() and "emailsignup" not in page_insta.url.lower()) else "LoginNeeded"
            x_status = "LoggedIn" if ("home" in page_x.url.lower() or "explore" in page_x.url.lower()) else "LoginNeeded"

            if fb_status == "LoggedIn" and insta_status == "LoggedIn" and x_status == "LoggedIn":
                print("\n[SUCCESS] All 3 platforms (Facebook, Instagram, X) successfully logged in!")
                break

            sys.stdout.write(f"\r[TIMER] {remaining}s left | FB: {fb_status} | Insta: {insta_status} | X: {x_status}   ")
            sys.stdout.flush()
            await asyncio.sleep(2)

        print("\n\n[INFO] Saving unified session cookies to shared_chrome...")
        await context.close()
        print("[SUCCESS] Done! All 3 social logins saved to 'user_data/shared_chrome'!")

if __name__ == "__main__":
    asyncio.run(main())
