# Analytics Platform (stream → worker → api → alerts)

แพลตฟอร์ม analytics สำหรับงานโรงงาน/ฟาร์ม/ไลน์ผลิต ที่วิ่งแบบ real-time ผ่าน Kafka → ประมวลผล/รวมค่าใน TimescaleDB → เปิดอ่านผ่าน API → แจ้งเตือนผ่าน Alerts

```
Edge/IoT/Lab → analytics-stream → Kafka topics
                                   │
                                   ▼
                            analytics-worker
                         (normalize/aggregate/
                         event rollup/anomaly)
                                   │
                          TimescaleDB/Postgres
                                   │
                                   ├── analytics-api (REST)
                                   └── analytics-alerts (notify)
```

---

## TL;DR — อยากให้ติดตั้ง/ทดสอบเร็ว ๆ

1. รัน TimescaleDB และ Kafka (ตาม compose ของคุณ)
2. รัน **analytics-worker** และ **analytics-api**
3. ส่งข้อความทดสอบเข้า Kafka (`sensors.device.readings`)
4. เรียก **analytics-api** ดูผลรวม (agg) → จบ

คำสั่งตัวอย่าง (ในเครื่องที่มี docker compose):

```bash
# 1) DB schema (เฉพาะครั้งแรก)
psql "postgresql://postgres:password@localhost:5432/sensor_cloud_db" -f services/analytic/sql/01_analytics_core.sql
psql "postgresql://postgres:password@localhost:5432/sensor_cloud_db" -f services/analytic/sql/02_analytics_events.sql  # ถ้าใช้ event

# 2) Bring up worker & api (และ kafka, timescaledb)
docker compose up -d timescaledb kafka analytics-worker analytics-api

# 3) ส่ง message ทดสอบ (วิ่งในคอนเทนเนอร์ worker)
docker exec -it analytics-worker python - <<'PY'
from confluent_kafka import Producer; import json, datetime
p=Producer({'bootstrap.servers':'kafka:9092'})
msg={"time":datetime.datetime.utcnow().replace(microsecond=0).isoformat()+"Z",
     "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
     "sensor_id":"s-001","metric":"temp","value":23.7}
p.produce("sensors.device.readings", json.dumps(msg).encode()); p.flush(); print("sent", msg)
PY

# 4) ดึงผลรวมจาก API
curl "http://localhost:7305/v1/agg?tenant_id=t1&factory_id=f1&machine_id=mc-01&metric=temp&window_s=60&start=2025-08-20T00:00:00Z&end=2025-08-21T00:00:00Z"
```

---

## ส่วนประกอบของระบบ

### 1) analytics-stream

**หน้าที่**: ตัวรวบรวม/คอนเนคเตอร์จาก Edge/Device/Lab เข้าสู่ Kafka
**ตัวอย่างแหล่งข้อมูล**: Sensor telemetry, Device health, Sweep batch, Lab results

* ผลิตข้อความไปยัง topics (อย่างน้อย):

  * `sensors.device.readings` (measurement ต่อเนื่อง)
  * `device.health` (online/offline หรือ health score)
  * `sensors.sweep.readings` (batch readings)
  * `lab.results` (QC/QA per analyte)
* **Partitioning/Key (แนะนำ)**: `${tenant_id}-${factory_id}-${machine_id}`
  เพื่อให้ record ที่เกี่ยวข้องไปลงพาร์ติชันเดียวกัน

> หมายเหตุ: ในสภาพจริง `analytics-stream` อาจเป็น set ของ micro-connectors หลายตัว (modbus/mqtt/http/webhook) — หลักคือ “แปลงให้เป็น payload กลางที่ worker เข้าใจ”

---

### 2) analytics-worker

**หน้าที่**: Consumer หลายโดเมน → Normalize → Aggregate/Anomaly → เขียน TimescaleDB
**จุดเด่น**: ปลั๊กอินได้ (registry), เปิด/ปิดโดเมนด้วย ENV, idempotent upsert

* **Kafka topics → handlers** (เริ่มต้น):

  | Topic                     | Handler                 | Kind         | ลงตาราง                                |
  | ------------------------- | ----------------------- | ------------ | -------------------------------------- |
  | `sensors.device.readings` | `handle_sensor_reading` | measurement  | `analytics.analytics_agg`              |
  | `device.health`           | `handle_device_health`  | event/metric | `analytics_event` หรือ `analytics_agg` |
  | `sensors.sweep.readings`  | `handle_sweep_reading`  | event        | `analytics_event` + rollup             |
  | `lab.results`             | `handle_lab_record`     | measurement  | `analytics.analytics_agg`              |

* **Windows** (ค่าเริ่มต้น): `[60, 300, 3600]` วินาที

* **FastAPI (port 7304)**: `/v1/health`, `/v1/metrics`

> ดู README ของ analytics-worker สำหรับรายละเอียด internals (เราใส่ไว้ให้แล้ว)

---

### 3) analytics-api

**หน้าที่**: REST API อ่านข้อมูล analytics จาก DB (บาง เบา เร็ว)
**FastAPI (port 7305)**:

* `GET /v1/health`
* `GET /v1/metrics` (Prometheus)
* `GET /v1/agg` — ดึง aggregate (ต้องระบุ key + metric + window + ช่วงเวลา)
* (ถ้าใช้ events) `GET /v1/event-rollup`

> ดู README ของ analytics-api สำหรับวิธีเรียกละเอียดและกรณีใช้งาน

---

### 4) analytics-alerts

**หน้าที่**: สร้าง “สัญญาณเตือน” เมื่อมีเหตุผิดปกติ/เหตุการณ์สำคัญ
**แหล่ง trigger (เลือกอย่างน้อยหนึ่ง)**

* Query DB: `analytics.analytics_anomaly`, `analytics.analytics_event_rollup` (cron/interval)
* หรือ Consume Kafka topic เช่น `analytics.alerts` (ถ้าให้ worker publish)

**ช่องทางการแจ้ง**

* Slack (Incoming Webhook)
* LINE Notify / Email / Webhook อื่น ๆ

**ตัวอย่าง Rule (เบื้องต้น)**

* Anomaly severity ≥ 3 → แจ้งทันที
* Device offline ต่อเนื่อง > 10 นาที → แจ้ง
* Sweep/Batch fail rate > threshold → แจ้ง
* Lab analyte เกิน spec → แจ้ง

**ENV ที่มักใช้**

```
ALERT_BACKEND=slack
SLACK_WEBHOOK_URL=...
LINE_NOTIFY_TOKEN=...
POLL_INTERVAL_SECONDS=60
# ถ้า query DB
DB_HOST=... DB_PORT=... DB_NAME=... DB_USER=... DB_PASSWORD=...
```

---

## สคีมา/ตาราง (DB)

จำเป็นต้องมีอย่างน้อย:

* `01_analytics_core.sql`

  * `analytics.analytics_agg` (hypertable, aggregate ต่อ window)
  * `analytics.analytics_anomaly`
  * `analytics.analytics_kpi`
  * `analytics.analytics_spec_limits`
  * `analytics.worker_checkpoints`
* (ถ้าใช้ event) `02_analytics_events.sql`

  * `analytics.analytics_event`
  * `analytics.analytics_event_rollup`
* (สะดวกใช้) `10_analytics_views.sql`

  * `v_agg_latest`, `v_anomaly_recent`, `v_kpi_latest`, `v_event_daily`

> สคริปต์ตั้ง compression/retention ให้โดยอัตโนมัติ (idempotent)

---

## รูปแบบข้อมูล (payloads) ที่รองรับ

### sensors.device.readings (measurement)

```json
{
  "time":"2025-08-20T03:12:00Z",
  "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "sensor_id":"s-001","metric":"temp","value":23.7,
  "payload":{"source":"edge-01"}
}
```

### device.health (event หรือ metric)

```json
{ "time":"2025-08-20T03:12:00Z",
  "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "status":"online","level":"ok" }
```

หรือ

```json
{ "time":"2025-08-20T03:12:00Z",
  "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "health_score":0.96 }
```

### sensors.sweep.readings (event summary)

```json
{ "time":"2025-08-20T03:20:00Z",
  "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "metric":"temp","readings":[{"value":23.1},{"value":22.9},{"value":23.6}] }
```

### lab.results (measurement)

```json
{ "time":"2025-08-20T03:25:00Z",
  "tenant_id":"t1","factory_id":"f1",
  "station_id":"lab-01","sample_id":"S-8892",
  "analyte":"Moisture","value":12.4,"unit":"%" }
```

> เวลา (time) ใช้ ISO-8601 + `Z` (UTC) เท่านั้น

---

## ค่าคอนฟิกหลัก (ENV)

ค่ารวมที่มักใช้ซ้ำในหลายบริการ:

| Key                                      | Example                            | หมายเหตุ                                                                   |
| ---------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `KAFKA_BROKERS`                          | `kafka:9092`                       | ใน Docker network เดียวกันใช้ชื่อ service ได้เลย; นอกนั้นใช้ hostname จริง |
| `KAFKA_TOPICS`                           | `["sensors.device.readings", ...]` | analytics-stream ส่งเข้ามา; worker subscribe                               |
| `DOMAINS_ENABLED`                        | `sensor,device,lab,sweep`          | worker ใช้กรอง domain ใน registry                                          |
| `WINDOWS`                                | `[60,300,3600]`                    | worker รวมค่าเป็น window                                                   |
| `DB_HOST/PORT/NAME/USER/PASSWORD/SCHEMA` | —                                  | ทุกบริการที่คุย DB ต้องตั้งให้ถูก                                          |
| `API_HOST/API_PORT`                      | —                                  | แต่ละบริการ API                                                            |

---

## การดีพลอย (Compose แนะนำ)

ตัวอย่างบริการหลัก (โครง):

```yaml
services:
  timescaledb:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: sensor_cloud_db
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL","pg_isready -U postgres -d sensor_cloud_db"]
      interval: 5s
      timeout: 5s
      retries: 10

  kafka:
    image: bitnami/kafka:3
    environment:
      - KAFKA_ENABLE_KRAFT=yes
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
    ports: ["9092:9092"]

  analytics-worker:
    build: ./services/analytic/services/analytics-worker
    env_file: ./services/analytic/services/analytics-worker/.env
    depends_on: { timescaledb: { condition: service_healthy }, kafka: { condition: service_started } }
    ports: ["7304:7304"]

  analytics-api:
    build: ./services/analytic/services/analytics-api
    env_file: ./services/analytic/services/analytics-api/.env
    depends_on: { timescaledb: { condition: service_started } }
    ports: ["7305:7305"]

  analytics-alerts:
    build: ./services/analytic/services/analytics-alerts
    env_file: ./services/analytic/services/analytics-alerts/.env
    depends_on: { timescaledb: { condition: service_started } }
```

> `analytics-stream` อาจรันที่ edge/เกตเวย์คนละ compose ก็ได้ ขอให้เข้าถึง broker ได้

---

## Observability

* **Metrics (Prometheus):**

  * worker: `GET http://<host>:7304/v1/metrics`
  * api:    `GET http://<host>:7305/v1/metrics`
* **Logs:** stdout ทั้งหมด (รวบด้วย Docker/Cloud logging)
* **Dashboards (แนะนำ):** Grafana + Prometheus + PostgreSQL/TimescaleDB datasource

  * กราฟยอดนิยม: Avg(temp) by window, Count events/hour, Device uptime %, ADG trend, Lab pass rate

---

## ความปลอดภัย

* แยก DB user:

  * **worker** = RW (INSERT/UPDATE) บน schema `analytics`
  * **api/alerts** = RO (SELECT)
* เฉพาะ production:

  * เปิด TLS/Authentication สำหรับ Kafka (SASL) ถ้าจำเป็น
  * จำกัด CORS/API auth (JWT/RBAC) ใน analytics-api
  * สำรองข้อมูล TimescaleDB ตามรอบ

---

## Runbook (เมื่อเกิดปัญหา)

1. **API 200 แต่ข้อมูลว่าง (`[]`)**

   * เช็ค `analytics-worker` log มี `[boot] stream worker started` ไหม
   * เช็คว่า **ส่ง message** ไปที่ topic ตรงกับที่ worker subscribe
   * เช็คว่า **registry** ลงทะเบียน handler ของ topic นั้นแล้ว (`init_registry()`)
   * SQL เช็คใน DB:

     ```sql
     SELECT * FROM analytics.analytics_agg ORDER BY bucket_start DESC LIMIT 20;
     SELECT * FROM analytics.analytics_event ORDER BY time DESC LIMIT 20;
     ```

2. **worker หา Kafka ไม่เจอ**

   * ถ้า worker รัน “นอก Docker”: ตั้ง `KAFKA_BROKERS=localhost:9092` หรือ broker จริง (อย่าใช้ `kafka:9092`)
   * ถ้าใน Docker: โอเคใช้ `kafka:9092`

3. **confluent-kafka ไม่ติดตั้ง**

   * ใน Docker เราใส่ `librdkafka1` แล้ว
   * นอก Docker (Windows): `conda install -c conda-forge librdkafka confluent-kafka`

4. **alerts ไม่เด้ง**

   * ทดสอบ webhook (Slack/LINE) ด้วย curl ก่อน
   * ถ้า alerts query DB: รัน SQL ที่ใช้ trigger ด้วยมือดูว่ามีผลลัพธ์ไหม

---

## การเพิ่มโดเมนใหม่ (เร็วและไม่พังของเดิม)

1. เขียน `app/pipelines/map/<domain>.py` (ใน worker) ให้คืน `("measurement" | "event", payload)`
2. `register("my.topic", handle_my_domain, domain="<domain>")` ใน `init_registry()`
3. ตั้ง ENV:

   ```
   DOMAINS_ENABLED=sensor,<domain>
   KAFKA_TOPICS=["sensors.device.readings","my.topic"]
   ```
4. (ถ้าเป็น event) แน่ใจว่ารัน `02_analytics_events.sql` แล้ว

---

## Testing เชิงระบบ (Smoke/Contract)

* **Stream → Worker (schema contract)**: ใช้ชุด JSON example + pytest schema validation
* **Worker aggregate**: ป้อน message 10 ชุดที่ค่า known → ควรได้ avg/sum/min/max ตรง
* **Event rollup**: ยิง event 5 ครั้ง → ควรนับ `count_n=5`
* **API contract**: `openapi.json` ถูกต้อง + 200/422/500 ตามกรณี
* **Alerts**: mock DB ด้วยแถว anomaly severity 4 → ควรยิง webhook 1 ครั้ง

---

## Versioning & Migration

* เวลาจะ “เปลี่ยน schema payload” ให้ bump `schema_version` ใน message (ถ้าจำเป็น) และเพิ่ม backward mapping ใน handler
* DB migration: เพิ่มไฟล์ SQL ใหม่ (ไม่แก้ของเดิม), ใช้ DO $…$ ตรวจ job/policy ซ้ำซ้อนได้
* API version: อยู่ใน path `/v1/*` — ถ้ามี breaking change ให้เพิ่ม `/v2`

---

## Roadmap (ให้ทีมเห็นภาพ)

* Continuous Aggregates บาง metric หนัก ๆ เพื่อลด compute runtime
* KPI/Anomaly rules configurable จาก API + RBAC
* Alerts enrichment (แนบกราฟ/บริบท) และ mute windows
* BFF/GraphQL + realtime subscriptions สำหรับแดชบอร์ด

---

## ใบอนุญาต

ภายในองค์กร / ตามนโยบายทีม
