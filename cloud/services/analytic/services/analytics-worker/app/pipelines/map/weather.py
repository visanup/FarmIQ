# app\pipelines\map\weather.py

from __future__ import annotations
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, Optional

def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)

def _pick_metric(o: Dict[str, Any]) -> Tuple[str, Optional[float], Optional[str]]:
    """
    เลือก metric เดียวจาก weather record ตามลำดับความสำคัญ:
    temp_c > humidity_pct > rainfall_mm > wind_kph
    """
    if "temp_c" in o:      return "weather.temp_c", float(o["temp_c"]), "C"
    if "humidity" in o:    return "weather.humidity_pct", float(o["humidity"]), "%"
    if "rain_mm" in o:     return "weather.rain_mm", float(o["rain_mm"]), "mm"
    if "wind_kph" in o:    return "weather.wind_kph", float(o["wind_kph"]), "kph"
    return "weather.index", None, None

def handle_weather_record(o: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Examples:
    {
      "time":"2025-08-20T02:05:00Z",
      "tenant_id":"t1", "factory_id":"farm-a",
      "station_id":"wx-001",
      "temp_c": 31.2, "humidity": 78.0, "rain_mm": 0.0, "wind_kph": 5.6,
      "payload": {"src":"openweather"}
    }
    → measurement (เลือก metric เดียว ตามลำดับความสำคัญ)
    """
    t = _ts(o["time"])
    metric, value, unit = _pick_metric(o)
    if value is not None:
        return "measurement", {
            "tenant_id": o["tenant_id"],
            "factory_id": o["factory_id"],
            "machine_id": o.get("station_id") or "weather",
            "sensor_id": o.get("sensor_id"),
            "metric": metric,
            "value": value,
            "time": t,
            "payload": { "unit": unit, **(o.get("payload") or {}) }
        }

    # ถ้าไม่มี numeric เลย -> เก็บเป็น event summary
    return "event", {
        "time": t,
        "tenant_id": o["tenant_id"],
        "domain": "weather",
        "entity_type": "station",
        "entity_id": o.get("station_id") or "weather",
        "event_type": "weather_report",
        "value": None,
        "unit": None,
        "severity": 1,
        "payload": {k:v for k,v in o.items() if k not in ("tenant_id","factory_id","time")}
    }
