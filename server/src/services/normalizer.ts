// =============================================================================
// Normalizer — converts raw YouTube API responses to CanonicalSocialEvent
// =============================================================================

import type { CanonicalSocialEvent } from '../types/index.js';
import type { youtube_v3 } from 'googleapis';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract #hashtags from a string. */
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u0900-\u097F]+/g); // supports Latin + Devanagari
  return matches ? [...new Set(matches.map((h) => h.toLowerCase()))] : [];
}

/** Extract @mentions from a string. */
function extractMentions(text: string): string[] {
  const matches = text.match(/@[\w.]+/g);
  return matches ? [...new Set(matches.map((m) => m.toLowerCase()))] : [];
}

/** Generate a deterministic event_id for YouTube content. */
function makeEventId(prefix: string, id: string): string {
  return `yt_${prefix}_${id}`;
}

// ---------------------------------------------------------------------------
// Video → CanonicalSocialEvent
// ---------------------------------------------------------------------------

/**
 * Maps a YouTube video (search/video item + statistics) to a CanonicalSocialEvent.
 */
export function videoToCanonicalEvent(
  video: youtube_v3.Schema$Video,
): CanonicalSocialEvent {
  const snippet = video.snippet!;
  const stats = video.statistics;
  const videoId = video.id!;

  const title = snippet.title ?? '';
  const description = snippet.description ?? '';
  const fullText = `${title}\n\n${description}`;

  // Combine tags from snippet + hashtags extracted from description
  const snippetTags = (snippet.tags ?? []).map((t) => `#${t.toLowerCase()}`);
  const descriptionTags = extractHashtags(description);
  const allHashtags = [...new Set([...snippetTags, ...descriptionTags])];

  return {
    event_id: makeEventId('video', videoId),
    platform: 'youtube',
    event_type: 'post',
    source: {
      source_id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      collector: 'youtube_data_api_v3',
    },
    author: {
      user_id: snippet.channelId ?? 'unknown',
      username: snippet.channelId ?? 'unknown',
      display_name: snippet.channelTitle ?? 'Unknown Channel',
    },
    content: {
      text: fullText,
      language: snippet.defaultLanguage ?? snippet.defaultAudioLanguage ?? 'en',
      hashtags: allHashtags,
      mentions: extractMentions(fullText),
    },
    engagement: {
      likes: parseInt(stats?.likeCount ?? '0', 10),
      comments: parseInt(stats?.commentCount ?? '0', 10),
      shares: 0, // YouTube API does not expose share count
      views: parseInt(stats?.viewCount ?? '0', 10),
    },
    relationships: {
      reply_to: null,
      repost_of: null,
      quoted_event_id: null,
    },
    timestamps: {
      created_at: snippet.publishedAt ?? new Date().toISOString(),
      collected_at: new Date().toISOString(),
    },
    analysis: {
      sentiment: { label: 'neutral', score: 0 },
      emotion: { label: 'surprise', score: 0 },
      stance: { label: 'neutral', score: 0 },
      sarcasm: { detected: false, score: 0 },
    },
    collection_reason: ['youtube_search_ingestion'],
  };
}

// ---------------------------------------------------------------------------
// Comment → CanonicalSocialEvent
// ---------------------------------------------------------------------------

/**
 * Maps a YouTube comment (top-level or reply) to a CanonicalSocialEvent.
 */
export function commentToCanonicalEvent(
  comment: youtube_v3.Schema$Comment,
  videoId: string,
  isReply: boolean = false,
  parentCommentId?: string,
): CanonicalSocialEvent {
  const snippet = comment.snippet!;
  const commentId = comment.id!;
  const text = snippet.textOriginal ?? snippet.textDisplay ?? '';

  return {
    event_id: makeEventId('comment', commentId),
    platform: 'youtube',
    event_type: isReply ? 'reply' : 'comment',
    source: {
      source_id: commentId,
      url: `https://www.youtube.com/watch?v=${videoId}&lc=${commentId}`,
      collector: 'youtube_data_api_v3',
    },
    author: {
      user_id: snippet.authorChannelId?.value ?? 'unknown',
      username: snippet.authorChannelId?.value ?? 'unknown',
      display_name: snippet.authorDisplayName ?? 'Anonymous',
      avatarUrl: snippet.authorProfileImageUrl ?? undefined,
    },
    content: {
      text,
      language: 'en', // YouTube comment API does not return language
      hashtags: extractHashtags(text),
      mentions: extractMentions(text),
    },
    engagement: {
      likes: snippet.likeCount ?? 0,
      comments: 0,
      shares: 0,
    },
    relationships: {
      reply_to: isReply ? (parentCommentId ?? videoId) : videoId,
      repost_of: null,
      quoted_event_id: null,
    },
    timestamps: {
      created_at: snippet.publishedAt ?? new Date().toISOString(),
      collected_at: new Date().toISOString(),
    },
    analysis: {
      sentiment: { label: 'neutral', score: 0 },
      emotion: { label: 'surprise', score: 0 },
      stance: { label: 'neutral', score: 0 },
      sarcasm: { detected: false, score: 0 },
    },
    collection_reason: ['youtube_comment_ingestion'],
  };
}
