// =============================================================================
// YouTube API Client — frontend service to communicate with the backend
// =============================================================================

import type { CanonicalSocialEvent } from '../types';

const API_BASE = 'http://localhost:3001/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface YouTubeIngestionRequest {
  query: string;
  maxResults?: number;
  publishedAfter?: string;
  publishedBefore?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  maxCommentsPerVideo?: number;
}

export interface YouTubeIngestionResult {
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

export interface YouTubeEventsResponse {
  total: number;
  limit: number;
  offset: number;
  count: number;
  events: CanonicalSocialEvent[];
}

export interface YouTubeStats {
  totalEvents: number;
  totalIngestions: number;
  lastIngestionTime: string | null;
  queriesRun: string[];
  eventsByType: {
    posts: number;
    comments: number;
  };
}

export interface YouTubeSearchPreview {
  query: string;
  total: number;
  preview: CanonicalSocialEvent[];
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/** Check if the backend is running. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Run the full YouTube ingestion pipeline. */
export async function ingestYouTube(
  request: YouTubeIngestionRequest,
): Promise<YouTubeIngestionResult> {
  const res = await fetch(`${API_BASE}/youtube/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(90000), // 90s timeout — YouTube API + comment fetching can be slow
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ingestion failed');
  }

  return res.json();
}

/** Fetch stored YouTube events with optional pagination and type filter. */
export async function fetchYouTubeEvents(
  options: { limit?: number; offset?: number; type?: string; q?: string } = {},
): Promise<YouTubeEventsResponse> {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.offset) params.set('offset', String(options.offset));
  if (options.type) params.set('type', options.type);
  if (options.q) params.set('q', options.q);

  const res = await fetch(`${API_BASE}/youtube/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

/** Preview YouTube search results without storing. */
export async function searchYouTubePreview(
  query: string,
  maxResults: number = 5,
): Promise<YouTubeSearchPreview> {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
  const res = await fetch(`${API_BASE}/youtube/search?${params.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

/** Get ingestion statistics. */
export async function fetchYouTubeStats(): Promise<YouTubeStats> {
  const res = await fetch(`${API_BASE}/youtube/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

/** Clear all stored YouTube events. */
export async function clearYouTubeEvents(): Promise<void> {
  const res = await fetch(`${API_BASE}/youtube/events`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear events');
}
