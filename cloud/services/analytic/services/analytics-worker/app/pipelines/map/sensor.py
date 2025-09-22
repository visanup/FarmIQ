# app/pipelines/map/sensor.py
from datetime import datetime, timezone

def handle_sensor_reading(o: dict):
    # Handle envelope format from analytics-stream
    data = o.get("data", o)  # Support both envelope and flat formats
    
    # normalize → measurement
    return "measurement", {
        "tenant_id": data["tenant_id"],
        "farm_id": data.get("farm_id"),
        "house_id": data.get("house_id"),
        "sensor_id": data.get("sensor_id"),
        "metric": data["metric"],
        "value": float(data["value"]),
        "time": datetime.fromisoformat(data["time"].replace("Z","+00:00")).astimezone(timezone.utc),
        "payload": data.get("payload")
    }