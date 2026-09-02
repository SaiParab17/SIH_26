// =============================================================================
// JSON File Storage — persists CanonicalSocialEvents and ingestion logs
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CanonicalSocialEvent, IngestionLogEntry, IngestionStats } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const EVENTS_FILE = path.join(DATA_DIR, 'youtube_events.json');
const LOG_FILE = path.join(DATA_DIR, 'ingestion_log.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Load all stored YouTube canonical events. */
export function loadEvents(): CanonicalSocialEvent[] {
  return readJsonFile<CanonicalSocialEvent[]>(EVENTS_FILE, []);
}

/**
 * Append new events, deduplicating by `event_id`.
 * Automatically prunes historical events to keep ONLY events from the 2 most recent search queries.
 * @returns Object with counts of stored and skipped duplicates.
 */
export function saveEvents(
  newEvents: CanonicalSocialEvent[],
  currentQuery?: string
): { stored: number; duplicatesSkipped: number } {
  let existing = loadEvents();
  const existingIds = new Set(existing.map((e) => e.event_id));
  const newIds = new Set(newEvents.map((e) => e.event_id));

  let stored = 0;
  let duplicatesSkipped = 0;

  for (const event of newEvents) {
    if (existingIds.has(event.event_id)) {
      duplicatesSkipped++;
    } else {
      existing.push(event);
      existingIds.add(event.event_id);
      stored++;
    }
  }

  // Prune events to retain only events for the 2 most recent queries
  const log = loadIngestionLog();
  const logQueries = log.slice().reverse().map((l) => l.query.trim().toLowerCase());
  const allQueries = currentQuery ? [currentQuery.trim().toLowerCase(), ...logQueries] : logQueries;
  const recentQueries = [...new Set(allQueries)].slice(0, 2);

  if (recentQueries.length > 0) {
    existing = existing.filter((e) => {
      const text = (e.content?.text || '').toLowerCase();
      const reasons = (e.collection_reason || []).map((r) => r.toLowerCase());
      return (
        newIds.has(e.event_id) ||
        recentQueries.some((rq) => text.includes(rq)) ||
        recentQueries.some((rq) => reasons.some((r) => r.includes(rq)))
      );
    });
  }

  // Fallback limit: keep at most 200 most recent events
  if (existing.length > 200) {
    existing = existing.slice(-200);
  }

  writeJsonFile(EVENTS_FILE, existing);
  return { stored, duplicatesSkipped };
}

/** Remove all stored events. */
export function clearEvents(): void {
  writeJsonFile(EVENTS_FILE, []);
}

// ---------------------------------------------------------------------------
// Ingestion Log
// ---------------------------------------------------------------------------

/** Load all ingestion log entries. */
export function loadIngestionLog(): IngestionLogEntry[] {
  return readJsonFile<IngestionLogEntry[]>(LOG_FILE, []);
}

/** Append a new ingestion log entry. */
export function saveIngestionLog(entry: IngestionLogEntry): void {
  const log = loadIngestionLog();
  log.push(entry);
  writeJsonFile(LOG_FILE, log);
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

/** Compute ingestion statistics from stored data. */
export function getIngestionStats(): IngestionStats {
  const events = loadEvents();
  const log = loadIngestionLog();

  const posts = events.filter((e) => e.event_type === 'post').length;
  const comments = events.filter((e) => e.event_type === 'comment').length;

  return {
    totalEvents: events.length,
    totalIngestions: log.length,
    lastIngestionTime: log.length > 0 ? log[log.length - 1].timestamp : null,
    queriesRun: [...new Set(log.map((l) => l.query))],
    eventsByType: { posts, comments },
  };
}
