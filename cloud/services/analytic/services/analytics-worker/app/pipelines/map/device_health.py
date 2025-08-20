# app\pipelines\map\device_health.py

from __future__ import annotations
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, Optional

def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)

def _sev(level: Optional[str]) -> int:
    if not level: return 1
    level = level.lower()
    return {"ok":1, "info":1, "warn":2, "warning":2, "error":3, "critical":4, "crit":4}.get(level, 1)

def handle_device_health(o: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Expected (flexible) payload examples:
    {
      "time":"2025-08-20T03:12:00Z",
      "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
      "status":"online",              # online|offline (optional)
      "level":"ok",                   # ok|warn|error|critical (optional)
      "health_score": 0.97,           # optional numeric
      "battery_pct": 82,              # optional numeric
      "cpu_pct": 36.4,                # optional numeric
      "payload": {...}
    }
    Strategy:
      - ถ้ามี status → สร้าง EVENT domain=device, event_type="status"
      - ถ้าไม่มี status แต่มี health_score → measurement metric="device.health_score"
      - อย่างอื่น: fallback เป็น event "heartbeat"
    """
    t = _ts(o.get("time"))
    tenant = o["tenant_id"]; factory = o["factory_id"]; machine = o["machine_id"]
    payload = o.get("payload") or {k:v for k,v in o.items() if k not in ("tenant_id","factory_id","machine_id","time")}

    status = (o.get("status") or "").lower().strip()
    if status in ("online","offline"):
        val = 1.0 if status == "online" else 0.0
        return "event", {
            "time": t, "tenant_id": tenant, "domain": "device",
            "entity_type": "machine", "entity_id": machine,
            "event_type": "status",
            "value": val, "unit":"binary", "severity": _sev(o.get("level")),
            "payload": payload
        }

    if "health_score" in o:
        return "measurement", {
            "tenant_id": tenant, "factory_id": factory, "machine_id": machine,
            "sensor_id": o.get("sensor_id"),
            "metric": "device.health_score",
            "value": float(o["health_score"]),
            "time": t,
            "payload": payload
        }

    # Fallback: heartbeat event (count-only)
    return "event", {
        "time": t, "tenant_id": tenant, "domain": "device",
        "entity_type": "machine", "entity_id": machine,
        "event_type": "heartbeat",
        "value": None, "unit": None, "severity": _sev(o.get("level")),
        "payload": payload
    }
