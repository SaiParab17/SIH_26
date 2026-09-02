"""
BaseSocialCollector Interface.
Standardized base class for platform collectors (X, Facebook, etc.).
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.models.social_event import CanonicalSocialEvent


class BaseSocialCollector(ABC):
    """Abstract Base Class for web platform data collectors."""

    def __init__(self, platform_name: str, headless: bool = True, timeout_ms: int = 30000):
        self.platform_name = platform_name
        self.headless = headless
        self.timeout_ms = timeout_ms
        self.session_active = False

    @abstractmethod
    async def start_session(self) -> None:
        """Initialize browser, context, and page session."""
        pass

    @abstractmethod
    async def search_or_discover(self, query: str, sort: str = "recent") -> bool:
        """Navigate to query search or discovery page on target platform."""
        pass

    @abstractmethod
    async def collect_posts(
        self,
        query: str,
        target_count: int = 1000,
        max_pages: int = 100,
        comments_per_post: int = 5,
        on_item_collected: Optional[Any] = None,
    ) -> List[CanonicalSocialEvent]:
        """Collect public posts up to target_count valid unique items."""
        pass

    @abstractmethod
    async def collect_comments(
        self,
        post_url: str,
        parent_event_id: str,
        limit: int = 5,
    ) -> List[CanonicalSocialEvent]:
        """Collect public top-level comments and replies for a given post."""
        pass

    @abstractmethod
    def normalize(self, raw_item: Dict[str, Any], event_type: str = "post") -> CanonicalSocialEvent:
        """Convert extracted raw DOM dict into CanonicalSocialEvent model."""
        pass

    @abstractmethod
    async def close_session(self) -> None:
        """Gracefully close page, context, and browser."""
        pass
