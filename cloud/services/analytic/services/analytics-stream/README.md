# analytics-stream

Stream processor สำหรับ IoT/telemetry ที่อ่านข้อมูลจาก **Kafka**, ทำ **minute-bucket aggregation** ลง **TimescaleDB**, แคช feature ล่าสุดใน **Redis**, และเผยแพร่สรุปเป็น event ออกไปยัง Kafka อีก topic

* ✔️ **At-least-once & Idempotent**: ใช้ UPSERT ต่อ `bucket`/`tenant`/`device`/`metric`
* ✔️ **Continuous Aggregates** (5 นาที, 1 ชั่วโมง) ด้วย Timescale
* ✔️ **DLQ** สำหรับ payload พัง ๆ (เก็บ error+payload เดิม)
* ✔️ ยืดหยุ่นเรื่องเวลา: รองรับ `time` หรือ `ts` เป็น ISO/epoch(ms|sec)/`YYYY-MM-DD HH:mm:ss`

---

## แกนของระบบ

```
Kafka (sensors.device.readings) ──▶ analytics-stream
                                     ├─ upsert → Timescale: analytics.analytics_minute_features (1m bucket)
                                     ├─ publish finalized 1m features → Kafka: analytics.features
                                     └─ cache last features → Redis (TTL=FEATURE_TTL_SECONDS)
```

### Kafka topics (ค่าเริ่มต้น)

* **IN**  : `sensors.device.readings`
* **OUT** : `analytics.features`
* **DLQ** : `analytics.invalid-readings`

---

## สคีมาข้อมูล

### Input (Kafka → `KAFKA_TOPICS_IN`)

```json
{
  "tenant_id": "tenant-b",
  "device_id": "dev-02",
  "sensor_id": "s-temp",
  "metric": "temp",
  "value": 23.9,
  "time": "2025-08-18T10:51:08.174Z",     // หรือใช้ "ts" แทนได้
  "tags": { "unit": "C" }
}
```

> `time`/`ts` รองรับ: ISO 8601, epoch **ms**, epoch **sec**, หรือ `"YYYY-MM-DD HH:mm:ss[.SSS]"`

### Raw minute bucket (Timescale)

ตาราง: `analytics.analytics_minute_features`
PRIMARY KEY: `(bucket, tenant_id, device_id, metric)`

คอลัมน์:

* `bucket timestamptz` — ปัดลงเป็นจุดนาที
* `tenant_id text`, `device_id text`, `metric text`
* `count bigint`, `sum double`, `min double`, `max double`, `sumsq double`

### Continuous aggregates

* View: `analytics.analytics_5m` (time\_bucket 5 นาที)
* View: `analytics.analytics_1h` (time\_bucket 1 ชั่วโมง)
  มี policy refresh อัตโนมัติ (idempotent migration ป้องกันซ้ำแล้ว)

### Output (Kafka → `KAFKA_TOPIC_OUT`)

ตัวอย่าง payload ที่ publish ต่อ 1 นาที/อุปกรณ์/metric

```json
{
  "bucket": "2025-08-18T10:51:00.000Z",
  "tenant_id": "tenant-b",
  "device_id": "dev-02",
  "metric": "temp",
  "count": 133,
  "min": 23.9,
  "max": 23.9,
  "avg": 23.9,
  "stddev": 0,
  "window": "1m"
}
```

### Redis cache

* key: `feat:<tenant_id>:<device_id>:<metric>:<bucketISO>`
* value: JSON เหมือน payload ที่ publish
* TTL: `FEATURE_TTL_SECONDS` (ค่าเริ่มต้น 86400s = 1 วัน)

### DLQ payload (เมื่อ parse ไม่ผ่าน)

```json
{
  "error": "zod-parse-error",
  "issues": [ ... ],
  "payload": "{...raw-json-string...}"
}
```

---

## การติดตั้ง

### Prerequisites

* Node.js ≥ 18.18
* Kafka cluster (หรือ Redpanda)
* Postgres + TimescaleDB
* Redis

### ติดตั้งและรัน (โหมดโลคอล)

```bash
yarn install
yarn build
yarn start
# dev (ถ้ามี ts-node-dev): yarn dev
```

### ตัวแปรแวดล้อม (สำคัญ)

| ชื่อ                                          | ค่าเริ่มต้น                  | คำอธิบาย                                              |
| --------------------------------------------- | ---------------------------- | ----------------------------------------------------- |
| `SERVICE_NAME`                                | `analytics-stream`           | ชื่อ service                                          |
| `ANALYTIC_STREAM_PORT`                        | `7303`                       | พอร์ต HTTP (`/health`)                                |
| `KAFKA_CLIENT_ID`                             | `analytics-stream`           | clientId Kafka                                        |
| `CONSUMER_GROUP`                              | `analytic-service.v1`        | consumer group                                        |
| `KAFKA_BROKERS`                               | `kafka:9092`                 | comma-separated brokers                               |
| `KAFKA_TOPICS_IN`                             | `sensors.device.readings`    | comma-separated input topics                          |
| `KAFKA_TOPIC_OUT`                             | `analytics.features`         | output topic                                          |
| `KAFKA_TOPIC_DLQ`                             | `analytics.invalid-readings` | DLQ สำหรับ invalid payload                            |
| `DATABASE_URL`                                | —                            | ถ้าไม่กำหนด จะประกอบจาก `DB_*`                        |
| `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` | —                            | รายละเอียด DB (ใช้เมื่อไม่มี `DATABASE_URL`)          |
| `DB_SCHEMA`                                   | `analytics`                  | สคีมาที่ใช้ (migration จะ create schema ถ้าไม่มี)     |
| `REDIS_URL`                                   | `redis://redis:6379`         | ที่อยู่ Redis                                         |
| `FEATURE_TTL_SECONDS`                         | `86400`                      | TTL cache                                             |
| `POLL_INTERVAL_MS`                            | `1000`                       | ช่วงเวลาทำงานของ job publish features                 |
| `BATCH_SIZE`                                  | `5000`                       | batch size (reserved)                                 |
| `MAX_LAG_SECONDS`                             | `60`                         | max lag (reserved/monitoring)                         |
| `TENANT_FILTER`                               | (ว่าง)                       | ถ้าตั้งเป็น `a,b,c` จะ consume เฉพาะ tenants ที่กำหนด |

> หมายเหตุ: โค้ดจะเลือกใช้ `DATABASE_URL` ก่อน ถ้าไม่มีจึง fallback เป็น `DB_*`

---

## Docker Compose

### แนะนำ (ครบชุด dev): Redis + Redpanda + Kafka UI + Timescale + analytics-stream

```yaml
name: farmiq-cloud-analytics
networks: { farmiq-cloud-analytics: { driver: bridge } }
volumes: { redis-data: {}, pg-data: {} }

services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [ "redis-data:/data" ]
    networks: [farmiq-cloud-analytics]

  redpanda:
    image: docker.redpanda.com/redpandadata/redpanda:v23.3.10
    command: [ "redpanda", "start", "--overprovisioned", "--smp", "1",
               "--memory", "512M", "--reserve-memory", "0M",
               "--kafka-addr", "PLAINTEXT://0.0.0.0:9092",
               "--advertise-kafka-addr", "PLAINTEXT://redpanda:9092" ]
    ports: ["9092:9092"]
    networks: [farmiq-cloud-analytics]

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: redpanda:9092
    ports: ["8080:8080"]
    depends_on: [ redpanda ]
    networks: [farmiq-cloud-analytics]

  timescaledb:
    image: timescale/timescaledb:pg15-latest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: sensor_cloud_db
    ports: ["5432:5432"]
    volumes: [ "pg-data:/var/lib/postgresql/data" ]
    networks: [farmiq-cloud-analytics]

  analytics-stream:
    build:
      context: ./services/analytics-stream
      dockerfile: Dockerfile
    env_file: [ ./services/analytics-stream/.env ]
    environment:
      # override ให้ตรงกับ compose นี้
      KAFKA_BROKERS: redpanda:9092
      DATABASE_URL: postgres://postgres:password@timescaledb:5432/sensor_cloud_db
      DB_SCHEMA: analytics
      REDIS_URL: redis://redis:6379
      ANALYTIC_STREAM_PORT: 7303
    depends_on: [ redpanda, timescaledb, redis ]
    networks: [farmiq-cloud-analytics]
    ports: [ "7303:7303" ]
```

> ต้องการ GUI ของ Redis? เพิ่ม `redisinsight` แล้วเปิด `http://localhost:8001`:
>
> ```yaml
> redisinsight:
>   image: redis/redisinsight:latest
>   ports: ["8001:5540"]   # v2 ฟังในคอนเทนเนอร์ที่ 5540
>   networks: [farmiq-cloud-analytics]
>   depends_on: [redis]
> ```

---

## การทำงานภายใน (สรุปโฟลว์)

1. **Consumer** subscribe `KAFKA_TOPICS_IN` และประมวลผลเป็น **batch**

   * Validate ด้วย Zod → normalize `time`/`ts` เป็น `Date`
   * Filter ด้วย `TENANT_FILTER` ถ้าตั้งไว้
   * UPSERT ไปที่ `analytics.analytics_minute_features` (key = minute bucket + tenant/device/metric)

2. **Publisher Job** (ทุก ๆ `POLL_INTERVAL_MS`)

   * คิวรี minute-buckets ที่ **ปิดนาทีแล้ว** (ไม่ใช่นาทีปัจจุบัน)
   * คำนวณ `avg/stddev` แล้ว

     * publish ออก `KAFKA_TOPIC_OUT`
     * cache ลง Redis (TTL = `FEATURE_TTL_SECONDS`)

3. **DLQ**

   * ถ้า Zod parse ไม่ผ่าน (เช่นไม่มี `time`/`ts`) → ส่งลง `KAFKA_TOPIC_DLQ` แล้ว commit offset เพื่อไม่ลูป

4. **Migrations**

   * สร้าง schema/table/hypertable/view/policy ด้วย SQL idempotent (`DO $$ ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;`)
   * ใช้ FQN `analytics.analytics_minute_features` เพื่อไม่พึ่ง `search_path`

---

## ตรวจสุขภาพ / ตรวจผล

* **Health**: `GET http://localhost:7303/health` → 200
* **ดู raw minute table**

  ```sql
  SELECT * FROM analytics.analytics_minute_features
  ORDER BY bucket DESC LIMIT 20;
  ```
* **ดู 5 นาที / 1 ชั่วโมง**

  ```sql
  SELECT * FROM analytics.analytics_5m WHERE device_id='dev-02' ORDER BY bucket DESC LIMIT 5;
  SELECT * FROM analytics.analytics_1h WHERE device_id='dev-02' ORDER BY bucket DESC LIMIT 5;
  ```
* **ตรวจค่าทางสถิติจากแถวเดียว**

  ```sql
  SELECT
    sum / NULLIF(count,0)                              AS avg,
    GREATEST(0, sumsq/NULLIF(count,0) - (sum/NULLIF(count,0))^2) AS variance,
    sqrt(GREATEST(0, sumsq/NULLIF(count,0) - (sum/NULLIF(count,0))^2)) AS stddev
  FROM analytics.analytics_minute_features
  WHERE tenant_id='tenant-b' AND device_id='dev-02' AND metric='temp'
  ORDER BY bucket DESC LIMIT 1;
  ```

---

## ทดสอบอย่างรวดเร็ว

ผลิตข้อความเข้า topic:

```bash
# ตัวอย่าง JSON (ISO)
kcat -b localhost:9092 -t sensors.device.readings -P <<'EOF'
{"tenant_id":"tenant-b","device_id":"dev-02","metric":"temp","value":23.9,"time":"2025-08-18T10:51:08.174Z","sensor_id":"s-temp","tags":{"unit":"C"}}
EOF
```

ดู output:

```bash
kcat -b localhost:9092 -t analytics.features -C -o end -q
```

ดู DLQ:

```bash
kcat -b localhost:9092 -t analytics.invalid-readings -C -o beginning -q
```

---

## แนวทางปรับจูน/ปฏิบัติการ

* **KafkaJS partitioner warning**:
  ถ้าต้องการคงพฤติกรรม partitioning แบบ v1 ให้ใช้:

  ```ts
  import { Partitioners } from 'kafkajs';
  producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  ```

  หรือ set env `KAFKAJS_NO_PARTITIONER_WARNING=1`.

* **TENANT\_FILTER**: ใส่ `TENANT_FILTER=a,b,c` เพื่อลด traffic เฉพาะ tenants ที่สนใจ

* **Idempotency**: UPSERT ทำให้ reprocess ซ้ำ ๆ ไม่ทำให้ค่าบิด

* **Continuous aggregates**: policy ถูกทำให้ idempotent แล้ว; ถ้าต้องลบ/สร้างใหม่ ใช้ migration หรือสั่ง:

  ```sql
  SELECT remove_continuous_aggregate_policy('analytics.analytics_5m');
  SELECT add_continuous_aggregate_policy('analytics.analytics_5m',
    start_offset => '2 hours', end_offset => '5 minutes', schedule_interval => '1 minute');
  ```

---

## โครงสร้างโค้ด (สั้น ๆ)

```
src/
  configs/        # อ่าน/validate env (zod)
  consumers/      # Kafka consumers (batch)
  models/         # entities/views + migrations
  services/
    featurePublisher.ts  # job อ่าน minute bucket แล้ว publish + cache
  stores/
    analyticsFeature.repo.ts  # UPSERT SQL (FQN กับ schema)
    redis.ts
  types/
    events.ts     # Zod schema + time normalization (time|ts)
  utils/
    dataSource.ts # TypeORM DataSource
    kafka.ts      # Kafka client/producer/consumer
    logger.ts
    scheduler.ts  # every(ms, fn)
  server.ts       # bootstrap: DB → migrations → consumers → scheduler → /health
```

---

## License

(ยังไม่ระบุ — เติมภายหลังตามนโยบายของโปรเจกต์)

