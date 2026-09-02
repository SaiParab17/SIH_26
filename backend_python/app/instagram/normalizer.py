"""
Instagram Normalizer module.
Maps parsed raw Instagram post dicts into CanonicalSocialEvent models.
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


def normalize_instagram_post(raw_post: Dict[str, Any], query: str = "") -> CanonicalSocialEvent:
    """Map parsed Instagram post dictionary into CanonicalSocialEvent schema."""
    post_id = str(raw_post.get("post_id", ""))
    is_comment = raw_post.get("is_comment", False)
    parent_id = raw_post.get("parent_post_id")

    event_id = f"insta_comment_{post_id}" if is_comment else f"insta_post_{post_id}"
    event_type = "comment" if is_comment else "post"

    created_at = raw_post.get("created_at") or datetime.utcnow().isoformat() + "Z"

    # Construct valid URL — fallback to tag explore page if post_id is synthetic/hash-based
    raw_url = raw_post.get("post_url", "")
    if not raw_url or "insta_" in raw_url or post_id.startswith("insta_"):
        clean_tag = query.replace("#", "").strip().replace(" ", "").lower()
        url = f"https://www.instagram.com/explore/tags/{clean_tag}/" if clean_tag else "https://www.instagram.com/explore/"
    else:
        url = raw_url

    return CanonicalSocialEvent(
        event_id=event_id,
        platform="instagram",
        event_type=event_type,
        source=EventSource(
            source_id=post_id,
            url=url,
            collector="instagram_camoufox",
        ),
        author=SocialAuthor(
            user_id=raw_post.get("author_id", "instagram_creator"),
            username=raw_post.get("username", "instagram_creator"),
            display_name=raw_post.get("display_name", "Instagram Creator"),
        ),
        content=EventContent(
            text=raw_post.get("text", ""),
            language="en",
            hashtags=raw_post.get("hashtags", []),
            mentions=raw_post.get("mentions", []),
        ),
        engagement=EventEngagement(
            likes=raw_post.get("likes") or 0,
            comments=raw_post.get("comments") or 0,
            shares=0,
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
