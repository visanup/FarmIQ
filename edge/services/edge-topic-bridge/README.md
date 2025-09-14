# edge-topic-bridge

Bridges existing Edge MQTT topics (sensor.*, dm/*, image/created, weight/associated) to the Cloud-aligned `edge/{tele|evt|stat}` topics and optionally produces normalized events to Kafka topics.

## What it does
- sensor.clean → `edge/tele/...` and Kafka `sensors.lab.readings.v1` or `sensors.sweep.readings.v1`
- sensor.anomaly → `edge/evt/.../alert/{type}` and Kafka `analytics.anomaly.v1`
- dm/{tenant}/{device}/health|lwt → `edge/stat/...` retained and Kafka `sensors.device.health.v1`
- image/created → `edge/evt/.../camera/{cam}/stored` and Kafka `media.image.stored.v1` (optional)
- weight/associated → `edge/evt/.../weigh/finalized` and Kafka readings topic

## Env
```
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
MQTT_BRIDGE_USER=edge_bridge
MQTT_BRIDGE_PASSWORD=pass
TOPIC_PREFIX=edge

# Kafka (ไม่ใช้ใน edge-layer นี้ — ลบทิ้งได้)

# Defaults to fill path context when missing
DEFAULT_TENANT=t1
DEFAULT_HOUSE=h01

BRIDGE_PORT=6305
```

## Run
```
npm i
npm run dev
# or
npm run build && npm start
```

