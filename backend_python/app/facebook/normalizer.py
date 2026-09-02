"""
Facebook Normalizer module.
Maps parsed raw Facebook post dicts into CanonicalSocialEvent models.
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


def normalize_facebook_post(raw_post: Dict[str, Any], query: str = "") -> CanonicalSocialEvent:
    """Map parsed Facebook post dictionary into CanonicalSocialEvent schema."""
    post_id = str(raw_post.get("post_id", ""))
    is_comment = raw_post.get("is_comment", False)
    parent_id = raw_post.get("parent_post_id")

    event_id = f"fb_comment_{post_id}" if is_comment else f"fb_post_{post_id}"
    event_type = "comment" if is_comment else "post"

    created_at = raw_post.get("created_at") or datetime.utcnow().isoformat() + "Z"

    return CanonicalSocialEvent(
        event_id=event_id,
        platform="facebook",
        event_type=event_type,
        source=EventSource(
            source_id=post_id,
            url=raw_post.get("post_url", f"https://www.facebook.com/{post_id}"),
            collector="facebook_playwright",
        ),
        author=SocialAuthor(
            user_id=raw_post.get("author_id", "fb_public_page"),
            username=raw_post.get("username", "fb_public_page"),
            display_name=raw_post.get("display_name", "Facebook Public Page"),
        ),
        content=EventContent(
            text=raw_post.get("text", ""),
            language="en",
            hashtags=raw_post.get("hashtags", []),
            mentions=raw_post.get("mentions", []),
        ),
        engagement=EventEngagement(
            likes=raw_post.get("reactions") or 0,
            comments=raw_post.get("comments") or 0,
            shares=raw_post.get("shares") or 0,
        ),
        relationships=EventRelationships(
            reply_to=parent_id if is_comment else None,
            parent_post_id=parent_id if is_comment else None,
            mentions=raw_post.get("mentions", []),
        ),
        timestamps=EventTimestamps(
            created_at=created_at,
            collected_at=datetime.utcnow().isoformat() + "Z",
        ),
        analysis=EventAnalysis(),
        collection_reason=["recent", "relevant"] if query else ["recent"],
    )
