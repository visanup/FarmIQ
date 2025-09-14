# app/api/v1/anomalies.py

from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.domain.models import Anomaly
from app.services.anomaly_detector import detect_anomalies

router = APIRouter(prefix="/v1")

class AnomalyDetectionRequest(BaseModel):
    tenant_id: str
    factory_id: str
    machine_id: str
    metric: str
    window_s: int
    start: datetime
    end: datetime
    sensor_id: Optional[str] = None
    limit: int = 1000

@router.post("/anomalies", response_model=List[Anomaly])
def detect_anomalies_endpoint(
    request: AnomalyDetectionRequest,
    db: Session = Depends(get_db)
):
    """
    Detect anomalies using Western Electric rules
    
    Returns list of anomalies found in the specified time range
    """
    try:
        # Build query to get data points from minute_features
        sql = text("""
            SELECT 
                tenant_id, 
                tags->>'farm_id' as farm_id,
                tags->>'house_id' as house_id,
                sensor_id, 
                metric, 
                value_sum / NULLIF(value_count, 0) as value,
                bucket as time
            FROM analytics.minute_features
            WHERE tenant_id = :tenant_id
              AND tags->>'farm_id' = :factory_id
              AND tags->>'house_id' = :machine_id
              AND metric = :metric
              AND bucket >= :start
              AND bucket < :end
              AND (:sensor_id IS NULL OR sensor_id = :sensor_id)
            ORDER BY bucket ASC
            LIMIT :limit
        """)
        
        rows = db.execute(sql, {
            "tenant_id": request.tenant_id,
            "factory_id": request.factory_id,
            "machine_id": request.machine_id,
            "metric": request.metric,
            "window_s": request.window_s,
            "start": request.start,
            "end": request.end,
            "sensor_id": request.sensor_id,
            "limit": request.limit
        }).mappings().all()
        
        if not rows:
            return []
        
        # Convert to list of dicts for anomaly detection
        points = [dict(row) for row in rows]
        
        # Detect anomalies
        anomalies = detect_anomalies(points)
        
        return [Anomaly(**anomaly) for anomaly in anomalies]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.get("/anomalies", response_model=List[Anomaly])
def get_anomalies(
    tenant_id: str = Query(...),
    factory_id: str = Query(...),
    machine_id: str = Query(...),
    metric: str = Query(...),
    window_s: int = Query(...),
    start: datetime = Query(..., description="ISO8601 start"),
    end: datetime = Query(..., description="ISO8601 end (exclusive)"),
    sensor_id: Optional[str] = None,
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """
    Get stored anomalies (if anomaly storage is implemented)
    """
    # This would query a stored anomalies table if implemented
    # For now, return empty list
    return []
