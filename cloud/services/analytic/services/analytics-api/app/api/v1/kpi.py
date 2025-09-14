# app/api/v1/kpi.py

from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.services.kpi import compute_kpi

router = APIRouter(prefix="/v1")

class KpiCalculationRequest(BaseModel):
    period: str = "day"  # day, week, month
    metric: Optional[str] = None
    use_window_s: int = 60

class KpiResponse(BaseModel):
    period: str
    period_start: datetime
    tenant_id: str
    factory_id: str
    machine_id: str
    sensor_id: Optional[str]
    metric: str
    n: int
    mean_val: float
    stddev_val: float
    cp: Optional[float]
    cpk: Optional[float]
    pp: Optional[float]
    ppk: Optional[float]

@router.post("/kpi", response_model=List[KpiResponse])
def calculate_kpi_endpoint(
    request: KpiCalculationRequest,
    db: Session = Depends(get_db)
):
    """
    Calculate process capability indices (Cp/Cpk/Pp/Ppk)
    
    Requires specification limits to be configured for the metric
    """
    try:
        # Simple spec lookup function (in production, this would query a config table)
        def spec_lookup(tenant_id, factory_id, machine_id, sensor_id, metric, period_start):
            # Example: return LSL, USL for temperature
            if metric == "temperature":
                return 20.0, 30.0  # Example limits
            return None, None
        
        # Calculate KPIs
        compute_kpi(
            db=db,
            period=request.period,
            metric=request.metric,
            spec_lookup=spec_lookup,
            use_window_s=request.use_window_s
        )
        
        # Query the calculated KPIs
        sql = text("""
            SELECT period, period_start, tenant_id, factory_id, machine_id, sensor_id, metric,
                   n, mean_val, stddev_val, cp, cpk, pp, ppk
            FROM analytics.analytics_kpi
            WHERE period = :period
              AND (:metric IS NULL OR metric = :metric)
            ORDER BY period_start DESC
            LIMIT 1000
        """)
        
        rows = db.execute(sql, {
            "period": request.period,
            "metric": request.metric
        }).mappings().all()
        
        return [KpiResponse(**row) for row in rows]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KPI calculation failed: {str(e)}")

@router.get("/kpi", response_model=List[KpiResponse])
def get_kpi(
    period: str = Query("day", description="Period: day, week, month"),
    metric: Optional[str] = Query(None, description="Metric name"),
    tenant_id: Optional[str] = Query(None, description="Tenant ID"),
    factory_id: Optional[str] = Query(None, description="Factory ID"),
    machine_id: Optional[str] = Query(None, description="Machine ID"),
    start: Optional[datetime] = Query(None, description="Start time"),
    end: Optional[datetime] = Query(None, description="End time"),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """
    Get calculated KPI values
    """
    try:
        conditions = ["period = :period"]
        params = {"period": period}
        
        if metric:
            conditions.append("metric = :metric")
            params["metric"] = metric
        
        if tenant_id:
            conditions.append("tenant_id = :tenant_id")
            params["tenant_id"] = tenant_id
        
        if factory_id:
            conditions.append("factory_id = :factory_id")
            params["factory_id"] = factory_id
        
        if machine_id:
            conditions.append("machine_id = :machine_id")
            params["machine_id"] = machine_id
        
        if start:
            conditions.append("period_start >= :start")
            params["start"] = start
        
        if end:
            conditions.append("period_start < :end")
            params["end"] = end
        
        where_clause = " AND ".join(conditions)
        
        sql = text(f"""
            SELECT period, period_start, tenant_id, factory_id, machine_id, sensor_id, metric,
                   n, mean_val, stddev_val, cp, cpk, pp, ppk
            FROM analytics.analytics_kpi
            WHERE {where_clause}
            ORDER BY period_start DESC
            LIMIT :limit
        """)
        
        params["limit"] = limit
        rows = db.execute(sql, params).mappings().all()
        
        return [KpiResponse(**row) for row in rows]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get KPI data: {str(e)}")
