"""
Interactive Facebook 3-Minute Login Setup Script.
Launches Playwright Chromium with persistent user profile in 'user_data/facebook'.
Gives the user 3 minutes to log into Facebook and saves cookies/session automatically.
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
    print("[Facebook Login Setup] Playwright Chromium Session Setup")
    print("=" * 70)
    print(f"Profile Storage Directory: {USER_DATA_DIR}")
    print("Launching visible Chromium browser... Please complete your Facebook login.")
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

        page = context.pages[0] if context.pages else await context.new_page()
        await page.goto("https://www.facebook.com/", wait_until="domcontentloaded")

        total_seconds = 180
        start_time = time.time()

        print("\n[INFO] You have 3 minutes (180 seconds) to log in on the opened Chromium window...")

        while True:
            elapsed = int(time.time() - start_time)
            remaining = total_seconds - elapsed

            if remaining <= 0:
                break

            current_url = page.url
            if "facebook.com" in current_url.lower() and "login" not in current_url.lower():
                # Check if home feed or profile is loaded
                try:
                    title = await page.title()
                    if "Facebook" in title and ("Facebook" not in title or len(title) > 8):
                        print(f"\n[SUCCESS] Detected logged-in Facebook session! (Title: {title})")
                        break
                except Exception:
                    pass

            sys.stdout.write(f"\r[TIMER] Time remaining: {remaining}s | Page: {current_url[:55]}...   ")
            sys.stdout.flush()
            await asyncio.sleep(2)

        print("\n\n[INFO] Saving persistent Facebook login session cookies...")
        await context.close()
        print("[SUCCESS] Done! Facebook session saved to 'user_data/facebook'. Future scraping will use this login!")

if __name__ == "__main__":
    asyncio.run(main())
