## Sensor Service (Fastify + Prisma)

- Port: `6300`
- Health: `GET /sensor/health`
- MQTT: `MQTT_BROKER_URL` (default `mqtt://edge-mqtt:1883`)
- DB: `DATABASE_URL` (Postgres/Timescale)

### Run (Docker Compose)
Service is included in `edge/docker-compose.apps.yml`.

### Env
- `DATABASE_URL=postgresql://USER:PASS@timescaledb:5432/DB`
- `DB_SCHEMA=sensors`
- `MQTT_BROKER_URL=mqtt://edge-mqtt:1883`

### Development
```bash
yarn
yarn build && yarn start
```

### Notes
- Uses Prisma with raw SQL (`$queryRawUnsafe`/`$executeRawUnsafe`).
- Requires OpenSSL in runtime container for Prisma engine.
# sensor-service

รวบรวมและทำความสะอาดข้อมูลจากอุปกรณ์ผ่าน MQTT แล้วกระจายต่อเป็นกลุ่ม clean/anomaly รวมถึงบันทึกลงฐานข้อมูล (เมื่อเปิดใช้งาน) และอัปเดตสถานะอุปกรณ์จาก health/LWT

- Runtime: Node.js 20 + TypeScript (Express)
- Broker: Mosquitto (MQTT)
- DB: TimescaleDB/PostgreSQL (TypeORM, schema `sensors`)
- HTTP: `/sensor/health`, `/sensor/latest`

---

## หัวข้อ MQTT ที่ใช้
- Subscribe (ค่าเริ่มต้นจาก ENV):
  - `sensor.raw/+/+/+` (รูปแบบ: `sensor.raw/{tenant}/{metric}/{deviceId}`)
  - `dm/+/+/health`, `dm/+/+/lwt`
- Publish:
  - `sensor.clean/{tenant}/{metric}/{deviceId}`
  - `sensor.anomaly/{tenant}/{metric}/{deviceId}`
  - (ทางเลือก) `sensor.dlq/...`

หมายเหตุ: เมื่อมี “Edge Topic Bridge” ข้อมูล `sensor.clean`/`sensor.anomaly` จะถูก re-publish เป็น `edge/tele/...` และ Alert/Stat จะถูกแมพให้ตามสเปก Cloud อัตโนมัติ

---

## การเขียน DB
- มี run context (robot + run + sensor): บันทึก `sweep_readings`
- ไม่มี run context: เรียกฟังก์ชัน `sensors.fn_ingest_device_reading(...)`
- Health/LWT: upsert `device_health`

---

## Endpoint (ย่อ)
- `GET /sensor/health` → `{ ok: true }`
- `GET /sensor/latest` (ต้อง `x-api-key`) → บัฟเฟอร์ข้อมูลล่าสุด 50 รายการที่ service ส่งออก

---

## Environment Variables (สำคัญ)
- MQTT: `MQTT_BROKER_URL`, `MQTT_SENSOR_USER`, `MQTT_SENSOR_PASSWORD`, `SENSOR_RAW_SUB`, `DM_HEALTH_SUB`, `DM_LWT_SUB`, `PUB_NS_CLEAN`, `PUB_NS_ANOMALY`, `PUB_NS_DLQ`
- DB: `DATABASE_URL` หรือ `DB_HOST/PORT/NAME/USER/PASSWORD`, `WRITE_DB`
- Server: `SENSOR_PORT` (ดีฟอลต์ 6309)
- Security: `SERVICE_API_KEY`, `REQUIRE_API_KEY`

---

## Compose
บริการถูกผูกไว้แล้วใน `edge/docker-compose.*.yml` และพึ่งพา `edge-mqtt`, `timescaledb`

