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
    # Use minute_features and aggregate on the fly
    sql = text(f"""
      SELECT
        time_bucket(INTERVAL '{window_s} seconds', bucket) AS bucket_start,
        {window_s} AS window_s,
        tenant_id,
          tags->>'farm_id' AS farm_id,
          tags->>'house_id' AS house_id,
        sensor_id,
        metric,
        SUM(value_count) AS count_n,
        SUM(value_sum) AS sum_val,
        AVG(value_sum / NULLIF(value_count, 0)) AS avg_val,
        MIN(value_min) AS min_val,
        MAX(value_max) AS max_val,
        STDDEV_POP(value_sum / NULLIF(value_count, 0)) AS stddev_val,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value_sum / NULLIF(value_count, 0)) AS p95_val
      FROM analytics.minute_features
        WHERE tenant_id = :tenant_id
          AND tags->>'farm_id' = :factory_id
          AND tags->>'house_id' = :machine_id
        AND metric = :metric
        AND bucket >= :start
        AND bucket < :end
        { "AND sensor_id = :sensor_id" if sensor_id else "" }
      GROUP BY time_bucket(INTERVAL '{window_s} seconds', bucket), tenant_id, tags->>'farm_id', tags->>'house_id', sensor_id, metric
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
