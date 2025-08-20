# app/pipelines/map/sensor.py
from datetime import datetime, timezone

def handle_sensor_reading(o: dict):
    # normalize → measurement
    return "measurement", {
        "tenant_id": o["tenant_id"],
        "factory_id": o["factory_id"],
        "machine_id": o["machine_id"],
        "sensor_id": o.get("sensor_id"),
        "metric": o["metric"],
        "value": float(o["value"]),
        "time": datetime.fromisoformat(o["time"].replace("Z","+00:00")).astimezone(timezone.utc),
        "payload": o.get("payload")
    }