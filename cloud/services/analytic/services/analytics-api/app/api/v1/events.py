# app/v1/events.py

from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db

class EventRollup(BaseModel):
    bucket_start: datetime
    window_s: int
    tenant_id: str
    domain: str
    entity_type: str
    entity_id: str
    event_type: str
    count_n: int
    sum_val: Optional[float] = None
    avg_val: Optional[float] = None
    min_val: Optional[float] = None
    max_val: Optional[float] = None

router = APIRouter(prefix="/v1")

@router.get("/event-rollup", response_model=List[EventRollup])
def get_event_rollup(
    tenant_id: str = Query(...),
    domain: str = Query(...),
    entity_type: str = Query(...),
    entity_id: str = Query(...),
    event_type: str = Query(...),
    window_s: int = Query(...),
    start: datetime = Query(...),
    end: datetime = Query(...),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    sql = text("""
      SELECT bucket_start, window_s, tenant_id, domain, entity_type, entity_id, event_type,
             count_n, sum_val, avg_val, min_val, max_val
      FROM analytics.analytics_event_rollup
      WHERE tenant_id = :tenant_id
        AND domain = :domain
        AND entity_type = :entity_type
        AND entity_id = :entity_id
        AND event_type = :event_type
        AND window_s = :window_s
        AND bucket_start >= :start
        AND bucket_start < :end
      ORDER BY bucket_start ASC
      LIMIT :limit
    """)
    rows = db.execute(sql, {
        "tenant_id": tenant_id, "domain": domain,
        "entity_type": entity_type, "entity_id": entity_id, "event_type": event_type,
        "window_s": window_s, "start": start, "end": end, "limit": limit
    }).mappings().all()
    return [EventRollup(**r) for r in rows]
