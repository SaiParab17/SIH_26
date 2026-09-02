"""
Deduplicator module.
Maintains set of seen stable source IDs to prevent duplicate items.
"""

from typing import Set, List, Optional
from app.models.social_event import CanonicalSocialEvent


class Deduplicator:
    """Thread-safe / async in-memory deduplicator tracking stable source IDs."""

    def __init__(self, initial_ids: Optional[List[str]] = None):
        self._seen_ids: Set[str] = set(initial_ids or [])

    def is_duplicate(self, source_id: str) -> bool:
        """Check if source_id has already been seen."""
        return source_id in self._seen_ids

    def mark_seen(self, source_id: str) -> bool:
        """
        Mark a source_id as seen.
        Returns True if item was NEW, False if it was a duplicate.
        """
        if source_id in self._seen_ids:
            return False
        self._seen_ids.add(source_id)
        return True

    def filter_events(self, events: List[CanonicalSocialEvent]) -> List[CanonicalSocialEvent]:
        """Filter list of events, returning only unique new items."""
        unique_events = []
        for event in events:
            if self.mark_seen(event.event_id):
                unique_events.append(event)
        return unique_events

    def count(self) -> int:
        """Get total count of unique seen IDs."""
        return len(self._seen_ids)
