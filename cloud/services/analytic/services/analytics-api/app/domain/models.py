# app/domain/models.py
from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
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

# FCR Models
class FcrData(BaseModel):
    tenant_id: str
    house_id: str
    farm_id: Optional[str] = None
    period_start: datetime
    period_end: datetime
    total_feed_consumed_kg: float
    total_weight_gain_kg: float
    fcr_ratio: float
    animal_count: Optional[int] = None
    avg_daily_fcr: Optional[float] = None
    weight_source: str
    scale_weight_gain_kg: Optional[float] = None
    predict_weight_gain_kg: Optional[float] = None

# Size Distribution Models
class WeightCategory(BaseModel):
    category: str
    count: int
    percentage: float
    avg_weight_kg: float

class Quartiles(BaseModel):
    q1_kg: float
    q2_kg: float
    q3_kg: float
    iqr_kg: float

class SizeDistributionData(BaseModel):
    tenant_id: str
    house_id: str
    farm_id: Optional[str] = None
    measurement_date: datetime
    total_animals: int
    mean_weight_kg: float
    median_weight_kg: float
    std_deviation_kg: float
    variance_kg: float
    min_weight_kg: float
    max_weight_kg: float
    range_kg: float
    coefficient_of_variation: float
    weight_categories: List[WeightCategory]
    quartiles: Quartiles

# KPI Models
class KpiResponse(BaseModel):
    period: str
    period_start: datetime
    tenant_id: str
    farm_id: str
    house_id: str
    sensor_id: Optional[str] = None
    metric: str
    n: int
    mean_val: float
    stddev_val: float
    cp: Optional[float] = None
    cpk: Optional[float] = None
    pp: Optional[float] = None
    ppk: Optional[float] = None
