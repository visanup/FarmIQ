# app/pipelines/map/sensor.py
from datetime import datetime, timezone

def handle_sensor_reading(o: dict):
    # normalize → measurement
    return "measurement", {
        "tenant_id": o["tenant_id"],
        "farm_id": o.get("farm_id"),
        "house_id": o.get("house_id"),
        "sensor_id": o.get("sensor_id"),
        "metric": o["metric"],
        "value": float(o["value"]),
        "time": datetime.fromisoformat(o["time"].replace("Z","+00:00")).astimezone(timezone.utc),
        "payload": o.get("payload")
    }