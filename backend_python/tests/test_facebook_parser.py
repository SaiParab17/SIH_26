"""
Unit tests for Facebook HTML Parser.
Tests parsing using offline HTML string fixtures.
"""

import pytest
from app.facebook.parser import FacebookParser, parse_facebook_count


def test_parse_facebook_count():
    assert parse_facebook_count("1.4K comments") == 1400
    assert parse_facebook_count("250 shares") == 250
    assert parse_facebook_count("4.2M views") == 4200000
    assert parse_facebook_count(None) is None


def test_parse_facebook_post_html():
    html_fixture = """
    <div data-testid="post_container">
        <h2>AI Policy Center</h2>
        <a href="https://www.facebook.com/aipolicy/posts/pfbid02947192">
            <abbr>August 31, 2026</abbr>
        </a>
        <div dir="auto">
            New public discussion report published on data governance and privacy standards. #DataPrivacy #AIEthics
        </div>
        <span>1.2K reactions</span>
        <span>340 comments</span>
        <span>85 shares</span>
    </div>
    """

    parsed = FacebookParser.parse_post_html(html_fixture)
    assert parsed is not None
    assert "pfbid02947192" in parsed["post_id"] or "fb_" in parsed["post_id"]
    assert "discussion report published" in parsed["text"]
    assert "#dataprivacy" in parsed["hashtags"]
    assert parsed["reactions"] == 1200
    assert parsed["comments"] == 340
    assert parsed["shares"] == 85
