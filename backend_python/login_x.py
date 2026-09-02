"""
Interactive X / Twitter 3-Minute Login Setup Script.
Launches Playwright Chromium with persistent user profile in 'user_data/x'.
Gives the user 3 minutes to log into X (Twitter) and saves cookies/session automatically.
"""

import os
import sys
import time
import asyncio
from playwright.async_api import async_playwright

USER_DATA_DIR = os.path.join(os.path.dirname(__file__), "user_data", "x")

async def main():
    print("=" * 70)
    print("🔑 X (Twitter) Playwright Chromium Login Setup")
    print("=" * 70)
    print(f"Profile Storage Directory: {USER_DATA_DIR}")
    print("Launching visible Chromium browser... Please complete your X login.")
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
        await page.goto("https://x.com/i/flow/login", wait_until="domcontentloaded")

        total_seconds = 180
        start_time = time.time()

        print("\n⏳ You have 3 minutes (180 seconds) to log in on the opened Chromium window...")

        while True:
            elapsed = int(time.time() - start_time)
            remaining = total_seconds - elapsed

            if remaining <= 0:
                break

            current_url = page.url
            if "home" in current_url.lower() or "explore" in current_url.lower():
                print("\n✅ Successfully detected logged-in session on X!")
                break

            sys.stdout.write(f"\r⏱️  Time remaining: {remaining}s | Current Page: {current_url[:60]}...   ")
            sys.stdout.flush()
            await asyncio.sleep(2)

        print("\n\n💾 Saving persistent X login session cookies...")
        await context.close()
        print("✅ Done! X session saved to 'user_data/x'. Future scraping will automatically use this login!")

if __name__ == "__main__":
    asyncio.run(main())
