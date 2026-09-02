"""
Live Web Scraping Demo - X (Twitter) + Facebook
================================================
Uses authenticated Camoufox anti-detect browser profiles for:
  - X profile       : user_data/x        (already logged in)
  - Facebook profile: user_data/facebook  (already logged in)

Collects 15-20 posts + comments per post.
"""

import os
import asyncio
import logging

# Force Camoufox engine
os.environ["USE_CAMOUFOX"] = "true"

from app.x.collector import XCollector
from app.facebook.collector import FacebookCollector

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("live_harvest")


# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────
QUERY            = "SIH 2026"
X_TARGET_POSTS   = 10
FB_TARGET_POSTS  = 10
COMMENTS_PER_POST = 3
HEADLESS          = False


def is_real_url(url: str) -> bool:
    """Return True only if this looks like a genuine navigatable post URL."""
    if not url:
        return False
    # Reject hash-generated fallback URLs
    if "/fb_" in url and "permalink.php" not in url and "posts/" not in url:
        return False
    # Reject bare X status URLs with no numeric ID
    if "x.com/status/" in url:
        after = url.split("/status/")[-1].strip("/").split("?")[0]
        return after.isdigit()
    return True


# ─────────────────────────────────────────────────────────────────────────────
async def harvest_x(query: str, target: int, comments_per: int):
    logger.info("=" * 60)
    logger.info("  PLATFORM: X (Twitter) — user_data/x")
    logger.info("=" * 60)

    collector = XCollector(headless=HEADLESS, timeout_ms=50000)
    posts_collected = []
    comments_collected = []

    try:
        await collector.start_session()
        posts = await collector.collect_posts(query=query, target_count=target, max_pages=10)
        logger.info(f"[X] Harvested {len(posts)} posts")

        for i, post in enumerate(posts, 1):
            url = post.source.url or ""
            logger.info(
                f"  [X Post #{i}] @{post.author.username}"
                f" | {post.content.text[:80].strip()}..."
                f"\n    URL: {url}"
            )
            posts_collected.append(post)

            if is_real_url(url):
                try:
                    comments = await collector.collect_comments(
                        post_url=url,
                        parent_event_id=post.event_id,
                        limit=comments_per,
                    )
                    for j, c in enumerate(comments, 1):
                        logger.info(
                            f"    -> [X Comment #{j}] @{c.author.username}"
                            f" | {c.content.text[:70].strip()}"
                        )
                    comments_collected.extend(comments)
                except Exception as ce:
                    logger.warning(f"    [X] Error fetching comments for post #{i}: {ce}")
            else:
                logger.info(f"    (Skipping comments — no valid URL)")

    except Exception as e:
        logger.error(f"[X] Fatal error during harvest: {e}", exc_info=True)
    finally:
        await collector.close_session()

    return posts_collected, comments_collected


# ─────────────────────────────────────────────────────────────────────────────
async def harvest_facebook(query: str, target: int, comments_per: int):
    logger.info("=" * 60)
    logger.info("  PLATFORM: Facebook — user_data/facebook")
    logger.info("=" * 60)

    fb_profile = os.path.join(os.path.dirname(__file__), "user_data", "facebook")
    if not os.path.exists(fb_profile):
        logger.error(
            "[Facebook] No saved session found!\n"
            "  Run: python setup_platform_sessions.py facebook"
        )
        return [], []

    collector = FacebookCollector(headless=HEADLESS, timeout_ms=50000)
    posts_collected = []
    comments_collected = []

    try:
        await collector.start_session()
        posts = await collector.collect_posts(query=query, target_count=target, max_pages=10)
        logger.info(f"[Facebook] Harvested {len(posts)} posts")

        for i, post in enumerate(posts, 1):
            url = post.source.url or ""
            logger.info(
                f"  [FB Post #{i}] {post.author.display_name}"
                f" | {post.content.text[:80].strip()}..."
                f"\n    URL: {url}"
            )
            posts_collected.append(post)

            if is_real_url(url):
                try:
                    comments = await collector.collect_comments(
                        post_url=url,
                        parent_event_id=post.event_id,
                        limit=comments_per,
                    )
                    for j, c in enumerate(comments, 1):
                        logger.info(
                            f"    -> [FB Comment #{j}] {c.author.display_name}"
                            f" | {c.content.text[:70].strip()}"
                        )
                    comments_collected.extend(comments)
                except Exception as ce:
                    logger.warning(f"    [FB] Error fetching comments for post #{i}: {ce}")
            else:
                logger.info(f"    (Skipping comments — no valid permalink URL)")

    except Exception as e:
        logger.error(f"[Facebook] Fatal error during harvest: {e}", exc_info=True)
    finally:
        await collector.close_session()

    return posts_collected, comments_collected


# ─────────────────────────────────────────────────────────────────────────────
async def main():
    logger.info("╔══════════════════════════════════════════════════════════╗")
    logger.info("║   LIVE WEB SCRAPING — Camoufox Anti-Detect Browser       ║")
    logger.info(f"║   Query  : '{QUERY}'")
    logger.info(f"║   Target : {X_TARGET_POSTS} X posts + {FB_TARGET_POSTS} FB posts + {COMMENTS_PER_POST} comments each")
    logger.info("╚══════════════════════════════════════════════════════════╝")

    x_posts, x_comments = await harvest_x(QUERY, X_TARGET_POSTS, COMMENTS_PER_POST)
    fb_posts, fb_comments = await harvest_facebook(QUERY, FB_TARGET_POSTS, COMMENTS_PER_POST)

    total_posts    = len(x_posts)    + len(fb_posts)
    total_comments = len(x_comments) + len(fb_comments)

    logger.info("")
    logger.info("╔══════════════════════════════════════════════════════════╗")
    logger.info("║                 HARVEST COMPLETE                         ║")
    logger.info(f"║  X Posts      : {len(x_posts):>4}  |  X Comments      : {len(x_comments):>4}  ║")
    logger.info(f"║  FB Posts     : {len(fb_posts):>4}  |  FB Comments     : {len(fb_comments):>4}  ║")
    logger.info(f"║  TOTAL Posts  : {total_posts:>4}  |  TOTAL Comments  : {total_comments:>4}  ║")
    logger.info("╚══════════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    asyncio.run(main())
