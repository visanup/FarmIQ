# weight-associator-service — README

เซอร์วิสนี้ทำหน้าที่ “จับคู่ภาพ” ที่ถูก ingest (เช่นจากกล้อง/หุ่นยนต์) เข้ากับ “ค่าน้ำหนัก” จากเซนเซอร์ โดยอิงเวลาและบริบท (tenant, station, sensor) แล้วบันทึกผลการจับคู่ลงฐานข้อมูล พร้อมยิงอีเวนต์ `weight.associated` ทาง MQTT ให้บริการอื่น ๆ เอาไปต่อยอด

> โปรเจ็กต์ของคุณอาจตั้งโฟลเดอร์เป็น `weigh-associator-service` หรือ `weight-associator-service` ก็ได้ โค้ดด้านในเหมือนกัน

---

## โครงสร้างโฟลเดอร์

```
src/
  configs/
    config.ts
  middleware/
    apiKey.ts
    errorHandler.ts
  models/
    MediaObject.ts
    Reading.ts
    ReadingMediaMap.ts
  routes/
    associate.route.ts          # POST /api/associate/weight
    associations.route.ts       # GET debug endpoints (recent/by-media)
    index.ts
  schemas/
    ingestion.schemas.ts        # zod schema: events + request/response
  services/
    associate.service.ts
    media.service.ts
    reading.service.ts
    readingMediaMap.service.ts
  types/
    swagger-jsdoc.d.ts
  utils/
    dataSource.ts
    mqtt.ts
    swagger.ts
    zod.ts
  server.ts

Dockerfile
.dockerignore
package.json
tsconfig.json
```

---

## คุณสมบัติหลัก

* ✅ Subscribe MQTT topic `image.created` (map เป็น MQTT topic `image/created`)
* ✅ หา “**reading น้ำหนัก**” ที่ใกล้เวลา `media.time` ที่สุดภายในกรอบเวลา `±ASSOC_WINDOW_MS` (ค่าเริ่ม 5000 ms)
* ✅ บันทึกผลในตาราง `sensors.reading_media_map`
* ✅ Publish MQTT event `weight.associated` (map เป็น `weight/associated`)
* ✅ REST API:

  * `POST /api/associate/weight` จับคู่ย้อนหลังบนคำขอ
  * `GET /associations/recent` ดู mapping ล่าสุด (brief/full)
  * `GET /associations/by-media/:mediaId` ดู mapping ล่าสุดของสื่อที่ระบุ
* ✅ Swagger UI: `/api-docs`, OpenAPI JSON: `/openapi.json`
* ✅ Health check: `/health`
* ✅ API Key ผ่าน header `x-api-key`

---

## การติดตั้ง & รัน

### Prerequisites

* Node.js 20+
* Yarn classic 1.22.x
* TimescaleDB/PostgreSQL ที่มีสคีมาและตารางด้านล่าง (ดูหัวข้อ “สคีมาฐานข้อมูล”)
* MQTT broker (เช่น `edge-mqtt`)
* (แนะนำ) ตั้งเวลาเครื่อง/คอนเทนเนอร์ให้ตรง (NTP) ลด error delta เวลา

### .env ตัวอย่าง

```env
# ---- Database ----
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensors_db
DB_USER=postgres
DB_PASSWORD=password
DB_SCHEMA=sensors
# หรือกำหนด DATABASE_URL แทนทั้งหมด:
# DATABASE_URL=postgresql://postgres:password@timescaledb:5432/sensors_db

# ---- Server ----
WEIGHT_ASSOCIATOR_PORT=6312
LOG_LEVEL=INFO
NODE_ENV=development

# ---- Security ----
API_KEY=<your_api_key>

# ---- MQTT ----
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
MQTT_USER=edge_image_ingest
MQTT_PASSWORD=admin1234
IMG_CREATED_RK=image.created
WEIGHT_ASSOCIATED_RK=weight.associated

# ---- Matching window (ms) ----
ASSOC_WINDOW_MS=5000
```

> หมายเหตุ: ไลบรารี MQTT ของเรา **แมป “routing key”** ที่ใช้จุด (`.`) ไปเป็น **topic** ที่ใช้สแลช (`/`) อัตโนมัติ
> เช่น `image.created` → MQTT topic จริง `image/created`

### ติดตั้งและรัน (โหมด Dev/Local)

```bash
# ติดตั้งแพ็กเกจ
yarn install

# รัน dev (watch + ts-node-dev)
yarn dev

# หรือ build แล้วรันด้วย Node
yarn build
yarn start
```

เซอร์วิสจะขึ้นที่ `http://localhost:6312` (หรือพอร์ตตาม .env ของคุณ)

* Swagger UI: `http://localhost:6312/api-docs`
* OpenAPI JSON: `http://localhost:6312/openapi.json`
* Health: `http://localhost:6312/health`

### รันด้วย Docker

```bash
# สร้างอิมเมจ
docker build -t weight-associator:latest .

# รัน
docker run --rm -p 6312:6312 --env-file .env --network <your-net> weight-associator:latest
```

> ถ้าใช้ `docker-compose`, ใส่ service นี้ในเครือข่ายเดียวกับ `timescaledb` และ `edge-mqtt`

---

## สคีมาฐานข้อมูลที่คาดหวัง

เซอร์วิสนี้ **ไม่สร้างตารางเอง** (TypeORM `synchronize=false`) จึงต้องมีตารางเหล่านี้อยู่แล้ว:

1. `sensors.media_objects` — ภาพจาก image-ingestion
   คอลัมน์หลัก: `media_id (PK, bigint)`, `time timestamptz`, `tenant_id text`, `kind text`, `bucket text`, `object_key text`, `sensor_id text?`, `station_id text?`, `meta jsonb?`

2. `sensors.readings` — time-series readings ทุกชนิด
   ใช้ **คอลัมน์**: `id (bigint PK)`, `time timestamptz`, `tenant_id text`, `sensor_id text?`, `station_id text?`, `metric text`, `value_num double precision?`, `unit text?`, `meta jsonb?`
   โดยที่ **น้ำหนัก** ควรเป็น `metric IN ('weight','mass')`

3. `sensors.reading_media_map` — ตารางผลการจับคู่ (**จำเป็น**)

   ```sql
   CREATE TABLE IF NOT EXISTS sensors.reading_media_map (
     id          BIGSERIAL PRIMARY KEY,
     media_id    BIGINT NOT NULL REFERENCES sensors.media_objects(media_id),
     reading_id  BIGINT NOT NULL REFERENCES sensors.readings(id),
     delta_ms    INTEGER NOT NULL,             -- |time(reading)-time(media)|
     method      TEXT NOT NULL,                -- 'nearest' | 'window' | 'exact'
     confidence  REAL,
     created_at  timestamptz NOT NULL DEFAULT now()
   );
   CREATE INDEX IF NOT EXISTS idx_rmm_media   ON sensors.reading_media_map(media_id);
   CREATE INDEX IF NOT EXISTS idx_rmm_reading ON sensors.reading_media_map(reading_id);
   ```

### ดัชนีที่แนะนำ (Performance)

```sql
-- readings: เรา where โดย tenant_id, sensor_id, metric, time, และ order-by ความใกล้เวลา
CREATE INDEX IF NOT EXISTS readings_tenant_sensor_metric_time_idx
ON sensors.readings (tenant_id, sensor_id, metric, time);

-- media_objects: ใช้ค้นหาล่าสุด/ช่วงเวลา และค้นหาแบบ bucket+object_key
CREATE INDEX IF NOT EXISTS media_objects_time_idx
ON sensors.media_objects (time);

CREATE UNIQUE INDEX IF NOT EXISTS media_objects_bucket_key_uq
ON sensors.media_objects (bucket, object_key);
```

> ถ้าใช้ TimescaleDB: ให้ `sensors.readings` เป็น **hypertable** บน `time` เพื่อประสิทธิภาพที่ดีกว่า

---

## MQTT Topics & Payloads

### Subscribe: `image.created` → topic จริง `image/created`

**Payload (แนะนำให้ image-ingestion ส่ง):**

```json
{
  "event": "image.created",
  "media_id": 12345,
  "time": "2025-08-15T13:45:00.000Z",
  "tenant_id": "farm-001",
  "bucket": "images",
  "object_key": "farm-001/camera-01/1739592000000-a1b2c3d.jpg",
  "station_id": "station-a",
  "sensor_id": "scale-01",
  "meta": { "run_id": "42" }
}
```

### Publish: `weight.associated` → topic จริง `weight/associated`

**Payload ตัวอย่าง:**

```json
{
  "event": "weight.associated",
  "media_id": 12345,
  "reading_id": 67890,
  "delta_ms": 420,
  "weight": 2.35,
  "time": "2025-08-15T13:45:00.420Z"
}
```

---

## REST API

> ทุก endpoint ต้องใส่ header: `x-api-key: <API_KEY>`

### 1) จับคู่ย้อนหลัง

`POST /api/associate/weight`

**Body (เลือกอย่างใดอย่างหนึ่ง):**

```json
{ "media_id": 12345, "window_ms": 5000 }
```

หรือ

```json
{ "bucket": "images", "object_key": "farm-001/camera-01/xxx.jpg", "window_ms": 5000 }
```

**Response 201:**

```json
{ "ok": true, "media_id": 12345, "reading_id": 67890, "delta_ms": 420, "weight": 2.35 }
```

**Curl ตัวอย่าง:**

```bash
curl -X POST "http://localhost:6314/api/associate/weight" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <API_KEY>" \
  -d '{"media_id":12345,"window_ms":5000}'
```

### 2) ดู mapping ล่าสุด (debug/สังเกตการณ์)

`GET /associations/recent?limit=20&include=brief|full`

* `include=brief` (ค่าเริ่ม): คืนเฉพาะแถว mapping
* `include=full`: join ข้อมูล `media` และ `reading` ให้ด้วย

```bash
curl -H "x-api-key: <API_KEY>" "http://localhost:6314/associations/recent?limit=10&include=full"
```

### 3) ดู mapping ล่าสุดของสื่อที่ระบุ

`GET /associations/by-media/:mediaId?include=brief|full`

```bash
curl -H "x-api-key: <API_KEY>" "http://localhost:6314/associations/by-media/12345?include=full"
```

### 4) Health

`GET /health` → `200 OK`

### 5) Swagger

* UI: `GET /api-docs`
* JSON: `GET /openapi.json`

---

## วิธีทดสอบเร็ว

1. **สร้าง reading จำลอง** (psql)

```sql
INSERT INTO sensors.readings (time, tenant_id, sensor_id, metric, value_num, unit)
VALUES
  (now() - interval '500 ms', 'farm-001', 'scale-01', 'weight', 2.35, 'kg');
```

2. **สร้าง media จำลอง** (psql)

```sql
INSERT INTO sensors.media_objects (time, tenant_id, kind, bucket, object_key, sensor_id)
VALUES
  (now(), 'farm-001', 'image', 'images', 'farm-001/camera-01/test.jpg', 'scale-01')
RETURNING media_id;
```

3. **สั่งจับคู่ย้อนหลัง** (REST)

```bash
curl -X POST "http://localhost:6314/api/associate/weight" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <API_KEY>" \
  -d '{"bucket":"images","object_key":"farm-001/camera-01/test.jpg","window_ms":2000}'
```

4. **ดูผล**

```bash
curl -H "x-api-key: <API_KEY>" "http://localhost:6314/associations/recent?include=full&limit=5"
```

5. **ทดสอบ MQTT**
   Publish event `image.created` ไปที่ `image/created` ด้วย payload ตามสเปคข้างบน แล้วเช็คว่ามี `weight/associated` ออกมาหรือไม่

---

## การตั้งค่า Matching

* `ASSOC_WINDOW_MS` (env): กรอบเวลาค้นหา reading ที่ใกล้ที่สุด (ms)
* Logic ปัจจุบัน: **nearest by absolute time difference** ภายในกรอบ
  ต้องการเปลี่ยนเป็น “น้ำหนักนิ่ง/median 1–2s ก่อน timestamp” ก็ทำได้ง่าย ๆ ที่ `reading.service.ts` (เพิ่ม `findStableWeightReading(...)`) แล้วเรียกใช้แทน `findNearestWeightReading(...)`

---

## Logging

* ใช้ `morgan` สำหรับ HTTP access log
* ใช้ log มาตรฐานผ่าน `console` ในจุดสำคัญ (เริ่มเซอร์วิส, สถานะ MQTT, error)
* ปรับระดับด้วย `LOG_LEVEL` ได้ตามต้องการ (ปัจจุบันไม่ได้กรองด้วยไลบรารี log level—แต่อ่านค่าไว้เพื่อขยายได้)

---

## ปัญหาพบบ่อย & แนวทางแก้

* **MQTT ต่อไม่ติด**

  * ตรวจ `MQTT_BROKER_URL`, `MQTT_USER`, `MQTT_PASSWORD`, network docker
  * เช็คว่า topic ใช้ `/` ไม่ใช่ `.` (โค้ดแปลงให้อยู่แล้ว แต่ฝั่ง publisher/consumer อื่นต้องสอดคล้อง)

* **DB ต่อไม่ติด / สิทธิ์ไม่พอ**

  * ตรวจ `DATABASE_URL` หรือชุด `DB_*`
  * เช็ค `DB_SCHEMA` = `sensors` ให้ตรงกับตาราง
  * ให้สิทธิ์ `USAGE` บน schema, และ `SELECT/INSERT` บนตารางที่ใช้

* **No reading found in window**

  * ขยาย `ASSOC_WINDOW_MS`
  * ตรวจ `tenant_id`, `sensor_id` ของ `media_objects` และ `readings` ว่าตรงกัน
  * ตรวจ timezone (ใช้ `timestamptz` ทั้งคู่), clock skew

* **delta\_ms สูงผิดปกติ**

  * เช็คเวลาของกล้อง/หุ่นยนต์กับสเกลชั่งให้ตรง (NTP)
  * ตรวจว่ามีหลาย sensor\_id/metric ปะปนหรือไม่

* **คอมไพล์ TypeScript error (@types/jsonwebtoken, zod-to-openapi)**

  * เซอร์วิสนี้ **ไม่ต้องใช้ jsonwebtoken** → อย่า import
  * `zod-to-openapi` ถูก import แบบ optional แล้วใน `utils/zod.ts`
    ถ้าจะใช้งานจริง ให้ `yarn add @asteasolutions/zod-to-openapi`

---

## ข้อเสนอแนะเพื่ออนาคต

* Stable-weight detection (median/mean + derivative threshold)
* ป้องกันการคูณซ้ำ (unique mapping ต่อ media หรือ policy แบบ N-to-1)
* Continuous aggregates (Timescale) สำหรับสรุปน้ำหนักรายช่วงเวลา
* Retry/Dead-letter ถ้า associate ไม่เจอ reading ภายในเวลาที่กำหนด
* Metrics/Tracing (Prometheus/OpenTelemetry)

---

## License

ภายในทีม/โครงการของคุณ (private). หากจะเปิด OSS โปรดเพิ่มไฟล์ LICENSE ตามนโยบายที่ต้องการ

---

## สรุป

**weight-associator-service** ช่วยเชื่อมโยง “ภาพ” กับ “น้ำหนัก” ให้อัตโนมัติแบบเบา ๆ แต่ขยายต่อได้เยอะ ทั้งฝั่งอัลกอริทึมจับคู่, ประสิทธิภาพ (index/hypertable), และ observability.
ถ้าจะให้ผมเพิ่มเส้นทาง “stable-weight” หรือทำชุดทดสอบอัตโนมัติ (Jest) บอกมาได้เลย เดี๋ยวผมร้อยให้ครบชุด 🚀
