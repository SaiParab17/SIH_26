"""
Unit tests for JobManager and Deduplicator.
Tests job creation, progress tracking, counting rules, and deduplication.
"""

import pytest
from app.core.job_manager import JobManager
from app.core.deduplicator import Deduplicator


def test_job_manager_lifecycle():
    jm = JobManager()
    job = jm.create_job(platform="x", query="AI regulation", target_posts=1000)

    assert job.job_id.startswith("job_x_")
    assert job.status == "queued"
    assert job.target_posts == 1000
    assert job.progress_pct == 0.0

    # Simulate progress
    job.unique_valid = 500
    job.update_progress()
    assert job.progress_pct == 50.0

    job.unique_valid = 1000
    job.update_progress()
    assert job.progress_pct == 100.0


def test_deduplicator():
    dedup = Deduplicator()

    assert dedup.mark_seen("id_101") is True
    assert dedup.mark_seen("id_102") is True
    assert dedup.is_duplicate("id_101") is True
    assert dedup.mark_seen("id_101") is False
    assert dedup.count() == 2
