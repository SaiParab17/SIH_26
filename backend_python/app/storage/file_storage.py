"""
File Storage module.
Increments and persists CanonicalSocialEvents to JSON files.
"""

import os
import json
import logging
from typing import List, Dict, Any
from app.models.social_event import CanonicalSocialEvent

logger = logging.getLogger("file_storage")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
EVENTS_FILE = os.path.join(DATA_DIR, "events.json")


def ensure_data_dir() -> None:
    """Ensure data directory exists."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)


def load_all_events() -> List[Dict[str, Any]]:
    """Load all stored canonical events from JSON file."""
    ensure_data_dir()
    if not os.path.exists(EVENTS_FILE):
        return []
    try:
        with open(EVENTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as err:
        logger.error(f"Error reading events file: {err}")
        return []


def save_events(new_events: List[CanonicalSocialEvent], current_query: Optional[str] = None) -> int:
    """
    Append new CanonicalSocialEvents to storage, deduplicating by event_id.
    Automatically prunes historical events so only events for the 2 most recent queries are retained.
    """
    ensure_data_dir()
    existing = load_all_events()
    existing_ids = {e.get("event_id") for e in existing}

    new_ids = set()
    saved_count = 0
    for event in new_events:
        event_dict = event.model_dump()
        new_ids.add(event_dict["event_id"])
        if event_dict["event_id"] not in existing_ids:
            existing.append(event_dict)
            existing_ids.add(event_dict["event_id"])
            saved_count += 1

    # Extract all queries from collection_reason in reverse order (newest first)
    queries = [current_query.strip()] if current_query else []
    for item in reversed(existing):
        reasons = item.get("collection_reason", [])
        for r in reasons:
            if r not in ("recent", "relevant", "high_engagement") and r.lower() not in [q.lower() for q in queries]:
                queries.append(r)

    # Keep at most 2 most recent queries
    recent_queries = queries[:2]
    if recent_queries:
        recent_lower = [q.lower() for q in recent_queries]
        existing = [
            e for e in existing
            if e.get("event_id") in new_ids
            or any(q in (e.get("content", {}).get("text", "") or "").lower() for q in recent_lower)
            or any(q in r.lower() for r in e.get("collection_reason", []) for q in recent_lower)
        ]

    # Limit maximum stored items to 150
    if len(existing) > 150:
        existing = existing[-150:]

    try:
        with open(EVENTS_FILE, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)
    except Exception as err:
        logger.error(f"Error writing events file: {err}")

    return saved_count


def clear_events() -> None:
    """Clear all stored events."""
    ensure_data_dir()
    with open(EVENTS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)
