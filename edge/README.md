# FARM Ecosystem — Edge Services

> เอกสารนี้สรุป *ทุกบริการฝั่ง Edge* ที่อยู่ในโฟลเดอร์ `edge/` พร้อมหน้าที่ การไหลของข้อมูล สัญญา (contracts), ตัวอย่าง MQTT topics/payloads, ความสัมพันธ์กับฐานข้อมูล (TimescaleDB) และแนวทางรัน/ดีบัก/โปรดักชัน

## โครงสร้างรวม

```
edge/
├─ db/                # ไฟล์ init DB (เช่น migrations) / data volume mapping
├─ mosquitto/         # broker MQTT + config/acl
├─ nginx/             # reverse proxy/edge API (ถ้ามี REST)
├─ robot-scheduler/   # ตั้งเวลากิจกรรมของหุ่น (cron-like)
└─ services/
   ├─ config-cache-service-port:6301
   ├─ data-guard-service-port:6302
   ├─ device-health-service-port:6303
   ├─ edge-agent-port:6304
   ├─ mqtt-client-port:6305
   ├─ pose-tracker-service-port:6306
   ├─ robot-bridge-port:6307
   ├─ robot-orchestrator-port:6308
   ├─ sensor-service-port:6309
   ├─ station-service-port:6310
   ├─ sync-service-port:6311
   ├─ vision-capture-service-port:6312
   ├─ image-ingestion-service -port:6313
   ├─ vision-inference-service-port:6314
   ├─ weigh-associator-service-port:6315
   └─ zone-mapper-service-port:6316
```

## ภาพรวมสถาปัตยกรรม (Lab → Commercial)

```
[ENV Sensors/Depth Cam/Robot] → MQTT (mosquitto) → Edge Services → TimescaleDB
                                              ↘  Media (filesystem/S3)
```

* **Lab scale**: ใช้ `station-service` (อ่าน ENV sensors แบบจุดติดตั้ง), `vision-capture-service` (ดึงภาพ), `vision-inference-service` (คำนวณน้ำหนัก), เขียนผลลง `lab_readings`/`media_*`
* **Commercial scale**: เพิ่ม `robot-bridge` (เชื่อม ROS2/PLC), `pose-tracker-service`, `zone-mapper-service`, `robot-orchestrator` (เริ่ม/จบ run + cadence), เขียนผลลง `sweep_*`

## มาตรฐานสัญญา (Contracts)

### MQTT Topics (แนะนำ)

* Telemetry

  * `edge/<tenant>/<robot>/pose`
  * `edge/<tenant>/<robot>/reading/<sensor>/<metric>`
  * `edge/<tenant>/<device>/health`
* Vision

  * `edge/<tenant>/<robot|station>/camera/<cam_id>/frame`
  * `edge/<tenant>/<robot|station>/camera/<cam_id>/inferred`
* Orchestration

  * `edge/cmd/<robot>/start_sweep`
  * `edge/cmd/<robot>/abort`
  * `edge/cmd/<robot>/goto` (payload: `{x,y,heading}`)
  * `edge/evt/<robot>/run_started`, `edge/evt/<robot>/run_ended`

### Payloads (JSON)

```jsonc
// pose (robot)
{
  "tenant": "farm1",
  "robot": "r001",
  "run": 12345,
  "ts": "2025-08-01T12:34:56.789Z",
  "x": 12.3, "y": 4.5, "heading": 90.0,
  "speed_mps": 0.8, "battery_v": 25.1,
  "meta": {"src":"ros2"}
}
```

```jsonc
// reading (ENV/WEIGHT, ระหว่าง run = commercial หรือ lab ไม่มี run)
{
  "tenant": "farm1",
  "robot": "r001",        // หรือใช้ "station": "st01" สำหรับ Lab
  "run": 12345,            // Lab ไม่ต้องส่ง
  "sensor": "env01",
  "metric": "TEMP",       // TEMP/HUM/CO2/NH3/WEIGHT ...
  "ts": "2025-08-01T12:35:00Z",
  "value": 27.6,
  "quality": "clean",     // raw|clean|anomaly|invalid|calibrating|stale
  "zone": "A1",           // optional
  "x": 12.3, "y": 4.5,    // optional
  "payload": {"unit":"°C","rssi":-60}
}
```

```jsonc
// health (LWT/heartbeat)
{
  "tenant": "farm1",
  "device": "r001",       // robot_id หรือโมดูล
  "ts": "2025-08-01T12:35:10Z",
  "online": true,
  "source": "lwt",        // health|lwt
  "rssi": -55,
  "uptime_s": 123456,
  "meta": {"fw":"1.2.3"}
}
```

```jsonc
// vision frame (capture)
{
  "tenant": "farm1",
  "scope": {"robot": "r001"},     // หรือ {"station":"st01"}
  "cam_id": "depth01",
  "ts": "2025-08-01T12:35:20Z",
  "path": "/share/media/2025/08/01/abc.png",
  "sha256": "...",
  "w": 1280, "h": 720,
  "meta": {"depth": true}
}
```

## ความสัมพันธ์กับฐานข้อมูล

> ฐานข้อมูลอยู่ในสคีมา `sensors` (TimescaleDB + PostgreSQL) — สคริปต์แยกไฟล์ migrations พร้อมแล้วในโปรเจ็กต์นี้

ตาราง/ฟังก์ชันสำคัญที่ services ใช้:

* **Commercial (รันบนหุ่น)**

  * `sweep_runs` | `fn_run_start`, `fn_run_end`
  * `robot_pose` | `fn_ingest_pose`
  * `sweep_readings` | `fn_ingest_reading`
* **Lab**

  * `lab_stations`, `lab_readings`
* **สุขภาพอุปกรณ์**

  * `device_health` | `fn_ingest_health`
* **มีเดีย**

  * `media_objects`, `reading_media_map`
* **มุมมอง/สรุป**

  * `robot_latest_status` (view), `sweep_zone_summary` (view)
  * `cagg_sweep_readings_5m` (continuous aggregate)

---

## รายละเอียดรายบริการ (Edge/services)

> ทุกบริการควรรับค่าคอนฟิกผ่าน ENV และบันทึก log เป็นบรรทัด JSON

### 1) config-cache-service

* **หน้าที่**: ดึง/เก็บแคชคอนฟิกจาก cloud/ไฟล์ เช่น thresholds, zone map, cadence, robot plan
* **อินพุต**: REST จาก cloud หรืออ่านไฟล์ `share/config/*.json`
* **เอาต์พุต**: ให้บริการ REST/gRPC ภายใน edge ให้ service อื่นเรียก
* **ENV**: `CONFIG_SOURCE`, `REFRESH_SEC`

### 2) data-guard-service

* **หน้าที่**: ตรวจคุณภาพข้อมูล (stale/spike/out-of-range) และแปะ `quality` หรือยิง `alerts`
* **อินพุต**: subscribe MQTT readings หรืออ่านจาก DB เป็นช่วง
* **เอาต์พุต**: อัปเดตคุณภาพ (`quality=anomaly|invalid|stale`) หรือ insert `alerts`
* **DB**: เข้าถึง `sweep_readings`/`lab_readings`, `alerts`

### 3) device-health-service

* **หน้าที่**: รวม LWT/heartbeat → เรียก `fn_ingest_health`
* **อินพุต**: `edge/<tenant>/<device>/health`
* **DB**: `fn_ingest_health`
* **View ใช้งาน**: `robot_latest_status`

### 4) edge-agent

* **หน้าที่**: ตัวควบคุมบน edge (utility/maintenance/OTA), อาจ expose REST สำหรับ manual ops
* **ข้อควรระวัง**: จำกัดสิทธิ์/ใส่ auth

### 5) mqtt-client

* **หน้าที่**: ไลบรารี/ยูทิลสำหรับเชื่อม MQTT ในรูป container (หรือใช้เป็นตัวทดสอบ publish/subscribe)
* **ใช้ตอน dev**: ยิงตัวอย่าง payload เข้าระบบ

### 6) pose-tracker-service

* **หน้าที่**: รับ pose จาก `robot-bridge` → กรอง/คำนวณ → `fn_ingest_pose`
* **อินพุต**: `edge/<tenant>/<robot>/pose`
* **DB**: `robot_pose`
* **เพิ่ม**: เขียน `zone_id` ผ่าน `zone-mapper-service` หรือดึง map มาเอง

### 7) robot-bridge

* **หน้าที่**: สะพานจาก ROS2/PLC/Serial → MQTT topics มาตรฐาน
* **อินพุต/เอาต์พุต**:

  * pub: pose/health/readings/camera frames
  * sub: cmd start/abort/goto
* **ENV**: `ROBOT_PORT` หรือ `ROS_DOMAIN_ID` ฯลฯ

### 8) robot-orchestrator

* **หน้าที่**: คุม lifecycle run (start/end), จัด cadence ช่วงวิ่ง, เขียน `sweep_runs.summary`
* **DB**: `fn_run_start`, `fn_run_end`
* **MQTT**: ส่งคำสั่งไป `robot-bridge` และ listen events

### 9) robot-scheduler

* **หน้าที่**: ตั้งเวลา (cron-like) เรียก orchestrator ให้เริ่มงานตามแผน (เช้า/บ่าย/เย็น)
* **สัญญา**: REST call ไป orchestrator หรือ publish MQTT cmd

### 10) sensor-service

* **หน้าที่**: ตัวรวบรวม readings จาก MQTT → DB (commercial: `sweep_readings`)
* **อินพุต**: `edge/<tenant>/<robot>/reading/<sensor>/<metric>`
* **DB**: `fn_ingest_reading`
* **หมายเหตุ**: อาจใช้ซ้ำสำหรับ Lab ถ้า ingest ผ่าน MQTT เช่นกัน

### 11) station-service (Lab)

* **หน้าที่**: อ่าน ENV sensors แบบจุดติดตั้ง (USB/I2C/Modbus) → เขียน `lab_readings`
* **DB**: insert โดยตรงหรือผ่าน `fn_ingest_reading` (แต่ไม่ส่ง run)
* **ENV**: รายชื่อพอร์ต/หัววัด/คาบเวลา

### 12) sync-service

* **หน้าที่**: ซิงก์ข้อมูลเฉพาะส่วนขึ้น cloud (เช่น media หรือ summary) เมื่อมีเน็ต
* **โหมด**: batch + backoff

### 13) vision-capture-service

* **หน้าที่**: จับภาพจาก Depth/USB/IP camera → เก็บไฟล์ → publish metadata (frame)
* **เอาต์พุต**: topic `.../camera/<cam_id>/frame` + เขียนไฟล์ลง `share/media`
* **หมายเหตุ**: ใส่ checksum/sha256 เพื่อ dedup

### 14) vision-inference-service

* **หน้าที่**: รับ path ภาพ → รันโมเดลคำนวณค่า (เช่น น้ำหนัก) → บันทึกผล/ผูก media
* **DB**: insert `media_objects`, `reading_media_map`, และ `fn_ingest_reading(metric='WEIGHT', ...)`

### 15) zone-mapper-service

* **หน้าที่**: map `(x,y)` → `zone_id` จากตาราง `zones`/`houses`
* **การใช้**: เรียกจาก pose-tracker/sensor-service ก่อนบันทึก หรือรันเป็น post-processor

### 16) image-ingestion-service

* **หน้าที่**: รับเมทาดาต้าภาพจาก MQTT/HTTP แล้วอัปโหลดไฟล์ขึ้น **MinIO** จากนั้น `INSERT` เมทาดาต้าเข้าสู่ `sensors.media_objects` และ publish event `.../stored` (มี `media_id`) กลับไปให้ผู้ตาม (เช่น associator, inference).
* **อินพุต**:

  * MQTT: `edge/<tenant>/<station|robot>/camera/<cam_id>/frame`

    * payload แนะนำ: `{ session_id?, ts, path|presigned, sha256, w, h, meta }`
  * (ตัวเลือก) REST/HTTP upload จาก Pi หากไม่ใช้แชร์โฟลเดอร์หรือ presigned URL
* **เอาต์พุต**:

  * MQTT: `edge/<tenant>/<station|robot>/camera/<cam_id>/stored`

    * payload: `{ session_id?, ts, media_id, bucket, object_key, sha256 }`
* **DB**: `sensors.media_objects` (เก็บ `bucket`, `object_key`, `sha256`, `time`, `tenant_id`, ฯลฯ)
* **ENV แนะนำ**: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `DB_URL`, `MQTT_URL`, `TENANT_ID`, `MEDIA_STAGE_DIR`, `PRESIGNED_UPLOAD=true|false`
* **Idempotency**: ใช้ `sha256` + `ON CONFLICT DO NOTHING` เพื่อ dedup, รองรับรีทราย
* **หมายเหตุ**: โหมดรับไฟล์ 3 แบบ — (A) แชร์โฟลเดอร์บน Edge, (B) Pi อัปโหลดผ่าน presigned URL, (C) Pi ส่งไฟล์ตรงผ่าน HTTP ไปยัง service

### 17) weigh-associator-service

* **หน้าที่**: ทำให้ **ภาพ ↔ น้ำหนักจริง** จับคู่กัน และบันทึก mapping สำหรับเทรนโมเดล

  * โหมด **Session-driven** (แนะนำ): ใช้ `session_id` เป็นกุญแจทอง (เปิด/ปิด session, เลือกภาพหลัก, คำนวณ ground truth)
  * โหมด **Time-window fallback**: จับคู่ด้วยเวลาที่ใกล้ที่สุดในหน้าต่าง `±Δt` เมื่อไม่มี `session_id`
* **อินพุต**:

  * น้ำหนัก: `edge/<tenant>/<station>/scale/weight`  (หรือ commercial: ตามหัวข้อ readings)
  * ภาพที่เก็บแล้ว: `edge/<tenant>/<station|robot>/camera/<cam_id>/stored`
  * (ตัวเลือก) คำสั่งจาก orchestrator: `edge/cmd/<station>/start_capture` (associator เป็นคนสั่งและแจก `session_id`)
* **เอาต์พุต**:

  * Mapping: `INSERT INTO sensors.reading_media_map(time, tenant_id, station_id|robot_id, sensor_id, metric='WEIGHT', media_id)`
    *(commercial เติม `run_id` ด้วย)*
  * (ถ้าใช้ `130_weight.sql`) เรียก `fn_weigh_open / fn_weigh_add_scale / fn_weigh_add_frame / fn_weigh_finalize` เพื่อสรุป session อัตโนมัติ
  * (ตัวเลือก) Event: `edge/evt/<station>/weigh_finalized` สำหรับ UI/มอนิเตอร์
* **DB**:

  * พื้นฐาน: `reading_media_map`, `lab_readings`/`sweep_readings`, `media_objects`
  * ขั้นสูง (ถ้าเปิดใช้): `weigh_sessions`, `weigh_events`, ฟังก์ชัน `fn_weigh_*`
* **อัลกอริทึมสรุป**: เลือก ground truth เป็น **median ของช่วงที่ stable**; เลือกภาพหลักที่เวลาใกล้จุดนิ่งที่สุด
* **ENV แนะนำ**: `DB_URL`, `MQTT_URL`, `TENANT_ID`, `MATCH_WINDOW_MS=700`, `USE_SESSIONS=true|false`, `SESSION_TIMEOUT_MS`, `STABLE_MIN_DURATION_MS`
* **ความทนทาน**: เปิด NTP, ใช้ MQTT QoS1 + offline buffer ที่ Pi, ใส่ healthcheck, ทำ buffer ภายใน service 5–10 วินาทีต่อ station/tenant

### (infra) nginx

* **หน้าที่**: reverse proxy/edge API/Static (metrics, status pages)
* **ทางแนะนำ**: ผูก basic auth/TLS

### (infra) mosquitto

* **หน้าที่**: MQTT broker
* **ทางแนะนำ**: เปิด TLS + ACL แยก tenant/topic

---

## Environment Variables กลาง (แนะนำ)

* `DB_URL=postgres://user:pass@db:5432/farmdb`
* `MQTT_URL=mqtts://user:pass@mosquitto:8883`
* `TENANT_ID=farm1`
* `HOUSE_ID=houseA`
* `MEDIA_DIR=/share/media`
* `LOG_LEVEL=info` (ทุก service)

## Healthchecks (docker-compose ตัวอย่าง)

```yaml
services:
  sensor-service:
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8080/health"]
      interval: 10s
      timeout: 3s
      retries: 5
  robot-orchestrator:
    depends_on:
      mosquitto: { condition: service_healthy }
      db:        { condition: service_healthy }
```

## ขั้นตอน Deploy/Run

1. **TimescaleDB Extension** (ทำครั้งแรก *เท่านั้น*)

   * เปิด session ใหม่ของ `psql` พร้อม `-X` แล้วรัน:

     ```sql
     CREATE EXTENSION IF NOT EXISTS timescaledb;
     -- หรือ ถ้ามีอยู่แล้วแต่เวอร์ชันไม่ตรง
     ALTER EXTENSION timescaledb UPDATE;
     ```
2. **Migrations**

   * รันไฟล์ตามลำดับ `001`→`120` (ข้าม `000` ถ้าไม่ได้ติดตั้ง extension ในขั้นตอนนี้)
3. **นำขึ้น services**

   * ตรวจ `DB_URL`, `MQTT_URL`, โฟลเดอร์ `share/media`
   * `docker compose up -d`

> แนะนำเพิ่ม **db-migrator** container ที่ไล่รัน `migrations/*.sql` อัตโนมัติก่อนขึ้น services เพื่อกัน schema mismatch

## Troubleshooting ที่พบบ่อย

* **TS103: unique index ต้องรวม partitioning column** → ปรับ PK/unique ให้มี `run_id` เมื่อ partition ด้วย `run_id`
* **`create_hypertable`/`add_*_policy` ไม่พบฟังก์ชัน** → ยังไม่ได้ `CREATE EXTENSION` หรือ search\_path ไม่เจอ → ใช้ `public.create_hypertable` และห่อด้วย `DO $$ ... $$` + เช็ค `pg_extension`
* **`timescaledb already loaded with another version`** → เปิด session ใหม่ + `-X` และรัน `ALTER EXTENSION timescaledb UPDATE;`
* **PRIMARY KEY มี expression (COALESCE)** → PostgreSQL ไม่อนุญาต ให้ใช้ surrogate key + UNIQUE index แบบ expression แทน (เช่น `reading_media_map`)

## Security & Ops Checklist

* MQTT over TLS + ACL ตาม tenant/robot
* จำกัดสิทธิ์ฐานข้อมูลตาม service (least privilege)
* เปิด Metrics/Logs เป็น JSON + ส่งเข้า Loki/Promtail หรือ OTEL
* Backup/Restore DB (pgBackRest/WAL-G) และทดสอบกู้คืน
* Media GC policy ให้สอดคล้องกับ retention DB

## Roadmap/Future

* Queue สำหรับงาน inference หนัก (Redis/RabbitMQ + workers)
* OTA/remote mgmt ผ่าน edge-agent แบบมี audit
* เพิ่ม continuous aggregates เพิ่มเติมตาม KPI

---

## ภาคผนวก: Mapping → SQL

* Pose → `sensors.fn_ingest_pose` → `robot_pose`
* Readings (Commercial) → `sensors.fn_ingest_reading` → `sweep_readings`
* Readings (Lab) → insert `lab_readings` (หรือเรียกฟังก์ชันถ้าต้อง unify)
* Health → `sensors.fn_ingest_health` → `device_health`
* Vision → insert `media_objects` + map ที่ `reading_media_map`
* Run lifecycle → `fn_run_start` / `fn_run_end` → `sweep_runs`

> อ่านสคีมาฉบับเต็มและไฟล์ migrations ได้ใน: **Farm Iq Edge Robot Sweep — Full Sql (lab + Commercial)**
