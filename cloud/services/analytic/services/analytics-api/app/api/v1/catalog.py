from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(prefix="/v1/catalog", tags=["Catalog"])

@router.get("/tenants", response_model=List[str])
def list_tenants(
    db: Session = Depends(get_db),
):
    sql = text(
        """
        SELECT DISTINCT tenant_id
        FROM analytics.minute_features
        ORDER BY tenant_id
        LIMIT 10000
        """
    )
    rows = db.execute(sql).all()
    return [r[0] for r in rows if r[0]]


@router.get("/factories", response_model=List[str])
def list_factories(
    tenant_id: Optional[str] = Query(None, description="Tenant ID"),
    db: Session = Depends(get_db),
):
    if tenant_id:
        sql = text(
            """
            SELECT DISTINCT tags->>'farm_id' as farm_id
            FROM analytics.minute_features
            WHERE tenant_id = :tenant_id
              AND tags->>'farm_id' IS NOT NULL
            ORDER BY farm_id
            LIMIT 10000
            """
        )
        rows = db.execute(sql, {"tenant_id": tenant_id}).all()
    else:
        sql = text(
            """
            SELECT DISTINCT tags->>'farm_id' as farm_id
            FROM analytics.minute_features
            WHERE tags->>'farm_id' IS NOT NULL
            ORDER BY farm_id
            LIMIT 10000
            """
        )
        rows = db.execute(sql).all()
    return [r[0] for r in rows if r[0]]


@router.get("/machines", response_model=List[str])
def list_machines(
    tenant_id: Optional[str] = Query(None, description="Tenant ID"),
    factory_id: Optional[str] = Query(None, description="Factory ID"),
    db: Session = Depends(get_db),
):
    conditions = []
    params = {}
    
    if tenant_id:
        conditions.append("tenant_id = :tenant_id")
        params["tenant_id"] = tenant_id
    
    if factory_id:
        conditions.append("tags->>'farm_id' = :factory_id")
        params["factory_id"] = factory_id
    
    conditions.append("tags->>'house_id' IS NOT NULL")
    
    where_clause = " AND ".join(conditions)
    
    sql = text(f"""
        SELECT DISTINCT tags->>'house_id' as house_id
        FROM analytics.minute_features
        WHERE {where_clause}
        ORDER BY house_id
        LIMIT 10000
    """)
    
    rows = db.execute(sql, params).all()
    return [r[0] for r in rows if r[0]]


@router.get("/metrics", response_model=List[str])
def list_metrics(
    tenant_id: Optional[str] = Query(None, description="Tenant ID"),
    factory_id: Optional[str] = Query(None, description="Factory ID"),
    machine_id: Optional[str] = Query(None, description="Machine ID"),
    db: Session = Depends(get_db),
):
    conditions = []
    params = {}
    
    if tenant_id:
        conditions.append("tenant_id = :tenant_id")
        params["tenant_id"] = tenant_id
    
    if factory_id:
        conditions.append("tags->>'farm_id' = :factory_id")
        params["factory_id"] = factory_id
    
    if machine_id:
        conditions.append("tags->>'house_id' = :machine_id")
        params["machine_id"] = machine_id
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    sql = text(f"""
        SELECT DISTINCT metric
        FROM analytics.minute_features
        WHERE {where_clause}
        ORDER BY metric
        LIMIT 10000
    """)
    
    rows = db.execute(sql, params).all()
    return [r[0] for r in rows if r[0]]
