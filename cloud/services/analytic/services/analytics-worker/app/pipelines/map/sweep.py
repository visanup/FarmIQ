# app\pipelines\map\sweep.py

from __future__ import annotations
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, List, Optional

def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)

def handle_sweep_reading(o: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Sweep payloads มักเป็นชุดค่าในข้อความเดียว (ไม่เหมาะจะแตกเป็นหลาย measurement
    ใน handler ปัจจุบัน) ดังนั้นรวมเป็น 'sweep_completed' EVENT + summary
    Examples:
    {
      "time":"2025-08-20T02:20:00Z",
      "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
      "metric":"temp",                         # อาจมีหรือไม่มีก็ได้
      "readings":[ {"value":23.1},{"value":22.9},{"value":23.6} ],
      "payload": {...}
    }
    """
    t = _ts(o["time"])
    vals: List[float] = [float(r["value"]) for r in (o.get("readings") or []) if r.get("value") is not None]
    n = len(vals)
    s = sum(vals) if n else None
    avg = (s / n) if s is not None else None
    mn = min(vals) if vals else None
    mx = max(vals) if vals else None

    return "event", {
        "time": t,
        "tenant_id": o["tenant_id"],
        "domain": "sweep",
        "entity_type": "machine",
        "entity_id": o.get("machine_id","-"),
        "event_type": "sweep_completed",
        "value": avg,                # summary value (avg)
        "unit": o.get("unit"),
        "severity": 1,
        "payload": {
            "count": n, "sum": s, "min": mn, "max": mx,
            "metric": o.get("metric"),
            **(o.get("payload") or {})
        }
    }
