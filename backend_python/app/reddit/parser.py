"""
Reddit Parser.
Extracts structured post & comment dictionaries from Reddit DOM elements / HTML strings.
"""

import re
import logging
from typing import Dict, Any, Optional, List
from bs4 import BeautifulSoup

logger = logging.getLogger("reddit_parser")


def parse_score(text: str) -> int:
    """Parse score text like '1.2k', '450', '1,200' into integer."""
    if not text:
        return 0
    cleaned = text.strip().lower().replace(",", "").replace(" points", "").replace(" point", "")
    try:
        if "k" in cleaned:
            val = float(cleaned.replace("k", ""))
            return int(val * 1000)
        elif "m" in cleaned:
            val = float(cleaned.replace("m", ""))
            return int(val * 1000000)
        return int(cleaned)
    except (ValueError, TypeError):
        return 0


class RedditParser:
    """Parses Reddit HTML or DOM string into structured objects."""

    @staticmethod
    def parse_post_html(html_content: str) -> Optional[Dict[str, Any]]:
        """Parse HTML string of a Reddit post item (thing.link)."""
        if not html_content:
            return None

        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Post ID & Title & URL
        title_elem = soup.find("a", class_=re.compile(r"title"))
        if not title_elem:
            return None

        title = title_elem.get_text().strip()
        rel_url = title_elem.get("href", "")
        post_url = f"https://old.reddit.com{rel_url}" if rel_url.startswith("/") else rel_url

        # Extract post_id from data-fullname or url
        id_match = re.search(r"/comments/([a-z0-9]+)/", post_url)
        post_id = id_match.group(1) if id_match else ""
        if not post_id:
            return None

        # 2. Author
        author_elem = soup.find("a", class_=re.compile(r"author"))
        author = author_elem.get_text().strip() if author_elem else "[deleted]"

        # 3. Score / Likes
        score_elem = soup.find(class_=re.compile(r"score"))
        score = parse_score(score_elem.get_text()) if score_elem else 0

        # 4. Comments count
        comments_elem = soup.find("a", class_=re.compile(r"comments"))
        comments_count = 0
        if comments_elem:
            comments_text = comments_elem.get_text().strip()
            comm_match = re.search(r"(\d+[\d,]*)\s+comment", comments_text, re.IGNORECASE)
            if comm_match:
                comments_count = parse_score(comm_match.group(1))

        # 5. Timestamp
        time_elem = soup.find("time")
        created_at = time_elem.get("datetime", "") if time_elem and time_elem.has_attr("datetime") else ""

        # Subreddit name
        sub_elem = soup.find("a", href=re.compile(r"/r/"))
        subreddit = sub_elem.get_text().strip() if sub_elem else "r/all"

        return {
            "post_id": post_id,
            "post_url": post_url,
            "title": title,
            "text": f"[{subreddit}] {title}",
            "author": author,
            "score": score,
            "comments_count": comments_count,
            "created_at": created_at,
            "subreddit": subreddit,
        }

    @staticmethod
    def parse_comment_html(html_content: str, parent_post_id: str) -> Optional[Dict[str, Any]]:
        """Parse HTML string of a Reddit comment item (thing.comment)."""
        if not html_content:
            return None

        soup = BeautifulSoup(html_content, "html.parser")

        # Comment author
        author_elem = soup.find("a", class_=re.compile(r"author"))
        author = author_elem.get_text().strip() if author_elem else "[deleted]"

        # Comment body
        body_elem = soup.find("div", class_=re.compile(r"usertext-body"))
        body = body_elem.get_text(separator=" ").strip() if body_elem else ""

        if not body:
            return None

        # Comment ID
        comment_id = ""
        id_elem = soup.find(attrs={"data-fullname": True})
        if id_elem:
            comment_id = id_elem["data-fullname"]
        else:
            comment_id = f"c_{hash(body) & 0xffffffff}"

        # Score
        score_elem = soup.find(class_=re.compile(r"score"))
        score = parse_score(score_elem.get_text()) if score_elem else 0

        # Timestamp
        time_elem = soup.find("time")
        created_at = time_elem.get("datetime", "") if time_elem and time_elem.has_attr("datetime") else ""

        return {
            "comment_id": comment_id,
            "parent_post_id": parent_post_id,
            "text": body,
            "author": author,
            "score": score,
            "created_at": created_at,
        }
