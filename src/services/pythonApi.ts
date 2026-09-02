// =============================================================================
// Python Collector API Client — frontend service for X & Facebook FastAPI backend
// =============================================================================

import type { CanonicalSocialEvent } from '../types';

const PYTHON_API_BASE = 'http://localhost:8000/api';

export interface PythonCollectionRequest {
  platform: 'x' | 'facebook' | 'instagram';
  query: string;
  target_posts?: number;
  max_pages?: number;
  comments_per_post?: number;
  posts_per_platform?: number;
  sort?: string;
  headless?: boolean;
}

export interface PythonJobResponse {
  job_id: string;
  platform: string;
  status: string;
  message: string;
}

export interface PythonJobStatus {
  job_id: string;
  platform: string;
  query: string;
  status: string;
  target: number;
  discovered: number;
  fetched: number;
  collected: number;
  unique_valid: number;
  duplicates: number;
  inaccessible: number;
  failed: number;
  comments_collected: number;
  replies_collected: number;
  progress: number;
  message: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  error?: string | null;
}

export interface PythonEventsResponse {
  total: number;
  limit: number;
  offset: number;
  count: number;
  events: CanonicalSocialEvent[];
}

/** Check if Python FastAPI collector is running. */
export async function checkPythonHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${PYTHON_API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Trigger X live collection. */
export async function triggerXCollection(
  request: Omit<PythonCollectionRequest, 'platform'>,
  sync: boolean = true
): Promise<PythonJobResponse> {
  const res = await fetch(`${PYTHON_API_BASE}/collection/x?sync=${sync}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'x', ...request }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'X Collection request failed');
  }

  return res.json();
}

/** Trigger Facebook live collection. */
export async function triggerFacebookCollection(
  request: Omit<PythonCollectionRequest, 'platform'>,
  sync: boolean = true
): Promise<PythonJobResponse> {
  const res = await fetch(`${PYTHON_API_BASE}/collection/facebook?sync=${sync}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'facebook', ...request }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Facebook Collection request failed');
  }

  return res.json();
}

/** Trigger Instagram live collection. */
export async function triggerInstagramCollection(
  request: Omit<PythonCollectionRequest, 'platform'>,
  sync: boolean = true
): Promise<PythonJobResponse> {
  const res = await fetch(`${PYTHON_API_BASE}/collection/instagram?sync=${sync}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'instagram', ...request }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Instagram Collection request failed');
  }

  return res.json();
}

/** Trigger multi-platform (Facebook + Instagram) sequential collection in single continuous browser session. */
export async function triggerMultiCollection(
  platforms: string[],
  request: Omit<PythonCollectionRequest, 'platform'>,
  sync: boolean = false
): Promise<PythonJobResponse> {
  const res = await fetch(`${PYTHON_API_BASE}/collection/multi?sync=${sync}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'multi', platforms, ...request }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Multi-platform Collection request failed');
  }

  return res.json();
}

/** Poll status of a collection job by ID. */
export async function fetchJobStatus(jobId: string): Promise<PythonJobStatus> {
  const res = await fetch(`${PYTHON_API_BASE}/collection/${jobId}/status`);
  if (!res.ok) throw new Error('Failed to fetch job status');
  return res.json();
}

/** Poll a job until it reaches completed, partial, or failed status. */
export async function pollJobUntilComplete(
  jobId: string,
  onProgress?: (status: PythonJobStatus) => void,
  maxWaitSeconds: number = 300
): Promise<PythonJobStatus> {
  const startTime = Date.now();
  while ((Date.now() - startTime) / 1000 < maxWaitSeconds) {
    try {
      const status = await fetchJobStatus(jobId);
      if (onProgress) onProgress(status);
      if (['completed', 'failed', 'partial', 'blocked'].includes(status.status)) {
        return status;
      }
    } catch (err) {
      console.warn(`Polling notice for job ${jobId}:`, err);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Collection job ${jobId} timed out`);
}

/** Fetch stored X and Facebook canonical events from Python backend. */
export async function fetchPythonEvents(
  options: { platform?: string; limit?: number; offset?: number } = {}
): Promise<PythonEventsResponse> {
  const params = new URLSearchParams();
  if (options.platform) params.set('platform', options.platform);
  if (options.limit) params.set('limit', String(options.limit));
  if (options.offset) params.set('offset', String(options.offset));

  const res = await fetch(`${PYTHON_API_BASE}/collection/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch Python events');
  return res.json();
}
