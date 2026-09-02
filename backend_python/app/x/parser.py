"""
X (Twitter) Parser.
Extracts raw tweet & comment dictionary objects from DOM elements or HTML fixtures.
"""

import re
import logging
from typing import Dict, Any, Optional, List
from bs4 import BeautifulSoup

logger = logging.getLogger("x_parser")


def parse_engagement_number(text: str) -> Optional[int]:
    """Parse text like '1.2K', '45M', '1,420' into an integer."""
    if not text:
        return None
    cleaned = text.strip().replace(",", "")
    try:
        if "K" in cleaned or "k" in cleaned:
            val = float(cleaned.replace("K", "").replace("k", ""))
            return int(val * 1000)
        elif "M" in cleaned or "m" in cleaned:
            val = float(cleaned.replace("M", "").replace("m", ""))
            return int(val * 1000000)
        return int(cleaned)
    except (ValueError, TypeError):
        return None


def extract_hashtags(text: str) -> List[str]:
    """Extract #hashtags from text."""
    if not text:
        return []
    matches = re.findall(r"#[\w\u0900-\u097F]+", text)
    return list(set(h.lower() for h in matches))


def extract_mentions(text: str) -> List[str]:
    """Extract @mentions from text."""
    if not text:
        return []
    matches = re.findall(r"@[\w.]+", text)
    return list(set(m.lower() for m in matches))


class XParser:
    """Parses X tweet HTML string or DOM data into structured dictionaries."""

    @staticmethod
    def parse_tweet_html(html_content: str, is_reply: bool = False, parent_tweet_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Parse raw HTML string of a tweet element."""
        if not html_content:
            return None

        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Tweet ID & URL
        link_elem = soup.find("a", href=re.compile(r"/status/\d+"))
        tweet_url = ""
        tweet_id = ""
        if link_elem and link_elem.has_attr("href"):
            href = link_elem["href"]
            tweet_url = f"https://x.com{href}" if href.startswith("/") else href
            match = re.search(r"/status/(\d+)", href)
            if match:
                tweet_id = match.group(1)

        # 2. Text
        text_elem = soup.find(attrs={"data-testid": "tweetText"})
        text = text_elem.get_text(separator=" ").strip() if text_elem else ""
        
        # If no tweetText element, only fallback if a status link is explicitly present
        if not text and link_elem:
            raw_text = soup.get_text(separator=" ").strip()
            if len(raw_text) > 20 and "Who to follow" not in raw_text and "Trends" not in raw_text:
                text = raw_text

        if not tweet_id:
            id_attr = soup.find(attrs={"data-tweet-id": True})
            if id_attr:
                tweet_id = str(id_attr["data-tweet-id"])
            elif text and link_elem:
                tweet_id = f"gen_{abs(hash(text)) & 0xffffffff}"

        if not tweet_id or not text:
            return None

        # 3. Author Info
        user_container = soup.find(attrs={"data-testid": "User-Name"})
        display_name = "X User"
        username = "x_user"
        if user_container:
            full_user_text = user_container.get_text(separator=" ")
            handles = re.findall(r"@[\w.]+", full_user_text)
            if handles:
                username = handles[0].replace("@", "")
            names = [part.strip() for part in full_user_text.split("@") if part.strip()]
            if names:
                display_name = names[0]

        avatar_elem = soup.find("img", src=re.compile(r"profile_images"))
        avatar_url = avatar_elem["src"] if avatar_elem and avatar_elem.has_attr("src") else None

        # 4. Timestamp
        time_elem = soup.find("time")
        created_at = time_elem["datetime"] if time_elem and time_elem.has_attr("datetime") else ""

        # 5. Engagement Metrics
        reply_btn = soup.find(attrs={"data-testid": "reply"})
        repost_btn = soup.find(attrs={"data-testid": "retweet"})
        like_btn = soup.find(attrs={"data-testid": "like"})
        views_btn = soup.find("a", href=re.compile(r"/analytics"))

        likes = parse_engagement_number(like_btn.get_text()) if like_btn else 0
        comments = parse_engagement_number(reply_btn.get_text()) if reply_btn else 0
        shares = parse_engagement_number(repost_btn.get_text()) if repost_btn else 0
        views = parse_engagement_number(views_btn.get_text()) if views_btn else None

        return {
            "tweet_id": tweet_id,
            "tweet_url": tweet_url or f"https://x.com/{username}/status/{tweet_id}",
            "text": text,
            "author_id": username,
            "username": username,
            "display_name": display_name,
            "avatar_url": avatar_url,
            "created_at": created_at,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "views": views,
            "hashtags": extract_hashtags(text),
            "mentions": extract_mentions(text),
            "is_reply": is_reply,
            "parent_tweet_id": parent_tweet_id,
        }
