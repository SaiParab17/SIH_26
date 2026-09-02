"""
Job Manager module.
Orchestrates background collection jobs, item counting, and status reporting.
"""

import time
import uuid
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger("job_manager")


class CollectionJobStatus:
    """Detailed job status container."""

    def __init__(self, job_id: str, platform: str, query: str, target_posts: int):
        self.job_id = job_id
        self.platform = platform
        self.query = query
        self.status = "queued"  # queued, running, completed, partial, failed, blocked, cancelled
        self.target_posts = target_posts

        # Item counts
        self.discovered = 0
        self.fetched = 0
        self.unique_valid = 0
        self.duplicates = 0
        self.inaccessible = 0
        self.failed = 0
        self.comments = 0
        self.replies = 0

        self.progress_pct = 0.0
        self.message = "Job queued"
        self.created_at = datetime.utcnow().isoformat() + "Z"
        self.updated_at = datetime.utcnow().isoformat() + "Z"
        self.completed_at: Optional[str] = None
        self.error: Optional[str] = None

    def update_progress(self) -> None:
        """Recompute completion percentage based on valid unique posts collected vs target."""
        if self.target_posts > 0:
            self.progress_pct = min(100.0, round((self.unique_valid / self.target_posts) * 100.0, 2))
        self.updated_at = datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> Dict[str, Any]:
        """Serialize job status for API responses."""
        return {
            "job_id": self.job_id,
            "platform": self.platform,
            "query": self.query,
            "status": self.status,
            "target": self.target_posts,
            "discovered": self.discovered,
            "fetched": self.fetched,
            "collected": self.unique_valid,
            "unique_valid": self.unique_valid,
            "duplicates": self.duplicates,
            "inaccessible": self.inaccessible,
            "failed": self.failed,
            "comments_collected": self.comments,
            "replies_collected": self.replies,
            "progress": self.progress_pct,
            "message": self.message,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "completed_at": self.completed_at,
            "error": self.error,
        }


class JobManager:
    """In-memory collection job registry and orchestrator."""

    def __init__(self):
        self._jobs: Dict[str, CollectionJobStatus] = {}

    def create_job(self, platform: str, query: str, target_posts: int) -> CollectionJobStatus:
        """Create and register a new collection job."""
        job_id = f"job_{platform}_{uuid.uuid4().hex[:8]}"
        job = CollectionJobStatus(job_id=job_id, platform=platform, query=query, target_posts=target_posts)
        self._jobs[job_id] = job
        logger.info(f"Created job {job_id} for platform '{platform}' with query '{query}' (target: {target_posts})")
        return job

    def get_job(self, job_id: str) -> Optional[CollectionJobStatus]:
        """Retrieve job status by ID."""
        return self._jobs.get(job_id)

    def list_jobs(self) -> List[Dict[str, Any]]:
        """List all job statuses."""
        return [job.to_dict() for job in self._jobs.values()]


# Global job manager singleton
global_job_manager = JobManager()
