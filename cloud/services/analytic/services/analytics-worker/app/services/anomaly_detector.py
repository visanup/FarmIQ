# app\services\anomaly_detector.py

from __future__ import annotations
from typing import Iterable, Dict, List, Tuple
from statistics import mean, pstdev
from app.domain import rules

def _calc_cl_std(values: List[float]) -> Tuple[float, float]:
    if not values:
        return 0.0, 0.0
    m = mean(values)
    sd = pstdev(values) if len(values) > 1 else 0.0
    return m, sd

def detect_anomalies(points: List[dict]) -> List[dict]:
    """
    points: list ของ measurement (tenant_id, factory_id, machine_id, sensor_id?, metric, value, time)
    ทำ rule WE1-4 บน series เดียวกัน (สมมติ points ถูก filter ตาม key เดียวแล้ว)
    """
    if not points:
        return []
    points = sorted(points, key=lambda x: x["time"])
    vals = [float(p["value"]) for p in points]
    cl, std = _calc_cl_std(vals)

    hits = rules.evaluate(vals, cl, std)
    if not hits:
        return []

    ucl, lcl = cl + 3*std, cl - 3*std
    base = points[0]
    out: List[dict] = []
    for h in hits:
        p = points[h.index]
        out.append({
            "time": p["time"],
            "tenant_id": p["tenant_id"],
            "factory_id": p["factory_id"],
            "machine_id": p["machine_id"],
            "sensor_id": p.get("sensor_id"),
            "metric": p["metric"],
            "rule_code": h.code,
            "severity": 3 if h.code == "WE-1" else 2,
            "value": float(p["value"]),
            "cl": cl, "ucl": ucl, "lcl": lcl,
            "zscore": (float(p["value"]) - cl) / std if std > 0 else None,
            "details": {"reason": "stream", **(h.detail or {})}
        })
    return out
