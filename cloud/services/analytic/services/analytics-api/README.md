# analytics-api

FastAPI service สำหรับอ่านข้อมูล **analytics** จาก TimescaleDB/PostgreSQL
บาง เบา เร็ว และ **รีใช้โค้ดจาก analytics-worker ได้ตรง ๆ** (config/database/domain/utils)

> โฟกัสของ service นี้คือ **Read-only API**: aggregates, anomalies, KPI และ event rollups
> งาน ingest/aggregate มาจาก `analytics-worker` (Kafka → DB)

---

## TL;DR (มือใหม่อยากยิงเร็ว)

```bash
# 1) ตั้ง .env ให้ชี้ DB
cat > .env <<'ENV'
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensor_cloud_db
DB_USER=postgres
DB_PASSWORD=password
DB_SCHEMA=analytics

API_HOST=0.0.0.0
API_PORT=7305
ENV=prod
ENV

# 2) ติดตั้งและรัน (โหมด dev)
pip install -r requirements.txt
python -m app.main

# 3) ทดสอบ
curl http://localhost:7305/v1/health
# {"status":"ok"}
```

ถ้าได้ `[]` จาก `/v1/agg` ให้ดูส่วน **Troubleshooting** ด้านล่าง

---

## คุณสมบัติเด่น

* ✅ **FastAPI + Pydantic v2**: มี OpenAPI/Swagger อัตโนมัติ
* ✅ **รีใช้โค้ดจาก analytics-worker**: `config.py`, `database.py`, `domain/*`, `utils/*`, `instrumentation/*`
* ✅ **Prometheus metrics** ที่ `/v1/metrics`
* ✅ บาง เบา: ไม่มี Kafka/consumer ใน service นี้
* ✅ พร้อมขยายเป็น BFF/GraphQL ในอนาคต (หากต้องการ realtime)

---

## โครงไฟล์ (ที่แนะนำ)

```
analytics-api/
  app/
    __init__.py
    main.py
    v1/
      __init__.py
      endpoint.py        # /v1/health, /v1/metrics
      agg.py             # /v1/agg  (อ่าน analytics_agg)
      events.py          # /v1/event-rollup (ถ้ามี events)
    # ↓ รีใช้มาจาก analytics-worker
    config.py
    database.py
    domain/
      models.py
      rules.py
      windows.py
    utils/
      time.py
      ids.py
      stats.py
      serialization.py
    instrumentation/
      metrics.py
```

> ไม่ต้องเอาอะไรที่เป็น Kafka/worker/scheduler มาใน API

---

## ข้อกำหนดระบบ (Requirements)

* Python 3.11+ (เทียบเท่า base image ของ Dockerfile)
* PostgreSQL 14+/TimescaleDB 2.x (แนะนำ)
* ตาราง/สคีมาต่อไปนี้ **ต้องมี**:

  * `analytics.analytics_agg` (จาก `01_analytics_core.sql`)
  * (เลือกใช้) `analytics.analytics_event`, `analytics.analytics_event_rollup` (จาก `02_analytics_events.sql`)

> ดูหัวข้อ **Migrations/Schema** ถ้าคุณยังไม่รัน SQL

---

## การตั้งค่า (Environment variables)

| ตัวแปร        |       ค่าเริ่มต้น | คำอธิบาย                                    |
| ------------- | ----------------: | ------------------------------------------- |
| `DB_HOST`     |     `timescaledb` | host ของ DB                                 |
| `DB_PORT`     |            `5432` | พอร์ต DB                                    |
| `DB_NAME`     | `sensor_cloud_db` | ชื่อฐานข้อมูล                               |
| `DB_USER`     |        `postgres` | ผู้ใช้ DB (แนะนำใช้ read-only user ใน prod) |
| `DB_PASSWORD` |        `password` | รหัสผ่าน DB                                 |
| `DB_SCHEMA`   |       `analytics` | สคีมาที่เก็บตาราง analytics                 |
| `API_HOST`    |         `0.0.0.0` | host ที่ FastAPI จะ bind                    |
| `API_PORT`    |            `7305` | พอร์ตของ API                                |
| `ENV`         |             `dev` | ป้ายสภาพแวดล้อม (dev/prod)                  |

> โค้ด `Config` รวม `search_path` ให้เรียบร้อย (ชี้ `analytics,public`) ถ้าใช้ `Config.FULL_DATABASE_URL()` ที่มีให้

---

## รันด้วย Docker / Compose

ตัวอย่าง service ใน `docker-compose.yml`:

```yaml
analytics-api:
  build:
    context: ./services/analytic/services/analytics-api
    dockerfile: Dockerfile
  container_name: analytics-api
  restart: unless-stopped
  env_file:
    - ./services/analytic/services/analytics-api/.env
  environment:
    TZ: Asia/Bangkok
    API_HOST: "0.0.0.0"
    API_PORT: "7305"
  depends_on:
    timescaledb:
      condition: service_started
  networks: [farm_cloud]
  ports:
    - "7305:7305"
  healthcheck:
    test: ["CMD", "python", "-c", "import sys,urllib.request;u='http://localhost:7305/v1/health';sys.exit(0 if urllib.request.urlopen(u,timeout=3).getcode()==200 else 1)"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 15s
```

---

## Endpoints

### `GET /v1/health`

* สถานะ service (ใช้เป็น liveness/readiness)
* 200: `{"status":"ok"}`

### `GET /v1/metrics`

* Prometheus metrics ของ FastAPI/app
* `Content-Type: text/plain; version=0.0.4`

### `GET /v1/agg`

อ่าน aggregated metrics จาก `analytics.analytics_agg`

**Query params (จำเป็นเว้นแต่จะระบุว่า optional):**

* `tenant_id`: str
* `factory_id`: str
* `machine_id`: str
* `metric`: str (เช่น `temp`, `humidity`, `lab.moisture`)
* `window_s`: int (เช่น 60/300/3600)
* `start`: ISO8601 (เช่น `2025-08-20T00:00:00Z`)
* `end`: ISO8601 (exclusive)
* `sensor_id`: str (optional)
* `limit`: int (default 1000, 1–10000)

**ตัวอย่างเรียกใช้**

```bash
curl "http://localhost:7305/v1/agg?tenant_id=t1&factory_id=f1&machine_id=mc-01&metric=temp&window_s=60&start=2025-08-20T00:00:00Z&end=2025-08-21T00:00:00Z"
```

**ตัวอย่างผลลัพธ์**

```json
[
  {
    "bucket_start": "2025-08-20T09:20:00+00:00",
    "window_s": 60,
    "tenant_id": "t1",
    "factory_id": "f1",
    "machine_id": "mc-01",
    "sensor_id": "s-001",
    "metric": "temp",
    "count_n": 5,
    "sum_val": 118.5,
    "avg_val": 23.7,
    "min_val": 23.4,
    "max_val": 24.0,
    "stddev_val": 0.2,
    "p95_val": 24.0
  }
]
```

### (ถ้ามี events) `GET /v1/event-rollup`

อ่านสรุปเหตุการณ์จาก `analytics.analytics_event_rollup`

**Query params**

* `tenant_id`, `domain`, `entity_type`, `entity_id`, `event_type`: str
* `window_s`: int
* `start`, `end`: ISO8601
* `limit`: int (default 1000)

**ตัวอย่าง**

```bash
curl "http://localhost:7305/v1/event-rollup?tenant_id=t1&domain=device&entity_type=machine&entity_id=mc-01&event_type=status&window_s=3600&start=2025-08-20T00:00:00Z&end=2025-08-21T00:00:00Z"
```

---

## Migrations / Schema ที่จำเป็น

**ต้องมีอย่างน้อย:**

* `01_analytics_core.sql` (ตาราง: `analytics_agg`, `analytics_anomaly`, `analytics_kpi`, `analytics_spec_limits`, `worker_checkpoints`)

**ถ้าจะใช้ event/device\_health/sweep:**

* `02_analytics_events.sql` (ตาราง: `analytics_event`, `analytics_event_rollup`)

**อำนวยความสะดวก:**

* `10_analytics_views.sql` (views: `v_agg_latest`, `v_anomaly_recent`, `v_kpi_latest`, `v_event_daily`)

**ตัวอย่างรัน**

```bash
psql "$DATABASE_URL" -f 01_analytics_core.sql
psql "$DATABASE_URL" -f 02_analytics_events.sql      # ถ้าต้องการ events
psql "$DATABASE_URL" -f 10_analytics_views.sql
```

---

## ความปลอดภัย (แนะนำอย่างแรง)

สร้าง **read-only user** สำหรับ API แยกจาก worker:

```sql
-- สร้าง role เฉพาะอ่าน
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='analytics_ro') THEN
    CREATE ROLE analytics_ro LOGIN PASSWORD 'change_me';
  END IF;
END $$;

GRANT USAGE ON SCHEMA analytics TO analytics_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analytics_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT ON TABLES TO analytics_ro;

-- (ถ้าใช้ views/seq อื่น เติม grant ตามเหมาะสม)
```

แล้วตั้ง `.env` ของ API ให้ใช้ user นี้:

```
DB_USER=analytics_ro
DB_PASSWORD=change_me
```

---

## Observability

* **Metrics**: `GET /v1/metrics` (Prometheus scrape ได้)
* **Logs**: stdout (uvicorn) — จับด้วย Docker/Compose/Cloud logging
* (Optional) **Tracing**: ถ้าเปิด OTEL ในโปรเจกต์อยู่แล้ว สามารถใส่ได้ไม่ยาก

---

## การพัฒนา (Dev)

* Run local:

  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port 7305 --reload
  ```
* Swagger UI:

  ```
  http://localhost:7305/docs
  ```
* OpenAPI JSON:

  ```
  http://localhost:7305/openapi.json
  ```

---

## การรีใช้โค้ดจาก analytics-worker

**รีใช้ได้ทันที**:

* `app/config.py`, `app/database.py`
* `app/domain/models.py` (+ ไฟล์ domain อื่น ๆ)
* `app/utils/*`
* `app/instrumentation/metrics.py`

> อย่าเอาพวก `adapters/kafka_*`, `workers/*`, `pipelines/*` มาใน API

---

## ตัวอย่าง SQL เช็คข้อมูล

```sql
-- ดู aggregate ล่าสุด
SELECT bucket_start, window_s, tenant_id, factory_id, machine_id, sensor_id, metric, avg_val, count_n
FROM analytics.analytics_agg
ORDER BY bucket_start DESC
LIMIT 20;

-- (ถ้าใช้ event) ดู event rollup
SELECT bucket_start, window_s, domain, entity_type, entity_id, event_type, count_n, avg_val
FROM analytics.analytics_event_rollup
ORDER BY bucket_start DESC
LIMIT 20;
```

---

## Troubleshooting

* `GET /v1/agg` คืน `[]`
  → มักเป็นเพราะยังไม่มีแถวใน `analytics_agg` ช่วงเวลาที่ query
  เช็ค:

  1. `analytics-worker` รันอยู่และเขียน DB ได้จริง
  2. `tenant_id/factory_id/machine_id/metric` ตรงกับที่ ingest
  3. `start/end` ครอบคลุมเวลา (ใช้ UTC + “Z”)

* 422 Unprocessable Entity
  → ขาดพารามิเตอร์ หรือรูปแบบ time ไม่ใช่ ISO8601

* 500 DB error
  → ตรวจ `DB_*` ใน `.env`, สิทธิ์ user, หรือ `DB_SCHEMA` ให้ถูกต้อง

* CORS ปฏิเสธ (เวลาเรียกจาก frontend browser)
  → เปิด CORS ใน `app.main` (ใส่ `from fastapi.middleware.cors import CORSMiddleware` แล้วเพิ่ม middleware)

* Compose เตือน `"The "p" variable is not set."`
  → ในไฟล์ compose มี `${p}` ที่ไม่มีการกำหนดค่าไว้ — ลบ/กำหนดค่าให้มัน

---

## Roadmap (สั้น ๆ)

* `/v1/anomalies` และ `/v1/kpi`
* ค่าตั้ง (spec/limits) แบบแก้ไขได้ด้วย RBAC (admin only)
* Caching (Redis) สำหรับ query หนัก ๆ
* BFF/GraphQL service แยก (Node/TS) ถ้าต้อง realtime/subscriptions

---

## ใบอนุญาต (License)

ภายในองค์กร / ตามที่ทีมคุณกำหนด
