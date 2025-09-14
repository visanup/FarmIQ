# MQTT Topics โ€” FarmIQ Edge

เน€เธญเธเธชเธฒเธฃเธกเธฒเธ•เธฃเธเธฒเธเธเธฒเธฃเธ•เธฑเนเธเธเธทเนเธญ **MQTT topics**, เนเธเธฃเธเธชเธฃเนเธฒเธ payload, เธเนเธขเธเธฒเธข QoS/retain, เนเธฅเธฐเธ•เธฑเธงเธญเธขเนเธฒเธ ACL เธชเธณเธซเธฃเธฑเธเธฃเธฐเธเธ IoT โ’ Edge โ’ AI เธเธญเธเนเธเธฃเธเธเธฒเธฃ FarmIQ

> TL;DR โ€” เนเธเน prefix เน€เธ”เธตเธขเธง `edge/` เนเธขเธเธเธฅเธธเนเธกเน€เธเนเธ `tele|evt|cmd|stat|cfg|dlq` เนเธฅเธฐเนเธขเธเธเธฃเธ“เธต **Lab** เธเธฑเธ **Robot/Run** เนเธซเนเธเธฑเธ”เน€เธเธ

---

## 0) เธเนเธญเธเธณเธซเธเธ”เธฃเนเธงเธก

* **Prefix**: `edge/`
* **เธเธฅเธธเนเธกเธ—เนเธญเธเธเธดเธ**

  * `tele` เน€เธ—เน€เธฅเน€เธกเธ—เธฃเธต (เธเนเธฒเธ—เธตเนเนเธซเธฅเธ•เนเธญเน€เธเธทเนเธญเธ เน€เธเนเธ weight, env, pose)
  * `evt` เธญเธตเน€เธงเธเธ•เน (เน€เธซเธ•เธธเธเธฒเธฃเธ“เน เน€เธเนเธ image stored, weigh finalized)
  * `cmd` เธเธณเธชเธฑเนเธเธเธงเธเธเธธเธกเธญเธธเธเธเธฃเธ“เน/เธเธฃเธดเธเธฒเธฃ
  * `stat` เธชเธ–เธฒเธเธฐ/Heartbeat/LWT (Last Will)
  * `cfg` เธเธฒเธฃเธเธณเธซเธเธ”เธเนเธฒ (Retained)
  * `dlq` Deadโ€‘letter เธเธญเธเธเธฃเธดเธเธฒเธฃ
* **เธ•เธฑเธงเนเธเธฃเธ—เธตเนเนเธเนเนเธ path**

  * `{tenant}` เธเธนเนเน€เธเนเธฒ/เธฅเธนเธเธเนเธฒ, `{house}` เนเธฃเธเน€เธฃเธทเธญเธ/เธญเธฒเธเธฒเธฃ
  * `lab/{station}` เธชเธณเธซเธฃเธฑเธ Lab (เนเธกเนเธกเธต run/robot)
  * `robot/{robot_id}/run/{run_id}` เธชเธณเธซเธฃเธฑเธ Commercial
  * `{sensor_id}`, `{metric}`, `{cam_id}` เธฃเธฐเธเธธเน€เธเนเธเน€เธเธญเธฃเน/เน€เธกเธ•เธฃเธดเธ/เธเธฅเนเธญเธ
* **QoS**: เธเนเธฒเน€เธฃเธดเนเธกเธ•เนเธ **QoS 1** เธชเธณเธซเธฃเธฑเธเธเนเธญเธเธงเธฒเธกเธเธเธดเธเธฑเธ•เธดเธเธฒเธฃเธ—เธฑเนเธเธซเธกเธ”
* **Retain**: เนเธเนเน€เธเธเธฒเธฐ `cfg` เนเธฅเธฐ LWT เนเธ `stat` (เธเนเธฒเธญเธทเนเธ **เนเธกเน retain**)
* **เน€เธงเธฅเธฒเธกเธฒเธ•เธฃเธเธฒเธ**: `ts` เนเธเน ISOโ€‘8601 (UTC), เน€เธเนเธ `2025-08-14T10:30:00Z`
* **เธชเธเธตเธกเธฒเธเธญเธ payload**: เนเธชเนเธเธดเธฅเธ”เน `schema` เธฃเธฐเธเธธเน€เธงเธญเธฃเนเธเธฑเธ เน€เธเนเธ `"image_stored@1"`
* **เธเธธเธเนเธเธเธฒเธฃเธเธฑเธเธเธนเน**: `session_id` เน€เธเนเธเธซเธฅเธฑเธ เน€เธงเธฅเธฒเน€เธเนเธ fallback
* **เธฃเธนเธเธ เธฒเธ**: **เธญเธขเนเธฒเธชเนเธ binary เธเนเธฒเธ MQTT** โ€” เธเธฅเนเธญเธเธญเธฑเธเนเธซเธฅเธ”เธ เธฒเธเธเนเธฒเธ **HTTP โ’ image-ingestion-service โ’ MinIO** เนเธฅเนเธงเธเนเธญเธขเธเธฃเธฐเธเธฒเธจเธชเธ–เธฒเธเธฐเธ—เธฒเธ MQTT

---

## 1) Telemetry Topics (publish เนเธ”เธขเธญเธธเธเธเธฃเธ“เน/เธเธฃเธดเธ”เธเน)

### 1.1 Lab Sensors

```
edge/tele/{tenant}/{house}/lab/{station}/scale/{scale_id}/weight
edge/tele/{tenant}/{house}/lab/{station}/env/{sensor_id}/{metric}
```

**เธ•เธฑเธงเธญเธขเนเธฒเธ**

```json
{
  "schema":"scale_weight@1",
  "tenant":"t1","house":"h01","station":"st01","device":"scale01",
  "ts":"2025-08-14T10:30:01Z",
  "value":87.5,
  "unit":"kg",
  "stable":true,
  "session_id":"b3f9-..."
}
```

### 1.2 Robot / Runโ€‘based

```
edge/tele/{tenant}/{house}/robot/{robot_id}/run/{run_id}/{sensor_id}/{metric}
edge/tele/{tenant}/{house}/robot/{robot_id}/pose
```

**เธ•เธฑเธงเธญเธขเนเธฒเธ pose**

```json
{"schema":"pose@1","ts":"2025-08-14T10:30:01Z","x":1.23,"y":4.56,"heading":90.0,"speed_mps":0.35}
```

### 1.3 Device Status / LWT (retained)

```
edge/stat/{tenant}/{house}/{device_type}/{device_id}
```

**เธ•เธฑเธงเธญเธขเนเธฒเธ**

```json
{"schema":"device_status@1","ts":"2025-08-14T10:30:01Z","online":true,"rssi":-58,"uptime_s":12345,"meta":{"fw":"1.2.3"}}
```

> เธ•เธฑเนเธ LWT เนเธซเน publish `online:false` เนเธเธ retained เน€เธกเธทเนเธญเธญเธญเธเนเธฅเธเน

### 1.4 Device Health Metrics

```
edge/tele/{tenant}/{house}/device/{device_id}/health
```

**เธ•เธฑเธงเธญเธขเนเธฒเธ**

```json
{
  "schema":"device_health@1",
  "tenant":"t1","house":"h01","device":"scale01",
  "ts":"2025-08-14T10:30:01Z",
  "batteryLevel":85,
  "signalStrength":-45,
  "temperature":25.5,
  "errors":[],
  "warnings":["low_battery"],
  "session_id":"b3f9-..."
}
```

---

## 2) Event Topics (publish เนเธ”เธข services เธเธ Edge)

### 2.1 เธ เธฒเธเธ–เนเธฒเธขเนเธฅเนเธง (metadata เธเธฒเธ Pi โ€” optional)

```
edge/evt/{tenant}/{house}/lab/{station}/camera/{cam_id}/captured
edge/evt/{tenant}/{house}/robot/{robot_id}/camera/{cam_id}/captured
```

```json
{"schema":"image_captured@1","tenant":"t1","house":"h01","station":"st01","device":"cam01","ts":"2025-08-14T10:30:00Z","filename":"cam01_20250814T103000.jpg","session_id":"b3f9-..."}
```

### 2.2 เธ เธฒเธเธ–เธนเธเน€เธเนเธเธชเธณเน€เธฃเนเธ (publish เนเธ”เธข image-ingestion-service)

```
edge/evt/{tenant}/{house}/lab/{station}/camera/{cam_id}/stored
edge/evt/{tenant}/{house}/robot/{robot_id}/camera/{cam_id}/stored
```

```json
{
  "schema":"image_stored@1",
  "tenant":"t1","house":"h01","station":"st01","device":"cam01",
  "ts":"2025-08-14T10:30:00Z",
  "media_id":123456,
  "bucket":"edge-media",
  "object_key":"tenant=t1/house=h01/station=st01/cam=cam01/date=2025/08/14/uuid.jpg",
  "sha256":"...",
  "session_id":"b3f9-..."
}
```

### 2.3 เธเธฑเธเธเธนเนเธ เธฒเธโ€“เธเนเธณเธซเธเธฑเธเธชเธณเน€เธฃเนเธ (publish เนเธ”เธข weigh-associator-service)

```
edge/evt/{tenant}/{house}/lab/{station}/weigh/finalized
edge/evt/{tenant}/{house}/robot/{robot_id}/run/{run_id}/weigh/finalized
```

```json
{
  "schema":"weigh_finalized@1",
  "tenant":"t1","house":"h01","station":"st01",
  "session_id":"b3f9-...",
  "media_id":123456,
  "weight_kg":87.5,
  "t_weight":"2025-08-14T10:30:01Z",
  "strategy":"session_id",
  "match_window_ms":0
}
```

### 2.4 เนเธเนเธเน€เธ•เธทเธญเธ/เธเธธเธ“เธ เธฒเธเธเนเธญเธกเธนเธฅ (publish เนเธ”เธข data-guard-service)

```
edge/evt/{tenant}/{house}/alert/{alert_type}
```

```json
{"schema":"alert@1","ts":"2025-08-14T10:30:05Z","alert_type":"weight_outlier","level":2,"context":{"value":999}}
```

### 2.5 Data Ingestion Status (publish เนเธ”เธข sensor-streamer-service)

```
edge/evt/{tenant}/{house}/data/ingestion/{data_type}
```

```json
{
  "schema":"data_ingestion@1",
  "tenant":"t1","house":"h01",
  "ts":"2025-08-14T10:30:05Z",
  "dataType":"sensor_readings",
  "recordCount":150,
  "status":"success",
  "session_id":"b3f9-...",
  "metadata":{"batch_size":150,"processing_time_ms":45}
}
```

---

## 3) Command Topics (publish เนเธ”เธข orchestrator/associator)

### 3.1 เธเธณเธชเธฑเนเธเธเธฅเนเธญเธ (Pi subscribe)

```
edge/cmd/{tenant}/{house}/lab/{station}/camera/{cam_id}/start_capture
edge/cmd/{tenant}/{house}/lab/{station}/camera/{cam_id}/stop_capture
```

```json
{"schema":"cmd_start_capture@1","session_id":"b3f9-...","duration_ms":2500,"fps":15}
```

> เน€เธกเธทเนเธญเธชเธฑเนเธเธ–เนเธฒเธขเนเธ”เธข associator เนเธซเนเน€เธเนเธเธเธ **เนเธเธ `session_id`** เนเธฅเนเธงเธชเนเธเนเธซเนเธเธฅเนเธญเธเนเธเนเนเธเธ—เธธเธเน€เธเธฃเธก

### 3.2 เธเธณเธชเธฑเนเธเธซเธธเนเธเธขเธเธ•เน/เธฃเธฑเธ

```
edge/cmd/{tenant}/{house}/robot/{robot_id}/run/start
edge/cmd/{tenant}/{house}/robot/{robot_id}/run/abort
edge/cmd/{tenant}/{house}/robot/{robot_id}/goto/{zone_id}
```

```json
{"schema":"run_start@1","plan":{"zones":["A1","A2"]},"cadence_sec":60}
```

### 3.3 เธเธณเธชเธฑเนเธ Sync Service

```
edge/cmd/{tenant}/{house}/sync/trigger
edge/cmd/{tenant}/{house}/sync/pause
edge/cmd/{tenant}/{house}/sync/resume
```

```json
{
  "schema":"sync_trigger@1",
  "tenant":"t1","house":"h01",
  "ts":"2025-08-14T10:30:00Z",
  "dataTypes":["sensor_readings","sweep_readings","lab_readings"],
  "batchSize":1000,
  "session_id":"b3f9-..."
}
```

---

## 4) Config Topics (Retained)

```
edge/cfg/{tenant}/{house}/lab/{station}/camera/{cam_id}
edge/cfg/{tenant}/{house}/robot/{robot_id}/{component}
```

```json
{"schema":"camera_cfg@1","fps":15,"resolution":"1280x720","exposure":"auto","white_balance":"daylight"}
```

> เนเธเน QoS 1 + **retain = true** เน€เธเธทเนเธญเนเธซเน device เธ—เธตเนเน€เธเธดเนเธเธญเธญเธเนเธฅเธเนเนเธ”เนเธเนเธฒเธ—เธฑเธเธ—เธต

---

## 5) Deadโ€‘letter Topics (DLQ)

```
edge/dlq/{service_name}
```

**เธ•เธฑเธงเธญเธขเนเธฒเธ payload**

```json
{"schema":"ingest_failed@1","reason":"minio_upload_error","context":{"filename":"cam01_...jpg"}}
```

> เธ—เธธเธเธเธฃเธดเธเธฒเธฃเธ—เธตเน consume MQTT เธเธงเธฃเธชเนเธเธเนเธญเธเธงเธฒเธกเธ—เธตเน parse เนเธกเนเนเธ”เน/เธเธดเธ” schema/เธเนเธณเธเนเธญเธเธกเธฒ DLQ เน€เธเธทเนเธญเนเธซเนเธฃเธฐเธเธเธ•เธฒเธกเนเธเนเนเธ”เน

---

## 6) เธ•เธฒเธฃเธฒเธเธเธฃเธดเธเธฒเธฃ: เนเธเธฃ Sub/Pub เธญเธฐเนเธฃเธเนเธฒเธ

| Service                         | Subscribe                                                      | Publish                                                                                     |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **vision-capture-service (Pi)** | `edge/cmd/.../camera/{cam_id}/#`                               | `edge/evt/.../camera/{cam_id}/captured` *(metadata)* โ€” **เธ เธฒเธเธญเธฑเธเนเธซเธฅเธ”เธเนเธฒเธ HTTP เนเธ ingestion** |
| **image-ingestion-service**     | โ€“                                                              | `edge/evt/.../camera/{cam_id}/stored`, `edge/dlq/image-ingestion-service`                   |
| **sensor-service**              | `edge/tele/.../scale/+/weight`, `edge/tele/.../env/+/+`        | โ€“ *(เน€เธเธตเธขเธ DB)*                                                                              |
| **weigh-associator-service**    | `edge/evt/.../camera/+/stored`, `edge/tele/.../scale/+/weight` | `edge/evt/.../weigh/finalized`, `edge/cmd/.../camera/{cam_id}/start_capture`                |
| **pose-tracker-service**        | `edge/tele/.../robot/*/pose`                                   | โ€“                                                                                           |
| **device-health-service**       | `edge/stat/#`, `edge/tele/.../device/+/health`                 | โ€“ *(เธเธฃเธฐเธกเธงเธฅเธเธฅ/เธญเธฑเธเน€เธ”เธ• DB)*                                                                    |
| **data-guard-service**          | `edge/tele/#`                                                  | `edge/evt/.../alert/{type}`                                                                 |
| **robot-orchestrator**          | โ€“                                                              | `edge/cmd/.../robot/*/run/*`, `edge/cmd/.../camera/*/start_capture`                         |
| **config-cache-service**        | โ€“                                                              | `edge/cfg/#` *(retained)*                                                                   |
| **sync-service**                | `edge/cmd/.../sync/trigger`                                    | `edge/evt/.../data/ingestion/{data_type}`, `edge/dlq/sync-service`                          |
| **sensor-streamer-service**     | โ€“                                                              | `edge/evt/.../data/ingestion/{data_type}`, `edge/dlq/sensor-streamer-service`               |

> เธซเธกเธฒเธขเน€เธซเธ•เธธ: เธชเธณเธซเธฃเธฑเธ Commercial เน€เธ•เธดเธก path เธชเนเธงเธ `robot/{robot_id}/run/{run_id}` เธ•เธฒเธกเนเธเธ—เธขเน

---

## 7) ACL เธ•เธฑเธงเธญเธขเนเธฒเธ (Mosquitto)

### 7.1 เธเธฅเนเธญเธ `cam01` เธ—เธตเนเธชเธ–เธฒเธเธต `st01`

```
user cam01
pattern write edge/evt/%/%/lab/st01/camera/cam01/captured
pattern read  edge/cmd/%/%/lab/st01/camera/cam01/#
```

### 7.2 เน€เธเธฃเธทเนเธญเธเธเธฑเนเธ `scale01`

```
user scale01
pattern write edge/tele/%/%/lab/st01/scale/scale01/weight
```

### 7.3 image-ingestion-service

```
user image-ingestion
pattern write edge/evt/%/%/lab/+/camera/+/stored
pattern write edge/dlq/image-ingestion-service
```

### 7.4 weigh-associator-service

```
user weigh-associator
pattern read  edge/evt/%/%/lab/+/camera/+/stored
pattern read  edge/tele/%/%/lab/+/scale/+/weight
pattern write edge/evt/%/%/lab/+/weigh/finalized
pattern write edge/cmd/%/%/lab/+/camera/+/start_capture
```

> เธเธฃเธฑเธ `%` โ’ `{tenant}/{house}` เธซเธฒเธเธฅเนเธญเธเนเธงเนเธฃเธฒเธขเธฅเธนเธเธเนเธฒเน€เธเธทเนเธญเธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธขเธชเธนเธเธชเธธเธ”

---

## 8) เธเนเธญเนเธเธฐเธเธณเธ”เนเธฒเธ Broker/Client

* เน€เธเธดเธ” **NTP** เธ—เธฑเนเธ Pi เนเธฅเธฐ Edge เน€เธเธทเนเธญเธฅเธ” clock skew
* เธ•เธฑเนเธ `max_payload_size` เนเธ Broker เธเนเธญเธเธเธฑเธเธเธฒเธฃเธชเนเธ binary image เน€เธเนเธฒเธกเธฒเธ—เธฒเธ MQTT เนเธ”เธขเนเธกเนเธ•เธฑเนเธเนเธ
* เนเธเน **QoS 1** เนเธฅเธฐเธเธฑเธ duplicate เธ”เนเธงเธข idempotency เธเธ consumer
* เนเธเน **persistent session** เธชเธณเธซเธฃเธฑเธเธเธฃเธดเธเธฒเธฃเธซเธฅเธฑเธ เนเธฅเธฐเธ•เธฑเนเธ **LWT** เนเธซเนเธ—เธธเธ client

---

## 9) เนเธเธฃเธ object\_key เนเธ MinIO (เนเธเธฐเธเธณ)

```
tenant={tenant}/house={house}/station={station}/cam={cam_id}/date=YYYY/MM/DD/{uuid}.jpg
```

> เธเนเธงเธขเนเธซเนเธเนเธ/เธฅเธเธ•เธฒเธกเธเนเธงเธเน€เธงเธฅเธฒเนเธ”เนเน€เธฃเนเธง เนเธฅเธฐ map เธเธฅเธฑเธเธซเธฒ context เนเธ”เนเธเนเธฒเธข

---

## 10) Testing Quickโ€‘Refs

**Subscribe เธเนเธณเธซเธเธฑเธ (Lab)**

```
mosquitto_sub -t 'edge/tele/t1/h01/lab/+/scale/+/weight' -q 1 -v
```

**Subscribe เธ เธฒเธ stored**

```
mosquitto_sub -t 'edge/evt/t1/h01/lab/+/camera/+/stored' -q 1 -v
```

**เธชเธฑเนเธเธ–เนเธฒเธขเธ เธฒเธ**

```
mosquitto_pub -t 'edge/cmd/t1/h01/lab/st01/camera/cam01/start_capture' -q 1 -m '{"schema":"cmd_start_capture@1","session_id":"demo-123","duration_ms":1500,"fps":10}'
```

**Subscribe Device Health**

```
mosquitto_sub -t 'edge/tele/t1/h01/device/+/health' -q 1 -v
```

**Subscribe Data Ingestion Status**

```
mosquitto_sub -t 'edge/evt/t1/h01/data/ingestion/+' -q 1 -v
```

**เธชเธฑเนเธ Sync Trigger**

```
mosquitto_pub -t 'edge/cmd/t1/h01/sync/trigger' -q 1 -m '{"schema":"sync_trigger@1","tenant":"t1","house":"h01","ts":"2025-08-14T10:30:00Z","dataTypes":["sensor_readings","sweep_readings"],"batchSize":1000,"session_id":"demo-123"}'
```

---

## 11) เน€เธงเธญเธฃเนเธเธฑเธเน€เธญเธเธชเธฒเธฃ

* v1.0 โ€” เธ•เธฑเนเธเธ•เนเธเธซเธฑเธงเธเนเธญเธ—เธฑเนเธเธซเธกเธ”, เน€เธเธดเนเธกเธ•เธฑเธงเธญเธขเนเธฒเธ payload/ACL, เนเธเธฐเธเธณ QoS/retain
