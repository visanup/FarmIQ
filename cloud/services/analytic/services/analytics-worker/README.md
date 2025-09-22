# Analytics Worker Service

Analytics worker for FarmIQ. Default operating mode is DB-first analytics: analytics-stream ingests Kafka and writes per-minute aggregates to `analytics.minute_features`, and this worker reads from the database to compute higher‑level analytics on a schedule. Real‑time Kafka streaming in this service is optional and disabled by default.

## Architecture

- Framework: FastAPI + SQLAlchemy + APScheduler
- Database: PostgreSQL/TimescaleDB (`analytics` schema)
- Kafka: optional consumer (disabled by default)
- Port: 7304 (configurable)

## Quick Start (Scheduler‑only mode)

1) Environment

Create `.env` (only DB + scheduler needed):

```
# Database
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensor_cloud_db
DB_USER=postgres
DB_PASSWORD=password
DB_SCHEMA=analytics

# Kafka (not used when ENABLE_WORKER=0)
KAFKA_BROKERS=kafka:9092
CONSUMER_GROUP=analytics-worker.v1
KAFKA_CLIENT_ID=analytics-worker
KAFKA_TOPICS=

# Windows (seconds)
WINDOWS=60,300,3600

# API
API_HOST=0.0.0.0
ANALYTICS_WORKER_PORT=7304
ENV=dev

# Mode
ENABLE_SCHEDULER=1
ENABLE_WORKER=0
```

2) Run

```
pip install -r requirements.txt
python -m app.main
# or
uvicorn app.main:app --host 0.0.0.0 --port 7304
```

3) Health

```
curl http://localhost:7304/v1/health
curl http://localhost:7304/v1/metrics
```

## API Endpoints

- GET `/v1/health` – status + worker/scheduler flags
- GET `/v1/metrics` – Prometheus metrics
- POST `/v1/analytics/trigger/hourly` – run hourly health
- POST `/v1/analytics/trigger/daily` – run daily FCR/health/production
- POST `/v1/analytics/trigger/weekly` – run weekly FCR/production
 - GET `/v1/checkpoints?limit=200` – list recent checkpoints
 - GET `/v1/checkpoints/{job}/{tenant}/{farm}/{house}` – legacy: list all flock checkpoints under a house
 - GET `/v1/checkpoints/{job}/{tenant}/{farm}/{house}/{flock}` – get per-entity (flock-level) checkpoint
 - DELETE `/v1/checkpoints/{job}/{tenant}/{farm}/{house}/{flock}` – clear checkpoint to force rerun
 - POST `/v1/checkpoints/{job}/{tenant}/{farm}/{house}/{flock}` with `ts=ISO8601` – set checkpoint explicitly

## Configuration

| Variable | Default | Notes |
|---|---|---|
| DB_HOST/PORT/NAME/USER/PASSWORD | timescaledb/5432/sensor_cloud_db/postgres/password | DB connection |
| DB_SCHEMA | analytics | search_path used by the worker |
| KAFKA_BROKERS | kafka:9092 | Only used if worker enabled |
| CONSUMER_GROUP | analytics-worker.v1 | Only used if worker enabled |
| KAFKA_TOPICS | empty | Comma-separated list of topics; empty disables worker subscribe |
| WINDOWS | 60,300,3600 | Aggregate windows (seconds) |
| ENABLE_SCHEDULER | 1 | Enable scheduled analytics |
| ENABLE_WORKER | 0 | Disable Kafka stream worker |

## Processing Flow

1) Analytics‑stream upserts rows into `analytics.minute_features`
2) Analytics‑worker queries `minute_features` windows and stores results:
   - `analytics.fcr_calculation`
   - `analytics.health_metrics`
   - `analytics.production_metrics`
3) Optional: enable Kafka worker (set `ENABLE_WORKER=1`) to process realtime topics.

## Troubleshooting

- Worker not running jobs: verify `ENABLE_SCHEDULER=1` and check `/v1/health`
- No analytics rows: ensure `analytics.minute_features` is populated by analytics‑stream and schemas/DB point to the same instance
- Kafka errors when disabled: leave `KAFKA_TOPICS` empty and `ENABLE_WORKER=0`

## Project Structure

```
app/
├─ adapters/ (kafka, repository)
├─ api/v1/endpoint.py (health, metrics, triggers)
├─ services/ (aggregator, analytics_calculator, kpi)
├─ workers/ (scheduler, stream_worker)
└─ main.py (FastAPI app + lifespan)
```

This project is part of the FarmIQ platform.
