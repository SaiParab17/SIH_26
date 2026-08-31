export type SocialPlatform = 'x' | 'telegram' | 'instagram' | 'facebook' | 'reddit' | 'youtube';

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  color: string;
  bgColor: string;
  iconName: string;
  status: 'connected' | 'partially_configured' | 'unavailable' | 'disabled';
  targetItems: number;
  validUniqueCount: number;
  duplicateCount: number;
  errorCount: number;
  completionPercentage: number;
}

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

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
  timeline: Array<{
    time: string;
    positive: number;
    negative: number;
    neutral: number;
  }>;
}

export interface EmotionMetrics {
  joy: number;
  anger: number;
  fear: number;
  anxiety: number;
  excitement: number;
  sadness: number;
  surprise: number;
}

export interface StanceMetrics {
  support: number;
  against: number;
  neutral: number;
}

export interface DemographicSegment {
  segment: string;
  percentage: number;
  confidence: number;
  sample_size: number;
  basis: string;
}

export interface AudienceProfile {
  ageBrackets: DemographicSegment[];
  geography: Array<{ country: string; flag: string; percentage: number; count: number }>;
  languages: Array<{ language: string; code: string; percentage: number }>;
  interests: Array<{ interest: string; category: string; percentage: number }>;
}

export interface TopicCluster {
  id: string;
  title: string;
  keywords: string[];
  volume: number;
  sentiment: { positive: number; negative: number; neutral: number };
  trendScore: number;
  growthRatePct: number;
  topInfluencers: string[];
  platforms: SocialPlatform[];
  forecastDirection: 'likely_rising' | 'stable' | 'likely_declining' | 'uncertain';
}

export interface TrendItem {
  id: string;
  topic: string;
  category: string;
  trendScore: number; // 0.00 - 1.00
  growthRatePct: number;
  engagementVelocity: number;
  uniqueUsersGrowth: number;
  crossPlatformSpread: number;
  recencyScore: number;
  status: 'emerging' | 'rising' | 'viral' | 'stable' | 'declining';
  forecast1h: number;
  forecast6h: number;
  forecast24h: number;
  prediction: string;
}

export interface NetworkNode {
  id: string;
  username: string;
  name: string;
  platform: SocialPlatform;
  communityId: number;
  communityName: string;
  influenceScore: number;
  pageRank: number;
  betweenness: number;
  reach: number;
  role: 'leading_node' | 'bridge_node' | 'community_leader' | 'participant';
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  relationshipType: 'mention' | 'reply' | 'repost' | 'quote' | 'follow';
}

export interface CommunityDetail {
  id: number;
  name: string;
  size: number;
  color: string;
  dominantTopic: string;
  dominantSentiment: string;
  topNodes: string[];
}

export interface PropagationStep {
  step: number;
  timestamp: string;
  fromCommunity: string;
  toCommunity: string;
  timeLagMinutes: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  volume: number;
  keyPostSnippet: string;
}

export interface AIAnalystQueryResponse {
  query: string;
  answer: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  evidence: {
    sentimentChange?: string;
    topTopic?: string;
    dominantPlatform?: string;
    propagationPattern?: string;
    sampleSize?: number;
  };
  supportingEventIds: string[];
}

export interface AnalysisPipelineStep {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  progressPct: number;
  detailMessage?: string;
}
