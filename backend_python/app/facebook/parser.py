"""
Facebook Parser module.
Extracts raw post & comment dictionaries from Facebook HTML elements or string fixtures.
"""

import re
import logging
from typing import Dict, Any, Optional, List
from bs4 import BeautifulSoup

logger = logging.getLogger("facebook_parser")


def parse_facebook_count(text: str) -> Optional[int]:
    """Parse text like '1.4K comments', '120 shares', '4.2M' into an integer."""
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


class FacebookParser:
    """Parses raw Facebook post HTML into structured dictionaries."""

    @staticmethod
    def parse_post_html(html_content: str, is_comment: bool = False, parent_post_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Parse raw HTML string of a Facebook post element."""
        if not html_content:
            return None

        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Post/comment text extraction
        text = ""

        if not is_comment:
            # Posts: try confirmed data-ad-* selectors first
            for attr, val in [("data-ad-comet-preview", "message"), ("data-ad-preview", "message")]:
                elem = soup.find(attrs={attr: val})
                if elem:
                    text = elem.get_text(separator=" ").strip()
                    break

        if not text:
            # Comments and fallback: find the longest dir=auto text block
            candidates = []
            for d in soup.find_all(attrs={"dir": "auto"}):
                t = d.get_text(separator=" ").strip()
                if (len(t) > 10
                        and not re.match(r"^(Like|Comment|Share|Reply|Send|More|See more|Follow)$", t, re.I)
                        and not re.match(r"^\d+[KkMm]?$", t)):
                    candidates.append(t)
            if candidates:
                text = max(candidates, key=len)

        # 2. Post ID & Permalink
        post_url = ""
        post_id = ""
        link_elem = soup.find("a", href=re.compile(r"/(posts|permalink|photos|story\.php|fbid)/"))
        if not link_elem:
            link_elem = soup.find("a", href=re.compile(r"story_fbid|fbid=|/photo"))

        if link_elem and link_elem.has_attr("href"):
            href = link_elem["href"]
            # Preserve fbid/story_fbid params — they ARE the post ID
            # Only strip pure tracking params (__cft__, __tn__, hash, etc.)
            href_clean = re.sub(r"[?&](?:__cft__|__tn__|hash|__xts__|_nc_)[^&]*", "", href).strip("?&")
            post_url = f"https://www.facebook.com{href_clean}" if href_clean.startswith("/") else href_clean

            # Extract ID: try path-based first, then query string
            id_match = (
                re.search(r"(?:posts/|permalink/)([a-zA-Z0-9_-]+)", href)
                or re.search(r"[?&](?:fbid|story_fbid)=([0-9a-zA-Z_-]+)", href)
                or re.search(r"/photos/([0-9]+)", href)
            )
            if id_match:
                post_id = id_match.group(1)

        if not post_id and text:
            # Deterministic hash ID — URL will be fake, comment collection will be skipped
            post_id = f"fb_{abs(hash(text[:60])) & 0xFFFFFFFF}"

        if not post_id:
            return None


        # 3. Author Info
        # Try aria-label on profile links, then h2/h3/strong tags
        author_name = ""
        # Look for a link with aria-label (FB uses this for profile links)
        profile_link = soup.find("a", attrs={"aria-label": True})
        if profile_link:
            author_name = profile_link["aria-label"].strip()
        if not author_name:
            h_tag = soup.find(["h2", "h3"])
            if h_tag:
                author_name = h_tag.get_text().strip()
        if not author_name:
            strong_tag = soup.find("strong")
            if strong_tag:
                author_name = strong_tag.get_text().strip()
        if not author_name:
            author_name = "Facebook User"

        author_id = re.sub(r"\W+", "_", author_name.lower()).strip("_")

        # 4. Timestamp
        abbr_elem = soup.find("abbr")
        timestamp = abbr_elem.get_text().strip() if abbr_elem else ""

        # 5. Engagement Metrics (regex on full text)
        all_text = soup.get_text(separator=" ")
        reactions = 0
        comments_count = 0
        shares = 0

        reaction_match = re.search(r"([\d.,]+[KkMm]?)\s+(?:reactions|likes?)", all_text, re.IGNORECASE)
        if reaction_match:
            reactions = parse_facebook_count(reaction_match.group(1)) or 0

        comment_match = re.search(r"([\d.,]+[KkMm]?)\s+comments?", all_text, re.IGNORECASE)
        if comment_match:
            comments_count = parse_facebook_count(comment_match.group(1)) or 0

        share_match = re.search(r"([\d.,]+[KkMm]?)\s+shares?", all_text, re.IGNORECASE)
        if share_match:
            shares = parse_facebook_count(share_match.group(1)) or 0

        return {
            "post_id": post_id,
            "post_url": post_url or f"https://www.facebook.com/permalink.php?story_fbid={post_id}",
            "text": text,
            "author_id": author_id,
            "username": author_id,
            "display_name": author_name,
            "created_at": timestamp,
            "reactions": reactions,
            "comments": comments_count,
            "shares": shares,
            "hashtags": extract_hashtags(text),
            "mentions": extract_mentions(text),
            "is_comment": is_comment,
            "parent_post_id": parent_post_id,
        }
