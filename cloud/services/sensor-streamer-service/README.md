# sensor-streamer-service

บริการ (Node.js/TypeScript) สำหรับ “ดึงข้อมูลจาก TimescaleDB/ PostgreSQL แล้วสตรีมออก Kafka” เป็นระยะๆ โดยใช้ **lexicographic cursor** เก็บสถานะการอ่านไว้ในตาราง `sensors.stream_state` ทำให้รันซ้ำ/หยุด–เริ่มใหม่ได้โดยไม่อ่านซ้ำ

> สถานะล่าสุดของคุณ: บริการขึ้นแล้ว, ต่อ Kafka ได้, ต่อ DB ได้ และมีการ bootstrap แถวแรกใน `sensors.stream_state` สำเร็จ ✅

---

## คุณสมบัติหลัก

* อ่านจาก 4 ตารางในสคีมา `sensors`

  * `device_readings`, `device_health`, `lab_readings`, `sweep_readings`
* แปลงแถวข้อมูลเป็น JSON และส่งออก Kafka topics:

  * `sensors.device.readings`
  * `sensors.device.health`
  * `sensors.lab.readings`
  * `sensors.sweep.readings`
* เลือก tenant ได้ (`TENANT_FILTER=tenant-a,tenant-b`)
* ปลอดภัยต่อการรันซ้ำ (idempotent) ด้วย **cursor** ใน `sensors.stream_state`
* ปรับ batch, interval, max-lag ได้ผ่าน ENV
* Health endpoint: `GET /health` (200 OK)

---

## สถาปัตยกรรมย่อ

```
TimescaleDB (schema = sensors)
   ├─ device_readings       ─┐
   ├─ device_health          ├─(TypeORM)──► streamer.service ──► (KafkaJS) ──► Kafka
   ├─ lab_readings          ─┘
   ├─ sweep_readings
   └─ stream_state (cursor)
```

---

## โครงสร้างโฟลเดอร์ (ย่อ)

```
services/sensor-streamer-service/
├─ src/
│  ├─ configs/config.ts          # โหลด/validate ENV, สร้าง KAFKA/DB config
│  ├─ utils/dataSource.ts        # TypeORM DataSource
│  ├─ utils/kafka.ts             # KafkaJS producer
│  ├─ models/                    # TypeORM entities (ตารางใน sensors)
│  │  ├─ DeviceReading.ts
│  │  ├─ DeviceHealth.ts
│  │  ├─ LabReading.ts
│  │  ├─ SweepReading.ts
│  │  └─ StreamState.ts          # ตารางคอร์สเซอร์ sensors.stream_state
│  ├─ services/streamer.service.ts
│  └─ routes/index.ts            # หน้ารวม/health
├─ Dockerfile
├─ tsconfig.json
└─ README.md  (ไฟล์นี้)
```

---

## การตั้งค่า (ENV)

> บริการอ่าน ENV จาก `process.env` และไฟล์ `.env` (มีตัวช่วยค้นหาไฟล์ และรองรับ `ENV_PATH` ให้ชี้ path เองได้)
> เลขพอร์ตใช้ `SENSOR_STREAMER_PORT` > `PORT` > `7302` ตามลำดับ

### ฐานข้อมูล

| ตัวแปร         | คำอธิบาย         | ตัวอย่าง                                                          |
| -------------- | ---------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | URL แบบ Postgres | `postgresql://postgres:password@timescaledb:5432/sensor_cloud_db` |
| `DB_SCHEMA`    | ชื่อสคีมา        | `sensors`                                                         |

> ถ้าไม่ตั้ง `DATABASE_URL` ระบบจะสังเคราะห์จาก `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` ให้โดยอัตโนมัติ

### Kafka

| ตัวแปร                 | คำอธิบาย                                    | ค่าเริ่มต้น       |
| ---------------------- | ------------------------------------------- | ----------------- |
| `KAFKA_CLIENT_ID`      | clientId                                    | `sensor-streamer` |
| `KAFKA_BROKERS`        | ลิสต์ broker คั่นด้วยจุลภาค                 | เช่น `kafka:9092` |
| `KAFKA_SSL`            | เปิด TLS หรือไม่ (boolean)                  | `false`           |
| `KAFKA_SASL_MECHANISM` | `plain` / `scram-sha-256` / `scram-sha-512` | (ว่าง)            |
| `KAFKA_SASL_USERNAME`  | SASL user                                   | (ว่าง)            |
| `KAFKA_SASL_PASSWORD`  | SASL pass                                   | (ว่าง)            |

### Topics

| ตัวแปร                  | ค่าเริ่มต้น               |
| ----------------------- | ------------------------- |
| `TOPIC_DEVICE_READINGS` | `sensors.device.readings` |
| `TOPIC_DEVICE_HEALTH`   | `sensors.device.health`   |
| `TOPIC_LAB_READINGS`    | `sensors.lab.readings`    |
| `TOPIC_SWEEP_READINGS`  | `sensors.sweep.readings`  |

### Streamer & Server

| ตัวแปร                          | คำอธิบาย                                    | ค่าเริ่มต้น       |
| ------------------------------- | ------------------------------------------- | ----------------- |
| `TENANT_FILTER`                 | กรอง tenant: `tenant-a,tenant-b`            | ว่าง = ทุก tenant |
| `BATCH_SIZE`                    | ขนาด batch                                  | `5000`            |
| `POLL_INTERVAL_MS`              | ระยะเวลาระหว่างรอบ                          | `1000`            |
| `MAX_LAG_SECONDS`               | ขอบเขตเวลา (ตัดอนาคตเกินไป)                 | `60`              |
| `SENSOR_STREAMER_PORT` / `PORT` | พอร์ต HTTP                                  | `7302`            |
| `API_KEY` หรือ `ADMIN_API_KEY`  | key ขั้นต่ำ 8 ตัวอักษร (จำเป็นต้องมีสักตัว) | —                 |
| `ENABLE_PROMETHEUS`             | สำหรับเปิด metric (ถ้ามี endpoint ในโค้ด)   | `true`            |

---

## การรันด้วย Docker Compose

ตัวอย่าง service ใน `docker-compose.yml`:

```yaml
sensor-streamer:
  build:
    context: ./services/sensor-streamer-service
    dockerfile: Dockerfile
  container_name: sensor-streamer
  restart: unless-stopped
  ports:
    - "${SENSOR_STREAMER_PORT:-7302}:7302"
  env_file:
    - .env
  environment:
    DATABASE_URL: "postgresql://${DB_USER}:${DB_PASSWORD}@timescaledb:5432/${DB_NAME}"
    DB_SCHEMA: sensors
    KAFKA_BROKERS: "kafka:9092"
    KAFKA_SSL: "false"
  networks: [farm_cloud]
  depends_on:
    timescaledb:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "node", "-e", "http=require('http');http.get('http://localhost:7302/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]
    interval: 10s
    timeout: 10s
    retries: 5
    start_period: 10s
```

สั่งรัน:

```bash
docker-compose up sensor-streamer
```

ผลลัพธ์ที่คาดหวัง:

* `✅ DataSource initialized`
* `✅ Kafka producer connected`
* `🚀 sensor-streamer-service on http://localhost:7302`
* ถ้าเพิ่งรันครั้งแรก จะมี `INSERT INTO sensors.stream_state ...` เพื่อ bootstrap คอร์สเซอร์

---

## สคีมา & DDL ที่ใช้งาน

> ต้องมีตารางเหล่านี้ในสคีมา `sensors` (และแนะนำให้เป็น **hypertable** ถ้าใช้ TimescaleDB)

**สรุปคีย์ (สำคัญต่อการจัดลำดับอ่าน):**

* `device_readings`: PK (`time`, `tenant_id`, `device_id`, `metric`)
* `device_health`:   PK (`time`, `tenant_id`, `device_id`)
* `lab_readings`:     PK (`time`, `tenant_id`, `station_id`, `sensor_id`, `metric`)
* `sweep_readings`:   PK (`time`, `tenant_id`, `robot_id`, `run_id`, `sensor_id`, `metric`)

**ตารางคอร์สเซอร์**

```sql
CREATE TABLE IF NOT EXISTS sensors.stream_state (
  name       text PRIMARY KEY,          -- ตัวระบุแผน เช่น 'sensors.device_readings'
  last_time  timestamptz NULL,          -- เวลาแถวสุดท้ายที่อ่านแล้ว (cursor)
  tenant_id  text NULL,
  robot_id   text NULL,
  run_id     text NULL,
  sensor_id  text NULL,
  metric     text NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
```

> ถ้าเคยมี `public.stream_state` รูปแบบเก่า (`table_name/last_ts/last_key`) ให้ย้ายไป `sensors.stream_state` ตามโครงสร้างใหม่นี้

---

## รูปแบบข้อความที่ส่งออก Kafka

> ทุก message เป็น JSON (Content-Type: `application/json`) และใส่ key สำหรับ partition

* **Topic: `sensors.device.readings`**

  ```json
  {
    "schema": "sensor.device.v1",
    "ts": "2025-08-18T09:43:04.329Z",
    "tenant_id": "tenant-a",
    "device_id": "dev-1",
    "metric": "temp",
    "value": 25.3,
    "quality": "clean",
    "sensor_id": "s1",
    "payload": { "src": "test" }
  }
  ```

* **Topic: `sensors.device.health`**

  ```json
  {
    "schema": "sensor.health.v1",
    "ts": "2025-08-18T09:43:04.329Z",
    "tenant_id": "tenant-a",
    "device_id": "dev-1",
    "online": true,
    "rssi": -60,
    "uptime_s": 3600,
    "source": "edge",
    "meta": {}
  }
  ```

* **Topic: `sensors.lab.readings`**

  ```json
  {
    "schema": "sensor.lab.v1",
    "ts": "2025-08-18T09:43:04.329Z",
    "tenant_id": "tenant-a",
    "station_id": "st-1",
    "sensor_id": "ph",
    "metric": "pH",
    "value": 6.9,
    "quality": "clean",
    "payload": {}
  }
  ```

* **Topic: `sensors.sweep.readings`**

  ```json
  {
    "schema": "sensor.sweep.v1",
    "ts": "2025-08-18T09:43:04.329Z",
    "tenant_id": "tenant-a",
    "robot_id": "rb-1",
    "run_id": "1001",
    "sensor_id": "LIDAR",
    "metric": "intensity",
    "zone_id": "Z-01",
    "x": 12.34,
    "y": 56.78,
    "value": 0.92,
    "quality": "clean",
    "payload": {}
  }
  ```

---

## ทดสอบแบบเร็ว (seed ข้อมูล + ดู consumer)

> ค่าเริ่มต้นของ `MAX_LAG_SECONDS = 60` ดังนั้นเวลาที่ insert ควร “ย้อนหลัง” เกิน 60 วินาที เพื่อให้ถูกอ่าน

### 1) ใส่ข้อมูลตัวอย่าง (ทุกตาราง)

```bash
# device_readings
docker exec -it farmiq-cloud-timescaledb-1 \
  psql -U postgres -d sensor_cloud_db -c \
"INSERT INTO sensors.device_readings (time,tenant_id,device_id,metric,sensor_id,value,quality,payload)
 VALUES (now() - interval '2 minutes','tenant-a','dev-1','temp','s1',25.3,'clean','{\"src\":\"seed\"}');"

# device_health
docker exec -it farmiq-cloud-timescaledb-1 \
  psql -U postgres -d sensor_cloud_db -c \
"INSERT INTO sensors.device_health (time,tenant_id,device_id,online,source,rssi,uptime_s,meta)
 VALUES (now() - interval '2 minutes','tenant-a','dev-1',true,'edge',-55,7200,'{}');"

# lab_readings
docker exec -it farmiq-cloud-timescaledb-1 \
  psql -U postgres -d sensor_cloud_db -c \
"INSERT INTO sensors.lab_readings (time,tenant_id,station_id,sensor_id,metric,value,quality,payload)
 VALUES (now() - interval '2 minutes','tenant-a','st-1','ph','pH',6.9,'clean','{}');"

# sweep_readings
docker exec -it farmiq-cloud-timescaledb-1 \
  psql -U postgres -d sensor_cloud_db -c \
"INSERT INTO sensors.sweep_readings (time,tenant_id,robot_id,run_id,sensor_id,metric,zone_id,x,y,value,quality,payload)
 VALUES (now() - interval '2 minutes','tenant-a','rb-1',1001,'LIDAR','intensity','Z-01',12.34,56.78,0.92,'clean','{}');"
```

### 2) เปิด consumer ดูข้อความ

```bash
docker exec -it kafka bash -lc "/opt/bitnami/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic sensors.device.readings --from-beginning --timeout-ms 5000"
```

ทำแบบเดียวกันกับ topic อื่นๆ ได้ตามต้องการ

---

## Endpoints

* `GET /health` → `200 OK` (พร้อมข้อความสั้นๆ)
* `GET /` → แสดงรายการสถานะใน `sensors.stream_state` (ขึ้นกับโค้ดใน `routes/index.ts`)

---

## เคล็ดลับ & แก้ปัญหา

* **Kafka ต่อไม่ได้ / TLS error (`ECONNRESET`)**
  ตรวจ `KAFKA_SSL=false` ให้ชัด และ `KAFKA_BROKERS` ต้องใช้ host ภายในเครือข่าย compose เช่น `kafka:9092` (ไม่ใช่พอร์ตที่ map ออกนอก)

* **Timeout: `kafka-1:9092`**
  ใช้ `kafka:9092` แทนชื่อ `kafka-1` หรือระบุ brokers ให้ตรงกับบริการที่รันจริง

* **`.env not found; using process.env only`**
  ไม่ใช่ error แค่เตือนว่าไม่พบไฟล์ `.env`; ถ้าใช้ `env_file: .env` ใน compose แล้ว ข้ามได้
  หรือกำหนด `ENV_PATH=/app/.env` (ตามตำแหน่งไฟล์ใน container) ก็ได้

* **`relation "...sweep_readings" does not exist`**
  ยังไม่ได้สร้างตาราง/สคีมา หรือ `DB_SCHEMA` ไม่ตรง ให้ apply DDL และตั้ง `DB_SCHEMA=sensors` ให้ตรงกับ entity

* **`EntityMetadataNotFoundError: No metadata for "StreamState"`**
  ตรวจว่า import เอนทิตีถูกไฟล์/ชื่อ, `AppDataSource` รวม `StreamState` แล้ว, `dist/` สะอาด (ลองลบแล้ว build ใหม่)

* **ไม่มีข้อความออก Kafka**

  * เวลาที่ insert ต้องย้อนหลังเกิน `MAX_LAG_SECONDS`
  * เช็ค `TENANT_FILTER`
  * ตารางมีข้อมูลจริง และ topics ถูกสร้างแล้ว (ใช้ `kafka-topics.sh --list` ดู)

* **Partitioner warning (KafkaJS v2)**
  โค้ดตั้งค่าใช้ `Partitioners.LegacyPartitioner` เพื่อลดคำเตือนแล้ว

---

## พัฒนา/รันในเครื่อง (ไม่ใช้ Docker)

```bash
# ติดตั้ง
yarn

# สร้างไฟล์ .env (ดูตัวอย่างตัวแปรด้านบน)
cp .env.example .env  # ถ้ามี

# build
yarn build

# รัน
node dist/server.js
# หรือ dev
yarn ts-node-dev src/server.ts
```

---

## สิทธิ์ & ความปลอดภัย

* ตั้ง `API_KEY` หรือ `ADMIN_API_KEY` (ยาว ≥ 8 ตัวอักษร) อย่างน้อยหนึ่งตัว
* ถ้าต้องใช้ TLS/SASL กับ Kafka ให้ตั้งตัวแปร `KAFKA_SSL=true` และ `KAFKA_SASL_*` ให้สอดคล้องกับผู้ให้บริการ

---

## License

ภายในองค์กร/โปรเจกต์ (กำหนดตามนโยบายทีมของคุณ)

---

## คำถามที่พบบ่อย

**Q: ทำไม service ไม่อ่านข้อมูลล่าสุดในทันที?**
A: มีการกัน “อนาคต” ด้วย `MAX_LAG_SECONDS` (เช่น 60s) เพื่อรอความเสถียรของข้อมูล/ไทม์สแตมป์ ให้ insert เวลาย้อนหลังเกินช่วงนี้ หรือปรับค่าลดลง

**Q: อยากอ่านเฉพาะบาง tenant**
A: ตั้ง `TENANT_FILTER=tenant-a,tenant-b`

**Q: ตารางคอร์สเซอร์อยู่ที่ไหน?**
A: `sensors.stream_state` (คีย์หลัก `name` เช่น `sensors.device_readings`) มีคอลัมน์ `last_time` และคีย์ประกอบอื่น ๆ สำหรับช่วยคำนวณ cursor

---
