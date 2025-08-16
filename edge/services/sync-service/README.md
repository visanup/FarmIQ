# sync-service

Edge → Cloud **time-series sync** สำหรับแพลตฟอร์ม AIoT ของคุณ
ซิงก์เฉพาะ **ข้อมูลเซนเซอร์แบบ time-series** และ **สถานะอุปกรณ์** จากฐานข้อมูลที่ Edge ไปยัง Cloud โดย **ไม่** ยุ่งกับไฟล์ภาพ/เมตาดาต้า

> ถ้าพูดให้ชัด: น้ำหนักจากภาพถูกคำนวณที่ Edge แล้วเขียนเป็น readings ลง DB ที่ Edge — ตัวนี้ก็แค่ “ยก readings + health” ไป Cloud แบบ incremental, idempotent

---

## TL;DR

* **ซิงก์ตาราง:**

  * `sensors.sweep_readings` (ผูก run/robot)
  * `sensors.lab_readings` (ฝั่งห้องแล็บ)
  * `sensors.device_readings` (ระดับอุปกรณ์ทั่วไป)
  * `sensors.device_health` (สถานะ online/rssi/uptime)
* **คอร์สเซอร์:** ใช้คอลัมน์เวลา `time` (และ `updated_at` สำหรับ DIM ถ้าเปิดใช้)
* **กันซ้ำ:** `INSERT ... ON CONFLICT DO NOTHING` (ตาม composite PK ของแต่ละตาราง)
* **state:** เก็บคอร์สเซอร์ไว้ใน `cloud.sync_state`
* **สั่งรัน:** Cron ตาม `SYNC_INTERVAL_MINUTES` + endpoint `POST /sync/trigger`

---

## คุณสมบัติ

* Incremental sync by time cursor (+ backoff 1ms กันตกหล่น)
* Idempotent (ปลอดภัยต่อการรันซ้ำ)
* Multi-tenant filter (`SYNC_TENANT`)
* Batch configurable ต่อแต่ละตาราง
* ไม่พึ่ง MQTT/MinIO — ตรงไปตรงมาที่ Postgres/TimescaleDB

---

## สถาปัตยกรรม (ย่อ)

```
Edge (TimescaleDB)                          Cloud (Postgres/TimescaleDB)
┌─────────────────────┐                     ┌───────────────────────────┐
│ sensors.sweep_readings ───────────────►   │ sensors.sweep_readings    │
│ sensors.lab_readings   ───────────────►   │ sensors.lab_readings      │
│ sensors.device_readings ──────────────►   │ sensors.device_readings   │
│ sensors.device_health  ───────────────►   │ sensors.device_health     │
└─────────────────────┘                     └───────────────────────────┘
                        ┌──────────────┐
                        │ sync-service │  ← cron + /sync/trigger
                        └──────────────┘
```

---

## โครงโปรเจกต์ (สำคัญ ๆ)

```
services/sync-service/
├─ src/
│  ├─ configs/config.ts
│  ├─ middleware/
│  │  ├─ apiKey.ts
│  │  └─ errorHandler.ts
│  ├─ models/
│  │  ├─ SweepReading.ts
│  │  ├─ LabReading.ts
│  │  ├─ DeviceReading.ts
│  │  ├─ DeviceHealth.ts
│  │  └─ SyncState.ts
│  ├─ utils/
│  │  ├─ dataSource.ts
│  │  └─ syncJob.ts
│  └─ server.ts
├─ package.json
├─ tsconfig.json
├─ Dockerfile
└─ .dockerignore
```

---

## ตารางที่รองรับ + คีย์สำคัญ

| ตาราง                     | cursor (เวลา) | คีย์ซ้ำ/ON CONFLICT                                                  | ใช้เมื่อ…                                       |
| ------------------------- | ------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `sensors.sweep_readings`  | `time`        | `(time, robot_id, run_id, sensor_id, metric, tenant)`                | ข้อมูลที่ผูกกับ run ของ robot                   |
| `sensors.lab_readings`    | `time`        | `(time, tenant_id, station_id, sensor_id, metric)`                   | ข้อมูลจากห้องแล็บ                               |
| `sensors.device_readings` | `time`        | `(time, tenant_id, device_id, metric, sensor_id_norm)` *(generated)* | ข้อมูลระดับอุปกรณ์ทั่วไป (น้ำหนักจากภาพก็เหมาะ) |
| `sensors.device_health`   | `time`        | `(time, tenant_id, device_id)`                                       | สถานะอุปกรณ์/สัญญาณ/uptime                      |

> หมายเหตุ `device_readings`: มี **generated column** `sensor_id_norm = COALESCE(sensor_id,'-')` ใน PK → Entity **ไม่ต้อง**แม็พคอลัมน์นี้

---

## ตั้งค่า (.env)

อย่างน้อยต้องมี:

```env
# Edge DB (source)
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensors_db
DB_USER=postgres
DB_PASSWORD=password

# Cloud DB (destination)
CLOUD_DB_HOST=timescaledb
CLOUD_DB_PORT=5432
CLOUD_DB_NAME=sensor_cloud_db
CLOUD_DB_USER=postgres
CLOUD_DB_PASSWORD=password

# Service
SYNC_PORT=6311
SYNC_INTERVAL_MINUTES=1

# Optional: Sync scope
SYNC_TENANT=tenantA           # ซิงก์เฉพาะ tenant นี้ (ว่างไว้ = ซิงก์ทั้งหมด)

# Batches
SYNC_BATCH_SWEEP=20000
SYNC_BATCH_LAB=10000
SYNC_BATCH_DEVICE=20000
SYNC_BATCH_HEALTH=5000

# API key (ถ้าต้องการ)
REQUIRE_API_KEY=true
SERVICE_API_KEY=supersecret

# CORS (ถ้าต้องการ)
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=false
```

หรือใช้ connection string ตรง ๆ:

```env
EDGE_DATABASE_URL=postgresql://postgres:password@timescaledb:5432/sensors_db
CLOUD_DATABASE_URL=postgresql://postgres:password@timescaledb:5432/sensor_cloud_db
```

---

## การเตรียมสคีมา

**Edge และ Cloud ต้องมีสคีมาที่ “เหมือนกัน”** อย่างน้อย 4 ตารางหลักข้างบน
(ไฟล์ migration/DDL ที่คุณมี เช่น `040_readings.sql`, `045_device_readings.sql`, `050_health.sql` ฯลฯ ควร apply ทั้งสองฝั่ง)

---

## รัน (Dev / Docker)

### Dev (Node 20+)

```bash
yarn
yarn dev
# หรือ
yarn build && yarn start
```

### Docker Compose (แนะนำ)

```yaml
sync-service:
  build:
    context: ./services/sync-service
    dockerfile: Dockerfile
  container_name: sync-service
  restart: unless-stopped
  ports:
    - "${SYNC_PORT:-6311}:${SYNC_PORT:-6311}"
  environment:
    - SYNC_PORT=${SYNC_PORT:-6311}
  env_file:
    - .env
  depends_on:
    - timescaledb
  networks: [farm_edge]
  healthcheck:
    test: ["CMD", "node", "-e", "http=require('http');http.get('http://localhost:'+ (process.env.SYNC_PORT||'6311') +'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]
    interval: 10s
    timeout: 10s
    retries: 5
    start_period: 10s
  init: true
```

---

## HTTP Endpoints

* `GET /health` → เช็คสถานะ service
* `POST /sync/trigger` → สั่งซิงก์ทันที (ใส่ `x-api-key` ถ้าบังคับ)

ตัวอย่าง:

```bash
# ถ้าไม่บังคับ API key
curl -X POST http://localhost:6311/sync/trigger

# ถ้าบังคับ API key
curl -H "x-api-key: supersecret" -X POST http://localhost:6311/sync/trigger
```

> (ทางเลือก) เพิ่ม `GET /sync/state` เพื่อตรวจคอร์สเซอร์ของตารางแต่ละตัว — ง่ายต่อการดีบักใน prod

---

## วิธีทดสอบแบบเร็ว

1. ใส่ตัวอย่างลง `sensors.device_readings` ที่ **Edge**:

```sql
SELECT sensors.fn_ingest_device_reading(
  'tenantA',      -- tenant_id
  'dev-01',       -- device_id
  NOW(),          -- time
  NULL,           -- sensor_id (ปล่อย NULL ได้)
  'WEIGHT',       -- metric
  12.34,          -- value
  'clean',        -- quality
  '{}'::jsonb
);
```

2. ยิง sync:

```bash
curl -X POST http://localhost:6311/sync/trigger
```

3. ตรวจที่ **Cloud**:

```sql
SELECT * FROM sensors.device_readings
ORDER BY time DESC LIMIT 5;
```

---

## หลักการทำงาน (สำคัญ)

* ใช้ตาราง `sync_state(table_name text primary key, last_ts timestamptz)` เก็บคอร์สเซอร์ต่อโต๊ะ
* ทุกครั้งดึงข้อมูล **`> last_ts`** (ถอยหลัง 1ms ป้องกันตกหล่น), เรียงเวลา ASC, ใส่ทีละ batch
* Insert แบบ `ON CONFLICT DO NOTHING` (อาศัย composite PK กันซ้ำ)
* ถ้าต้อง “อัปเดตทับ” (เช่น `quality` เปลี่ยน) → ปรับเป็น `ON CONFLICT DO UPDATE SET ...` ได้ใน `syncJob.ts`

---

## ความปลอดภัย & สิทธิ์ DB

* **Edge DB user:** สิทธิ์ **READ ONLY** ต่อ schema/tables ที่ซิงก์
* **Cloud DB user:** สิทธิ์ INSERT (และ UPDATE ถ้าเปิด `DO UPDATE`)
* เปิด `REQUIRE_API_KEY=true` ใน `.env` สำหรับ endpoint `POST /sync/trigger`
* เครือข่าย: จำกัด access เฉพาะ internal network ของ compose/cluster

---

## การปรับแต่งประสิทธิภาพ

* ใส่ดัชนีตามไฟล์ migration (โดยเฉพาะ `(tenant_id, device_id, metric, time desc)` ฯลฯ)
* ปรับ `SYNC_BATCH_*` ให้เหมาะกับขนาดข้อมูล
* ถ้าปริมาณมาก: ทำ continuous aggregate ที่ Edge แล้วซิงก์เฉพาะ rollup
* ใช้ TimescaleDB compression ที่ Edge/Cloud เพื่อลด I/O

---

## Troubleshooting

* **Log ขึ้น `no new rows` ตลอด**

  * มีข้อมูลจริงไหม (`SELECT count(*) ...` ฝั่ง Edge)
  * เวลา `time` ย้อนอดีตเกินไปหรือเปล่า
  * ตั้ง `SYNC_TENANT` แต่ insert คนละ tenant
  * สคีมาฝั่ง Cloud ไม่ตรง → แก้ DDL ให้เหมือน Edge

* **duplicate key error**

  * PK ฝั่ง Cloud ไม่ตรงกับ Edge
  * ตัว service ถูกสลับเป็น `ON CONFLICT DO UPDATE` โดยไม่ได้ตั้งคอลัมน์ให้ตรง

* **timezone งง**

  * ใช้ `timestamptz` ทุกที่, บันทึกเป็น UTC จากทุก service

* **healthcheck ล้ม (พอร์ตผิด)**

  * เช็ก `SYNC_PORT` ทั้ง “ในคอนเทนเนอร์” และ “port mapping” ให้ตรงกับ `.env`

---

## ข้อจำกัด (ณ ตอนนี้)

* ยังไม่มี Prometheus `/metrics` (เพิ่มได้ภายหลัง)
* ยังไม่ทำ retry เฉพาะ insert ล้ม (พังทั้งชุดจะ log แล้วจบ) — ถ้าต้องการ, เติม queue/retry logic ได้ไม่ยาก
* ไม่รองรับ soft delete/compaction ฝั่ง Cloud (ส่วนใหญ่ time-series ไม่ต้อง)

---

## License

MIT — แก้ไขใช้งานในองค์กรได้เต็มที่
