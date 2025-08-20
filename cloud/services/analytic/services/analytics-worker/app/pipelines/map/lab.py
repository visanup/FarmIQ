# app\pipelines\map\lab.py

from __future__ import annotations
from datetime import datetime, timezone
from typing import Tuple, Dict, Any

def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)

def _slug(s: str) -> str:
    return (s or "").strip().lower().replace(" ", "_")

def handle_lab_record(o: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Lab QC/QA result (1 analyte per record) — map เป็น measurement
    Examples:
    {
      "time":"2025-08-20T01:45:00Z",
      "tenant_id":"t1","factory_id":"f1",
      "station_id":"lab-01",             # หรือ lab_id
      "sample_id":"S-8892",              # จะเก็บใน sensor_id
      "analyte":"Moisture",
      "value": 12.4,
      "unit":"%",
      "lot":"L-1001"
    }
    metric = f"lab.{slug(analyte)}"
    """
    t = _ts(o["time"])
    tenant = o["tenant_id"]; factory = o["factory_id"]
    machine = o.get("station_id") or o.get("lab_id") or "lab"
    sensor = o.get("sample_id")
    analyte = _slug(o.get("analyte") or "value")

    return "measurement", {
        "tenant_id": tenant, "factory_id": factory, "machine_id": machine,
        "sensor_id": sensor,
        "metric": f"lab.{analyte}",
        "value": float(o["value"]),
        "time": t,
        "payload": {k:v for k,v in o.items() if k not in ("tenant_id","factory_id","time")}
    }
