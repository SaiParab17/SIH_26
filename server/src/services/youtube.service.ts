// =============================================================================
// YouTube Service — interacts with YouTube Data API v3
// =============================================================================

import { google, type youtube_v3 } from 'googleapis';
import { videoToCanonicalEvent, commentToCanonicalEvent } from './normalizer.js';
import { saveEvents, saveIngestionLog } from './storage.js';
import type {
  CanonicalSocialEvent,
  IngestionRequest,
  IngestionResult,
  IngestionLogEntry,
} from '../types/index.js';

// ---------------------------------------------------------------------------
// YouTube client singleton
// ---------------------------------------------------------------------------

let youtubeClient: youtube_v3.Youtube | null = null;

function getYouTube(): youtube_v3.Youtube {
  if (!youtubeClient) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable is not set.');
    }
    youtubeClient = google.youtube({ version: 'v3', auth: apiKey });
  }
  return youtubeClient;
}

// ---------------------------------------------------------------------------
// Search Videos
// ---------------------------------------------------------------------------

export interface SearchOptions {
  maxResults?: number;
  publishedAfter?: string;
  publishedBefore?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  order?: 'relevance' | 'date' | 'rating' | 'viewCount';
}

/**
 * Search YouTube for videos matching a query.
 * Returns an array of video IDs with basic snippet info.
 */
export async function searchVideos(
  query: string,
  options: SearchOptions = {},
): Promise<youtube_v3.Schema$SearchResult[]> {
  const youtube = getYouTube();
  const maxResults = Math.min(options.maxResults ?? 10, 50); // API max is 50

  const params: youtube_v3.Params$Resource$Search$List = {
    part: ['snippet'],
    q: query,
    type: ['video'],
    maxResults,
    order: options.order ?? 'relevance',
    safeSearch: 'none',
  };

  if (options.publishedAfter) params.publishedAfter = options.publishedAfter;
  if (options.publishedBefore) params.publishedBefore = options.publishedBefore;
  if (options.regionCode) params.regionCode = options.regionCode;
  if (options.relevanceLanguage) params.relevanceLanguage = options.relevanceLanguage;

  const response = await youtube.search.list(params);
  return response.data.items ?? [];
}

// ---------------------------------------------------------------------------
// Get Video Details (metadata + statistics)
// ---------------------------------------------------------------------------

/**
 * Fetch full video details (snippet + statistics + contentDetails) for a
 * batch of video IDs (max 50 per call).
 */
export async function getVideoDetails(
  videoIds: string[],
): Promise<youtube_v3.Schema$Video[]> {
  if (videoIds.length === 0) return [];

  const youtube = getYouTube();

  // YouTube allows max 50 IDs per request
  const batches: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    batches.push(videoIds.slice(i, i + 50));
  }

  const allVideos: youtube_v3.Schema$Video[] = [];
  for (const batch of batches) {
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: batch,
    });
    if (response.data.items) {
      allVideos.push(...response.data.items);
    }
  }

  return allVideos;
}

// ---------------------------------------------------------------------------
// Get Video Comments
// ---------------------------------------------------------------------------

/**
 * Fetch top-level comment threads (and their replies) for a single video.
 * Gracefully returns empty array if comments are disabled.
 */
export async function getVideoComments(
  videoId: string,
  maxResults: number = 20,
): Promise<youtube_v3.Schema$CommentThread[]> {
  const youtube = getYouTube();

  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet', 'replies'],
      videoId,
      maxResults: Math.min(maxResults, 100),
      order: 'relevance',
      textFormat: 'plainText',
    });
    return response.data.items ?? [];
  } catch (error: unknown) {
    // Comments might be disabled on this video
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('commentsDisabled') ||
      message.includes('forbidden') ||
      message.includes('403')
    ) {
      console.warn(`⚠ Comments disabled for video ${videoId} — skipping.`);
      return [];
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Full Ingestion Orchestrator
// ---------------------------------------------------------------------------

/**
 * End-to-end ingestion pipeline:
 * search → fetch video details → fetch comments → normalize → store.
 */
export async function ingestByQuery(
  request: IngestionRequest,
): Promise<IngestionResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const allEvents: CanonicalSocialEvent[] = [];

  // 1. Search for videos
  console.log(`🔍 Searching YouTube for: "${request.query}"`);
  const searchResults = await searchVideos(request.query, {
    maxResults: request.maxResults ?? 10,
    publishedAfter: request.publishedAfter,
    publishedBefore: request.publishedBefore,
    regionCode: request.regionCode,
    relevanceLanguage: request.relevanceLanguage,
  });

  const videoIds = searchResults
    .map((r) => r.id?.videoId)
    .filter((id): id is string => !!id);

  console.log(`📹 Found ${videoIds.length} videos.`);

  if (videoIds.length === 0) {
    return {
      success: true,
      query: request.query,
      videosFound: 0,
      videosProcessed: 0,
      commentsCollected: 0,
      totalEventsCreated: 0,
      totalEventsStored: 0,
      duplicatesSkipped: 0,
      errors,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    };
  }

  // 2. Fetch full video details
  const videos = await getVideoDetails(videoIds);
  console.log(`📊 Fetched details for ${videos.length} videos.`);

  // 3. Normalize videos to CanonicalSocialEvents
  for (const video of videos) {
    try {
      const event = videoToCanonicalEvent(video);
      allEvents.push(event);
    } catch (err) {
      const msg = `Failed to normalize video ${video.id}: ${err instanceof Error ? err.message : err}`;
      errors.push(msg);
      console.error(`❌ ${msg}`);
    }
  }

  // 4. Fetch and normalize comments for each video
  const maxCommentsPerVideo = request.maxCommentsPerVideo ?? 20;
  let totalCommentsCollected = 0;

  for (const video of videos) {
    const vid = video.id!;
    try {
      const threads = await getVideoComments(vid, maxCommentsPerVideo);

      for (const thread of threads) {
        const topLevelComment = thread.snippet?.topLevelComment;
        if (topLevelComment) {
          const event = commentToCanonicalEvent(topLevelComment, vid, false);
          allEvents.push(event);
          totalCommentsCollected++;
        }

        // Process replies
        const replies = thread.replies?.comments ?? [];
        for (const reply of replies) {
          const event = commentToCanonicalEvent(
            reply,
            vid,
            true,
            topLevelComment?.id ?? undefined,
          );
          allEvents.push(event);
          totalCommentsCollected++;
        }
      }
    } catch (err) {
      const msg = `Failed to fetch comments for video ${vid}: ${err instanceof Error ? err.message : err}`;
      errors.push(msg);
      console.error(`❌ ${msg}`);
    }
  }

  console.log(`💬 Collected ${totalCommentsCollected} comments.`);

  // 5. Log ingestion entry first so query log is active
  const logEntry: IngestionLogEntry = {
    id: `ingest_${Date.now()}`,
    query: request.query,
    timestamp: new Date().toISOString(),
    videosProcessed: videos.length,
    commentsCollected: totalCommentsCollected,
    eventsCreated: allEvents.length,
    errors,
  };
  saveIngestionLog(logEntry);

  // 6. Store events (with deduplication and query protection)
  const { stored, duplicatesSkipped } = saveEvents(allEvents, request.query);
  console.log(`💾 Stored ${stored} new events (${duplicatesSkipped} duplicates skipped).`);

  return {
    success: errors.length === 0,
    query: request.query,
    videosFound: videoIds.length,
    videosProcessed: videos.length,
    commentsCollected: totalCommentsCollected,
    totalEventsCreated: allEvents.length,
    totalEventsStored: stored,
    duplicatesSkipped,
    errors,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };
}
