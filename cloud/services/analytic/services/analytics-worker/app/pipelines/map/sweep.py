# app\pipelines\map\sweep.py

from __future__ import annotations
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, List, Optional

def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)

def handle_sweep_reading(o: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Handle envelope format from analytics-stream
    Sweep payloads มักเป็นชุดค่าในข้อความเดียว (ไม่เหมาะจะแตกเป็นหลาย measurement
    ใน handler ปัจจุบัน) ดังนั้นรวมเป็น 'sweep_completed' EVENT + summary
    Examples:
    {
      "data": {
        "timestamp":"2025-08-20T02:20:00Z",
        "tenant_id":"t1","farmId":"f1","deviceId":"device-01",
        "metric":"temp",
        "readings":[ {"value":23.1},{"value":22.9},{"value":23.6} ]
      }
    }
    """
    # Handle envelope format
    data = o.get("data", o)
    
    t = _ts(data.get("timestamp") or data.get("time"))
    tenant = data["tenant_id"] if "tenant_id" in data else "unknown"
    device_id = data.get("deviceId") or data.get("device_id") or "unknown"
    
    vals: List[float] = [float(r["value"]) for r in (data.get("readings") or []) if r.get("value") is not None]
    n = len(vals)
    s = sum(vals) if n else None
    avg = (s / n) if s is not None else None
    mn = min(vals) if vals else None
    mx = max(vals) if vals else None

    return "event", {
        "time": t,
        "tenant_id": tenant,
        "domain": "sweep",
        "entity_type": "device",
        "entity_id": device_id,
        "event_type": "sweep_completed",
        "value": avg,                # summary value (avg)
        "unit": data.get("unit"),
        "severity": 1,
        "payload": {
            "count": n, "sum": s, "min": mn, "max": mx,
            "metric": data.get("metric"),
            **(data.get("payload") or {})
        }
    }
