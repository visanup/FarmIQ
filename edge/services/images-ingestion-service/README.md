# images-ingestion-service

รับภาพจากอุปกรณ์/บริการ (HTTP multipart/form-data), คำนวณแฮช/เมตาดาตา, จัดเก็บลง MinIO และบันทึกเมตาดาตาลง DB จากนั้นประกาศเหตุการณ์ผ่าน MQTT เพื่อให้บริการอื่นจับต่อ

- Runtime: Node.js 20 + TypeScript (Express)
- Storage: MinIO (S3-compatible)
- DB: TimescaleDB/PostgreSQL + TypeORM (schema `sensors`)
- Docs: Swagger UI `/api-docs`, OpenAPI `/openapi.json`
- Auth: Header `x-api-key`

---

## API
- `POST /api/image`
  - Form field: `file` (binary)
  - Body (x-www-form-urlencoded/multipart): `{ tenant_id, station_id?, robot_id?, run_id?, sensor_id?, metric?, time? }`
  - Response: `{ ok, media_id, object_key, bucket }`
- `GET /api/recent?limit=20` → รายการ `media_objects` ล่าสุด
- Health: `GET /health`

---

## MQTT Events (ออกจากบริการ)
- Routing-key เริ่มต้น: `image.created` → ถูกแปลงเป็น topic `image/created` ภายใน service
- ถ้าใช้งาน “Edge Topic Bridge” จะ re-publish เป็น `edge/evt/{tenant}/{house}/{scope}/camera/{cam}/stored` ให้โดยอัตโนมัติ

ตัวอย่าง payload ที่ publish:
```json
{
  "kind":"image",
  "bucket":"images",
  "objectKey":"t1/cam01/1739592000000-a1b2c3d4e5.jpg",
  "media_id":123,
  "time":"2025-08-16T07:00:00Z",
  "tenant_id":"t1",
  "robot_id":"r01",
  "station_id":null,
  "sensor_id":"cam01",
  "metric":"image",
  "sha256":"...",
  "width":1280, "height":720
}
```

---

## Environment Variables (สำคัญ)
- DB: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA`, `DATABASE_URL`
- Server: `IMAGE_INGESTION_SERVICE_PORT` (ดีฟอลต์ 6304)
- MinIO: `MINIO_ENDPOINT`, `MINIO_ROOT_USER|MINIO_ACCESS_KEY`, `MINIO_ROOT_PASSWORD|MINIO_SECRET_KEY`, `MINIO_BUCKET_*`
- MQTT: `MQTT_BROKER_URL`, `MQTT_USER`, `MQTT_PASSWORD`, `ROUTING_KEY` (ดีฟอลต์ `image.created`)
- Security: `API_KEY`

---

## การใช้งานผ่าน Docker Compose
บริการถูกผูกไว้แล้วใน `edge/docker-compose.*.yml` เปิดพอร์ต 6304 และมี `/api-docs`

