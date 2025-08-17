# Image Ingestion Service

รับภาพจาก **vision-capture-service** ผ่าน HTTP, เก็บไฟล์ลง **MinIO**, บันทึกเมตาดาต้าลง **TimescaleDB/PostgreSQL** และประกาศอีเวนต์ไป **MQTT** เพื่อแจ้งบริการปลายทาง

* Runtime: **Node.js 20 + TypeScript**
* Framework: **Express**
* Upload: **multer** (multipart/form-data)
* Storage: **MinIO** (S3-compatible)
* DB: **TimescaleDB/PostgreSQL** + **TypeORM**
* Messaging: **MQTT** (mosquitto)
* Docs: **Swagger UI** ที่ `/api-docs` (spec เสิร์ฟที่ `/openapi.json`)
* Auth: **x-api-key** header

---

## ✨ Features

* รับไฟล์ภาพแบบ `multipart/form-data` (สูงสุด \~25MB ต่อไฟล์)
* คำนวณ `sha256` + ดึง `width/height` ด้วย `sharp`
* อัพโหลดไฟล์ลง **MinIO** bucket เดียว (ค่าเริ่มต้น: `images`)
* เขียนเมตาดาต้าไปที่ `sensors.media_objects` และ `sensors.reading_media_map`
* ประกาศ MQTT event ตาม `ROUTING_KEY` (เช่น `image.created` → topic `image/created`)
* Swagger UI พร้อมใช้งาน

---

## 🧱 Database Schema (สรุป)

```sql
-- schema: sensors

CREATE TABLE IF NOT EXISTS sensors.media_objects (
  media_id    BIGSERIAL PRIMARY KEY,
  time        TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id   TEXT NOT NULL,
  kind        TEXT NOT NULL,
  bucket      TEXT NOT NULL,
  object_key  TEXT NOT NULL,
  sha256      TEXT,
  width       INT,
  height      INT,
  meta        JSONB
);

CREATE TABLE IF NOT EXISTS sensors.reading_media_map (
  map_id     BIGSERIAL PRIMARY KEY,
  time       TIMESTAMPTZ NOT NULL,
  tenant_id  TEXT        NOT NULL,
  robot_id   TEXT,
  run_id     BIGINT,
  station_id TEXT,
  sensor_id  TEXT,
  metric     TEXT        NOT NULL,
  media_id   BIGINT      NOT NULL REFERENCES sensors.media_objects(media_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reading_media_map_norm
  ON sensors.reading_media_map (
    time,
    tenant_id,
    (COALESCE(robot_id,'-')),
    (COALESCE(station_id,'-')),
    (COALESCE(sensor_id,'-')),
    metric,
    media_id
  );
```

---

## 📦 Object Key Pattern (ใน MinIO)

```
{tenant_id}/{sensor_id|unknown}/{unix_ms}-{sha256_10}{ext}
# ตัวอย่าง: farm-001/camera-01/1739592000000-a1b2c3d4e5.jpg
```

---

## 🔐 Authentication

ทุก endpoint ที่อยู่ใต้ `/api` ต้องส่ง header:

```
x-api-key: <API_KEY>
```

ค่า `API_KEY` ตั้งใน `.env`

---

## 🔧 Environment Variables

| กลุ่ม    | ตัวแปร                        | ค่า/ตัวอย่าง                | หมายเหตุ                            |
| -------- | ----------------------------- | --------------------------- | ----------------------------------- |
| Server   | `SYNC_PORT` หรือ `PORT`       | `6313`                      | ถ้าไม่ตั้ง default = `4104`         |
| DB       | `DB_HOST`                     | `timescaledb`               | ชื่อบริการใน docker network         |
|          | `DB_PORT`                     | `5432`                      |                                     |
|          | `DB_NAME`                     | `sensors_db`                |                                     |
|          | `DB_USER`                     | `postgres`                  |                                     |
|          | `DB_PASSWORD`                 | `password`                  |                                     |
|          | `DB_SCHEMA`                   | `sensors`                   |                                     |
| MinIO    | `MINIO_ENDPOINT`              | `http://minio:9000`         |                                     |
|          | `MINIO_ROOT_USER`             | `admin`                     |                                     |
|          | `MINIO_ROOT_PASSWORD`         | `admin1234`                 |                                     |
|          | `MINIO_BUCKET`                | `images`                    | bucket เดียว                        |
| MQTT     | `MQTT_BROKER_URL`             | `mqtt://edge-mqtt:1883`     |                                     |
|          | `MQTT_USER` / `MQTT_PASSWORD` | `edge_image_ingest` / `***` | ต้องตรงกับ mosquitto `passwd`/ACL   |
|          | `ROUTING_KEY`                 | `image.created`             | จะถูกแปลงเป็น topic `image/created` |
| Security | `API_KEY`                     | `...`                       | ใช้กับ header `x-api-key`           |
| Misc     | `LOG_LEVEL`                   | `info`                      |                                     |

> ใน Docker เรา inject env ผ่าน `env_file: .env` ของ compose
> ถ้ารันโลคัล `.env` ต้องอยู่แถวราก (ตัวอ่าน env มี logic หาไฟล์ไล่ขึ้น 5 ระดับ)

---

## 🗂️ Project Structure (ย่อ)

```
src/
  configs/config.ts
  middleware/
    apiKey.ts
    errorHandler.ts
  models/
    MediaObject.ts
    ReadingMediaMap.ts
  routes/
    ingestion.routes.ts
    index.ts
  services/
    media.service.ts
  utils/
    dataSource.ts
    minio.ts
    mqtt.ts
    swagger.ts
  server.ts
```

---

## 🚀 Run (Docker Compose)

ตัวอย่างส่วนสำคัญใน `docker-compose.yml`:

```yaml
image-ingestion:
  build:
    context: ./services/images-ingestion-service
    dockerfile: Dockerfile
  ports:
    - "6313:6313"       # ให้เลขพอร์ตตรงกันทั้ง host/container
  env_file:
    - .env
  environment:
    PORT: "6313"        # บังคับให้ชัด
  depends_on:
    - timescaledb
    - minio
    - edge-mqtt
  healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:6313/health || exit 1"]
    interval: 10s
    timeout: 10s
    retries: 5
    start_period: 10s
```

คำสั่ง:

```bash
docker compose build image-ingestion
docker compose up -d image-ingestion
docker compose logs -f image-ingestion
```

คาดหวังใน log:

```
✅ DataSource initialized
📡 MQTT connected
🚀 image-ingestion-service on http://localhost:6313
📖 Swagger UI at        http://localhost:6313/api-docs
```

---

## 🧑‍💻 Run (Local Dev)

ต้องมี TimescaleDB, MinIO, MQTT ให้พร้อมก่อน (จะใช้จาก compose ก็ได้)

```bash
# ติดตั้ง
yarn install

# ตั้งค่า .env (ดูตัวอย่างด้านบน)
# แล้วรัน dev
yarn dev
```

---

## 📚 API

### 1) Health

```
GET /health
200 OK
```

### 2) Ingest image

```
POST /api/ingest/image
Headers:
  x-api-key: <API_KEY>
Content-Type:
  multipart/form-data

Form fields:
  file: (binary)           # required
  tenant_id: string        # required
  metric: string           # default: image
  time: string (ISO)       # optional
  robot_id: string         # optional
  run_id: string|number    # optional
  station_id: string       # optional
  sensor_id: string        # optional
  kind: string             # default: image
```

**cURL ตัวอย่าง**

```bash
curl -X POST "http://localhost:6313/api/ingest/image" \
  -H "x-api-key: $API_KEY" \
  -F tenant_id=farm-001 \
  -F sensor_id=camera-01 \
  -F metric=image \
  -F file=@/path/to/sample.jpg
```

**Response 201**

```json
{
  "ok": true,
  "media_id": 123,
  "object_key": "farm-001/camera-01/1739592000000-a1b2c3d4e5.jpg",
  "bucket": "images"
}
```

> การ publish MQTT จะเกิดหลังบันทึก DB สำเร็จ (ถ้า publish ล้มเหลวจะ log ไว้ ไม่ย้อนธุรกรรมฐานข้อมูล)

**MQTT Event (topic: `image/created`)**

```json
{
  "kind": "image",
  "bucket": "images",
  "objectKey": "farm-001/camera-01/1739592000000-a1b2c3d4e5.jpg",
  "media_id": 123,
  "time": "2025-08-15T13:45:00.000Z",
  "tenant_id": "farm-001",
  "robot_id": "robot-01",
  "station_id": "station-a",
  "sensor_id": "camera-01",
  "metric": "image",
  "sha256": "4b227777d4dd1fc6...",
  "width": 1920,
  "height": 1080
}
```

### 3) List recent media

```
GET /api/ingest/recent?limit=20
Headers:
  x-api-key: <API_KEY>

200 OK -> MediaObject[]
```

---

## 🧪 Verify

* **Swagger:** [http://localhost:6313/api-docs](http://localhost:6313/api-docs)
  (สเปคดิบที่ [http://localhost:6313/openapi.json](http://localhost:6313/openapi.json))
* **MinIO Console:** [http://localhost:9001](http://localhost:9001)
  ดูไฟล์ใน bucket `images`
* **MQTT:** ใช้ MQTT Explorer → subscribe `image/#`
* **DB (psql):**

  ```bash
  docker compose exec -it timescaledb psql -U "$DB_USER" -d "$DB_NAME" -c \
  "select media_id, time, tenant_id, bucket, object_key from sensors.media_objects order by media_id desc limit 5;"
  ```

---

## 🐞 Troubleshooting

* **`ERR_EMPTY_RESPONSE` ที่ `/api-docs`**
  เช็กให้ host map พอร์ตถูกต้อง (เช่น `6313:6313`) และ `/openapi.json` โหลดได้ 200

* **`MQTT not authorised`**
  username/password ไม่ตรงหรือ ACL ไม่อนุญาต `image/created`
  เพิ่มใน `aclfile`:

  ```
  user edge_image_ingest
  topic write image/created
  ```

* **`ENOTFOUND timescaledb` เมื่อรันนอก Docker**
  `DB_HOST=timescaledb` จะ resolve ได้เฉพาะใน docker network → ใส่ IP/host ที่เข้าถึงได้จากเครื่องคุณ หรือรันผ่าน compose ให้ครบชุด

* **`SASL ... client password must be a string`**
  ตรวจ `DB_PASSWORD` ใน env ไม่เป็นค่าว่าง/undefined

* **ข้อความ `[config] .env not found; using process.env only`**
  แปลว่าตอนรันใช้ค่า env จาก process (เช่นจาก compose) ไม่ได้อ่านจากไฟล์ `.env` — ไม่ใช่ error

---

## 🔒 Notes on Security

* ใช้ **x-api-key** สำหรับ auth แบบเบา ๆ บน edge
* ควรจำกัดสิทธิ์ MQTT ด้วย ACL เฉพาะ topic ที่ต้องใช้ (`image/created`)
* หากต้องเข้มขึ้น ให้เสริม JWT/Mutual TLS ตามสภาพแวดล้อม

---

## 🛣️ Roadmap (แนะนำ)

* [ ] รีฟอร์แมต payload สำหรับ downstream ให้เป็นมาตรฐานเดียว (schema versioning)
* [ ] รองรับ batch ingest / multiple files
* [ ] สร้าง consumer ฝั่ง DB สำหรับ enrich/validate เพิ่มเติม
* [ ] Metrics/Tracing (Prometheus/OpenTelemetry)

