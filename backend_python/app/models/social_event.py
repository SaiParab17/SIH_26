"""
Canonical SocialEvent Schema - Pydantic implementation.
Mirrors the project's canonical social event model for X, Facebook, YouTube, etc.
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class SocialAuthor(BaseModel):
    user_id: str
    username: str
    display_name: str
    avatarUrl: Optional[str] = None
    verified: Optional[bool] = None
    followers_count: Optional[int] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    inferred_interests: Optional[List[str]] = Field(default_factory=list)


class EventEngagement(BaseModel):
    likes: Optional[int] = 0
    comments: Optional[int] = 0
    shares: Optional[int] = 0
    views: Optional[int] = None


class EventSource(BaseModel):
    source_id: str
    url: str
    collector: str


class EventContent(BaseModel):
    text: str
    language: Optional[str] = "en"
    hashtags: List[str] = Field(default_factory=list)
    mentions: List[str] = Field(default_factory=list)
    media: List[str] = Field(default_factory=list)


class EventRelationships(BaseModel):
    reply_to: Optional[str] = None
    repost_of: Optional[str] = None
    quoted_event_id: Optional[str] = None
    parent_post_id: Optional[str] = None
    mentions: List[str] = Field(default_factory=list)


class EventTimestamps(BaseModel):
    created_at: str
    updated_at: Optional[str] = None
    collected_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class SentimentAnalysis(BaseModel):
    label: Literal["positive", "negative", "neutral"] = "neutral"
    score: float = 0.0


class EmotionAnalysis(BaseModel):
    label: Literal["joy", "anger", "fear", "anxiety", "excitement", "sadness", "surprise"] = "surprise"
    score: float = 0.0


class StanceAnalysis(BaseModel):
    label: Literal["support", "against", "neutral"] = "neutral"
    score: float = 0.0


class SarcasmAnalysis(BaseModel):
    detected: bool = False
    score: float = 0.0


class EventAnalysis(BaseModel):
    sentiment: SentimentAnalysis = Field(default_factory=SentimentAnalysis)
    emotion: EmotionAnalysis = Field(default_factory=EmotionAnalysis)
    stance: StanceAnalysis = Field(default_factory=StanceAnalysis)
    sarcasm: SarcasmAnalysis = Field(default_factory=SarcasmAnalysis)


class CollectionMeta(BaseModel):
    query: str
    collection_reason: List[str] = Field(default_factory=lambda: ["recent", "relevant"])
    source_type: str = "web"


class CanonicalSocialEvent(BaseModel):
    event_id: str
    platform: Literal["x", "telegram", "instagram", "facebook", "reddit", "youtube"]
    event_type: Literal["post", "comment", "reply", "repost", "message"]
    source: EventSource
    author: SocialAuthor
    content: EventContent
    engagement: EventEngagement
    relationships: EventRelationships = Field(default_factory=EventRelationships)
    timestamps: EventTimestamps
    analysis: EventAnalysis = Field(default_factory=EventAnalysis)
    collection_reason: List[str] = Field(default_factory=lambda: ["recent", "relevant"])
