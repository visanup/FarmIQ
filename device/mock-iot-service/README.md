# Mock IoT Sensor Service

This service emulates the IoT-layer devices in the FarmIQ edge architecture. It publishes synthetic sensor readings to the edge MQTT broker using the topic convention `sensor.raw/{tenant}/{metric}/{deviceId}` so that the edge-layer microservices can be exercised without real hardware.

## Features
- Mirrors three duck-meat customers (`tenant_001`..`tenant_003`), each with one flagship farm and three grow-out houses
- Generates environmental metrics (temperature, humidity, CO₂, NH₃, illuminance, photoperiod, VOCs) every 60 seconds per house
- Simulates water-quality sensors (pH, TDS, EC, water volume, water temperature) every 60 seconds per house
- Emits daily feed intake and scale readings in batches of 20 ducks every 60 seconds (round-robin across 450 birds/house) and, by default, skips vision inference weight predictions
- Generates synthetic image capture sessions per weight batch, publishes `image_captured@2` events, and uploads placeholder images to the image-ingestion service / MinIO
- Feature flags let you toggle environment/water/feed streams individually for targeted testing
- Uses the same ID conventions as `generate-complete-mockup-v2.js` so data lines up with master records

## Quick Start
1. Install dependencies
   ```bash
   cd device/mock-iot-service
   npm install
   ```
2. Configure environment
   ```bash
   cp .env.example .env
   # adjust MQTT credentials and timing if needed
   ```
3. Run the simulator
   ```bash
   npm start
   ```

The service begins publishing data immediately after connecting to the MQTT broker. Logs show each metric emitted so you can trace the flow through the edge layer.

## Environment Variables
See `.env.example` for defaults. Key values:
- `MQTT_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD` — connection to the edge MQTT broker
- `ANIMALS_PER_HOUSE` — flock size per house (default 450 ducks)
- `WEIGHT_BATCH_SIZE` — number of birds reported per MQTT cycle (default 20)
- `ENV_SENSOR_INTERVAL_MS`, `WEIGHT_READING_INTERVAL_MS`, `WATER_SENSOR_INTERVAL_MS`, `DAY_ADVANCE_INTERVAL_MS` — cadence for each sensor group (defaults push one reading per topic per minute)
- `ENV_SENSORS_ENABLED`, `WATER_SENSORS_ENABLED`, `FEED_SENSOR_ENABLED` — enable or disable each sensor group without code changes
- `VISION_INFERENCE_URL`, `VISION_INFERENCE_ENABLED` — enable HTTP call to the edge `vision-inference-service`; keep disabled when only scale weights are required
- `START_WEIGHT_KG`, `TARGET_WEIGHT_KG`, `GROWTH_DAYS` — parameters for the growth curve used in weight generation
- `CAPTURE_ENABLED`, `CAPTURE_MEDIA_DIR`, `CAPTURE_INGEST_URL`, `CAPTURE_INGEST_API_KEY`, `CAPTURE_IMAGE_METRIC` - control synthetic image uploads to the edge image-ingestion service

### Image Ingestion Endpoint
- The correct route for the image ingestion service is `POST /api/ingest/image`. The previous default `POST /api/upload` returned 404.
- This repo now defaults `CAPTURE_INGEST_URL` to `http://localhost:6313/api/ingest/image` in `src/config.js` and `.env`.
- If the ingestion service requires authorization, set `CAPTURE_INGEST_API_KEY` so the mock service sends the `x-api-key` header. A 401 Unauthorized in Swagger usually means the API key is missing or incorrect.

Example curl (replace YOUR_API_KEY if needed):
```
curl -X POST "http://localhost:6313/api/ingest/image" \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@./tmp/mock-capture/sample.png" \
  -F "tenant_id=tenant_001" -F "station_id=station_001" \
  -F "sensor_id=camera_001" -F "robot_id=device_001" \
  -F "metric=image" -F "timestamp=$(date -Iseconds)" \
  -F "session_id=demo" -F "weight_g=1000"
```

## Payload Format
Each MQTT message contains a JSON payload shaped for the edge `sensor-service`:
```json
{
  "ts": "2025-09-20T07:00:00.123Z",
  "tenant": "tenant_001",
  "device_id": "device_house_farm_tenant_001_001_001_001",
  "metric": "sensors.weight_scale.current_kg",
  "value": 1.72,
  "unit": "kg",
  "sensor_id": "weight_scale_12",
  "metadata": {
    "tenantId": "tenant_001",
    "farmId": "farm_tenant_001_001",
    "houseId": "house_farm_tenant_001_001_001",
    "flockId": "flock_house_farm_tenant_001_001_001_001",
    "animalId": 12,
    "animalCount": 450,
    "dayIndex": 3
  }
}
```

### Sensor Frequency Summary
| Metric group | Topics | Frequency | Value range |
| --- | --- | --- | --- |
| Environment | `temperature`, `humidity`, `CO2`, `NH3`, `illuminance`, `photoperiod`, `VOCs` | Every 60s per house | Random within configured min/max bands |
| Water quality | `pH`, `TDS`, `EC`, `water_volume`, `water_temp` | Every 60s per house | Random within configured min/max bands |
| Feed intake | `feed.intake.kg` | Every 60s per house | Baseline 0.1 × flock size ± noise |
| Weight scale | `sensors.weight_scale.current_kg` | Every 60s, 20 ducks per house (round-robin) | Growth curve from `START_WEIGHT_KG` to `TARGET_WEIGHT_KG` ± 50 g |
| Image capture | `edge/evt/{tenant}/{house}/lab/{station}/camera/{camera}/image` | One per duck in the active weight batch | Placeholder image + metadata uploaded to image-ingestion |

## Extending
- Adjust sensor lists in `src/sensorCatalog.js`
- Add new publishers in `src/publishers/*.js`
- Integrate additional edge services (e.g., image capture) by adding new modules and hooking into the main loop.
- Ensure you run `generate-complete-mockup-v2.js` (or otherwise seed master data) so the tenants, farms, and houses referenced here (`tenant_00{1-3}` / `farm_tenant_00X_001` / `house_farm_tenant_00X_001_{001-003}`) exist in the edge database; the simulator assumes those IDs.
