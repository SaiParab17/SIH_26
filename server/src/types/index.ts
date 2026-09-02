// =============================================================================
// Shared types — mirrors frontend CanonicalSocialEvent schema exactly
// =============================================================================

export type SocialPlatform = 'x' | 'telegram' | 'instagram' | 'facebook' | 'reddit' | 'youtube';

export interface SocialAuthor {
  user_id: string;
  username: string;
  display_name: string;
  avatarUrl?: string;
  verified?: boolean;
  follower_count?: number;
  inferred_interests?: string[];
}

export interface EventEngagement {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
}

export interface CanonicalSocialEvent {
  event_id: string;
  platform: SocialPlatform;
  event_type: 'post' | 'comment' | 'reply' | 'repost' | 'message';
  source: {
    source_id: string;
    url: string;
    collector: string;
  };
  author: SocialAuthor;
  content: {
    text: string;
    language: string;
    hashtags: string[];
    mentions: string[];
  };
  engagement: EventEngagement;
  relationships: {
    reply_to?: string | null;
    repost_of?: string | null;
    quoted_event_id?: string | null;
  };
  timestamps: {
    created_at: string;
    collected_at: string;
  };
  analysis: {
    sentiment: {
      label: 'positive' | 'negative' | 'neutral';
      score: number;
    };
    emotion: {
      label: 'joy' | 'anger' | 'fear' | 'anxiety' | 'excitement' | 'sadness' | 'surprise';
      score: number;
    };
    stance: {
      label: 'support' | 'against' | 'neutral';
      score: number;
    };
    sarcasm: {
      detected: boolean;
      score: number;
    };
  };
  collection_reason: string[];
}

// =============================================================================
// Backend-specific types
// =============================================================================

export interface IngestionRequest {
  query: string;
  maxResults?: number;
  publishedAfter?: string;   // ISO 8601 date string
  publishedBefore?: string;  // ISO 8601 date string
  regionCode?: string;       // e.g. 'IN', 'US'
  relevanceLanguage?: string; // e.g. 'en', 'hi'
  maxCommentsPerVideo?: number;
}

export interface IngestionResult {
  success: boolean;
  query: string;
  videosFound: number;
  videosProcessed: number;
  commentsCollected: number;
  totalEventsCreated: number;
  totalEventsStored: number;
  duplicatesSkipped: number;
  errors: string[];
  timestamp: string;
  durationMs: number;
}

export interface IngestionLogEntry {
  id: string;
  query: string;
  timestamp: string;
  videosProcessed: number;
  commentsCollected: number;
  eventsCreated: number;
  errors: string[];
}

export interface IngestionStats {
  totalEvents: number;
  totalIngestions: number;
  lastIngestionTime: string | null;
  queriesRun: string[];
  eventsByType: {
    posts: number;
    comments: number;
  };
}
