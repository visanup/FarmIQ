# app/v1/agg.py

from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.domain.models import Aggregate

router = APIRouter(prefix="/v1")

@router.get("/agg", response_model=List[Aggregate])
def get_agg(
    tenant_id: str = Query(...),
    factory_id: str = Query(...),
    machine_id: str = Query(...),
    metric: str = Query(...),
    window_s: int = Query(...),
    start: datetime = Query(..., description="ISO8601 start"),
    end: datetime = Query(..., description="ISO8601 end (exclusive)"),
    sensor_id: Optional[str] = None,
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    sql = text(f"""
      SELECT
        bucket_start, window_s, tenant_id, factory_id, machine_id, sensor_id, metric,
        count_n,
        COALESCE(sum_val,0)    AS sum_val,
        COALESCE(avg_val,0)    AS avg_val,
        COALESCE(min_val,0)    AS min_val,
        COALESCE(max_val,0)    AS max_val,
        COALESCE(stddev_val,0) AS stddev_val,
        COALESCE(p95_val,0)    AS p95_val
      FROM analytics.analytics_agg
      WHERE tenant_id = :tenant_id
        AND factory_id = :factory_id
        AND machine_id = :machine_id
        AND metric = :metric
        AND window_s = :window_s
        AND bucket_start >= :start
        AND bucket_start < :end
        { "AND sensor_id = :sensor_id" if sensor_id else "" }
      ORDER BY bucket_start ASC
      LIMIT :limit
    """)
    rows = db.execute(sql, {
        "tenant_id": tenant_id, "factory_id": factory_id, "machine_id": machine_id,
        "metric": metric, "window_s": window_s, "start": start, "end": end,
        **({"sensor_id": sensor_id} if sensor_id else {}),
        "limit": limit,
    }).mappings().all()
    return [Aggregate(**r) for r in rows]
