# app/domain/models.py
from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class Measurement(BaseModel):
    tenant_id: str
    factory_id: str
    machine_id: str
    sensor_id: Optional[str] = None
    metric: str
    value: float
    time: datetime
    payload: Optional[Dict[str, Any]] = None

class Aggregate(BaseModel):
    bucket_start: datetime
    window_s: int
    tenant_id: str
    factory_id: str
    machine_id: str
    sensor_id: Optional[str] = None
    metric: str
    count_n: int
    sum_val: float
    avg_val: float
    min_val: float
    max_val: float
    stddev_val: float
    p95_val: float

class Anomaly(BaseModel):
    time: datetime
    tenant_id: str
    factory_id: str
    machine_id: str
    sensor_id: Optional[str] = None
    metric: str
    rule_code: str
    severity: int = 1
    value: float
    cl: Optional[float] = None
    ucl: Optional[float] = None
    lcl: Optional[float] = None
    zscore: Optional[float] = None
    details: Optional[Dict[str, Any]] = None
