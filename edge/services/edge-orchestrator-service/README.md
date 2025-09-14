## Edge Orchestrator Service

- Port: `6301`
- Health: `GET /health`
- MQTT: `MQTT_BROKER_URL`
- DB: `DATABASE_URL` (Timescale/Postgres)

### Run (Docker Compose)
Defined in `edge/docker-compose.apps.yml` as `edge-orchestrator`.

### Env
- `DATABASE_URL=postgresql://USER:PASS@timescaledb:5432/DB`
- `DB_SCHEMA=sensors`
- `MQTT_BROKER_URL=mqtt://edge-mqtt:1883`

### Notes
- Fastify + Prisma (raw SQL).
- Prisma requires OpenSSL in build and runtime; schema sets `binaryTargets` for Debian.
# edge-orchestrator-service

บริการควบคุมงาน Orchestration บน Edge เช่น สร้าง Dataset จากคู่ภาพ–น้ำหนัก, ลงทะเบียนและสั่ง Deploy โมเดล และ Trigger งาน Inference แบบ backfill พร้อมประกาศสถานะผ่าน MQTT

- Runtime: Node.js 20 + TypeScript (Express)
- DB: TimescaleDB/PostgreSQL (TypeORM, schema `sensors`)
- Object Storage: MinIO (buckets: raw/images, datasets, models)
- Docs: Swagger UI `/api-docs`, OpenAPI `/openapi.json`
- Auth: Header `x-api-key`

---

## ความสามารถหลัก
- Dataset: รวม mapping ภาพ–น้ำหนัก แล้วอัปโหลดเป็น CSV ไป MinIO → บันทึก `dataset_exports` → Publish สถานะ
- Model Registry/Deploy: ลงทะเบียนรุ่น, สั่ง Inference ให้ Deploy และประกาศผลผ่าน MQTT
- Backfill Inference: รับ `object_keys` เพื่อสั่ง inference ย้อนหลัง (เรียกผ่าน Inference service)

---

## API (ย่อ)
- Health: `GET /health`
- Datasets:
  - `POST /api/datasets/build` บอดี: `{ "limit": 5000 }` → สร้าง CSV ใน MinIO และคืน `{ dataset_s3, rows }`
  - `GET /api/datasets/recent?limit=10` → รายการ Dataset ล่าสุด
- Models:
  - `POST /api/models/register` บอดี: `{ model_name, version, artifact_s3, metrics?, auto_deploy? }` → ลงทะเบียนและ deploy (ถ้า `auto_deploy=true`)
- Infer:
  - `POST /api/infer/backfill` บอดี: `{ object_keys: ["..."] }`

ดูสคีมาอินพุต/ผลลัพธ์ได้ที่ Swagger UI

---

## MQTT Topics (ประกาศสถานะ)
- `edge/datasets/ready` payload: `{ dataset_s3, rows, schema: 'v1' }`
- `edge/model/deploy.done` payload: `{ model_name, version }`

หมายเหตุ: ถ้าใช้งาน “Edge Topic Bridge” อยู่ หัวข้อด้านบนเป็น `edge/*` อยู่แล้ว ไม่ต้องแปลงซ้ำ

---

## Environment Variables (สำคัญ)
- DB: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA`, `DATABASE_URL`
- Server: `EDGE_ORCHESTRATOR_PORT` (ดีฟอลต์ 6301)
- MinIO: `MINIO_ENDPOINT`, `MINIO_ROOT_USER|MINIO_ACCESS_KEY`, `MINIO_ROOT_PASSWORD|MINIO_SECRET_KEY`, `MINIO_BUCKET_*`
- MQTT: `MQTT_BROKER_URL`, `MQTT_USER`, `MQTT_PASSWORD`
- Security: `ADMIN_API_KEY` (ใช้กับ `x-api-key`)

---

## การใช้งานผ่าน Docker Compose
บริการถูกผูกไว้แล้วใน `edge/docker-compose.*.yml` กำหนด `.env` ให้ครบแล้วรันด้วย compose จะเปิดที่พอร์ต 6301 และมี `/api-docs`

ตัวอย่างล็อกที่คาดหวัง:
```
? DataSource initialized
?? edge-orchestrator-service on http://localhost:6301
?? Swagger UI http://localhost:6301/api-docs
```

---

## ตาราง/เอนทิตีที่เกี่ยวข้อง (ตัวอย่าง)
- `media_objects`, `reading_media_map`
- `weight_mappings` (ถ้ามี), `dataset_exports`, `model_registry`

