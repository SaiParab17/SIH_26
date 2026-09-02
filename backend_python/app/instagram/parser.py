"""
Instagram Parser module.
Extracts raw post & comment dictionaries from Instagram HTML elements or string fixtures.
"""

import re
import logging
from typing import Dict, Any, Optional, List
from bs4 import BeautifulSoup

logger = logging.getLogger("instagram_parser")


def parse_instagram_count(text: str) -> Optional[int]:
    """Parse text like '1.4K likes', '120 comments', '4.2M views' into an integer."""
    if not text:
        return None
    match = re.search(r"([\d.,]+)\s*([KkMm]?)", text)
    if not match:
        return None
    val_str, unit = match.groups()
    val_str = val_str.replace(",", "")
    try:
        val = float(val_str)
        if unit.lower() == "k":
            return int(val * 1000)
        elif unit.lower() == "m":
            return int(val * 1000000)
        return int(val)
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


class InstagramParser:
    """Parses raw Instagram post HTML into structured dictionaries."""

    @staticmethod
    def parse_post_html(html_content: str, is_comment: bool = False, parent_post_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Parse raw HTML string of an Instagram post element."""
        if not html_content:
            return None

        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Post/comment text extraction: check img alt attribute first (Instagram grid tiles store caption in img alt)
        text = ""
        img_elem = soup.find("img", alt=True)
        if img_elem and len(img_elem["alt"].strip()) > 3:
            text = img_elem["alt"].strip()

        if not text:
            # Try spans with caption classes or text containers
            for span in soup.find_all(["span", "h1"]):
                t = span.get_text(separator=" ").strip()
                if len(t) > 10 and not re.match(r"^(Like|Reply|View|Follow|Comments|Share|Log in)$", t, re.I):
                    text = t
                    break

        if not text:
            text = soup.get_text(separator=" ").strip()

        if len(text) < 2:
            return None

        # 2. Post ID & Permalink
        post_url = ""
        post_id = ""
        link_elem = soup.find("a", href=re.compile(r"/(?:p|reel)/([a-zA-Z0-9_-]+)"))
        if link_elem and link_elem.has_attr("href"):
            href = link_elem["href"]
            match = re.search(r"/(?:p|reel)/([a-zA-Z0-9_-]+)", href)
            if match:
                post_id = match.group(1)
                post_url = f"https://www.instagram.com/p/{post_id}/"

        if not post_id and text:
            post_id = f"insta_{abs(hash(text[:60])) & 0xFFFFFFFF}"
            # Use valid Instagram explore URL instead of broken synthetic post permalink
            post_url = "https://www.instagram.com/explore/"

        # 3. Author Info
        author_name = ""
        author_username = ""
        author_elem = soup.find("a", href=re.compile(r"^/[a-zA-Z0-9._]+/$"))
        if author_elem:
            author_username = author_elem.get_text().strip().lstrip("@")
            author_name = author_username

        if not author_username:
            h3_tag = soup.find(["h2", "h3"])
            if h3_tag:
                author_name = h3_tag.get_text().strip()
                author_username = re.sub(r"\W+", "_", author_name.lower()).strip("_")

        if not author_username:
            author_username = "instagram_creator"
            author_name = "Instagram Creator"

        # 4. Engagement Metrics
        all_text = soup.get_text(separator=" ")
        likes = 0
        comments_count = 0

        like_match = re.search(r"([\d.,]+[KkMm]?)\s+(?:likes?|views?)", all_text, re.IGNORECASE)
        if like_match:
            likes = parse_instagram_count(like_match.group(1)) or 0

        comment_match = re.search(r"([\d.,]+[KkMm]?)\s+comments?", all_text, re.IGNORECASE)
        if comment_match:
            comments_count = parse_instagram_count(comment_match.group(1)) or 0

        return {
            "post_id": post_id,
            "post_url": post_url,
            "text": text,
            "author_id": author_username,
            "username": author_username,
            "display_name": author_name,
            "created_at": "",
            "likes": likes,
            "comments": comments_count,
            "hashtags": extract_hashtags(text),
            "mentions": extract_mentions(text),
            "is_comment": is_comment,
            "parent_post_id": parent_post_id,
        }
