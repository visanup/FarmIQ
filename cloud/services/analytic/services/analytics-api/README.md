# Analytics API Service

Analytics API service for FarmIQ - provides statistical analysis, anomaly detection, and KPI calculations for sensor data.

## 🏗️ Architecture

- **Framework**: FastAPI + SQLAlchemy + Pydantic
- **Database**: PostgreSQL with TimescaleDB (analytics schema)
- **Message Queue**: Kafka (optional)
- **Port**: 7304

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL with TimescaleDB extension
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
    PRIMARY KEY (bucket_start, window_s, tenant_id, factory_id, machine_id, sensor_id, metric)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('analytics.analytics_agg', 'bucket_start');

-- Create analytics_event_rollup table
CREATE TABLE analytics.analytics_event_rollup (
    bucket_start TIMESTAMPTZ NOT NULL,
    window_s INTEGER NOT NULL,
    tenant_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    count_n BIGINT DEFAULT 0,
    sum_val DOUBLE PRECISION,
    avg_val DOUBLE PRECISION,
    min_val DOUBLE PRECISION,
    max_val DOUBLE PRECISION,
    PRIMARY KEY (bucket_start, window_s, tenant_id, domain, entity_type, entity_id, event_type)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('analytics.analytics_event_rollup', 'bucket_start');

-- Create analytics_kpi table
CREATE TABLE analytics.analytics_kpi (
    period TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    tenant_id TEXT NOT NULL,
    factory_id TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    sensor_id TEXT,
    metric TEXT NOT NULL,
    n BIGINT DEFAULT 0,
    mean_val DOUBLE PRECISION,
    stddev_val DOUBLE PRECISION,
    cp DOUBLE PRECISION,
    cpk DOUBLE PRECISION,
    pp DOUBLE PRECISION,
    ppk DOUBLE PRECISION,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (tenant_id, factory_id, machine_id, metric, period, period_start)
);

-- Create indexes for performance
CREATE INDEX idx_analytics_agg_tenant_factory_machine_metric_bucket 
ON analytics.analytics_agg (tenant_id, factory_id, machine_id, metric, bucket_start);

CREATE INDEX idx_analytics_event_rollup_tenant_domain_entity_bucket 
ON analytics.analytics_event_rollup (tenant_id, domain, entity_type, entity_id, event_type, bucket_start);

CREATE INDEX idx_analytics_kpi_tenant_factory_machine_metric_period 
ON analytics.analytics_kpi (tenant_id, factory_id, machine_id, metric, period, period_start);
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

# Kafka (optional)
KAFKA_BROKERS=kafka:9092
CONSUMER_GROUP=analytic-service.v1
KAFKA_CLIENT_ID=analytics-api

# API
API_HOST=0.0.0.0
ANALYTICS_API_PORT=7304
ENV=dev

# Aggregation windows (comma-separated)
WINDOWS=60,300,3600
```

### 3. Installation & Development

```bash
# Install dependencies
pip install -r requirements.txt

# Development mode
python -m app.main

# Or with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 7304 --reload
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f ../../../docker-compose.apps.yml up analytics-api --build

# Or run standalone
docker build -t analytics-api .
docker run -p 7304:7304 --env-file .env analytics-api
```

## 🧪 Testing

### Health Checks

```bash
# Health check
curl http://localhost:7304/v1/health

# Metrics
curl http://localhost:7304/v1/metrics
```

### API Testing

```bash
# Get aggregated data
curl "http://localhost:7304/v1/agg?tenant_id=tenant1&factory_id=factory1&machine_id=machine1&metric=temperature&window_s=60&start=2024-01-01T00:00:00Z&end=2024-01-01T23:59:59Z"

# Get event rollup
curl "http://localhost:7304/v1/event-rollup?tenant_id=tenant1&domain=farms&entity_type=house&entity_id=house1&event_type=feeding&window_s=300&start=2024-01-01T00:00:00Z&end=2024-01-01T23:59:59Z"

# Detect anomalies
curl -X POST "http://localhost:7304/v1/anomalies" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "tenant1",
    "factory_id": "factory1", 
    "machine_id": "machine1",
    "metric": "temperature",
    "window_s": 60,
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-01T23:59:59Z"
  }'

# Calculate KPIs
curl -X POST "http://localhost:7304/v1/kpi" \
  -H "Content-Type: application/json" \
  -d '{
    "period": "day",
    "metric": "temperature",
    "use_window_s": 60
  }'
```

### Database Testing

```sql
-- Test data insertion
INSERT INTO analytics.analytics_agg 
(bucket_start, window_s, tenant_id, factory_id, machine_id, metric, count_n, sum_val, avg_val, min_val, max_val, stddev_val, p95_val)
VALUES 
(NOW(), 60, 'tenant1', 'factory1', 'machine1', 'temperature', 10, 250.5, 25.05, 24.0, 26.0, 0.5, 25.8);

-- Query aggregated data
SELECT * FROM analytics.analytics_agg 
WHERE tenant_id = 'tenant1' 
  AND factory_id = 'factory1'
  AND machine_id = 'machine1'
  AND metric = 'temperature'
ORDER BY bucket_start DESC 
LIMIT 10;
```

## 📊 API Endpoints

### Health & Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/health` | Health check |
| GET | `/v1/metrics` | Prometheus metrics |

### Data Retrieval

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/agg` | Get aggregated sensor data |
| GET | `/v1/event-rollup` | Get event rollup data |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/anomalies` | Detect anomalies using Western Electric rules |
| POST | `/v1/kpi` | Calculate process capability indices (Cp/Cpk) |

### Query Parameters

#### `/v1/agg`
- `tenant_id` (required): Tenant identifier
- `factory_id` (required): Factory identifier  
- `machine_id` (required): Machine identifier
- `metric` (required): Metric name (e.g., temperature, humidity)
- `window_s` (required): Aggregation window in seconds
- `start` (required): Start time (ISO8601)
- `end` (required): End time (ISO8601)
- `sensor_id` (optional): Specific sensor identifier
- `limit` (optional): Maximum results (default: 1000, max: 10000)

#### `/v1/event-rollup`
- `tenant_id` (required): Tenant identifier
- `domain` (required): Domain (e.g., farms, devices)
- `entity_type` (required): Entity type (e.g., house, device)
- `entity_id` (required): Entity identifier
- `event_type` (required): Event type (e.g., feeding, maintenance)
- `window_s` (required): Aggregation window in seconds
- `start` (required): Start time (ISO8601)
- `end` (required): End time (ISO8601)
- `limit` (optional): Maximum results (default: 1000, max: 10000)

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
| `API_HOST` | `0.0.0.0` | API host |
| `ANALYTICS_API_PORT` | `7304` | API port |
| `WINDOWS` | `60,300,3600` | Aggregation windows (seconds) |

## 📈 Statistical Analysis

### Western Electric Rules

The service implements Western Electric rules for anomaly detection:

- **WE-1**: Points beyond 3σ limits
- **WE-2**: 2 of 3 consecutive points beyond 2σ on same side
- **WE-3**: 4 of 5 consecutive points beyond 1σ on same side  
- **WE-4**: 8 consecutive points on same side of center line

### Process Capability Indices

- **Cp**: Process capability (USL - LSL) / (6σ)
- **Cpk**: Process capability index (min of CPU, CPL)
- **Pp**: Process performance (USL - LSL) / (6σ)
- **Ppk**: Process performance index

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database connectivity
   docker exec -it farmiq-postgres psql -U postgres -d farmiq_cloud -c "SELECT 1;"
   ```

2. **Missing Tables**
   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'analytics';
   ```

3. **Performance Issues**
   ```sql
   -- Check table sizes
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
   FROM pg_tables WHERE schemaname = 'analytics';
   ```

### Debug Mode

```bash
# Enable debug logging
ENV=dev python -m app.main

# Check logs
docker logs farmiq-analytics-api -f
```

## 📁 Project Structure

```
app/
├── api/
│   └── v1/
│       ├── endpoint.py      # Health & metrics endpoints
│       ├── agg.py          # Aggregated data API
│       └── events.py       # Event rollup API
├── config.py               # Configuration management
├── database.py             # Database connection
├── domain/
│   ├── models.py           # Pydantic models
│   ├── rules.py            # Western Electric rules
│   └── windows.py          # Time window utilities
├── instrumentation/
│   └── metrics.py          # Prometheus metrics
├── services/
│   ├── aggregator.py       # Data aggregation logic
│   ├── anomaly_detector.py # Anomaly detection
│   ├── kpi.py             # KPI calculations
│   └── spec_limits.py     # Specification limits
├── utils/
│   ├── time.py            # Time utilities
│   ├── stats.py           # Statistical functions
│   └── serialization.py   # Data serialization
└── main.py                # FastAPI application
```

## 🔄 Data Flow

1. **Data Ingestion**: Raw sensor data → Kafka topics
2. **Aggregation**: analytics-stream → analytics_agg table
3. **API Queries**: FastAPI → PostgreSQL → JSON response
4. **Anomaly Detection**: Statistical analysis → anomaly alerts
5. **KPI Calculation**: Process capability analysis → KPI metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the FarmIQ platform.