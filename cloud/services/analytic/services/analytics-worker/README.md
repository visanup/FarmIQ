# Analytics Worker Service

Analytics worker service for FarmIQ - processes real-time data from Kafka, performs aggregations, and runs scheduled analytics jobs.

## 🏗️ Architecture

- **Framework**: FastAPI + SQLAlchemy + APScheduler
- **Database**: PostgreSQL with TimescaleDB (analytics schema)
- **Message Queue**: Kafka (consumer)
- **Scheduler**: APScheduler for background jobs
- **Port**: 7305

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL with TimescaleDB extension
- Kafka
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Database Setup

Create the analytics schema and tables in PostgreSQL:

```sql
-- Connect to your PostgreSQL database
\c farmiq_cloud

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create analytics_agg table (aggregated data)
CREATE TABLE analytics.analytics_agg (
    bucket_start TIMESTAMPTZ NOT NULL,
    window_s INTEGER NOT NULL,
    tenant_id TEXT NOT NULL,
    factory_id TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    sensor_id TEXT,
    metric TEXT NOT NULL,
    count_n BIGINT DEFAULT 0,
    sum_val DOUBLE PRECISION DEFAULT 0,
    avg_val DOUBLE PRECISION DEFAULT 0,
    min_val DOUBLE PRECISION DEFAULT 0,
    max_val DOUBLE PRECISION DEFAULT 0,
    stddev_val DOUBLE PRECISION DEFAULT 0,
    p95_val DOUBLE PRECISION DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (bucket_start, window_s, tenant_id, factory_id, machine_id, sensor_id, metric)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('analytics.analytics_agg', 'bucket_start');
```

### 2. Environment Setup

Create `.env` file:

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=farmiq_cloud
DB_USER=postgres
DB_PASSWORD=postgres1611
DB_SCHEMA=analytics

# Kafka
KAFKA_BROKERS=kafka:9092
CONSUMER_GROUP=analytic-service.v1
KAFKA_CLIENT_ID=analytics-worker

# Topics (comma-separated)
KAFKA_TOPICS=sensors.device.readings.v1,sensors.device.health.v1,sensors.lab.readings.v1

# Aggregation windows (comma-separated)
WINDOWS=60,300,3600

# API
API_HOST=0.0.0.0
ANALYTICS_WORKER_PORT=7305
ENV=dev

# Worker settings
ENABLE_WORKER=1
ENABLE_SCHEDULER=1
```

### 3. Installation & Development

```bash
# Install dependencies
pip install -r requirements.txt

# Development mode
python -m app.main

# Or with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 7305 --reload
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f ../../../docker-compose.apps.yml up analytics-worker --build
```

## 🧪 Testing

### Health Checks

```bash
# Health check
curl http://localhost:7305/v1/health

# Metrics
curl http://localhost:7305/v1/metrics
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/health` | Health check with worker status |
| GET | `/v1/metrics` | Prometheus metrics |

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `timescaledb` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `sensor_cloud_db` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `password` | Database password |
| `DB_SCHEMA` | `analytics` | Database schema |
| `KAFKA_BROKERS` | `kafka:9092` | Kafka broker addresses |
| `CONSUMER_GROUP` | `analytic-service.v1` | Kafka consumer group |
| `KAFKA_TOPICS` | - | Comma-separated list of topics to consume |
| `WINDOWS` | `60,300,3600` | Aggregation windows (seconds) |
| `API_HOST` | `0.0.0.0` | API host |
| `ANALYTICS_WORKER_PORT` | `7305` | API port |
| `ENABLE_WORKER` | `1` | Enable Kafka consumer worker |
| `ENABLE_SCHEDULER` | `1` | Enable background scheduler |

## 🔄 Data Processing Flow

### 1. **Kafka Consumer**
- Consumes messages from configured topics
- Handles batch processing (500 messages per batch)
- Implements graceful shutdown on SIGTERM/SIGINT

### 2. **Data Processing**
- **Measurements**: Aggregated into time windows (60s, 300s, 3600s)
- **Events**: Rolled up by entity and event type
- **Snapshots**: Stored as dimension data

### 3. **Background Jobs**
- **KPI Calculation**: Runs every 5 minutes
- **Anomaly Detection**: Real-time processing
- **Data Aggregation**: Continuous processing

### 4. **Database Operations**
- **Upsert Operations**: Prevents duplicates
- **Batch Processing**: Optimizes database performance
- **Transaction Management**: Ensures data consistency

## 📈 Monitoring

### Prometheus Metrics

- `aw_ingested_msgs` - Messages ingested from Kafka
- `aw_consumer_lag` - Consumer lag (approximate)
- `aw_proc_time_seconds` - Batch processing time
- `aw_worker_status` - Worker thread status
- `aw_scheduler_jobs` - Scheduled job count

## 🚨 Troubleshooting

### Common Issues

1. **Kafka Connection Failed**
   ```bash
   # Check Kafka status
   docker exec -it farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list
   ```

2. **Database Connection Failed**
   ```bash
   # Check database connectivity
   docker exec -it farmiq-postgres psql -U postgres -d farmiq_cloud -c "SELECT 1;"
   ```

3. **Worker Not Processing Messages**
   ```bash
   # Check worker status
   curl http://localhost:7305/v1/health
   ```

## 📁 Project Structure

```
app/
├── adapters/
│   ├── kafka_consumer.py    # Kafka consumer setup
│   ├── kafka_producer.py    # Kafka producer setup
│   └── repository.py        # Database repository
├── api/
│   └── v1/
│       └── endpoint.py      # Health & metrics endpoints
├── config.py                # Configuration management
├── database.py              # Database connection
├── domain/
│   ├── models.py            # Domain models
│   ├── rules.py             # Business rules
│   └── windows.py           # Time window utilities
├── instrumentation/
│   ├── metrics.py           # Prometheus metrics
│   └── tracing.py           # Distributed tracing
├── pipelines/
│   ├── map/                 # Data mapping functions
│   └── registry.py          # Pipeline registry
├── services/
│   ├── aggregator.py        # Data aggregation
│   ├── anomaly_detector.py  # Anomaly detection
│   ├── kpi.py              # KPI calculations
│   └── spec_limits.py      # Specification limits
├── utils/
│   ├── time.py             # Time utilities
│   ├── stats.py            # Statistical functions
│   └── serialization.py    # Data serialization
├── workers/
│   ├── scheduler.py        # Background scheduler
│   └── stream_worker.py    # Kafka stream worker
└── main.py                 # FastAPI application
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the FarmIQ platform.