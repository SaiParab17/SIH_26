"""
Unit tests for X (Twitter) HTML Parser.
Tests parsing using offline HTML string fixtures.
"""

import pytest
from app.x.parser import XParser, parse_engagement_number, extract_hashtags, extract_mentions


def test_parse_engagement_number():
    assert parse_engagement_number("1,420") == 1420
    assert parse_engagement_number("1.2K") == 1200
    assert parse_engagement_number("4.5M") == 4500000
    assert parse_engagement_number("0") == 0
    assert parse_engagement_number(None) is None


def test_extract_hashtags_and_mentions():
    text = "Important update regarding #AIRegulation and #AgenticAI! CC @tech_analyst_raj @ai_policy_lab"
    hashtags = extract_hashtags(text)
    mentions = extract_mentions(text)

    assert "#airegulation" in hashtags
    assert "#agenticai" in hashtags
    assert "@tech_analyst_raj" in mentions
    assert "@ai_policy_lab" in mentions


def test_parse_x_tweet_html():
    html_fixture = """
    <article data-testid="tweet">
        <div data-testid="User-Name">
            <span>Rajesh Sharma</span>
            <span>@tech_analyst_raj</span>
        </div>
        <a href="/tech_analyst_raj/status/1829471920001"><time datetime="2026-08-31T10:05:00Z">Aug 31</time></a>
        <div data-testid="tweetText">
            The new guidelines for AI compliance and sandboxing balance security with developer freedom. #AIRegulation #AgenticAI
        </div>
        <div data-testid="reply">184</div>
        <div data-testid="retweet">312</div>
        <div data-testid="like">1,420</div>
        <a href="/tech_analyst_raj/status/1829471920001/analytics">48K</a>
    </article>
    """

    parsed = XParser.parse_tweet_html(html_fixture)
    assert parsed is not None
    assert parsed["tweet_id"] == "1829471920001"
    assert parsed["username"] == "tech_analyst_raj"
    assert "guidelines for AI compliance" in parsed["text"]
    assert parsed["likes"] == 1420
    assert parsed["comments"] == 184
    assert parsed["shares"] == 312
    assert parsed["views"] == 48000
    assert "#airegulation" in parsed["hashtags"]
