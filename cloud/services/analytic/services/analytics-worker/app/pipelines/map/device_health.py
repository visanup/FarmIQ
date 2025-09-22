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
    Handle envelope format from analytics-stream
    Expected payload examples:
    {
      "data": {
        "deviceId": "device_123",
        "status": "online",
        "batteryLevel": 82,
        "temperature": 36.4,
        "timestamp": "2025-08-20T03:12:00Z"
      }
    }
    Strategy:
      - ถ้ามี status → สร้าง EVENT domain=device, event_type="status"
      - ถ้าไม่มี status แต่มี health_score → measurement metric="device.health_score"
      - อย่างอื่น: fallback เป็น event "heartbeat"
    """
    # Handle envelope format
    data = o.get("data", o)
    
    t = _ts(data.get("timestamp") or data.get("time"))
    tenant = data["tenant_id"] if "tenant_id" in data else "unknown"
    device_id = data.get("deviceId") or data.get("device_id") or "unknown"
    payload = data.get("payload") or {k:v for k,v in data.items() if k not in ("tenant_id","deviceId","device_id","timestamp","time")}

    status = (data.get("status") or "").lower().strip()
    if status in ("online","offline"):
        val = 1.0 if status == "online" else 0.0
        return "event", {
            "time": t, "tenant_id": tenant, "domain": "device",
            "entity_type": "device", "entity_id": device_id,
            "event_type": "status",
            "value": val, "unit":"binary", "severity": _sev(data.get("level")),
            "payload": payload
        }

    if "health_score" in data:
        return "measurement", {
            "tenant_id": tenant, "farm_id": data.get("farmId"), "device_id": device_id,
            "sensor_id": data.get("sensorId"),
            "metric": "device.health_score",
            "value": float(data["health_score"]),
            "time": t,
            "payload": payload
        }

    # Fallback: heartbeat event (count-only)
    return "event", {
        "time": t, "tenant_id": tenant, "domain": "device",
        "entity_type": "device", "entity_id": device_id,
        "event_type": "heartbeat",
        "value": None, "unit": None, "severity": _sev(data.get("level")),
        "payload": payload
    }
