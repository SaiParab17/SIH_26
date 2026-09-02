"""
API Schemas for FastAPI collection endpoints.
"""

from typing import Optional, Literal, List, Dict, Any
from pydantic import BaseModel, Field


class CollectionRequest(BaseModel):
    platform: Optional[Literal["x", "facebook", "instagram", "multi"]] = None
    platforms: Optional[List[str]] = Field(default=None, description="List of platforms to scrape sequentially in single browser session")
    query: str = Field(..., description="Topic or keywords to search")
    target_posts: int = Field(default=10, description="Target count of valid unique posts to collect")
    max_pages: int = Field(default=10, description="Hard cap on scroll/pagination iterations")
    comments_per_post: int = Field(default=5, description="Comments to collect per post")
    posts_per_platform: int = Field(default=5, ge=1, le=20, description="Live posts to expand into comments per platform")
    sort: Optional[str] = Field(default="recent", description="Sort strategy (recent/relevant)")
    headless: Optional[bool] = Field(default=False, description="Whether to run browser headless or visible live")


class CollectionJobResponse(BaseModel):
    job_id: str
    platform: str
    status: str  # queued, running, completed, partial, failed, blocked
    message: str
    events_collected: int = 0
    events: Optional[List[Dict[str, Any]]] = None


class HealthCheckResponse(BaseModel):
    status: str = "ok"
    service: str = "socialscope-python-web-collector"
    timestamp: str
