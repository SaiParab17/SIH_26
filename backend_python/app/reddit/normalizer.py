"""
Reddit Normalizer.
Converts raw Reddit dictionaries into CanonicalSocialEvent models.
"""

from typing import Dict, Any, Optional
from datetime import datetime
from app.models.social_event import (
    CanonicalSocialEvent,
    SocialAuthor,
    EventContent,
    EventEngagement,
    EventSource,
    EventRelationships,
    EventTimestamps,
    EventAnalysis,
)


def normalize_reddit_post(raw: Dict[str, Any], query: Optional[str] = None) -> CanonicalSocialEvent:
    """Normalize raw post dict to CanonicalSocialEvent."""
    post_id = raw.get("post_id", "")
    author_name = raw.get("author", "reddit_user")
    created_at = raw.get("created_at") or (datetime.utcnow().isoformat() + "Z")

    return CanonicalSocialEvent(
        event_id=f"reddit_post_{post_id}",
        platform="reddit",
        event_type="post",
        source=EventSource(
            source_id=post_id,
            url=raw.get("post_url", f"https://old.reddit.com/comments/{post_id}"),
            collector="reddit_collector",
        ),
        author=SocialAuthor(
            user_id=author_name,
            username=author_name,
            display_name=author_name,
        ),
        content=EventContent(
            text=raw.get("text", ""),
            hashtags=[],
            mentions=[],
        ),
        engagement=EventEngagement(
            likes=raw.get("score", 0),
            comments=raw.get("comments_count", 0),
        ),
        relationships=EventRelationships(),
        timestamps=EventTimestamps(created_at=created_at),
        analysis=EventAnalysis(),
        collection_reason=["recent", "search_query"] if query else ["recent"],
    )


def normalize_reddit_comment(raw: Dict[str, Any], post_url: Optional[str] = None) -> CanonicalSocialEvent:
    """Normalize raw comment dict to CanonicalSocialEvent."""
    comment_id = raw.get("comment_id", "")
    author_name = raw.get("author", "reddit_user")
    parent_id = raw.get("parent_post_id", "")
    created_at = raw.get("created_at") or (datetime.utcnow().isoformat() + "Z")

    return CanonicalSocialEvent(
        event_id=f"reddit_comment_{comment_id}",
        platform="reddit",
        event_type="comment",
        source=EventSource(
            source_id=comment_id,
            url=post_url or "https://old.reddit.com",
            collector="reddit_collector",
        ),
        author=SocialAuthor(
            user_id=author_name,
            username=author_name,
            display_name=author_name,
        ),
        content=EventContent(
            text=raw.get("text", ""),
            hashtags=[],
            mentions=[],
        ),
        engagement=EventEngagement(
            likes=raw.get("score", 0),
        ),
        relationships=EventRelationships(
            parent_post_id=parent_id,
            reply_to=parent_id,
        ),
        timestamps=EventTimestamps(created_at=created_at),
        analysis=EventAnalysis(),
        collection_reason=["live_comments"],
    )
