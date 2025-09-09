# app/v1/endpoint.py
from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.instrumentation.metrics import metrics_response
import threading
import os

router = APIRouter(prefix="/v1")

@router.get("/health")
def health(db: Session = Depends(get_db)):
    """Health check endpoint with database connectivity and worker status"""
    try:
        # Test database connection
        db.execute("SELECT 1")
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


