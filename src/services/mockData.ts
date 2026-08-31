import type {
  CanonicalSocialEvent,
  PlatformConfig,
  SentimentDistribution,
  EmotionMetrics,
  StanceMetrics,
  AudienceProfile,
  TopicCluster,
  TrendItem,
  NetworkNode,
  NetworkEdge,
  CommunityDetail,
  PropagationStep,
  AIAnalystQueryResponse,
  AnalysisPipelineStep
} from '../types';

export const INITIAL_PLATFORMS: PlatformConfig[] = [
  {
    id: 'x',
    name: 'X (Twitter)',
    color: '#1DA1F2',
    bgColor: '#E8F5FD',
    iconName: 'Twitter',
    status: 'connected',
    targetItems: 1500,
    validUniqueCount: 1482,
    duplicateCount: 18,
    errorCount: 0,
    completionPercentage: 98.8
  },
  {
    id: 'telegram',
    name: 'Telegram',
    color: '#24A1DE',
    bgColor: '#EBF6FC',
    iconName: 'Send',
    status: 'connected',
    targetItems: 2000,
    validUniqueCount: 2000,
    duplicateCount: 45,
    errorCount: 0,
    completionPercentage: 100.0
  },
  {
    id: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    bgColor: '#FFF0EC',
    iconName: 'MessageSquare',
    status: 'connected',
    targetItems: 2000,
    validUniqueCount: 1720,
    duplicateCount: 110,
    errorCount: 12,
    completionPercentage: 86.0
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    bgColor: '#FDF0F5',
    iconName: 'Instagram',
    status: 'partially_configured',
    targetItems: 1000,
    validUniqueCount: 710,
    duplicateCount: 65,
    errorCount: 8,
    completionPercentage: 71.0
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    bgColor: '#FFEAEB',
    iconName: 'Youtube',
    status: 'connected',
    targetItems: 500,
    validUniqueCount: 340,
    duplicateCount: 12,
    errorCount: 4,
    completionPercentage: 68.0
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    bgColor: '#EAF2FE',
    iconName: 'Facebook',
    status: 'connected',
    targetItems: 1000,
    validUniqueCount: 1000,
    duplicateCount: 82,
    errorCount: 0,
    completionPercentage: 100.0
  }
];

export const MOCK_SENTIMENT: SentimentDistribution = {
  positive: 46.2,
  negative: 32.8,
  neutral: 21.0,
  timeline: [
    { time: '00:00', positive: 42, negative: 35, neutral: 23 },
    { time: '04:00', positive: 44, negative: 33, neutral: 23 },
    { time: '08:00', positive: 48, negative: 30, neutral: 22 },
    { time: '12:00', positive: 39, negative: 41, neutral: 20 },
    { time: '16:00', positive: 47, negative: 32, neutral: 21 },
    { time: '20:00', positive: 51, negative: 29, neutral: 20 },
    { time: '24:00', positive: 46.2, negative: 32.8, neutral: 21.0 }
  ]
};

export const MOCK_EMOTIONS: EmotionMetrics = {
  joy: 24,
  anger: 18,
  fear: 14,
  anxiety: 22,
  excitement: 12,
  sadness: 6,
  surprise: 4
};

export const MOCK_STANCE: StanceMetrics = {
  support: 48,
  against: 34,
  neutral: 18
};

export const MOCK_AUDIENCE: AudienceProfile = {
  ageBrackets: [
    { segment: '18–24', percentage: 28.4, confidence: 0.76, sample_size: 9050, basis: 'Bio keywords, language slang, public engagement graph' },
    { segment: '25–34', percentage: 41.2, confidence: 0.88, sample_size: 13130, basis: 'Stated career bio, posting frequency, professional topics' },
    { segment: '35–44', percentage: 21.5, confidence: 0.82, sample_size: 6850, basis: 'Policy interest, institutional links, content depth' },
    { segment: '45+', percentage: 8.9, confidence: 0.71, sample_size: 2852, basis: 'Historical account age, legacy news sharing' }
  ],
  geography: [
    { country: 'India', flag: '🇮🇳', percentage: 42.5, count: 13540 },
    { country: 'United States', flag: '🇺🇸', percentage: 26.1, count: 8320 },
    { country: 'United Kingdom', flag: '🇬🇧', percentage: 11.4, count: 3634 },
    { country: 'Germany', flag: '🇩🇪', percentage: 8.2, count: 2614 },
    { country: 'Singapore', flag: '🇸🇬', percentage: 5.8, count: 1849 },
    { country: 'Others', flag: '🌐', percentage: 6.0, count: 1925 }
  ],
  languages: [
    { language: 'English', code: 'EN', percentage: 68.5 },
    { language: 'Hindi', code: 'HI', percentage: 18.2 },
    { language: 'Marathi', code: 'MR', percentage: 7.4 },
    { language: 'German', code: 'DE', percentage: 3.5 },
    { language: 'Others', code: 'OTHER', percentage: 2.4 }
  ],
  interests: [
    { interest: 'Technology & AI', category: 'Technical', percentage: 84.2 },
    { interest: 'Public Policy & Ethics', category: 'Governance', percentage: 62.1 },
    { interest: 'Software Engineering', category: 'Technical', percentage: 55.4 },
    { interest: 'Academic Research', category: 'Education', percentage: 41.0 },
    { interest: 'Finance & Venture Capital', category: 'Business', percentage: 38.6 }
  ]
};

export const MOCK_TOPICS: TopicCluster[] = [
  {
    id: 'topic-1',
    title: 'AI Governance & Compliance',
    keywords: ['AI Policy', 'Compliance', 'Safety Guardrails', 'EU AI Act', 'Governance Framework'],
    volume: 48210,
    sentiment: { positive: 48, negative: 32, neutral: 20 },
    trendScore: 0.92,
    growthRatePct: 340,
    topInfluencers: ['@tech_analyst_raj', '@ai_policy_lab', 'Prof. Elena Rostova'],
    platforms: ['x', 'linkedin' as any, 'telegram', 'reddit'],
    forecastDirection: 'likely_rising'
  },
  {
    id: 'topic-2',
    title: 'Autonomous Agent Safety',
    keywords: ['Agentic AI', 'Sandboxing', 'Tool Execution', 'Security Audit', 'System Prompts'],
    volume: 34120,
    sentiment: { positive: 56, negative: 24, neutral: 20 },
    trendScore: 0.86,
    growthRatePct: 210,
    topInfluencers: ['@open_agent_dev', 'Dr. Marcus Vance'],
    platforms: ['x', 'reddit', 'telegram'],
    forecastDirection: 'likely_rising'
  },
  {
    id: 'topic-3',
    title: 'Data Sovereignty & Privacy',
    keywords: ['Local Storage', 'Data Protection', 'DPDP Act', 'Encryption', 'Telemetry'],
    volume: 28940,
    sentiment: { positive: 38, negative: 46, neutral: 16 },
    trendScore: 0.79,
    growthRatePct: 154,
    topInfluencers: ['@privacy_first_in', '@cyber_rights'],
    platforms: ['telegram', 'reddit', 'x'],
    forecastDirection: 'stable'
  },
  {
    id: 'topic-4',
    title: 'Quantum Hardware Benchmarks',
    keywords: ['Qubits', 'Coherence Time', 'Error Mitigation', 'Superconducting', 'Trapped Ion'],
    volume: 14500,
    sentiment: { positive: 65, negative: 15, neutral: 20 },
    trendScore: 0.68,
    growthRatePct: 88,
    topInfluencers: ['QuantumToday', 'Physicist_Daily'],
    platforms: ['youtube', 'reddit'],
    forecastDirection: 'stable'
  }
];

export const MOCK_TRENDS: TrendItem[] = [
  {
    id: 'trend-1',
    topic: 'AI Regulation & Compliance Standards',
    category: 'Policy & Governance',
    trendScore: 0.92,
    growthRatePct: 340,
    engagementVelocity: 0.88,
    uniqueUsersGrowth: 0.91,
    crossPlatformSpread: 0.85,
    recencyScore: 0.95,
    status: 'viral',
    forecast1h: 0.94,
    forecast6h: 0.96,
    forecast24h: 0.93,
    prediction: 'likely_to_remain_rising'
  },
  {
    id: 'trend-2',
    topic: 'Autonomous Multi-Agent Workflows',
    category: 'AI Infrastructure',
    trendScore: 0.86,
    growthRatePct: 210,
    engagementVelocity: 0.82,
    uniqueUsersGrowth: 0.85,
    crossPlatformSpread: 0.79,
    recencyScore: 0.90,
    status: 'rising',
    forecast1h: 0.88,
    forecast6h: 0.91,
    forecast24h: 0.89,
    prediction: 'likely_to_accelerate'
  },
  {
    id: 'trend-3',
    topic: 'Synthesized Media & Audio Verification',
    category: 'Cybersecurity',
    trendScore: 0.78,
    growthRatePct: 154,
    engagementVelocity: 0.74,
    uniqueUsersGrowth: 0.76,
    crossPlatformSpread: 0.88,
    recencyScore: 0.82,
    status: 'emerging',
    forecast1h: 0.81,
    forecast6h: 0.85,
    forecast24h: 0.84,
    prediction: 'emerging_cross_platform'
  },
  {
    id: 'trend-4',
    topic: 'On-Device Small Language Models',
    category: 'Edge Computing',
    trendScore: 0.71,
    growthRatePct: 95,
    engagementVelocity: 0.68,
    uniqueUsersGrowth: 0.70,
    crossPlatformSpread: 0.65,
    recencyScore: 0.75,
    status: 'stable',
    forecast1h: 0.72,
    forecast6h: 0.73,
    forecast24h: 0.70,
    prediction: 'stable_interest'
  }
];

export const MOCK_NETWORK_NODES: NetworkNode[] = [
  { id: 'node-1', username: 'tech_analyst_raj', name: 'Rajesh Sharma', platform: 'x', communityId: 1, communityName: 'Policy & Research Lab', influenceScore: 0.94, pageRank: 0.88, betweenness: 0.82, reach: 142000, role: 'leading_node' },
  { id: 'node-2', username: 'ai_policy_lab', name: 'AI Policy Institute', platform: 'x', communityId: 1, communityName: 'Policy & Research Lab', influenceScore: 0.91, pageRank: 0.84, betweenness: 0.79, reach: 98000, role: 'community_leader' },
  { id: 'node-3', username: 'open_agent_dev', name: 'Agentic Frameworks', platform: 'reddit', communityId: 2, communityName: 'Developer Guild', influenceScore: 0.88, pageRank: 0.81, betweenness: 0.89, reach: 76000, role: 'bridge_node' },
  { id: 'node-4', username: 'prof_rostova', name: 'Prof. Elena Rostova', platform: 'telegram', communityId: 1, communityName: 'Policy & Research Lab', influenceScore: 0.85, pageRank: 0.78, betweenness: 0.65, reach: 54000, role: 'leading_node' },
  { id: 'node-5', username: 'privacy_watch_in', name: 'Data Rights Forum', platform: 'telegram', communityId: 3, communityName: 'Privacy Advocates', influenceScore: 0.82, pageRank: 0.75, betweenness: 0.81, reach: 62000, role: 'bridge_node' },
  { id: 'node-6', username: 'code_builder_42', name: 'Aarav Patel', platform: 'github' as any, communityId: 2, communityName: 'Developer Guild', influenceScore: 0.76, pageRank: 0.69, betweenness: 0.54, reach: 31000, role: 'participant' }
];

export const MOCK_NETWORK_EDGES: NetworkEdge[] = [
  { source: 'node-1', target: 'node-2', weight: 42, relationshipType: 'repost' },
  { source: 'node-1', target: 'node-3', weight: 28, relationshipType: 'quote' },
  { source: 'node-3', target: 'node-5', weight: 35, relationshipType: 'mention' },
  { source: 'node-2', target: 'node-4', weight: 19, relationshipType: 'reply' },
  { source: 'node-5', target: 'node-1', weight: 15, relationshipType: 'quote' }
];

export const MOCK_COMMUNITIES: CommunityDetail[] = [
  { id: 1, name: 'Policy & Research Lab', size: 14200, color: '#3157D5', dominantTopic: 'AI Governance', dominantSentiment: 'Positive (48%)', topNodes: ['@tech_analyst_raj', '@ai_policy_lab', 'Prof. Elena Rostova'] },
  { id: 2, name: 'Developer Guild', size: 11800, color: '#DE775A', dominantTopic: 'Autonomous Agent Safety', dominantSentiment: 'Positive (56%)', topNodes: ['@open_agent_dev', '@code_builder_42'] },
  { id: 3, name: 'Privacy Advocates', size: 5882, color: '#4C8768', dominantTopic: 'Data Protection & DPDP', dominantSentiment: 'Negative (46%)', topNodes: ['@privacy_watch_in'] }
];

export const MOCK_PROPAGATION: PropagationStep[] = [
  { step: 1, timestamp: '10:05 UTC', fromCommunity: 'Policy & Research Lab (X)', toCommunity: 'Developer Guild (Reddit)', timeLagMinutes: 37, sentiment: 'positive', volume: 1420, keyPostSnippet: 'New framework guidelines proposed for sandboxed model execution.' },
  { step: 2, timestamp: '10:42 UTC', fromCommunity: 'Developer Guild (Reddit)', toCommunity: 'Privacy Advocates (Telegram)', timeLagMinutes: 26, sentiment: 'negative', volume: 2180, keyPostSnippet: 'Devs raise concerns regarding telemetry logging requirement.' },
  { step: 3, timestamp: '11:08 UTC', fromCommunity: 'Privacy Advocates (Telegram)', toCommunity: 'General News Audience (YouTube)', timeLagMinutes: 45, sentiment: 'negative', volume: 4820, keyPostSnippet: 'Video breakdown highlights compliance burden on early-stage startups.' }
];

export const MOCK_EVENTS: CanonicalSocialEvent[] = [
  {
    event_id: 'evt_1001',
    platform: 'x',
    event_type: 'post',
    source: { source_id: 'x_182947192', url: 'https://x.com/tech_analyst_raj/status/182947192', collector: 'x_official_api' },
    author: { user_id: 'u_101', username: 'tech_analyst_raj', display_name: 'Rajesh Sharma', verified: true, follower_count: 142000 },
    content: { text: 'The new guidelines for AI compliance and sandboxing balance security with developer freedom. Essential reading for engineering leads! #AIRegulation #AgenticAI', language: 'en', hashtags: ['AIRegulation', 'AgenticAI'], mentions: [] },
    engagement: { likes: 1420, comments: 184, shares: 312, views: 48000 },
    relationships: {},
    timestamps: { created_at: '2026-08-31T10:05:00Z', collected_at: '2026-08-31T10:07:15Z' },
    analysis: {
      sentiment: { label: 'positive', score: 0.88 },
      emotion: { label: 'joy', score: 0.72 },
      stance: { label: 'support', score: 0.91 },
      sarcasm: { detected: false, score: 0.04 }
    },
    collection_reason: ['recent', 'high_engagement']
  },
  {
    event_id: 'evt_1002',
    platform: 'telegram',
    event_type: 'message',
    source: { source_id: 'tg_msg_94012', url: 'https://t.me/privacy_watch/94012', collector: 'telegram_bot_collector' },
    author: { user_id: 'u_204', username: 'privacy_watch_in', display_name: 'Data Rights Forum', verified: false },
    content: { text: 'Telemetry logging requirements in the draft policy could compromise end-user data privacy unless strict zero-knowledge proofs are implemented.', language: 'en', hashtags: ['DataPrivacy'], mentions: [] },
    engagement: { likes: 890, comments: 142, shares: 204, views: 18400 },
    relationships: {},
    timestamps: { created_at: '2026-08-31T10:42:00Z', collected_at: '2026-08-31T10:43:00Z' },
    analysis: {
      sentiment: { label: 'negative', score: 0.79 },
      emotion: { label: 'anxiety', score: 0.81 },
      stance: { label: 'against', score: 0.84 },
      sarcasm: { detected: false, score: 0.02 }
    },
    collection_reason: ['recent', 'high_velocity']
  }
];

export const PRESET_AI_QUERIES: AIAnalystQueryResponse[] = [
  {
    query: "Why did negative sentiment spike around 12:00 UTC?",
    answer: "Negative sentiment rose from 30% to 41% due to discussions regarding proposed telemetry compliance rules in r/technology and Telegram channel @privacy_watch_in. Analysts expressed concern about potential data retention overhead for startups.",
    confidence: "High",
    confidenceScore: 0.92,
    evidence: {
      sentimentChange: "+11.0 percentage points negative shift",
      topTopic: "Data Protection Telemetry",
      dominantPlatform: "Reddit & Telegram",
      propagationPattern: "X → Reddit → Telegram",
      sampleSize: 18420
    },
    supportingEventIds: ['evt_1002']
  },
  {
    query: "Which community is driving the AI Regulation trend?",
    answer: "The 'Policy & Research Lab' community (centered on X and Telegram) initiated 62% of early posts, which were subsequently amplified by the 'Developer Guild' on Reddit with a 37-minute propagation lag.",
    confidence: "High",
    confidenceScore: 0.89,
    evidence: {
      topTopic: "AI Governance & Compliance",
      dominantPlatform: "X (Twitter)",
      propagationPattern: "Policy & Research Lab → Developer Guild",
      sampleSize: 48210
    },
    supportingEventIds: ['evt_1001']
  }
];

export const MOCK_PIPELINE_STEPS: AnalysisPipelineStep[] = [
  { id: 's1', name: 'Platform Data Collection', status: 'completed', progressPct: 100, detailMessage: '182,430 items collected across 6 platforms' },
  { id: 's2', name: 'Canonical Event Normalization', status: 'completed', progressPct: 100, detailMessage: 'Deduplicated 1,492 duplicate records' },
  { id: 's3', name: 'Sentiment & Emotion Inference', status: 'completed', progressPct: 100, detailMessage: 'Multi-dimensional BERT inference complete' },
  { id: 's4', name: 'Topic Clustering & Embeddings', status: 'completed', progressPct: 100, detailMessage: 'Extracted 124 distinct topic clusters' },
  { id: 's5', name: 'Trend Scoring & Forecasting', status: 'completed', progressPct: 100, detailMessage: '+1h, +6h, +24h velocity vectors computed' },
  { id: 's6', name: 'Network Topology & Community Graph', status: 'completed', progressPct: 100, detailMessage: 'Louvain modularity = 0.68, PageRank generated' },
  { id: 's7', name: 'Evidence Synthesis & AI Grounding', status: 'completed', progressPct: 100, detailMessage: 'Vector index updated with provenance pointers' }
];
