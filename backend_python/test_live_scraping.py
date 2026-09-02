"""
Live Web Scraping Test powered by Camoufox Anti-Detect Browser.
Runs non-headless (visible) Camoufox (Firefox-based) session for live social media scraping.
"""

import os
import asyncio
import logging

# Enforce Camoufox browser backend
os.environ["USE_CAMOUFOX"] = "true"

from app.x.collector import XCollector
from app.facebook.collector import FacebookCollector
from app.reddit.collector import RedditCollector
from app.storage.file_storage import save_events

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("live_demo")


async def run_live_scraping():
    query = "AI regulation"
    target_post_count = 20
    comments_per_post = 3

    logger.info("==================================================")
    logger.info("=== Live Web Scraping with Camoufox Anti-Detect ===")
    logger.info(f"=== Target: {target_post_count} Posts + Comments per Post ===")
    logger.info("==================================================")

    total_posts_collected = []
    total_comments_collected = []

    # 1. Scraping X (Twitter) using Camoufox (with saved persistent cookies)
    logger.info("\n--- Launching Camoufox Anti-Detect Browser for X (Twitter) ---")
    x_collector = XCollector(headless=False, timeout_ms=45000)
    logger.info(f"Browser Backend: {x_collector.browser_mgr.browser_backend.upper()}")
    
    await x_collector.start_session()
    x_posts = await x_collector.collect_posts(query=query, target_count=target_post_count, max_pages=10)
    logger.info(f"Collected {len(x_posts)} X posts using Camoufox!")
    
    if x_posts:
        save_events(x_posts)
        total_posts_collected.extend(x_posts)
        for i, ev in enumerate(x_posts, 1):
            logger.info(f"\n[X Post #{i}] @{ev.author.username} ({ev.author.display_name}): {ev.content.text[:100]}")
            if ev.source.url:
                comments = await x_collector.collect_comments(post_url=ev.source.url, parent_event_id=ev.event_id, limit=comments_per_post)
                if comments:
                    save_events(comments)
                    total_comments_collected.extend(comments)
                    for j, c in enumerate(comments, 1):
                        logger.info(f"     -> [X Comment #{j}] @{c.author.username}: {c.content.text[:80]}")

    await x_collector.close_session()

    # 2. Scraping Facebook using Camoufox (with saved persistent cookies)
    logger.info("\n--- Launching Camoufox Anti-Detect Browser for Facebook ---")
    fb_collector = FacebookCollector(headless=False, timeout_ms=45000)
    await fb_collector.start_session()
    fb_posts = await fb_collector.collect_posts(query=query, target_count=10, max_pages=5)
    logger.info(f"Collected {len(fb_posts)} Facebook posts using Camoufox!")
    if fb_posts:
        save_events(fb_posts)
        total_posts_collected.extend(fb_posts)
        for i, ev in enumerate(fb_posts, 1):
            logger.info(f"  [FB Post #{i}] {ev.author.display_name}: {ev.content.text[:80]}")
            if ev.source.url:
                fb_comments = await fb_collector.collect_comments(post_url=ev.source.url, parent_event_id=ev.event_id, limit=comments_per_post)
                if fb_comments:
                    save_events(fb_comments)
                    total_comments_collected.extend(fb_comments)
                    for j, c in enumerate(fb_comments, 1):
                        logger.info(f"     -> [FB Comment #{j}]: {c.content.text[:80]}")

    await fb_collector.close_session()

    # 3. Scraping Reddit public content via Camoufox
    logger.info("\n--- Launching Camoufox Anti-Detect Browser for Reddit ---")
    reddit_collector = RedditCollector(headless=False, timeout_ms=45000)
    await reddit_collector.start_session()
    reddit_posts = await reddit_collector.collect_posts(query=query, target_count=target_post_count, max_pages=5)
    logger.info(f"Collected {len(reddit_posts)} Reddit posts using Camoufox!")

    if reddit_posts:
        save_events(reddit_posts)
        total_posts_collected.extend(reddit_posts)
        for i, post in enumerate(reddit_posts, 1):
            logger.info(f"\n[Reddit Post #{i}] Author: u/{post.author.username} | Title: {post.content.text[:90]}")
            comments = await reddit_collector.collect_comments(post_url=post.source.url, parent_event_id=post.event_id, limit=comments_per_post)
            if comments:
                save_events(comments)
                total_comments_collected.extend(comments)
                for j, c in enumerate(comments, 1):
                    logger.info(f"     -> [Reddit Comment #{j}] u/{c.author.username}: {c.content.text[:80]}")

    await reddit_collector.close_session()

    logger.info("\n==================================================")
    logger.info("=== Camoufox Live Scraping Test Summary ===")
    logger.info(f" Total Unique Posts Collected   : {len(total_posts_collected)}")
    logger.info(f" Total Unique Comments Collected: {len(total_comments_collected)}")
    logger.info(" Storage Saved                  : data/events.json")
    logger.info("==================================================")


if __name__ == "__main__":
    asyncio.run(run_live_scraping())
