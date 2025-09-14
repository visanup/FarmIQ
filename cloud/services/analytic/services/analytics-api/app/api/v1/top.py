from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(prefix="/v1", tags=["Top Stats"])


class TopMetricRow(BaseModel):
    metric: str
    rows: int


class TopDeviceRow(BaseModel):
    device_id: str
    rows: int


@router.get("/metrics/top", response_model=List[TopMetricRow])
def top_metrics(
    window_m: int = Query(60, ge=1, le=24 * 60, description="Window in minutes"),
    limit: int = Query(5, ge=1, le=100),
    tenant_id: Optional[str] = Query(None),
    farm_id: Optional[str] = Query(None),
    house_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    sql = text(
        """
        SELECT metric, COUNT(*)::int AS rows
        FROM analytics.minute_features
        WHERE bucket > now() - make_interval(mins => :window_m)
          AND (:tenant_id = '' OR tenant_id = :tenant_id)
          AND (:farm_id  = '' OR tags->>'farm_id'  = :farm_id)
          AND (:house_id = '' OR tags->>'house_id' = :house_id)
        GROUP BY metric
        ORDER BY rows DESC
        LIMIT :limit
        """
    )
    rows = db.execute(
        sql,
        {
            "window_m": window_m,
            "limit": limit,
            "tenant_id": tenant_id or "",
            "farm_id": farm_id or "",
            "house_id": house_id or "",
        },
    ).mappings()
    return [TopMetricRow(**r) for r in rows]


@router.get("/devices/top", response_model=List[TopDeviceRow])
def top_devices(
    window_m: int = Query(60, ge=1, le=24 * 60, description="Window in minutes"),
    limit: int = Query(5, ge=1, le=100),
    tenant_id: Optional[str] = Query(None),
    farm_id: Optional[str] = Query(None),
    house_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    sql = text(
        """
        SELECT device_id, COUNT(*)::int AS rows
        FROM analytics.minute_features
        WHERE bucket > now() - make_interval(mins => :window_m)
          AND (:tenant_id = '' OR tenant_id = :tenant_id)
          AND (:farm_id  = '' OR tags->>'farm_id'  = :farm_id)
          AND (:house_id = '' OR tags->>'house_id' = :house_id)
        GROUP BY device_id
        ORDER BY rows DESC
        LIMIT :limit
        """
    )
    rows = db.execute(
        sql,
        {
            "window_m": window_m,
            "limit": limit,
            "tenant_id": tenant_id or "",
            "farm_id": farm_id or "",
            "house_id": house_id or "",
        },
    ).mappings()
    return [TopDeviceRow(**r) for r in rows]
