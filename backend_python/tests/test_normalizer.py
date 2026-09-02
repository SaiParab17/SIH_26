"""
Unit tests for X & Facebook Normalizers.
Tests mapping raw parsed dicts into CanonicalSocialEvent schema.
"""

import pytest
from app.x.normalizer import normalize_x_tweet
from app.facebook.normalizer import normalize_facebook_post


def test_normalize_x_tweet():
    raw_tweet = {
        "tweet_id": "1829471920001",
        "tweet_url": "https://x.com/tech_analyst_raj/status/1829471920001",
        "text": "The new guidelines for AI compliance. #AIRegulation",
        "author_id": "tech_analyst_raj",
        "username": "tech_analyst_raj",
        "display_name": "Rajesh Sharma",
        "created_at": "2026-08-31T10:05:00Z",
        "likes": 1420,
        "comments": 184,
        "shares": 312,
        "views": 48000,
        "hashtags": ["#airegulation"],
        "mentions": [],
        "is_reply": False,
    }

    event = normalize_x_tweet(raw_tweet, query="AI compliance")

    assert event.event_id == "x_post_1829471920001"
    assert event.platform == "x"
    assert event.event_type == "post"
    assert event.author.username == "tech_analyst_raj"
    assert event.engagement.likes == 1420
    assert event.engagement.views == 48000
    assert event.content.hashtags == ["#airegulation"]
    assert event.source.collector == "x_playwright"


def test_normalize_facebook_post():
    raw_post = {
        "post_id": "pfbid02947192",
        "post_url": "https://www.facebook.com/aipolicy/posts/pfbid02947192",
        "text": "New public discussion report published. #DataPrivacy",
        "author_id": "ai_policy_center",
        "username": "ai_policy_center",
        "display_name": "AI Policy Center",
        "created_at": "2026-08-31T10:42:00Z",
        "reactions": 1200,
        "comments": 340,
        "shares": 85,
        "hashtags": ["#dataprivacy"],
        "mentions": [],
        "is_comment": False,
    }

    event = normalize_facebook_post(raw_post, query="Data Privacy")

    assert event.event_id == "fb_post_pfbid02947192"
    assert event.platform == "facebook"
    assert event.event_type == "post"
    assert event.engagement.likes == 1200
    assert event.engagement.comments == 340
    assert event.source.collector == "facebook_playwright"


def test_normalize_reply_relationships():
    raw_reply = {
        "tweet_id": "1829471920099",
        "tweet_url": "https://x.com/user/status/1829471920099",
        "text": "Agreed with the sandboxing proposal!",
        "author_id": "commenter_1",
        "username": "commenter_1",
        "display_name": "Commenter One",
        "created_at": "2026-08-31T10:15:00Z",
        "likes": 42,
        "comments": 3,
        "shares": 1,
        "is_reply": True,
        "parent_tweet_id": "x_post_1829471920001",
    }

    event = normalize_x_tweet(raw_reply)

    assert event.event_id == "x_reply_1829471920099"
    assert event.event_type == "reply"
    assert event.relationships.reply_to == "x_post_1829471920001"
    assert event.relationships.parent_post_id == "x_post_1829471920001"
