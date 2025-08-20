# app\services\kpi.py

from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Tuple
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.config import Config

"""
คำนวณ KPI (Cp/Cpk/Pp/Ppk) ราย period (day|week|month)
ต้องมีสเปก (USL/LSL) สำหรับ metric นั้น ๆ — รับผ่าน spec_lookup() ด้านล่าง
"""

def _period_floor(ts: datetime, period: str) -> datetime:
    ts = ts.astimezone(timezone.utc)
    if period == "day":
        return ts.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "week":
        # ISO week: จันทร์เป็นวันแรก
        d = ts - timedelta(days=(ts.weekday()))
        return d.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "month":
        return ts.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    raise ValueError("period must be day|week|month")

def _compute_cp_cpk(mean: float, std: float, lsl: Optional[float], usl: Optional[float]) -> Tuple[Optional[float], Optional[float]]:
    if std is None or std <= 0 or lsl is None or usl is None:
        return None, None
    cp = (usl - lsl) / (6.0 * std) if std > 0 else None
    cpu = (usl - mean) / (3.0 * std) if std > 0 else None
    cpl = (mean - lsl) / (3.0 * std) if std > 0 else None
    cpk = min(cpu, cpl) if cpu is not None and cpl is not None else None
    return cp, cpk

def compute_kpi(
    db: Session,
    period: str = "day",
    metric: Optional[str] = None,
    spec_lookup: Optional[callable] = None,
    use_window_s: int = 60
):
    """
    ดึงจาก analytics_agg (window=use_window_s) มาเฉลี่ยทั้ง period แล้ว upsert ลง analytics_kpi
    spec_lookup: fn(key)->(lsl,usl)  | key: (tenant_id,factory_id,machine_id,sensor_id,metric,period_start)
    """
    sql = text(f"""
      WITH base AS (
        SELECT
          time_bucket(INTERVAL '1 {period}', bucket_start) AS period_start,
          tenant_id, factory_id, machine_id, sensor_id, metric,
          SUM(count_n) AS n,
          SUM(sum_val) / NULLIF(SUM(count_n),0) AS mean_val,
          -- stddev ของ aggregate ต้องระวัง; เอาง่าย ๆ ใช้ stddev_pop ของ avg ราย bucket
          STDDEV_POP(avg_val) AS stddev_val
        FROM {Config.DB_SCHEMA}.analytics_agg
        WHERE window_s = :w
        { "AND metric = :metric" if metric else "" }
        GROUP BY period_start, tenant_id, factory_id, machine_id, sensor_id, metric
      )
      SELECT * FROM base
    """)
    rows = db.execute(sql, {"w": use_window_s, **({"metric": metric} if metric else {})}).mappings().all()

    for r in rows:
        key = (r["tenant_id"], r["factory_id"], r["machine_id"], r["sensor_id"], r["metric"], r["period_start"])
        lsl = usl = None
        if spec_lookup:
            lsl, usl = spec_lookup(*key)  # ผู้ใช้ส่งฟังก์ชันมาเอง (อ่านจาก config/table อื่น ๆ )

        cp, cpk = _compute_cp_cpk(r["mean_val"], r["stddev_val"], lsl, usl)
        sql_upsert = text(f"""
          INSERT INTO {Config.DB_SCHEMA}.analytics_kpi
          (period, period_start, tenant_id, factory_id, machine_id, sensor_id, metric,
           n, mean_val, stddev_val, cp, cpk, pp, ppk)
          VALUES (:period, :period_start, :tenant_id, :factory_id, :machine_id, :sensor_id, :metric,
                  :n, :mean_val, :stddev_val, :cp, :cpk, :pp, :ppk)
          ON CONFLICT (tenant_id, factory_id, machine_id, metric, period, period_start)
          DO UPDATE SET
            n = EXCLUDED.n, mean_val = EXCLUDED.mean_val, stddev_val = EXCLUDED.stddev_val,
            cp = EXCLUDED.cp, cpk = EXCLUDED.cpk, pp = EXCLUDED.pp, ppk = EXCLUDED.ppk,
            updated_at = NOW();
        """)
        db.execute(sql_upsert, {
            "period": period, "period_start": r["period_start"],
            "tenant_id": r["tenant_id"], "factory_id": r["factory_id"], "machine_id": r["machine_id"],
            "sensor_id": r["sensor_id"], "metric": r["metric"],
            "n": int(r["n"] or 0), "mean_val": r["mean_val"], "stddev_val": r["stddev_val"],
            "cp": cp, "cpk": cpk, "pp": None, "ppk": None  # pp/ppk ไว้เพิ่มภายหลัง
        })
    db.commit()
