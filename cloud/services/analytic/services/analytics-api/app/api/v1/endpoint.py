# app/v1/endpoint.py
from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.instrumentation.metrics import metrics_response

router = APIRouter(prefix="/v1")

@router.get("/health")
def health(db: Session = Depends(get_db)):
    """Health check endpoint with database connectivity test"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "service": "analytics-api"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "database": "disconnected",
            "service": "analytics-api",
            "error": str(e)
        }

@router.get("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    body, code, headers = metrics_response()
    return Response(content=body, status_code=code, media_type=headers["Content-Type"])



