# Edge Topic Bridge

Bridges existing Edge MQTT topics to Cloud-aligned `edge/*` topics (Kafka is not used on Edge).

- Input topics: `sensor.clean/#`, `sensor.anomaly/#`, `dm/+/+/health`, `dm/+/+/lwt`, `image/created`, `weight/associated`
- Output MQTT (examples):
  - `edge/tele/{tenant}/{house}/lab/{station}/env/{sensor}/{metric}`
  - `edge/tele/{tenant}/{house}/robot/{robot}/run/{run}/{sensor}/{metric}`
  - `edge/stat/{tenant}/{house}/{device_type}/{device_id}` (retained)
  - `edge/evt/.../camera/{cam}/stored`, `edge/evt/.../weigh/finalized`, `edge/evt/.../alert/{type}`
- Optional Kafka topics: `sensors.lab.readings.v1`, `sensors.sweep.readings.v1`, `sensors.device.health.v1`, `analytics.anomaly.v1`, `media.image.stored.v1`

## Service path
`edge/services/edge-topic-bridge`

## Env
```
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
MQTT_BRIDGE_USER=edge_bridge
MQTT_BRIDGE_PASSWORD=pass
TOPIC_PREFIX=edge

หมายเหตุ: เวอร์ชัน Edge นี้ไม่ใช้ Kafka ใน bridge แล้ว

# Defaults to fill missing path context
DEFAULT_TENANT=t1
DEFAULT_HOUSE=h01

BRIDGE_PORT=6305
```

## Compose
Service is included in `edge/docker-compose.apps.yml` as `edge-topic-bridge` (port 6305).

## Healthcheck
- HTTP: `GET /health` → 200 OK (port 6305 by default)

## Notes
- For missing `{house}/{station|robot}/{run_id}` in legacy topics, the bridge fills values from payload when available, and falls back to defaults.
- Use this bridge during migration; services can later emit `edge/*` topics directly.

