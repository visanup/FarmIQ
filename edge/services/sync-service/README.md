## Sync Service (Edge → Cloud)

- Port: `6302`
- Health: `GET /health`

### Purpose
Pull batches from edge DB and POST to cloud `sensor-streamer-service` with retry/backoff and detailed logging.

### Key Env
- `EDGE_DATABASE_URL` (edge TimescaleDB)
- `CLOUD_DATABASE_URL` (optional)
- `CLOUD_API_URL` (default `http://host.docker.internal:7302/api`)
- `CLOUD_API_KEY`
- `SYNC_INTERVAL_MINUTES` (default 5)
- `SYNC_MAX_RETRIES` / `SYNC_BACKOFF_MS`

### Run
Included in `edge/docker-compose.apps.yml` as `sync-service`.

### Endpoints
- `POST /sync/trigger` (x-api-key required)
- `GET /api-docs` Swagger

### Notes
- Uses Fastify, Axios, cron.
- Payloads match cloud schemas: sweep-readings, lab-readings, sensor-readings, device-health.
# sync-service

บริการซิงก์ข้อมูล Time‑Series จาก Edge DB ไป Cloud DB แบบ incremental และ idempotent พร้อมรองรับการสั่งทำงานผ่าน API/cron

- Runtime: Node.js 20 + Fastify
- DB: Edge (TimescaleDB/PostgreSQL) → Cloud (Postgres/TimescaleDB)
- Docs: Swagger UI `/api-docs`

---

## แนวคิดหลัก
- Incremental: ไล่ตาม cursor เวลา (และ/หรือ `updated_at`) เพื่อลดภาระ I/O
- Idempotent: ใช้คีย์ผสม / upsert เพื่อลดโอกาสซ้ำซ้อน
- Batch + Backoff: ปรับขนาด batch และหน่วงเวลาได้

---

## ตารางที่ซิงก์ (ตัวอย่าง)
- `sensors.sweep_readings`
- `sensors.lab_readings`
- `sensors.device_readings`
- `sensors.device_health`

---

## API
- `GET /health` → สถานะบริการ
- `POST /sync/trigger` (ต้อง `x-api-key`) → สั่งเริ่มซิงก์ทันที (fire‑and‑forget)

งานประจำ (cron): ตั้งจาก ENV `SYNC_INTERVAL_MINUTES` และเริ่มซิงก์อัตโนมัติเมื่อบูต

---

## Environment Variables (สำคัญ)
- Edge DB: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` หรือ `EDGE_DATABASE_URL`
- Cloud DB: `CLOUD_DB_HOST`, `CLOUD_DB_PORT`, `CLOUD_DB_NAME`, `CLOUD_DB_USER`, `CLOUD_DB_PASSWORD` หรือ `CLOUD_DATABASE_URL`
- Server: `SYNC_PORT` (ดีฟอลต์ 6302)
- Schedule: `SYNC_INTERVAL_MINUTES`
- Security: `API_KEY` (ใช้กับ `x-api-key`)

---

## Compose
อยู่ใน `edge/docker-compose.*.yml` และพึ่งพา `timescaledb` (และ Cloud DB หากระบุ)

