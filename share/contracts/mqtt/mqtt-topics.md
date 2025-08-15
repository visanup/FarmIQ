# FarmIQ MQTT Topics & Payload Contracts
**Version:** 0.5 (Edge + Robot Sweeps)  
**Scope:** Edge site broker (Mosquitto) — device/robot, scheduler, sync-service, cloud control

---

## Conventions

- **Identifiers**
  - `tenant` = ฟาร์มหรือไซต์ (เช่น `farm-001`) → ใช้เป็น **username** บนอุปกรณ์
  - `deviceId` = ไอดีอุปกรณ์ IoT/โมดูล
  - `robotId` = ไอดีหุ่น/ชุดเคลื่อนที่
  - **MQTT clientId** ของอุปกรณ์/หุ่น = `deviceId`/`robotId` (บังคับโดย ACL)
- **Time**: ISO8601 with timezone, e.g. `2025-08-11T18:00:00+07:00`
- **QoS policy (แนะนำ)**
  - Control / Shadow / Schedule / Run events / Health / DLQ: **QoS 1**
  - Pose (ความถี่สูง): **QoS 0–1** (ขึ้นกับ bandwidth/สูญเสียได้แค่ไหน)
  - Telemetry sensor: **QoS 1**
- **Retain policy (แนะนำ)**
  - `dm/.../shadow/update`: **retain=true** (desired state ล่าสุด)
  - `dm/.../lwt`: **retain=true** (สถานะล่าสุด online=false เมื่อ disconnect)
  - ข้อมูลวัด/pose: **retain=false**

---

## Topic Namespace

### 1) Device Management / Shadow / Health
| Topic | Direction | Description |
|---|---|---|
| `dm/{tenant}/{deviceId}/shadow/get` | cloud → device | ขอให้ device ส่ง reported state |
| `dm/{tenant}/{deviceId}/shadow/update` | cloud → device | ตั้งค่า **desired** (retain=true) |
| `dm/{tenant}/{deviceId}/shadow/accepted` | device → cloud | ตอบรับ desired (apply OK) |
| `dm/{tenant}/{deviceId}/shadow/reported` | device → cloud | รายงาน **reported** state |
| `dm/{tenant}/{deviceId}/health` | device → edge | Heartbeat (uptime, rssi, temp, etc.) |
| `dm/{tenant}/{deviceId}/lwt` | broker (on disconnect) | Last Will: `{"online":false,...}` (retain=true recommended) |

**Payloads**

`shadow/update` (retain=true):
```json
{
  "fw_version": "1.8.3",
  "cfg": {
    "sample_rate_sec": 60,
    "reporting": { "qos": 1 }
  },
  "ts": "2025-08-11T18:00:00+07:00"
}
````

`shadow/reported`:

```json
{
  "fw_version": "1.8.3",
  "cfg": { "sample_rate_sec": 60, "reporting": { "qos": 1 } },
  "ts": "2025-08-11T18:00:05+07:00"
}
```

`health`:

```json
{
  "online": true,
  "uptime_s": 12345,
  "rssi": -60,
  "temp_c": 41.2,
  "heap_bytes": 1520432,
  "meta": { "fw":"1.8.3" },
  "ts": "2025-08-11T18:00:05+07:00"
}
```

`lwt` (configured at connect; broker publishes on disconnect, retain=true):

```json
{ "online": false, "reason": "conn_lost", "ts": "2025-08-11T18:07:00+07:00" }
```

---

### 2) OTA (Over-the-Air Update)

| Topic                              | Direction           | Description          |
| ---------------------------------- | ------------------- | -------------------- |
| `ota/{tenant}/{deviceId}/offer`    | cloud/edge → device | แจ้ง firmware ใหม่   |
| `ota/{tenant}/{deviceId}/progress` | device → cloud/edge | รายงานสถานะการอัปเดต |

**Payloads**

`offer`:

```json
{
  "device_type": "ESP32-S3",
  "version": "1.9.0",
  "size_bytes": 712345,
  "checksum_sha256": "ab12...ef",
  "signature_b64": "MEUCIQ...",
  "url": "https://edge-repo/firmware/esp32s3/1.9.0.bin",
  "mandatory": false,
  "window": { "start":"2025-08-11T22:00:00+07:00", "end":"2025-08-12T05:00:00+07:00" },
  "ts": "2025-08-11T18:10:00+07:00"
}
```

`progress`:

```json
{
  "state": "downloading", // downloading|installing|verifying|success|failed|rolledback
  "progress_pct": 42,
  "error_code": null,
  "ts": "2025-08-11T18:11:02+07:00"
}
```

---

### 3) Telemetry / Sensor (Edge DQ pipeline)

| Topic                                         | Direction                | Description              |
| --------------------------------------------- | ------------------------ | ------------------------ |
| `sensor.raw/{tenant}/{metric}/{deviceId}`     | device → edge            | ข้อมูลดิบ (ก่อน DQ)      |
| `sensor.clean/{tenant}/{metric}/{deviceId}`   | device/edge → edge/cloud | ข้อมูลผ่าน DQ แล้ว       |
| `sensor.anomaly/{tenant}/{metric}/{deviceId}` | edge → cloud             | ผิดปกติ                  |
| `sensor.dlq/{tenant}/{metric}/{deviceId}`     | edge → cloud             | Dead-letter (แก้ไม่ผ่าน) |

**Payload (clean/anomaly/dlq)** — *run\_id/zone/x,y จะใส่เมื่อเป็นหุ่น*:

```json
{
  "ts": "2025-08-11T18:15:00+07:00",
  "tenant": "farm-001",
  "device_id": "scale-12",
  "metric": "WEIGHT",
  "value": 27.4,
  "quality": "clean",           // raw|clean|anomaly|dlq
  "rule_hits": [],              // รายชื่อกฎ DQ ที่ชน (ถ้ามี)
  "run_id": 123,                // optional (robot)
  "zone_id": "A1",              // optional (robot)
  "x": 12.3, "y": 4.5,          // optional (robot)
  "payload": { "src": "edge-mqtt" }
}
```

---

### 4) Command / Actuation

| Topic                             | Direction           | Description                 |
| --------------------------------- | ------------------- | --------------------------- |
| `cmd/{tenant}/{deviceId}/request` | cloud/edge → device | สั่งงาน เช่น reboot/actuate |
| `cmd/{tenant}/{deviceId}/ack`     | device → cloud/edge | ผลการสั่งงาน/สถานะ          |

**Payloads**

`request`:

```json
{
  "cmd": "reboot",
  "corr_id": "a8f1b2",
  "params": { "delay_sec": 5 },
  "ts": "2025-08-11T18:20:00+07:00"
}
```

`ack`:

```json
{ "corr_id": "a8f1b2", "status": "ok", "ts": "2025-08-11T18:20:06+07:00" }
```

---

### 5) Robot Orchestration (Rail-mounted sweeps)

#### Schedule

| Topic                                   | Direction          | Description                       |
| --------------------------------------- | ------------------ | --------------------------------- |
| `robot/{tenant}/{robotId}/schedule/set` | cloud/edge → robot | ส่ง **policy** เต็ม/แบบ patch     |
| `robot/{tenant}/{robotId}/schedule/ack` | robot → edge/cloud | ยืนยันนโยบายที่นำไปใช้ (hash, ts) |

`schedule/set` (ตัวอย่าง ส่งทั้งชุด):

```json
{
  "policy": {
    "baseline": { "sweep_every_min": 60, "cadence_sec": 60 },
    "sensors": [
      { "sensor_id": "temp-head", "metric": "TEMP", "every_n_runs": 1, "warmup_sec": 5, "dwell_sec": 5 },
      { "sensor_id": "co2-head",  "metric": "CO2",  "every_n_runs": 1, "warmup_sec": 60, "dwell_sec": 10 },
      { "sensor_id": "nh3-head",  "metric": "NH3",  "every_n_runs": 1, "warmup_sec": 90, "dwell_sec": 10 },
      { "sensor_id": "voc-head",  "metric": "TVOC", "every_n_runs": 3, "warmup_sec": 120, "dwell_sec": 10 }
    ],
    "overrides": [
      { "metric": "NH3", "zone_id": "A1-A3", "force_every_minutes": 30, "until": "2025-08-12T18:00:00+07:00" }
    ]
  },
  "until": null,
  "ts": "2025-08-11T18:25:00+07:00"
}
```

`schedule/ack`:

```json
{ "ok": true, "policy_hash": "sha256:abcd...", "applied_at": "2025-08-11T18:25:05+07:00" }
```

#### Run control & Pose

| Topic                                | Direction              | Description                      |
| ------------------------------------ | ---------------------- | -------------------------------- |
| `robot/{tenant}/{robotId}/run/start` | edge scheduler → robot | คำสั่งเริ่มรอบ (assign `run_id`) |
| `robot/{tenant}/{robotId}/run/end`   | robot → edge/cloud     | จบรอบ, สรุปผล                    |
| `robot/{tenant}/{robotId}/pose`      | robot → edge/cloud     | ตำแหน่ง/ท่าทาง ระหว่างวิ่ง       |

`run/start`:

```json
{ "run_id": 123, "cadence_sec": 60, "route": "clockwise", "ts": "2025-08-11T19:00:00+07:00" }
```

`run/end`:

```json
{
  "run_id": 123,
  "status": "completed", // completed|aborted
  "summary": { "ok": true, "notes": "finished" },
  "ts": "2025-08-11T20:00:02+07:00"
}
```

`pose`:

```json
{
  "run_id": 123,
  "ts": "2025-08-11T19:15:00+07:00",
  "x": 12.3, "y": 4.5, "heading": 90, "speed": 0.4, "battery_v": 12.1,
  "meta": { "zone_id":"A1" }
}
```

> เมื่อหุ่นวัดค่าให้ส่งที่ `sensor.clean/{tenant}/{metric}/{robotId}` และ **ต้องแนบ** `run_id`, `zone_id`, `x,y` ใน payload เพื่อผูกกับรอบ

---

## ACL & Roles (สรุปสิทธิ์ระดับสูง)

* `edge_admin` → readwrite `#` (เฉพาะดูแล/ทดสอบ)
* `edge_sensor_svc` → read `sensor.raw/#`, write `sensor.clean/#`, `sensor.anomaly/#`, `sensor.dlq/#`, read `cmd/#`
* `edge_agent` → read `ota/#`, write `ota/+/+/progress`, read/write `dm/...` ตามที่กำหนด, write `dm/.../health,lwt`
* `edge_scheduler` → write `robot/.../schedule/set`, read `robot/.../schedule/ack`, write `robot/.../run/start`, read `robot/.../run/end`, read `robot/.../pose`
* `edge_sync_svc` → read `sensor.clean/#`, `robot/.../pose`, `robot/.../run/end`, `dm/.../health`, `dm/.../lwt`
* **Devices/Robots (username=tenant, clientId=deviceId/robotId)** → จำกัดด้วย `pattern`:

  * read `dm/%u/%c/shadow/update`, write `dm/%u/%c/shadow/reported`,`health`,`lwt`
  * read `ota/%u/%c/offer`, write `ota/%u/%c/progress`
  * read `cmd/%u/%c/request`, write `cmd/%u/%c/ack`
  * write `sensor.raw/%u/+/%c` (หรือ `sensor.clean/%u/+/%c`)
  * Robots: read `robot/%u/%c/schedule/set`, write `robot/%u/%c/schedule/ack`, read `robot/%u/%c/run/start`, write `robot/%u/%c/run/end`, `robot/%u/%c/pose`

---

## DB Mappings (Edge sync-service)

* `robot/.../run/start` → `SELECT sensors.fn_run_start(tenant, robotId, house, cadence_sec, plan)` **หรือ** scheduler เรียก DB เองแล้วยิง topic
* `robot/.../pose` → `SELECT sensors.fn_ingest_pose(tenant, robotId, run_id, ts, x, y, heading, speed, battery_v, meta)`
* `sensor.clean/...` → `SELECT sensors.fn_ingest_reading(tenant, robotId/deviceId, run_id, sensor_id, metric, ts, value, zone_id, x, y, quality, payload)`
* `robot/.../run/end` → `SELECT sensors.fn_run_end(run_id, summary, status)`
* `dm/.../health` / `dm/.../lwt` → `SELECT sensors.fn_ingest_health(tenant, deviceId, ts, online, source, rssi, uptime_s, meta)`

---

## Examples

**Device (scale-12) publishes a clean reading:**

* Topic: `sensor.clean/farm-001/WEIGHT/scale-12`
* Payload:

```json
{ "ts":"2025-08-11T19:05:00+07:00","tenant":"farm-001","device_id":"scale-12","metric":"WEIGHT","value":27.4,"quality":"clean","payload":{"src":"edge"} }
```

**Robot (robot-01) publishes a CO2 reading with run context:**

* Topic: `sensor.clean/farm-001/CO2/robot-01`
* Payload:

```json
{ "ts":"2025-08-11T19:15:00+07:00","tenant":"farm-001","device_id":"robot-01","metric":"CO2","value":1100,"quality":"clean","run_id":123,"zone_id":"A1","x":12.3,"y":4.5 }
```

**Cloud updates device desired shadow:**

* Topic: `dm/farm-001/esp32-01/shadow/update` (retain=true)
* Payload:

```json
{ "cfg": { "sample_rate_sec": 60 }, "ts": "2025-08-11T18:00:00+07:00" }
```

---

## Client LWT/Keepalive (แนะนำ)

* Keepalive: 20–30s
* Will (LWT):

  * topic: `dm/{tenant}/{deviceId}/lwt`
  * payload: `{"online":false,"reason":"conn_lost","ts":"<now>"}` (retain=true)
* Clean session: true
* Reconnect: exponential backoff (เริ่ม 1s สูงสุด 60s)

---

## Validation & Versioning

* ระบุ `schema_version` ใน payload สำหรับเมสเสจที่สำคัญ (เช่น schedule/run) เมื่อมี breaking change
* แนะนำใช้ JSON Schema ตรวจ payload ก่อนประมวลผลใน edge services

---

*Changelog*

* v0.5: เพิ่ม robot schedule/run/pose + mapping DB และ policy run-based
* v0.4: เพิ่ม OTA, DLQ, health/LWT
* v0.3: Shadow v1 + sensor.clean/anomaly

```
