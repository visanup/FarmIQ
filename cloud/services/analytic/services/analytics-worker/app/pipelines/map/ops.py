# app\pipelines\map\ops.py

from __future__ import annotations
from datetime import datetime, timezone
from typing import Tuple, Dict, Any

def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)

def _sev(evt: str) -> int:
    evt = (evt or "").lower()
    if "alarm" in evt or "incident" in evt: return 4
    if "workorder_opened" in evt or "downtime" in evt: return 3
    return 1

def handle_ops_event(o: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Operations events (batch lifecycle, shift, workorders, alarms…)
    Examples:
    {
      "time":"2025-08-20T03:00:00Z",
      "tenant_id":"t1",
      "entity_type":"batch",                 # batch|shift|workorder|line|house
      "entity_id":"B-2025-08-01",
      "event_type":"batch_started",          # batch_started|batch_closed|shift_started|workorder_opened|alarm_triggered
      "value": null,
      "payload": {"species":"broiler","target_fcr":1.5}
    }
    → event (domain="ops")
    """
    t = _ts(o["time"])
    return "event", {
        "time": t,
        "tenant_id": o["tenant_id"],
        "domain": "ops",
        "entity_type": o.get("entity_type","entity"),
        "entity_id": o.get("entity_id","-"),
        "event_type": o.get("event_type","event"),
        "value": o.get("value"),
        "unit": o.get("unit"),
        "severity": _sev(o.get("event_type")),
        "payload": o.get("payload") or {k:v for k,v in o.items() if k not in ("tenant_id","time")}
    }
