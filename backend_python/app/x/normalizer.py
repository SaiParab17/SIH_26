"""
X Normalizer module.
Maps parsed raw tweet dicts into CanonicalSocialEvent models.
"""

from datetime import datetime
from typing import Dict, Any
from app.models.social_event import (
    CanonicalSocialEvent,
    SocialAuthor,
    EventEngagement,
    EventSource,
    EventContent,
    EventRelationships,
    EventTimestamps,
    EventAnalysis,
)


def normalize_x_tweet(raw_tweet: Dict[str, Any], query: str = "") -> CanonicalSocialEvent:
    """Map parsed X tweet dictionary into CanonicalSocialEvent schema."""
    tweet_id = str(raw_tweet.get("tweet_id", ""))
    is_reply = raw_tweet.get("is_reply", False)
    parent_id = raw_tweet.get("parent_tweet_id")

    event_id = f"x_reply_{tweet_id}" if is_reply else f"x_post_{tweet_id}"
    event_type = "reply" if is_reply else "post"

    created_at = raw_tweet.get("created_at") or datetime.utcnow().isoformat() + "Z"

    return CanonicalSocialEvent(
        event_id=event_id,
        platform="x",
        event_type=event_type,
        source=EventSource(
            source_id=tweet_id,
            url=raw_tweet.get("tweet_url", f"https://x.com/status/{tweet_id}"),
            collector="x_playwright",
        ),
        author=SocialAuthor(
            user_id=raw_tweet.get("author_id", "unknown"),
            username=raw_tweet.get("username", "unknown"),
            display_name=raw_tweet.get("display_name", "X User"),
            avatarUrl=raw_tweet.get("avatar_url"),
            followers_count=raw_tweet.get("followers_count"),
        ),
        content=EventContent(
            text=raw_tweet.get("text", ""),
            language="en",
            hashtags=raw_tweet.get("hashtags", []),
            mentions=raw_tweet.get("mentions", []),
        ),
        engagement=EventEngagement(
            likes=raw_tweet.get("likes") or 0,
            comments=raw_tweet.get("comments") or 0,
            shares=raw_tweet.get("shares") or 0,
            views=raw_tweet.get("views"),
        ),
        relationships=EventRelationships(
            reply_to=parent_id if is_reply else None,
            parent_post_id=parent_id if is_reply else None,
            mentions=raw_tweet.get("mentions", []),
        ),
        timestamps=EventTimestamps(
            created_at=created_at,
            collected_at=datetime.utcnow().isoformat() + "Z",
        ),
        analysis=EventAnalysis(),
        collection_reason=["recent", "relevant"] if query else ["recent"],
    )
