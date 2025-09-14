# weight-associator-service

จับคู่น้ำหนักกับภาพที่ ingest เข้ามา โดยฟังอีเวนต์ภาพ (`image.created`) แล้วค้นหา reading น้ำหนักที่อยู่ในหน้าต่างเวลาที่กำหนด จากนั้นบันทึกความสัมพันธ์และประกาศอีเวนต์ผลลัพธ์

- Runtime: Node.js 20 + TypeScript (Express)
- DB: TimescaleDB/PostgreSQL (TypeORM, schema `sensors`)
- Docs: Swagger UI `/api-docs`, OpenAPI `/openapi.json`
- Auth: Header `x-api-key`

---

## ฟังก์ชันทำงาน
- Subscribe: routing-key `image.created` (topic `image/created`)
- คำนวณ matching กับ reading น้ำหนักในหน้าต่างเวลา `ASSOC_WINDOW_MS` (ดีฟอลต์ 5000 ms)
- บันทึก mapping (ตารางสัมพันธ์ภาพ–reading)
- Publish: routing-key `weight.associated` (topic `weight/associated`)

ถ้าใช้งาน “Edge Topic Bridge” อยู่ จะถูกแปลงเป็น `edge/evt/.../weigh/finalized` ให้โดยอัตโนมัติ

---

## API (ย่อ)
- `GET /health`
- `GET /openapi.json`, `GET /api-docs`
- `POST /api/associate/weight` (manual)
- `GET /api/associations/recent` (debug)

---

## Environment Variables (สำคัญ)
- DB: `DATABASE_URL` หรือ `DB_HOST/PORT/NAME/USER/PASSWORD`, `DB_SCHEMA`
- Server: `WEIGHT_ASSOCIATOR_PORT` (ดีฟอลต์ 6303)
- MQTT: `MQTT_BROKER_URL`, `MQTT_USER`, `MQTT_PASSWORD`, `IMG_CREATED_RK` (ดีฟอลต์ `image.created`), `WEIGHT_ASSOCIATED_RK` (ดีฟอลต์ `weight.associated`)
- Matching: `ASSOC_WINDOW_MS`

---

## โครงสร้างโปรเจ็กต์ (ย่อ)
```
src/
  configs/      middleware/      routes/        schemas/        services/       utils/
  server.ts
```

