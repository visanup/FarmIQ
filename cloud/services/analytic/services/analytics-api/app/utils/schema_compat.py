# app/utils/schema_compat.py

"""
Database schema compatibility utilities
Handles differences between Prisma schema and analytics-api expectations
"""

from typing import Dict, Any, Optional
from sqlalchemy import text
from sqlalchemy.orm import Session

def get_aggregated_data(
    db: Session,
    tenant_id: str,
    factory_id: str,
    machine_id: str,
    metric: str,
    window_s: int,
    start_time,
    end_time,
    sensor_id: Optional[str] = None,
    limit: int = 1000
) -> list:
    """
    Get aggregated data from minute_features table
    This replaces the need for analytics_agg table
    """
    sql = text(f"""
        SELECT
            time_bucket(INTERVAL '{window_s} seconds', bucket) AS bucket_start,
            {window_s} AS window_s,
            tenant_id,
            tags->>'factory_id' AS factory_id,
            tags->>'machine_id' AS machine_id,
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
          AND tags->>'factory_id' = :factory_id
          AND tags->>'machine_id' = :machine_id
          AND metric = :metric
          AND bucket >= :start_time
          AND bucket < :end_time
          { "AND sensor_id = :sensor_id" if sensor_id else "" }
        GROUP BY time_bucket(INTERVAL '{window_s} seconds', bucket), tenant_id, tags->>'factory_id', tags->>'machine_id', sensor_id, metric
        ORDER BY bucket_start ASC
        LIMIT :limit
    """)
    
    params = {
        "tenant_id": tenant_id,
        "factory_id": factory_id,
        "machine_id": machine_id,
        "metric": metric,
        "window_s": window_s,
        "start_time": start_time,
        "end_time": end_time,
        "limit": limit
    }
    
    if sensor_id:
        params["sensor_id"] = sensor_id
    
    rows = db.execute(sql, params).mappings().all()
    return [dict(row) for row in rows]

def get_catalog_data(
    db: Session,
    catalog_type: str,
    tenant_id: Optional[str] = None,
    factory_id: Optional[str] = None,
    machine_id: Optional[str] = None
) -> list:
    """
    Get catalog data (tenants, factories, machines, metrics) from minute_features
    """
    if catalog_type == "tenants":
        sql = text("""
            SELECT DISTINCT tenant_id
            FROM analytics.minute_features
            ORDER BY tenant_id
            LIMIT 10000
        """)
        params = {}
    elif catalog_type == "factories":
        sql = text("""
            SELECT DISTINCT tags->>'factory_id' as factory_id
            FROM analytics.minute_features
            WHERE (:tenant_id IS NULL OR tenant_id = :tenant_id)
              AND tags->>'factory_id' IS NOT NULL
            ORDER BY factory_id
            LIMIT 10000
        """)
        params = {"tenant_id": tenant_id}
    elif catalog_type == "machines":
        sql = text("""
            SELECT DISTINCT tags->>'machine_id' as machine_id
            FROM analytics.minute_features
            WHERE (:tenant_id IS NULL OR tenant_id = :tenant_id)
              AND (:factory_id IS NULL OR tags->>'factory_id' = :factory_id)
              AND tags->>'machine_id' IS NOT NULL
            ORDER BY machine_id
            LIMIT 10000
        """)
        params = {"tenant_id": tenant_id, "factory_id": factory_id}
    elif catalog_type == "metrics":
        sql = text("""
            SELECT DISTINCT metric
            FROM analytics.minute_features
            WHERE (:tenant_id IS NULL OR tenant_id = :tenant_id)
              AND (:factory_id IS NULL OR tags->>'factory_id' = :factory_id)
              AND (:machine_id IS NULL OR tags->>'machine_id' = :machine_id)
            ORDER BY metric
            LIMIT 10000
        """)
        params = {"tenant_id": tenant_id, "factory_id": factory_id, "machine_id": machine_id}
    else:
        return []
    
    rows = db.execute(sql, params).all()
    return [r[0] for r in rows if r[0]]

def get_anomaly_data(
    db: Session,
    tenant_id: str,
    factory_id: str,
    machine_id: str,
    metric: str,
    start_time,
    end_time,
    sensor_id: Optional[str] = None,
    limit: int = 1000
) -> list:
    """
    Get data points for anomaly detection from minute_features
    """
    sql = text("""
        SELECT 
            tenant_id, 
            tags->>'factory_id' as factory_id, 
            tags->>'machine_id' as machine_id, 
            sensor_id, 
            metric, 
            value_sum / NULLIF(value_count, 0) as value,
            bucket as time
        FROM analytics.minute_features
        WHERE tenant_id = :tenant_id
          AND tags->>'factory_id' = :factory_id
          AND tags->>'machine_id' = :machine_id
          AND metric = :metric
          AND bucket >= :start_time
          AND bucket < :end_time
          AND (:sensor_id IS NULL OR sensor_id = :sensor_id)
        ORDER BY bucket ASC
        LIMIT :limit
    """)
    
    params = {
        "tenant_id": tenant_id,
        "factory_id": factory_id,
        "machine_id": machine_id,
        "metric": metric,
        "start_time": start_time,
        "end_time": end_time,
        "limit": limit
    }
    
    if sensor_id:
        params["sensor_id"] = sensor_id
    
    rows = db.execute(sql, params).mappings().all()
    return [dict(row) for row in rows]
