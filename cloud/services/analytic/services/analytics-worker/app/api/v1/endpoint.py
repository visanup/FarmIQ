# app/v1/endpoint.py
from fastapi import APIRouter, Response, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.instrumentation.metrics import metrics_response
from app.utils.checkpoint import (
    ensure_checkpoint_table,
    get_checkpoint,
    set_checkpoint,
    list_checkpoints,
    delete_checkpoint,
    list_checkpoints_by_prefix,
)
from app.workers.analytics_scheduler import AnalyticsScheduler
import threading
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1")

@router.get("/health")
def health(db: Session = Depends(get_db)):
    """Health check endpoint with database connectivity and worker status"""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        database_status = "connected"
    except Exception as e:
        database_status = f"disconnected: {str(e)}"
    
    # Check worker status
    worker_enabled = os.getenv("ENABLE_WORKER", "1").strip().lower() in ("1", "true", "yes", "on")
    scheduler_enabled = os.getenv("ENABLE_SCHEDULER", "1").strip().lower() in ("1", "true", "yes", "on")
    
    # Count active threads
    active_threads = threading.active_count()
    thread_names = [t.name for t in threading.enumerate()]
    
    return {
        "status": "healthy" if database_status == "connected" else "unhealthy",
        "database": database_status,
        "service": "analytics-worker",
        "worker_enabled": worker_enabled,
        "scheduler_enabled": scheduler_enabled,
        "active_threads": active_threads,
        "thread_names": thread_names
    }

@router.get("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    body, code, headers = metrics_response()
    return Response(content=body, status_code=code, media_type=headers["Content-Type"])


# --- Checkpoint utilities ---
@router.get("/checkpoints")
def get_all_checkpoints(limit: int = 200):
    """List recent checkpoints (for monitoring/troubleshooting)."""
    ensure_checkpoint_table()
    return {"items": list_checkpoints(limit=limit), "limit": limit}


@router.get("/checkpoints/{job}/{tenant_id}/{farm_id}/{house_id}")
def get_checkpoint_for_legacy(job: str, tenant_id: str, farm_id: str, house_id: str, limit: int = 50):
    """Legacy path: list all checkpoints for any flock under this house (prefix match)."""
    ensure_checkpoint_table()
    prefix = f"{job}:{tenant_id}:{farm_id}:{house_id}:"
    items = list_checkpoints_by_prefix(prefix, limit=limit)
    return {"prefix": prefix, "items": items}


@router.get("/checkpoints/{job}/{tenant_id}/{farm_id}/{house_id}/{flock_id}")
def get_checkpoint_for(job: str, tenant_id: str, farm_id: str, house_id: str, flock_id: str):
    ensure_checkpoint_table()
    key = f"{job}:{tenant_id}:{farm_id}:{house_id}:{flock_id}"
    ts = get_checkpoint(key)
    return {"key": key, "watermark": ts}


@router.delete("/checkpoints/{job}/{tenant_id}/{farm_id}/{house_id}")
def clear_checkpoint_legacy(job: str, tenant_id: str, farm_id: str, house_id: str):
    raise HTTPException(status_code=400, detail="Checkpoint keys now include flock_id. Use /checkpoints/{job}/{tenant}/{farm}/{house}/{flock}")


@router.delete("/checkpoints/{job}/{tenant_id}/{farm_id}/{house_id}/{flock_id}")
def clear_checkpoint(job: str, tenant_id: str, farm_id: str, house_id: str, flock_id: str):
    ensure_checkpoint_table()
    key = f"{job}:{tenant_id}:{farm_id}:{house_id}:{flock_id}"
    ok = delete_checkpoint(key)
    return {"key": key, "deleted": ok}


@router.post("/checkpoints/{job}/{tenant_id}/{farm_id}/{house_id}/{flock_id}")
def set_checkpoint_for(job: str, tenant_id: str, farm_id: str, house_id: str, flock_id: str, ts: str):
    ensure_checkpoint_table()
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid timestamp format")
    key = f"{job}:{tenant_id}:{farm_id}:{house_id}:{flock_id}"
    set_checkpoint(key, dt)
    return {"key": key, "watermark": dt}

@router.post("/analytics/trigger/hourly")
def trigger_hourly_analytics():
    """Manually trigger hourly analytics calculation"""
    try:
        logger.info("🚀 Manual trigger: Hourly analytics")
        scheduler = AnalyticsScheduler()
        scheduler.run_hourly_analytics()
        scheduler.close()
        return {"status": "success", "message": "Hourly analytics completed"}
    except Exception as e:
        logger.error(f"Error in hourly analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/trigger/daily")
def trigger_daily_analytics(days: int = 7):
    """Manually trigger daily analytics calculation over the last N days (default 7)."""
    try:
        logger.info("🚀 Manual trigger: Daily analytics")
        scheduler = AnalyticsScheduler()
        scheduler.run_daily_analytics(window_days=days)
        scheduler.close()
        return {"status": "success", "message": "Daily analytics completed", "days": days}
    except Exception as e:
        logger.error(f"Error in daily analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/trigger/weekly")
def trigger_weekly_analytics(days: int = 7):
    """Manually trigger weekly analytics calculation over the last N days (default 7)."""
    try:
        logger.info("🚀 Manual trigger: Weekly analytics")
        scheduler = AnalyticsScheduler()
        scheduler.run_weekly_analytics(window_days=days)
        scheduler.close()
        return {"status": "success", "message": "Weekly analytics completed", "days": days}
    except Exception as e:
        logger.error(f"Error in weekly analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/trigger/all")
def trigger_all_analytics():
    """Manually trigger all analytics calculations"""
    try:
        logger.info("🚀 Manual trigger: All analytics")
        scheduler = AnalyticsScheduler()
        
        # Run all analytics
        scheduler.run_hourly_analytics()
        scheduler.run_daily_analytics()
        scheduler.run_weekly_analytics()
        
        scheduler.close()
        return {"status": "success", "message": "All analytics completed"}
    except Exception as e:
        logger.error(f"Error in all analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/trigger/rollup")
def trigger_rollup(since_minutes: int = 120, windows: str | None = None):
    """Manually trigger rollup into analytics_agg.
    windows: comma-separated list of seconds (e.g., "60,300,3600").
    """
    try:
        logger.info("🚀 Manual trigger: Window rollup")
        wins = None
        if windows:
            try:
                wins = [int(w.strip()) for w in windows.split(',') if w.strip()]
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid windows parameter")
        scheduler = AnalyticsScheduler()
        scheduler.run_window_rollup(since_minutes=since_minutes, windows=wins)
        scheduler.close()
        return {"status": "success", "message": "Rollup completed", "since_minutes": since_minutes, "windows": wins}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in rollup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/farms")
def get_active_farms():
    """Get list of active farms"""
    try:
        scheduler = AnalyticsScheduler()
        farms = scheduler.get_active_farms()
        scheduler.close()
        return {"status": "success", "farms": farms, "count": len(farms)}
    except Exception as e:
        logger.error(f"Error getting active farms: {e}")
        raise HTTPException(status_code=500, detail=str(e))


