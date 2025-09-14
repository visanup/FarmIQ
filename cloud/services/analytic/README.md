# Analytics Platform (stream โ’ worker โ’ api โ’ alerts)

เนเธเธฅเธ•เธเธญเธฃเนเธก analytics เธชเธณเธซเธฃเธฑเธเธเธฒเธเนเธฃเธเธเธฒเธ/เธเธฒเธฃเนเธก/เนเธฅเธเนเธเธฅเธดเธ• เธ—เธตเนเธงเธดเนเธเนเธเธ real-time เธเนเธฒเธ Kafka โ’ เธเธฃเธฐเธกเธงเธฅเธเธฅ/เธฃเธงเธกเธเนเธฒเนเธ TimescaleDB โ’ เน€เธเธดเธ”เธญเนเธฒเธเธเนเธฒเธ API โ’ เนเธเนเธเน€เธ•เธทเธญเธเธเนเธฒเธ Alerts

```
Edge/IoT/Lab โ’ analytics-stream โ’ Kafka topics
                                   โ”
                                   โ–ผ
                            analytics-worker
                         (normalize/aggregate/
                         event rollup/anomaly)
                                   โ”
                          TimescaleDB/Postgres
                                   โ”
                                   โ”โ”€โ”€ analytics-api (REST)
                                   โ””โ”€โ”€ analytics-alerts (notify)
```

---

## TL;DR โ€” เธญเธขเธฒเธเนเธซเนเธ•เธดเธ”เธ•เธฑเนเธ/เธ—เธ”เธชเธญเธเน€เธฃเนเธง เน

1. เธฃเธฑเธ TimescaleDB เนเธฅเธฐ Kafka (เธ•เธฒเธก compose เธเธญเธเธเธธเธ“)
2. เธฃเธฑเธ **analytics-worker** เนเธฅเธฐ **analytics-api**
3. เธชเนเธเธเนเธญเธเธงเธฒเธกเธ—เธ”เธชเธญเธเน€เธเนเธฒ Kafka (`sensors.device.readings`)
4. เน€เธฃเธตเธขเธ **analytics-api** เธ”เธนเธเธฅเธฃเธงเธก (agg) โ’ เธเธ

เธเธณเธชเธฑเนเธเธ•เธฑเธงเธญเธขเนเธฒเธ (เนเธเน€เธเธฃเธทเนเธญเธเธ—เธตเนเธกเธต docker compose):

```bash
# 1) DB schema (เน€เธเธเธฒเธฐเธเธฃเธฑเนเธเนเธฃเธ)
psql "postgresql://postgres:password@localhost:5432/sensor_cloud_db" -f services/analytic/sql/01_analytics_core.sql
psql "postgresql://postgres:password@localhost:5432/sensor_cloud_db" -f services/analytic/sql/02_analytics_events.sql  # เธ–เนเธฒเนเธเน event

# 2) Bring up worker & api (เนเธฅเธฐ kafka, timescaledb)
docker compose up -d timescaledb kafka analytics-worker analytics-api

# 3) เธชเนเธ message เธ—เธ”เธชเธญเธ (เธงเธดเนเธเนเธเธเธญเธเน€เธ—เธเน€เธเธญเธฃเน worker)
docker exec -it analytics-worker python - <<'PY'
from confluent_kafka import Producer; import json, datetime
p=Producer({'bootstrap.servers':'kafka:9092'})
msg={"time":datetime.datetime.utcnow().replace(microsecond=0).isoformat()+"Z",
     "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
     "sensor_id":"s-001","metric":"temp","value":23.7}
p.produce("sensors.device.readings", json.dumps(msg).encode()); p.flush(); print("sent", msg)
PY

# 4) เธ”เธถเธเธเธฅเธฃเธงเธกเธเธฒเธ API
curl "http://localhost:7305/v1/agg?tenant_id=t1&factory_id=f1&machine_id=mc-01&metric=temp&window_s=60&start=2025-08-20T00:00:00Z&end=2025-08-21T00:00:00Z"
```

---

## เธชเนเธงเธเธเธฃเธฐเธเธญเธเธเธญเธเธฃเธฐเธเธ

### 1) analytics-stream

**เธซเธเนเธฒเธ—เธตเน**: เธ•เธฑเธงเธฃเธงเธเธฃเธงเธก/เธเธญเธเน€เธเธเน€เธ•เธญเธฃเนเธเธฒเธ Edge/Device/Lab เน€เธเนเธฒเธชเธนเน Kafka
**เธ•เธฑเธงเธญเธขเนเธฒเธเนเธซเธฅเนเธเธเนเธญเธกเธนเธฅ**: Sensor telemetry, Device health, Sweep batch, Lab results

* เธเธฅเธดเธ•เธเนเธญเธเธงเธฒเธกเนเธเธขเธฑเธ topics (เธญเธขเนเธฒเธเธเนเธญเธข):

  * `sensors.device.readings` (measurement เธ•เนเธญเน€เธเธทเนเธญเธ)
  * `device.health` (online/offline เธซเธฃเธทเธญ health score)
  * `sensors.sweep.readings` (batch readings)
  * `lab.results` (QC/QA per analyte)
* **Partitioning/Key (เนเธเธฐเธเธณ)**: `${tenant_id}-${factory_id}-${machine_id}`
  เน€เธเธทเนเธญเนเธซเน record เธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธเนเธเธฅเธเธเธฒเธฃเนเธ•เธดเธเธฑเธเน€เธ”เธตเธขเธงเธเธฑเธ

> เธซเธกเธฒเธขเน€เธซเธ•เธธ: เนเธเธชเธ เธฒเธเธเธฃเธดเธ `analytics-stream` เธญเธฒเธเน€เธเนเธ set เธเธญเธ micro-connectors เธซเธฅเธฒเธขเธ•เธฑเธง (modbus/mqtt/http/webhook) โ€” เธซเธฅเธฑเธเธเธทเธญ โ€เนเธเธฅเธเนเธซเนเน€เธเนเธ payload เธเธฅเธฒเธเธ—เธตเน worker เน€เธเนเธฒเนเธโ€

---

### 2) analytics-worker

**เธซเธเนเธฒเธ—เธตเน**: Consumer เธซเธฅเธฒเธขเนเธ”เน€เธกเธ โ’ Normalize โ’ Aggregate/Anomaly โ’ เน€เธเธตเธขเธ TimescaleDB
**เธเธธเธ”เน€เธ”เนเธ**: เธเธฅเธฑเนเธเธญเธดเธเนเธ”เน (registry), เน€เธเธดเธ”/เธเธดเธ”เนเธ”เน€เธกเธเธ”เนเธงเธข ENV, idempotent upsert

* **Kafka topics โ’ handlers** (เน€เธฃเธดเนเธกเธ•เนเธ):

  | Topic                     | Handler                 | Kind         | เธฅเธเธ•เธฒเธฃเธฒเธ                                |
  | ------------------------- | ----------------------- | ------------ | -------------------------------------- |
  | `sensors.device.readings` | `handle_sensor_reading` | measurement  | `analytics.analytics_agg`              |
  | `device.health`           | `handle_device_health`  | event/metric | `analytics_event` เธซเธฃเธทเธญ `analytics_agg` |
  | `sensors.sweep.readings`  | `handle_sweep_reading`  | event        | `analytics_event` + rollup             |
  | `lab.results`             | `handle_lab_record`     | measurement  | `analytics.analytics_agg`              |

* **Windows** (เธเนเธฒเน€เธฃเธดเนเธกเธ•เนเธ): `[60, 300, 3600]` เธงเธดเธเธฒเธ—เธต

* **FastAPI (port 7304)**: `/v1/health`, `/v1/metrics`

> เธ”เธน README เธเธญเธ analytics-worker เธชเธณเธซเธฃเธฑเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” internals (เน€เธฃเธฒเนเธชเนเนเธงเนเนเธซเนเนเธฅเนเธง)

---

### 3) analytics-api

**เธซเธเนเธฒเธ—เธตเน**: REST API เธญเนเธฒเธเธเนเธญเธกเธนเธฅ analytics เธเธฒเธ DB (เธเธฒเธ เน€เธเธฒ เน€เธฃเนเธง)
**FastAPI (port 7305)**:

* `GET /v1/health`
* `GET /v1/metrics` (Prometheus)
* `GET /v1/agg` โ€” เธ”เธถเธ aggregate (เธ•เนเธญเธเธฃเธฐเธเธธ key + metric + window + เธเนเธงเธเน€เธงเธฅเธฒ)
* (เธ–เนเธฒเนเธเน events) `GET /v1/event-rollup`

> เธ”เธน README เธเธญเธ analytics-api เธชเธณเธซเธฃเธฑเธเธงเธดเธเธตเน€เธฃเธตเธขเธเธฅเธฐเน€เธญเธตเธขเธ”เนเธฅเธฐเธเธฃเธ“เธตเนเธเนเธเธฒเธ

---

### 4) analytics-alerts

**เธซเธเนเธฒเธ—เธตเน**: เธชเธฃเนเธฒเธ โ€เธชเธฑเธเธเธฒเธ“เน€เธ•เธทเธญเธโ€ เน€เธกเธทเนเธญเธกเธตเน€เธซเธ•เธธเธเธดเธ”เธเธเธ•เธด/เน€เธซเธ•เธธเธเธฒเธฃเธ“เนเธชเธณเธเธฑเธ
**เนเธซเธฅเนเธ trigger (เน€เธฅเธทเธญเธเธญเธขเนเธฒเธเธเนเธญเธขเธซเธเธถเนเธ)**

* Query DB: `analytics.analytics_anomaly`, `analytics.analytics_event_rollup` (cron/interval)
* เธซเธฃเธทเธญ Consume Kafka topic เน€เธเนเธ `analytics.alerts` (เธ–เนเธฒเนเธซเน worker publish)

**เธเนเธญเธเธ—เธฒเธเธเธฒเธฃเนเธเนเธ**

* Slack (Incoming Webhook)
* LINE Notify / Email / Webhook เธญเธทเนเธ เน

**เธ•เธฑเธงเธญเธขเนเธฒเธ Rule (เน€เธเธทเนเธญเธเธ•เนเธ)**

* Anomaly severity โฅ 3 โ’ เนเธเนเธเธ—เธฑเธเธ—เธต
* Device offline เธ•เนเธญเน€เธเธทเนเธญเธ > 10 เธเธฒเธ—เธต โ’ เนเธเนเธ
* Sweep/Batch fail rate > threshold โ’ เนเธเนเธ
* Lab analyte เน€เธเธดเธ spec โ’ เนเธเนเธ

**ENV เธ—เธตเนเธกเธฑเธเนเธเน**

```
ALERT_BACKEND=slack
SLACK_WEBHOOK_URL=...
LINE_NOTIFY_TOKEN=...
POLL_INTERVAL_SECONDS=60
# เธ–เนเธฒ query DB
DB_HOST=... DB_PORT=... DB_NAME=... DB_USER=... DB_PASSWORD=...
```

---

## เธชเธเธตเธกเธฒ/เธ•เธฒเธฃเธฒเธ (DB)

เธเธณเน€เธเนเธเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข:

* `01_analytics_core.sql`

  * `analytics.analytics_agg` (hypertable, aggregate เธ•เนเธญ window)
  * `analytics.analytics_anomaly`
  * `analytics.analytics_kpi`
  * `analytics.analytics_spec_limits`
  * `analytics.worker_checkpoints`
* (เธ–เนเธฒเนเธเน event) `02_analytics_events.sql`

  * `analytics.analytics_event`
  * `analytics.analytics_event_rollup`
* (เธชเธฐเธ”เธงเธเนเธเน) `10_analytics_views.sql`

  * `v_agg_latest`, `v_anomaly_recent`, `v_kpi_latest`, `v_event_daily`

> เธชเธเธฃเธดเธเธ•เนเธ•เธฑเนเธ compression/retention เนเธซเนเนเธ”เธขเธญเธฑเธ•เนเธเธกเธฑเธ•เธด (idempotent)

---

## เธฃเธนเธเนเธเธเธเนเธญเธกเธนเธฅ (payloads) เธ—เธตเนเธฃเธญเธเธฃเธฑเธ

### sensors.device.readings (measurement)

```json
{
  "time":"2025-08-20T03:12:00Z",
  "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "sensor_id":"s-001","metric":"temp","value":23.7,
  "payload":{"source":"edge-01"}
}
```

### device.health (event เธซเธฃเธทเธญ metric)

```json
{ "time":"2025-08-20T03:12:00Z",
  "tenant_id":"t1","factory_id":"f1","machine_id":"mc-01",
  "status":"online","level":"ok" }
```

เธซเธฃเธทเธญ

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

> เน€เธงเธฅเธฒ (time) เนเธเน ISO-8601 + `Z` (UTC) เน€เธ—เนเธฒเธเธฑเนเธ

---

## เธเนเธฒเธเธญเธเธเธดเธเธซเธฅเธฑเธ (ENV)

เธเนเธฒเธฃเธงเธกเธ—เธตเนเธกเธฑเธเนเธเนเธเนเธณเนเธเธซเธฅเธฒเธขเธเธฃเธดเธเธฒเธฃ:

| Key                                      | Example                            | เธซเธกเธฒเธขเน€เธซเธ•เธธ                                                                   |
| ---------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `KAFKA_BROKERS`                          | `kafka:9092`                       | เนเธ Docker network เน€เธ”เธตเธขเธงเธเธฑเธเนเธเนเธเธทเนเธญ service เนเธ”เนเน€เธฅเธข; เธเธญเธเธเธฑเนเธเนเธเน hostname เธเธฃเธดเธ |
| `KAFKA_TOPICS`                           | `["sensors.device.readings", ...]` | analytics-stream เธชเนเธเน€เธเนเธฒเธกเธฒ; worker subscribe                               |
| `DOMAINS_ENABLED`                        | `sensor,device,lab,sweep`          | worker เนเธเนเธเธฃเธญเธ domain เนเธ registry                                          |
| `WINDOWS`                                | `[60,300,3600]`                    | worker เธฃเธงเธกเธเนเธฒเน€เธเนเธ window                                                   |
| `DB_HOST/PORT/NAME/USER/PASSWORD/SCHEMA` | โ€”                                  | เธ—เธธเธเธเธฃเธดเธเธฒเธฃเธ—เธตเนเธเธธเธข DB เธ•เนเธญเธเธ•เธฑเนเธเนเธซเนเธ–เธนเธ                                          |
| `API_HOST/API_PORT`                      | โ€”                                  | เนเธ•เนเธฅเธฐเธเธฃเธดเธเธฒเธฃ API                                                            |

---

## เธเธฒเธฃเธ”เธตเธเธฅเธญเธข (Compose เนเธเธฐเธเธณ)

เธ•เธฑเธงเธญเธขเนเธฒเธเธเธฃเธดเธเธฒเธฃเธซเธฅเธฑเธ (เนเธเธฃเธ):

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

> `analytics-stream` เธญเธฒเธเธฃเธฑเธเธ—เธตเน edge/เน€เธเธ•เน€เธงเธขเนเธเธเธฅเธฐ compose เธเนเนเธ”เน เธเธญเนเธซเนเน€เธเนเธฒเธ–เธถเธ broker เนเธ”เน

---

## Observability

* **Metrics (Prometheus):**

  * worker: `GET http://<host>:7304/v1/metrics`
  * api:    `GET http://<host>:7305/v1/metrics`
* **Logs:** stdout เธ—เธฑเนเธเธซเธกเธ” (เธฃเธงเธเธ”เนเธงเธข Docker/Cloud logging)
* **Dashboards (เนเธเธฐเธเธณ):** Grafana + Prometheus + PostgreSQL/TimescaleDB datasource

  * เธเธฃเธฒเธเธขเธญเธ”เธเธดเธขเธก: Avg(temp) by window, Count events/hour, Device uptime %, ADG trend, Lab pass rate

---

## เธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข

* เนเธขเธ DB user:

  * **worker** = RW (INSERT/UPDATE) เธเธ schema `analytics`
  * **api/alerts** = RO (SELECT)
* เน€เธเธเธฒเธฐ production:

  * เน€เธเธดเธ” TLS/Authentication เธชเธณเธซเธฃเธฑเธ Kafka (SASL) เธ–เนเธฒเธเธณเน€เธเนเธ
  * เธเธณเธเธฑเธ” CORS/API auth (JWT/RBAC) เนเธ analytics-api
  * เธชเธณเธฃเธญเธเธเนเธญเธกเธนเธฅ TimescaleDB เธ•เธฒเธกเธฃเธญเธ

---

## Runbook (เน€เธกเธทเนเธญเน€เธเธดเธ”เธเธฑเธเธซเธฒ)

1. **API 200 เนเธ•เนเธเนเธญเธกเธนเธฅเธงเนเธฒเธ (`[]`)**

   * เน€เธเนเธ `analytics-worker` log เธกเธต `[boot] stream worker started` เนเธซเธก
   * เน€เธเนเธเธงเนเธฒ **เธชเนเธ message** เนเธเธ—เธตเน topic เธ•เธฃเธเธเธฑเธเธ—เธตเน worker subscribe
   * เน€เธเนเธเธงเนเธฒ **registry** เธฅเธเธ—เธฐเน€เธเธตเธขเธ handler เธเธญเธ topic เธเธฑเนเธเนเธฅเนเธง (`init_registry()`)
   * SQL เน€เธเนเธเนเธ DB:

     ```sql
     SELECT * FROM analytics.analytics_agg ORDER BY bucket_start DESC LIMIT 20;
     SELECT * FROM analytics.analytics_event ORDER BY time DESC LIMIT 20;
     ```

2. **worker เธซเธฒ Kafka เนเธกเนเน€เธเธญ**

   * เธ–เนเธฒ worker เธฃเธฑเธ โ€เธเธญเธ Dockerโ€: เธ•เธฑเนเธ `KAFKA_BROKERS=localhost:9092` เธซเธฃเธทเธญ broker เธเธฃเธดเธ (เธญเธขเนเธฒเนเธเน `kafka:9092`)
   * เธ–เนเธฒเนเธ Docker: เนเธญเน€เธเนเธเน `kafka:9092`

3. **confluent-kafka เนเธกเนเธ•เธดเธ”เธ•เธฑเนเธ**

   * เนเธ Docker เน€เธฃเธฒเนเธชเน `librdkafka1` เนเธฅเนเธง
   * เธเธญเธ Docker (Windows): `conda install -c conda-forge librdkafka confluent-kafka`

4. **alerts เนเธกเนเน€เธ”เนเธ**

   * เธ—เธ”เธชเธญเธ webhook (Slack/LINE) เธ”เนเธงเธข curl เธเนเธญเธ
   * เธ–เนเธฒ alerts query DB: เธฃเธฑเธ SQL เธ—เธตเนเนเธเน trigger เธ”เนเธงเธขเธกเธทเธญเธ”เธนเธงเนเธฒเธกเธตเธเธฅเธฅเธฑเธเธเนเนเธซเธก

---

## เธเธฒเธฃเน€เธเธดเนเธกเนเธ”เน€เธกเธเนเธซเธกเน (เน€เธฃเนเธงเนเธฅเธฐเนเธกเนเธเธฑเธเธเธญเธเน€เธ”เธดเธก)

1. เน€เธเธตเธขเธ `app/pipelines/map/<domain>.py` (เนเธ worker) เนเธซเนเธเธทเธ `("measurement" | "event", payload)`
2. `register("my.topic", handle_my_domain, domain="<domain>")` เนเธ `init_registry()`
3. เธ•เธฑเนเธ ENV:

   ```
   DOMAINS_ENABLED=sensor,<domain>
   KAFKA_TOPICS=["sensors.device.readings","my.topic"]
   ```
4. (เธ–เนเธฒเน€เธเนเธ event) เนเธเนเนเธเธงเนเธฒเธฃเธฑเธ `02_analytics_events.sql` เนเธฅเนเธง

---

## Testing เน€เธเธดเธเธฃเธฐเธเธ (Smoke/Contract)

* **Stream โ’ Worker (schema contract)**: เนเธเนเธเธธเธ” JSON example + pytest schema validation
* **Worker aggregate**: เธเนเธญเธ message 10 เธเธธเธ”เธ—เธตเนเธเนเธฒ known โ’ เธเธงเธฃเนเธ”เน avg/sum/min/max เธ•เธฃเธ
* **Event rollup**: เธขเธดเธ event 5 เธเธฃเธฑเนเธ โ’ เธเธงเธฃเธเธฑเธ `count_n=5`
* **API contract**: `openapi.json` เธ–เธนเธเธ•เนเธญเธ + 200/422/500 เธ•เธฒเธกเธเธฃเธ“เธต
* **Alerts**: mock DB เธ”เนเธงเธขเนเธ–เธง anomaly severity 4 โ’ เธเธงเธฃเธขเธดเธ webhook 1 เธเธฃเธฑเนเธ

---

## Versioning & Migration

* เน€เธงเธฅเธฒเธเธฐ โ€เน€เธเธฅเธตเนเธขเธ schema payloadโ€ เนเธซเน bump `schema_version` เนเธ message (เธ–เนเธฒเธเธณเน€เธเนเธ) เนเธฅเธฐเน€เธเธดเนเธก backward mapping เนเธ handler
* DB migration: เน€เธเธดเนเธกเนเธเธฅเน SQL เนเธซเธกเน (เนเธกเนเนเธเนเธเธญเธเน€เธ”เธดเธก), เนเธเน DO $โ€ฆ$ เธ•เธฃเธงเธ job/policy เธเนเธณเธเนเธญเธเนเธ”เน
* API version: เธญเธขเธนเนเนเธ path `/v1/*` โ€” เธ–เนเธฒเธกเธต breaking change เนเธซเนเน€เธเธดเนเธก `/v2`

---

## Roadmap (เนเธซเนเธ—เธตเธกเน€เธซเนเธเธ เธฒเธ)

* Continuous Aggregates เธเธฒเธ metric เธซเธเธฑเธ เน เน€เธเธทเนเธญเธฅเธ” compute runtime
* KPI/Anomaly rules configurable เธเธฒเธ API + RBAC
* Alerts enrichment (เนเธเธเธเธฃเธฒเธ/เธเธฃเธดเธเธ—) เนเธฅเธฐ mute windows
* BFF/GraphQL + realtime subscriptions เธชเธณเธซเธฃเธฑเธเนเธ”เธเธเธญเธฃเนเธ”

---

## เนเธเธญเธเธธเธเธฒเธ•

เธ เธฒเธขเนเธเธญเธเธเนเธเธฃ / เธ•เธฒเธกเธเนเธขเธเธฒเธขเธ—เธตเธก
