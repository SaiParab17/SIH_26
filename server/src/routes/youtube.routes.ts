// =============================================================================
// YouTube API Routes — REST endpoints for ingestion & event management
// =============================================================================

import { Router, type Request, type Response } from 'express';
import {
  searchVideos,
  getVideoDetails,
  ingestByQuery,
} from '../services/youtube.service.js';
import {
  loadEvents,
  clearEvents,
  getIngestionStats,
} from '../services/storage.js';
import { videoToCanonicalEvent } from '../services/normalizer.js';
import type { IngestionRequest } from '../types/index.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/youtube/ingest
// Full ingestion pipeline: search + fetch + normalize + store
// ---------------------------------------------------------------------------

router.post('/ingest', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as IngestionRequest;

    if (!body.query || typeof body.query !== 'string' || body.query.trim() === '') {
      res.status(400).json({
        error: 'Missing required field: query',
        example: { query: 'social media analytics', maxResults: 5 },
      });
      return;
    }

    const result = await ingestByQuery({
      query: body.query.trim(),
      maxResults: body.maxResults,
      publishedAfter: body.publishedAfter,
      publishedBefore: body.publishedBefore,
      regionCode: body.regionCode,
      relevanceLanguage: body.relevanceLanguage,
      maxCommentsPerVideo: body.maxCommentsPerVideo,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Ingestion error:', error);
    res.status(500).json({
      error: 'Ingestion failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/youtube/events
// List all stored canonical events with pagination
// ---------------------------------------------------------------------------

router.get('/events', (_req: Request, res: Response): void => {
  try {
    const limit = parseInt(_req.query.limit as string) || 5000;
    const offset = parseInt(_req.query.offset as string) || 0;
    const eventType = _req.query.type as string | undefined;
    const query = (_req.query.q as string || '').trim().toLowerCase();

    let events = loadEvents();

    // Optional filter by event type
    if (eventType && ['post', 'comment', 'reply'].includes(eventType)) {
      events = events.filter((e) => e.event_type === eventType);
    }

    // Optional search query filter across text, author, hashtags, event_id
    if (query) {
      events = events.filter((e) =>
        (e.content?.text || '').toLowerCase().includes(query) ||
        (e.author?.display_name || '').toLowerCase().includes(query) ||
        (e.author?.username || '').toLowerCase().includes(query) ||
        (e.event_id || '').toLowerCase().includes(query) ||
        (e.content?.hashtags || []).join(' ').toLowerCase().includes(query)
      );
    }

    // Sort descending by collected_at / created_at (newest/most recent events FIRST)
    events.sort((a, b) => {
      const ta = new Date(a.timestamps?.collected_at || a.timestamps?.created_at || 0).getTime();
      const tb = new Date(b.timestamps?.collected_at || b.timestamps?.created_at || 0).getTime();
      return tb - ta;
    });

    const total = events.length;
    const paginated = events.slice(offset, offset + limit);

    res.status(200).json({
      total,
      limit,
      offset,
      count: paginated.length,
      events: paginated,
    });
  } catch (error) {
    console.error('❌ Error loading events:', error);
    res.status(500).json({
      error: 'Failed to load events',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/youtube/events/:eventId
// Get a single event by ID
// ---------------------------------------------------------------------------

router.get('/events/:eventId', (req: Request, res: Response): void => {
  try {
    const { eventId } = req.params;
    const events = loadEvents();
    const event = events.find((e) => e.event_id === eventId);

    if (!event) {
      res.status(404).json({ error: `Event not found: ${eventId}` });
      return;
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('❌ Error loading event:', error);
    res.status(500).json({
      error: 'Failed to load event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/youtube/search
// Preview search results without storing
// ---------------------------------------------------------------------------

router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const maxResults = parseInt(req.query.maxResults as string) || 5;

    if (!query || query.trim() === '') {
      res.status(400).json({
        error: 'Missing required query parameter: q',
        example: '/api/youtube/search?q=social+media+analytics&maxResults=5',
      });
      return;
    }

    // Search for videos
    const searchResults = await searchVideos(query.trim(), { maxResults });

    const videoIds = searchResults
      .map((r) => r.id?.videoId)
      .filter((id): id is string => !!id);

    // Fetch details for richer preview
    const videos = await getVideoDetails(videoIds);

    // Normalize but do NOT store
    const previewEvents = videos.map((v) => videoToCanonicalEvent(v));

    res.status(200).json({
      query: query.trim(),
      total: previewEvents.length,
      preview: previewEvents,
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/youtube/stats
// Ingestion statistics
// ---------------------------------------------------------------------------

router.get('/stats', (_req: Request, res: Response): void => {
  try {
    const stats = getIngestionStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error computing stats:', error);
    res.status(500).json({
      error: 'Failed to compute stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/youtube/events
// Clear all stored events
// ---------------------------------------------------------------------------

router.delete('/events', (_req: Request, res: Response): void => {
  try {
    clearEvents();
    res.status(200).json({ message: 'All YouTube events cleared.' });
  } catch (error) {
    console.error('❌ Error clearing events:', error);
    res.status(500).json({
      error: 'Failed to clear events',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
