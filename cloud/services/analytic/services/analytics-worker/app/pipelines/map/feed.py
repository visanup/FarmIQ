# app/pipelines/map/feed.py
from datetime import datetime, timezone

def handle_feed_event(o: dict):
    # two shapes: delivery event / silo level metric
    etype = o.get("event_type")
    t = datetime.fromisoformat(o["time"].replace("Z","+00:00")).astimezone(timezone.utc)
    if etype == "delivery_received":
        return "event", {
            "time": t, "tenant_id": o["tenant_id"], "domain": "feed",
            "entity_type": "silo", "entity_id": o["silo_id"],
            "event_type": "delivery_received",
            "value": float(o.get("kg", 0)), "unit": "kg", "severity": 1,
            "payload": {"lot": o.get("lot"), "supplier": o.get("supplier")}
        }
    # fallback metric
    return "measurement", {
        "tenant_id": o["tenant_id"], "factory_id": o["factory_id"],
        "machine_id": o.get("house_id","-"),
        "sensor_id": o.get("silo_id"),
        "metric": "feed.silo_percent",
        "value": float(o["level_pct"]),
        "time": t,
        "payload": {"source":"feed.events"}
    }
