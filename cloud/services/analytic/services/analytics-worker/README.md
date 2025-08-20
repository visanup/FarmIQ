# analytics-worker

Kafka → (normalize/aggregate/anomaly/KPI) → TimescaleDB
พร้อม **FastAPI** endpoint เล็ก ๆ เพื่อ health/metrics และ **registry** สำหรับต่อโดเมนใหม่แบบปลั๊กอิน

> จุดประสงค์: “กินข้อมูลจาก edge หลายโดเมน แล้วสรุปลงตาราง analytics ให้ `analytics-api` อ่านได้ไว”
> ทำงานแบบ **streaming** (low-latency) + **idempotent** (รันซ้ำได้ ปลอดภัย)

---

## TL;DR — อยากให้รันเลย ทำแบบนี้

```bash
# 1) สร้าง .env
cat > .env <<'ENV'
# --- DB ---
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensor_cloud_db
DB_USER=postgres
DB_PASSWORD=password
DB_SCHEMA=analytics

# --- Kafka (ตัวอย่างใน Docker compose) ---
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=analytics-stream
CONSUMER_GROUP=analytic-service.v1

# โดเมนที่เปิดใช้ + ท็อปปิคที่กิน
DOMAINS_ENABLED=sensor,device,lab,sweep
KAFKA_TOPICS=["sensors.device.readings","device.health","sensors.sweep.readings","lab.results"]

# หน้าต่างเวลา (วินาที)
WINDOWS=[60,300,3600]

# API/Worker flags
ENABLE_WORKER=1
ENABLE_SCHEDULER=0
API_HOST=0.0.0.0
ANALYTICS_WORKER_PORT=7304
ENV=prod
ENV

# 2) รัน migrations (ต้องมี TimescaleDB)
psql "postgresql://postgres:password@localhost:5432/sensor_cloud_db" -f sql/01_analytics_core.sql
psql "postgresql://postgres:password@localhost:5432/sensor_cloud_db" -f sql/02_analytics_events.sql  # ถ้าใช้ device/sweep/lab events

# 3) Docker (แนะนำ)
docker compose up analytics-worker
# หรือ dev local:
pip install -r requirements.txt
python -m app.main
```

ทดสอบเร็ว:

```bash
curl http://localhost:7304/v1/health   # {"status":"ok"}
```

---

## สถาปัตยกรรมย่อ

```
Kafka topics ──► stream_worker ─┬─► normalize (registry mappers)
                                 ├─► aggregate (WINDOWS: 60,300,3600) ─► analytics.analytics_agg
                                 ├─► anomalies/KPI (optional) ────────► analytics.analytics_anomaly / analytics.analytics_kpi
                                 └─► events + rollup (device/sweep/ops/econ) ─► analytics.analytics_event[_rollup]

FastAPI (port 7304):
  GET /v1/health    → liveness/readiness
  GET /v1/metrics   → Prometheus metrics
```

---

## โครงไฟล์

```
analytics-worker/
  app/
    main.py                      # start FastAPI + worker (และ scheduler แบบ optional)
    config.py                    # อ่าน .env และ build DATABASE_URL (มี search_path)
    database.py                  # SQLAlchemy engine/session
    v1/
      endpoint.py                # /v1/health, /v1/metrics
    adapters/
      kafka_consumer.py          # build_consumer() (confluent-kafka)
      repository.py              # upsert_agg / insert_event / upsert_event_rollup / ...
    domain/
      models.py                  # Pydantic models (Measurement, Aggregate, Anomaly)
      rules.py, windows.py
    pipelines/
      registry.py                # register(topic→handler), topics(), handler_for()
      map/
        sensor.py                # handle_sensor_reading()
        device_health.py         # handle_device_health()
        sweep.py                 # handle_sweep_reading()
        lab.py                   # handle_lab_record()
        # เพิ่มโดเมนใหม่วางที่นี่
      __init__.py                # init_registry() : register ทุก handler
    services/
      aggregator.py              # aggregate(measurements, WINDOWS)
      anomaly_detector.py        # (optional)
      kpi.py                     # (optional)
      backfill.py                # (optional)
    instrumentation/
      metrics.py, tracing.py
    utils/
      time.py, ids.py, stats.py, serialization.py
    workers/
      stream_worker.py           # วน consume → map → write DB
      scheduler.py               # APScheduler (optional)
  Dockerfile
  requirements.txt
  sql/
    01_analytics_core.sql
    02_analytics_events.sql
    10_analytics_views.sql
```

---

## Handlers & Topics ที่รองรับ (เริ่มต้น)

| Topic                     | Handler                 | kind         | ลงตาราง                     |
| ------------------------- | ----------------------- | ------------ | --------------------------- |
| `sensors.device.readings` | `handle_sensor_reading` | measurement  | `analytics_agg`             |
| `device.health`           | `handle_device_health`  | event/metric | `analytics_event` / `agg`   |
| `sensors.sweep.readings`  | `handle_sweep_reading`  | event        | `analytics_event` (+rollup) |
| `lab.results`             | `handle_lab_record`     | measurement  | `analytics_agg`             |

> เปิด/ปิดโดเมนด้วย `DOMAINS_ENABLED` และกำหนด topics ใน `KAFKA_TOPICS`
> ถ้าไม่ได้ตั้ง `KAFKA_TOPICS` worker จะ subscribe ตาม `registry.topics()` (ที่กรองด้วย `DOMAINS_ENABLED`)
> **ไม่ว่าอย่างไร handler ต้องถูก register** (เรียก `init_registry()` ตอนบูตแล้ว)

---

## รูปแบบ Payload (ตัวอย่างจาก edge)

**sensor (numeric → agg)**

```json
{
  "time":"2025-08-20T03:12:00Z",
  "tenant_id":"t1", "factory_id":"f1", "machine_id":"mc-01",
  "sensor_id":"s-001", "metric":"temp", "value":23.7
}
```

**device.health (event หรือ metric)**

```json
{ "time":"2025-08-20T03:12:00Z", "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "status":"online","level":"ok" }
```

หรือ

```json
{ "time":"2025-08-20T03:12:00Z", "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "health_score":0.96 }
```

**sweep (event summary)**

```json
{ "time":"2025-08-20T03:20:00Z", "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "metric":"temp", "readings":[{"value":23.1},{"value":22.9},{"value":23.6}] }
```

**lab (measurement → agg)**

```json
{ "time":"2025-08-20T03:25:00Z", "tenant_id":"t1","factory_id":"f1",
  "station_id":"lab-01","sample_id":"S-8892",
  "analyte":"Moisture","value":12.4,"unit":"%" }
```

---

## Environment Variables

| Key                     | Example                                                                              | หมายเหตุ                                               |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `DB_HOST`               | `timescaledb`                                                                        | host DB                                                |
| `DB_PORT`               | `5432`                                                                               | —                                                      |
| `DB_NAME`               | `sensor_cloud_db`                                                                    | —                                                      |
| `DB_USER`               | `postgres`                                                                           | แนะนำ user เฉพาะงาน (RW)                               |
| `DB_PASSWORD`           | `password`                                                                           | —                                                      |
| `DB_SCHEMA`             | `analytics`                                                                          | search\_path ถูกตั้งโดย `Config`                       |
| `KAFKA_BROKERS`         | `kafka:9092`                                                                         | ถ้ารันนอก Docker ใช้ `localhost:9092` หรือ broker จริง |
| `KAFKA_CLIENT_ID`       | `analytics-stream`                                                                   | —                                                      |
| `CONSUMER_GROUP`        | `analytic-service.v1`                                                                | —                                                      |
| `KAFKA_TOPICS`          | `["sensors.device.readings","device.health","sensors.sweep.readings","lab.results"]` | JSON list หรือปล่อยว่างให้ `registry` ดูแล             |
| `DOMAINS_ENABLED`       | `sensor,device,lab,sweep`                                                            | กรอง domain ใน `registry`                              |
| `WINDOWS`               | `[60,300,3600]`                                                                      | หน้าต่างเวลา (วินาที)                                  |
| `ENABLE_WORKER`         | `1`                                                                                  | เปิด/ปิด thread worker                                 |
| `ENABLE_SCHEDULER`      | `0`                                                                                  | ต้องติดตั้ง `apscheduler` ก่อนถ้าจะเปิด                |
| `API_HOST`              | `0.0.0.0`                                                                            | host FastAPI                                           |
| `ANALYTICS_WORKER_PORT` | `7304`                                                                               | port FastAPI                                           |
| `ENV`                   | `dev`/`prod`                                                                         | ป้ายสภาพแวดล้อม                                        |

---

## การรัน (3 วิธี)

### 1) Docker Compose (แนะนำ)

```bash
docker compose up analytics-worker
```

healthcheck ใน compose เช็ค `/v1/health` ภายในคอนเทนเนอร์โดยตรง

### 2) Docker build + run

```bash
docker build -t analytics-worker .
docker run --rm --name analytics-worker --env-file .env -p 7304:7304 analytics-worker
```

### 3) Dev local (Windows/macOS/Linux)

> ต้องติดตั้ง `confluent-kafka` ให้สำเร็จ + ตั้ง `KAFKA_BROKERS` ให้ชี้ถึง broker ได้จริง

```bash
pip install -r requirements.txt
python -m app.main
```

**Windows tip (ถ้า pip มีปัญหา)**
ลอง:

```bash
conda install -c conda-forge librdkafka=2.3.* confluent-kafka=2.4.0
```

---

## Database Schema (จำเป็น)

รันตามลำดับ:

* `sql/01_analytics_core.sql` → `analytics_agg`, `analytics_anomaly`, `analytics_kpi`, `analytics_spec_limits`, `worker_checkpoints`
* `sql/02_analytics_events.sql` → `analytics_event`, `analytics_event_rollup` (จำเป็นถ้าใช้ device/sweep/ops/econ/vet แบบ event)
* (optional) `sql/10_analytics_views.sql` → views สะดวกใช้

> สคริปต์ตั้ง compression & retention policy ให้ตารางใหญ่ ๆ แบบ idempotent

---

## วิธีทดสอบ end-to-end

1. ส่ง message ตัวอย่างเข้าคิว:

```bash
docker exec -it analytics-worker python - <<'PY'
from confluent_kafka import Producer; import json, datetime
p=Producer({'bootstrap.servers':'kafka:9092'})
msg={"time":datetime.datetime.utcnow().replace(microsecond=0).isoformat()+"Z",
     "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
     "sensor_id":"s-001","metric":"temp","value":23.7}
p.produce("sensors.device.readings", json.dumps(msg).encode()); p.flush(); print("sent", msg)
PY
```

2. ดูผลใน DB:

```bash
docker exec -it farmiq-cloud-timescaledb-1 psql -U postgres -d sensor_cloud_db -c \
"SELECT bucket_start,window_s,tenant_id,factory_id,machine_id,metric,avg_val,count_n
 FROM analytics.analytics_agg
 ORDER BY bucket_start DESC LIMIT 5;"
```

3. (ถ้าใช้ event) ดู `analytics_event`/`analytics_event_rollup`:

```bash
docker exec -it farmiq-cloud-timescaledb-1 psql -U postgres -d sensor_cloud_db -c \
"SELECT time,domain,entity_type,entity_id,event_type,value FROM analytics.analytics_event ORDER BY time DESC LIMIT 5;"
```

---

## การเพิ่มโดเมน/ท็อปปิคใหม่ (How-to)

1. **เขียน handler** ใน `app/pipelines/map/<domain>.py`

   * รับ `dict` → คืน `(kind, payload_dict)` โดย `kind` เป็น `"measurement"` หรือ `"event"`

2. **register** ใน `app/pipelines/__init__.py`

```python
from app.pipelines.registry import register
from app.pipelines.map.my_domain import handle_my_domain

def init_registry():
    register("my.topic.name", handle_my_domain, domain="my_domain")
```

3. ตั้งค่า `.env`

```
DOMAINS_ENABLED=sensor,my_domain
KAFKA_TOPICS=["sensors.device.readings","my.topic.name"]
```

4. รีสตาร์ต worker

> **measurement** → ไป `analytics_agg`
> **event** → ไป `analytics_event` + rollup (`analytics_event_rollup`)

---

## Observability

* **/v1/health** — liveness/readiness
* **/v1/metrics** — Prometheus (รวม process/http metrics)
* **Logs** — stdout (uvicorn + worker)
* **Tracing (optional)** — `app/instrumentation/tracing.py` (รองรับ OTEL ถ้าติดตั้ง)

---

## Performance & Reliability Notes

* **Batch consume**: `consume(num_messages=500, timeout=1.0)` → ปรับเพิ่ม/ลดตาม throughput
* **Commit**: commit หลังเขียน DB สำเร็จ (at-least-once); ใช้ upsert/PK เพื่อ idempotency
* **Windows**: หน้าต่างเวลาใน `WINDOWS` ส่งผลต่อจำนวนแถวใน `analytics_agg` — เลือกเท่าที่ต้องใช้
* **Retention**: นโยบายเก็บข้อมูลอยู่ในไฟล์ SQL (ปรับให้เหมาะกับปริมาณจริง)
* **Graceful shutdown**: ใช้ `tini` + signal handler (`_stop` event) ปิด worker นิ่ม ๆ

---

## Troubleshooting

* `No module named 'confluent_kafka'`
  → ติดตั้ง `confluent-kafka` และมี `librdkafka` runtime (ใน Docker เราใส่ `librdkafka1` ให้แล้ว)

* `unsupported operand type(s) for |: '_CallableGenericAlias' and 'NoneType'`
  → เกิดจาก type hint `A | None` บางไฟล์ใน Python เก่า แก้เป็น `Optional[A]` (โปรเจกต์นี้แก้ให้แล้ว)

* ได้ `[]` ในตาราง aggregate/จาก API
  → ตรวจว่า handler ของ topic นั้นถูก `register` แล้ว, `DOMAINS_ENABLED` เปิด domain นั้น, และช่วงเวลาที่ query ครอบเวลาข้อมูล

* ต่อ Kafka ไม่ติดใน dev local
  → ตั้ง `KAFKA_BROKERS=localhost:9092` (ไม่ใช่ `kafka:9092` ถ้าไม่ได้อยู่ใน Docker network เดียวกัน) และตรวจ `advertised.listeners` ของ broker

* compose เตือน `"The "p" variable is not set."`
  → มี `${p}` ในไฟล์ compose ที่ไม่ได้กำหนดค่า—ลบหรือกำหนดค่าให้มัน

---

## ความปลอดภัย

* Worker ต้องใช้ DB user ที่มีสิทธิ์ **INSERT/UPDATE** ใน `analytics` schema
* แยก user สำหรับ **API (read-only)** ออกจาก **worker (write)**
* ถ้าต้องการ multi-tenant แนะนำเติม Row Level Security (RLS) ในภายหลัง

---

## Roadmap (สั้น ๆ)

* Continuous Aggregates (Timescale) สำหรับบาง metric หนัก ๆ
* Backfill tooling แบบ CLI (อ่านจาก raw view)
* Rule engine (WE rules) + auto-anomaly insert
* Retries/Dead-letter queue (DLQ) สำหรับ payload พัง

---

## License

ภายในองค์กร / ตามที่ทีมของคุณกำหนด

