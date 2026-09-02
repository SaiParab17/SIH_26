"""
FastAPI Routes for Web Collection Subsystem.
Exposes background collection endpoints for X and Facebook, job status polling, and event querying.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from app.api.schemas import CollectionRequest, CollectionJobResponse, HealthCheckResponse
from app.core.job_manager import global_job_manager, CollectionJobStatus
from app.core.browser_manager import BrowserManager
from app.x.collector import XCollector
from app.facebook.collector import FacebookCollector
from app.instagram.collector import InstagramCollector
from app.storage.file_storage import save_events, load_all_events, clear_events

logger = logging.getLogger("api_routes")
router = APIRouter()


async def run_x_collection_task(job_id: str, request: CollectionRequest) -> None:
    """Background task orchestrating X collection."""
    job = global_job_manager.get_job(job_id)
    if not job:
        return

    is_headless = request.headless if request.headless is not None else False
    collector = XCollector(headless=is_headless)
    try:
        events = await collector.collect_posts(
            query=request.query,
            target_count=request.target_posts,
            max_pages=request.max_pages,
            comments_per_post=request.comments_per_post,
            job_status=job,
        )
        if events:
            saved = save_events(events)
            logger.info(f"Saved {saved} new unique X events for job {job_id}")

            # Collect live comments for the top N posts, with a realistic 10-20 post cap.
            if request.comments_per_post > 0:
                live_post_limit = min(len(events), max(1, request.posts_per_platform))
                for event in events[:live_post_limit]:
                    if event.source.url and event.event_type == "post":
                        comments = await collector.collect_comments(
                            post_url=event.source.url,
                            parent_event_id=event.event_id,
                            limit=request.comments_per_post,
                        )
                        if comments:
                            save_events(comments)
                            job.comments += len(comments)
                            job.message = f"Collected live comments for {live_post_limit} X posts in this job."

    except Exception as err:
        logger.error(f"X collection task {job_id} failed: {err}")
        job.status = "failed"
        job.error = str(err)
        job.message = f"Collection failed: {err}"
    finally:
        if job.status == "running":
            job.status = "completed" if job.unique_valid > 0 or job.collected > 0 else "partial"
            if not job.message or job.message.startswith("Collecting"):
                job.message = f"X collection task completed with {job.unique_valid} unique items."
        job.completed_at = datetime.utcnow().isoformat() + "Z"
        await collector.close_session()


async def run_facebook_collection_task(job_id: str, request: CollectionRequest) -> None:
    """Background task orchestrating Facebook collection."""
    job = global_job_manager.get_job(job_id)
    if not job:
        return

    is_headless = request.headless if request.headless is not None else False
    collector = FacebookCollector(headless=is_headless)
    try:
        events = await collector.collect_posts(
            query=request.query,
            target_count=request.target_posts,
            max_pages=request.max_pages,
            comments_per_post=request.comments_per_post,
            job_status=job,
        )
        if events:
            saved = save_events(events, current_query=request.query)
            logger.info(f"Saved {saved} new unique Facebook events for job {job_id}")

            if request.comments_per_post > 0:
                live_post_limit = min(len(events), max(1, request.posts_per_platform))
                for event in events[:live_post_limit]:
                    if event.source.url and event.event_type == "post":
                        comments = await collector.collect_comments(
                            post_url=event.source.url,
                            parent_event_id=event.event_id,
                            limit=request.comments_per_post,
                        )
                        if comments:
                            save_events(comments, current_query=request.query)
                            job.comments += len(comments)
                            job.message = f"Collected live comments for {live_post_limit} Facebook posts in this job."

    except Exception as err:
        logger.error(f"Facebook collection task {job_id} failed: {err}")
        job.status = "failed"
        job.error = str(err)
        job.message = f"Collection failed: {err}"
    finally:
        if job.status == "running":
            job.status = "completed" if job.unique_valid > 0 or job.collected > 0 else "partial"
            if not job.message or job.message.startswith("Collecting"):
                job.message = f"Facebook collection task completed with {job.unique_valid} unique items."
        job.completed_at = datetime.utcnow().isoformat() + "Z"
        await collector.close_session()


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    return HealthCheckResponse(
        status="ok",
        service="socialscope-python-web-collector",
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


@router.post("/collection/x", response_model=CollectionJobResponse)
async def start_x_collection(
    request: CollectionRequest,
    background_tasks: BackgroundTasks,
    sync: bool = Query(True, description="Execute live scraping synchronously if True"),
):
    """Start X (Twitter) public content live scraping job."""
    job = global_job_manager.create_job(
        platform="x",
        query=request.query,
        target_posts=request.target_posts,
    )
    if sync:
        logger.info(f"Running X live scraping synchronously for query '{request.query}'...")
        await run_x_collection_task(job.job_id, request)
        updated_job = global_job_manager.get_job(job.job_id)
        status_str = updated_job.status if updated_job else "completed"
        msg = updated_job.message if updated_job else f"X live scraping complete for query '{request.query}'"
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="x",
            status=status_str,
            message=msg,
        )
    else:
        background_tasks.add_task(run_x_collection_task, job.job_id, request)
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="x",
            status=job.status,
            message=f"X collection job queued for query '{request.query}' (target: {request.target_posts} items)",
        )


async def run_instagram_collection_task(job_id: str, request: CollectionRequest) -> None:
    """Background task orchestrating Instagram collection."""
    job = global_job_manager.get_job(job_id)
    if not job:
        return

    is_headless = request.headless if request.headless is not None else False
    collector = InstagramCollector(headless=is_headless)
    try:
        events = await collector.collect_posts(
            query=request.query,
            target_count=request.target_posts,
            max_pages=request.max_pages,
            comments_per_post=request.comments_per_post,
            job_status=job,
        )
        if events:
            saved = save_events(events, current_query=request.query)
            logger.info(f"Saved {saved} new unique Instagram events for job {job_id}")

            if request.comments_per_post > 0:
                live_post_limit = min(len(events), max(1, request.posts_per_platform))
                for event in events[:live_post_limit]:
                    if event.source.url and event.event_type == "post":
                        comments = await collector.collect_comments(
                            post_url=event.source.url,
                            parent_event_id=event.event_id,
                            limit=request.comments_per_post,
                        )
                        if comments:
                            save_events(comments, current_query=request.query)
                            job.comments += len(comments)
                            job.message = f"Collected live comments for {live_post_limit} Instagram posts in this job."

    except Exception as err:
        logger.error(f"Instagram collection task {job_id} failed: {err}")
        job.status = "failed"
        job.error = str(err)
        job.message = f"Collection failed: {err}"
    finally:
        if job.status == "running":
            job.status = "completed" if job.unique_valid > 0 or job.collected > 0 else "partial"
            if not job.message or job.message.startswith("Collecting"):
                job.message = f"Instagram collection task completed with {job.unique_valid} unique items."
        job.completed_at = datetime.utcnow().isoformat() + "Z"
        await collector.close_session()


@router.post("/collection/facebook", response_model=CollectionJobResponse)
async def start_facebook_collection(
    request: CollectionRequest,
    background_tasks: BackgroundTasks,
    sync: bool = Query(True, description="Execute live scraping synchronously if True"),
):
    """Start Facebook public content live scraping job."""
    job = global_job_manager.create_job(
        platform="facebook",
        query=request.query,
        target_posts=request.target_posts,
    )
    if sync:
        logger.info(f"Running Facebook live scraping synchronously for query '{request.query}'...")
        await run_facebook_collection_task(job.job_id, request)
        updated_job = global_job_manager.get_job(job.job_id)
        status_str = updated_job.status if updated_job else "completed"
        msg = updated_job.message if updated_job else f"Facebook live scraping complete for query '{request.query}'"
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="facebook",
            status=status_str,
            message=msg,
        )
    else:
        background_tasks.add_task(run_facebook_collection_task, job.job_id, request)
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="facebook",
            status=job.status,
            message=f"Facebook collection job queued for query '{request.query}' (target: {request.target_posts} items)",
        )


@router.post("/collection/instagram", response_model=CollectionJobResponse)
async def start_instagram_collection(
    request: CollectionRequest,
    background_tasks: BackgroundTasks,
    sync: bool = Query(True, description="Execute live scraping synchronously if True"),
):
    """Start Instagram public content live scraping job."""
    job = global_job_manager.create_job(
        platform="instagram",
        query=request.query,
        target_posts=request.target_posts,
    )
    if sync:
        logger.info(f"Running Instagram live scraping synchronously for query '{request.query}'...")
        await run_instagram_collection_task(job.job_id, request)
        updated_job = global_job_manager.get_job(job.job_id)
        status_str = updated_job.status if updated_job else "completed"
        msg = updated_job.message if updated_job else f"Instagram live scraping complete for query '{request.query}'"
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="instagram",
            status=status_str,
            message=msg,
        )
    else:
        background_tasks.add_task(run_instagram_collection_task, job.job_id, request)
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="instagram",
            status=job.status,
            message=f"Instagram collection job queued for query '{request.query}' (target: {request.target_posts} items)",
        )


async def run_multi_platform_task(job_id: str, request: CollectionRequest) -> None:
    """Background task orchestrating multi-platform (Facebook + Instagram) sequential scraping in single browser session."""
    job = global_job_manager.get_job(job_id)
    if not job:
        return

    is_headless = request.headless if request.headless is not None else False
    target_platforms = request.platforms or ["facebook", "instagram"]

    # Single BrowserManager instance maintaining continuous open session across platforms
    browser_mgr = BrowserManager(
        headless=is_headless,
        use_camoufox=True,
        timeout_ms=75000,
        platform_name="instagram",
    )

    try:
        job.status = "running"
        job.message = f"Launching open Camoufox session for {', '.join(target_platforms)}..."
        _, page = await browser_mgr.launch()

        # 1. Facebook Collection Phase
        if "facebook" in target_platforms:
            job.message = f"Scraping Facebook live posts for query '{request.query}' in Camoufox..."
            fb_collector = FacebookCollector(headless=is_headless)
            fb_collector.use_existing_session(browser_mgr, page)

            fb_events = await fb_collector.collect_posts(
                query=request.query,
                target_count=request.target_posts,
                max_pages=request.max_pages,
                comments_per_post=request.comments_per_post,
                job_status=job,
            )
            if fb_events:
                save_events(fb_events, current_query=request.query)

                if request.comments_per_post > 0:
                    for ev in fb_events[:min(len(fb_events), 5)]:
                        if ev.source.url and ev.event_type == "post":
                            comms = await fb_collector.collect_comments(
                                post_url=ev.source.url,
                                parent_event_id=ev.event_id,
                                limit=request.comments_per_post,
                            )
                            if comms:
                                save_events(comms, current_query=request.query)

            logger.info("Facebook collection complete — keeping browser open and navigating to Instagram...")
            job.message = "Facebook scraping complete! Keeping browser open and switching to Instagram..."
            await asyncio.sleep(2)

        # 2. Instagram Collection Phase in the SAME active open browser
        if "instagram" in target_platforms:
            job.message = f"Navigating to Instagram in active browser for query '{request.query}'..."
            insta_collector = InstagramCollector(headless=is_headless)
            insta_collector.use_existing_session(browser_mgr, page)

            insta_events = await insta_collector.collect_posts(
                query=request.query,
                target_count=request.target_posts,
                max_pages=request.max_pages,
                comments_per_post=request.comments_per_post,
                job_status=job,
            )
            if insta_events:
                save_events(insta_events, current_query=request.query)

                if request.comments_per_post > 0:
                    for ev in insta_events[:min(len(insta_events), 5)]:
                        if ev.source.url and ev.event_type == "post":
                            comms = await insta_collector.collect_comments(
                                post_url=ev.source.url,
                                parent_event_id=ev.event_id,
                                limit=request.comments_per_post,
                            )
                            if comms:
                                save_events(comms, current_query=request.query)

    except Exception as err:
        logger.error(f"Multi-platform task {job_id} failed: {err}")
        job.status = "failed"
        job.error = str(err)
        job.message = f"Multi-platform collection failed: {err}"
    finally:
        if job.status == "running":
            job.status = "completed"
            job.message = f"Multi-platform collection finished ({', '.join(target_platforms)})."
        job.completed_at = datetime.utcnow().isoformat() + "Z"
        await browser_mgr.close()


@router.post("/collection/multi", response_model=CollectionJobResponse)
async def start_multi_collection(
    request: CollectionRequest,
    background_tasks: BackgroundTasks,
    sync: bool = Query(False, description="Execute live scraping synchronously if True"),
):
    """Start multi-platform sequential scraping job in single continuous browser session."""
    target_platforms = request.platforms or ["facebook", "instagram"]
    job = global_job_manager.create_job(
        platform="multi",
        query=request.query,
        target_posts=request.target_posts,
    )
    if sync:
        logger.info(f"Running multi-platform live scraping synchronously for platforms {target_platforms}...")
        await run_multi_platform_task(job.job_id, request)
        updated_job = global_job_manager.get_job(job.job_id)
        status_str = updated_job.status if updated_job else "completed"
        msg = updated_job.message if updated_job else "Multi-platform scraping complete"
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="multi",
            status=status_str,
            message=msg,
        )
    else:
        background_tasks.add_task(run_multi_platform_task, job.job_id, request)
        return CollectionJobResponse(
            job_id=job.job_id,
            platform="multi",
            status=job.status,
            message=f"Multi-platform collection job queued for {', '.join(target_platforms)}",
        )


@router.get("/collection/events")
async def list_events(
    platform: Optional[str] = Query(None, description="Filter by platform ('x', 'facebook', etc.)"),
    limit: int = Query(50, ge=1, le=5000),
    offset: int = Query(0, ge=0),
):
    """Retrieve stored CanonicalSocialEvent items."""
    all_events = load_all_events()

    if platform:
        all_events = [e for e in all_events if e.get("platform") == platform]

    # Sort descending by collected_at / created_at (newest/most recent events FIRST)
    all_events.sort(
        key=lambda e: e.get("timestamps", {}).get("collected_at") or e.get("timestamps", {}).get("created_at") or "",
        reverse=True
    )

    total = len(all_events)
    paginated = all_events[offset : offset + limit]

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "count": len(paginated),
        "events": paginated,
    }


@router.delete("/collection/events")
async def clear_stored_events():
    """Clear all stored canonical events."""
    clear_events()
    return {"message": "All stored canonical social events cleared."}


@router.get("/collection/{job_id}/status")
async def get_job_status(job_id: str):
    """Retrieve detailed real-time job status by job ID."""
    job = global_job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job ID not found: {job_id}")
    return job.to_dict()
