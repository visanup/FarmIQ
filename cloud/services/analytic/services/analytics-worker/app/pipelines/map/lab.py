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
    Handle envelope format from analytics-stream
    Lab QC/QA result (1 analyte per record) — map เป็น measurement
    Examples:
    {
      "data": {
        "timestamp":"2025-08-20T01:45:00Z",
        "tenant_id":"t1","farmId":"f1",
        "stationId":"lab-01",
        "sampleId":"S-8892",
        "testType":"Moisture",
        "value": 12.4,
        "unit":"%"
      }
    }
    metric = f"lab.{slug(testType)}"
    """
    # Handle envelope format
    data = o.get("data", o)
    
    t = _ts(data.get("timestamp") or data.get("time"))
    tenant = data["tenant_id"] if "tenant_id" in data else "unknown"
    farm_id = data.get("farmId") or data.get("farm_id")
    station_id = data.get("stationId") or data.get("station_id") or "lab"
    sample_id = data.get("sampleId") or data.get("sample_id")
    test_type = data.get("testType") or data.get("analyte") or "value"
    analyte = _slug(test_type)

    return "measurement", {
        "tenant_id": tenant, "farm_id": farm_id, "device_id": station_id,
        "sensor_id": sample_id,
        "metric": f"lab.{analyte}",
        "value": float(data["value"]),
        "time": t,
        "payload": {k:v for k,v in data.items() if k not in ("tenant_id","farmId","farm_id","timestamp","time")}
    }
