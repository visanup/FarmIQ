# app\services\backfill.py

from __future__ import annotations
from datetime import datetime
from typing import Iterable, List, Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.config import Config

"""
Backfill aggregates โดยใช้ time_bucket() ฝั่ง DB (เร็วกว่าโหลดมาทำใน Python มาก)
สมมติ raw อยู่ในตาราง sensors.device_readings โครง: 
(time timestamptz, tenant_id text, factory_id text, machine_id text, sensor_id text, metric text, value double precision)
ปรับชื่อ schema/table ถ้าของจริงต่างไป
"""

RAW_TABLE = "sensors.device_readings"

def backfill_aggregates(db: Session, start: datetime, end: datetime,
                        windows: Optional[List[int]] = None,
                        tenant_id: Optional[str] = None,
                        factory_id: Optional[str] = None,
                        machine_id: Optional[str] = None,
                        metric: Optional[str] = None):
    windows = windows or Config.WINDOWS

    where = ["time >= :start", "time < :end"]
    params = {"start": start, "end": end}
    if tenant_id:  where.append("tenant_id = :tenant_id");  params["tenant_id"]  = tenant_id
    if factory_id: where.append("factory_id = :factory_id");params["factory_id"] = factory_id
    if machine_id: where.append("machine_id = :machine_id");params["machine_id"] = machine_id
    if metric:     where.append("metric = :metric");        params["metric"]     = metric
    where_sql = " AND ".join(where)

    for w in windows:
        # ใช้ approx_percentile ถ้ามี; ที่นี่ใช้ p95 ง่าย ๆ ผ่าน percentile_disc
        sql = text(f"""
        WITH agg AS (
          SELECT
            time_bucket(make_interval(secs => :w), time) AS bucket_start,
            :w AS window_s,
            tenant_id, factory_id, machine_id, sensor_id, metric,
            COUNT(*)::bigint AS count_n,
            SUM(value)::double precision AS sum_val,
            AVG(value)::double precision AS avg_val,
            MIN(value)::double precision AS min_val,
            MAX(value)::double precision AS max_val,
            STDDEV_POP(value)::double precision AS stddev_val,
            PERCENTILE_DISC(0.95) WITHIN GROUP (ORDER BY value) AS p95_val
          FROM {RAW_TABLE}
          WHERE {where_sql}
          GROUP BY bucket_start, tenant_id, factory_id, machine_id, sensor_id, metric
        )
        INSERT INTO {Config.DB_SCHEMA}.analytics_agg
        (bucket_start, window_s, tenant_id, factory_id, machine_id, sensor_id, metric,
         count_n, sum_val, avg_val, min_val, max_val, stddev_val, p95_val)
        SELECT * FROM agg
        ON CONFLICT (tenant_id, factory_id, machine_id, metric, window_s, bucket_start)
        DO UPDATE SET
          count_n    = EXCLUDED.count_n,
          sum_val    = EXCLUDED.sum_val,
          avg_val    = EXCLUDED.avg_val,
          min_val    = EXCLUDED.min_val,
          max_val    = EXCLUDED.max_val,
          stddev_val = EXCLUDED.stddev_val,
          p95_val    = EXCLUDED.p95_val,
          updated_at = NOW();
        """)
        db.execute(sql, {**params, "w": w})
    db.commit()
