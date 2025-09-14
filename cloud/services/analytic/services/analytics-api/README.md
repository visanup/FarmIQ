# Analytics API Service

Analytics API service for FarmIQ - provides statistical analysis, anomaly detection, KPI calculations, FCR (Feed Conversion Ratio) calculations, and Size Distribution analysis for sensor data.

## ๐—๏ธ Architecture

- **Framework**: FastAPI + SQLAlchemy + Pydantic
- **Database**: PostgreSQL with TimescaleDB (analytics schema)
- **Message Queue**: Kafka (optional)
- **Port**: 7304

## ๐“ Prerequisites

- Python 3.11+
- PostgreSQL with TimescaleDB extension
- Docker & Docker Compose (optional)

## ๐€ Quick Start

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

## ๐งช Testing

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

# Calculate FCR (Feed Conversion Ratio)
curl "http://localhost:7304/v1/fcr?tenant_id=test-tenant&house_id=house-001&start_date=2024-01-01&end_date=2024-01-31&weight_source=both"

# Calculate daily FCR
curl "http://localhost:7304/v1/fcr/daily?tenant_id=test-tenant&house_id=house-001&start_date=2024-01-01&end_date=2024-01-31&weight_source=both"

# Calculate weekly FCR
curl "http://localhost:7304/v1/fcr/weekly?tenant_id=test-tenant&house_id=house-001&start_date=2024-01-01&end_date=2024-01-31&weight_source=both"

# Calculate Size Distribution
curl "http://localhost:7304/v1/size-distribution?tenant_id=test-tenant&house_id=house-001&measurement_date=2024-01-15&weight_source=predict"

# Calculate weekly Size Distribution
curl "http://localhost:7304/v1/size-distribution/weekly?tenant_id=test-tenant&house_id=house-001&measurement_date=2024-01-15&weight_source=predict"

# Compare Weight Sources (Scale vs Predict)
curl "http://localhost:7304/v1/size-distribution/compare?tenant_id=test-tenant&house_id=house-001&measurement_date=2024-01-15"

# Get available metrics for FCR calculation
curl "http://localhost:7304/v1/fcr/metrics?tenant_id=test-tenant&house_id=house-001"
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

## ๐“ API Endpoints

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

### FCR & Size Distribution

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/fcr` | Calculate FCR (Feed Conversion Ratio) |
| GET | `/v1/fcr/daily` | Calculate daily FCR for specified period |
| GET | `/v1/fcr/weekly` | Calculate weekly FCR for specified period |
| GET | `/v1/size-distribution` | Calculate size distribution for specified date |
| GET | `/v1/size-distribution/weekly` | Calculate weekly size distribution |
| GET | `/v1/size-distribution/compare` | Compare scale vs predict weight sources |
| GET | `/v1/fcr/metrics` | Get available metrics for FCR calculation |

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

#### `/v1/fcr`
- `tenant_id` (required): Tenant identifier
- `house_id` (required): House identifier
- `start_date` (required): Start date (ISO8601)
- `end_date` (required): End date (ISO8601)
- `farm_id` (optional): Farm identifier
- `animal_count` (optional): Number of animals
- `period` (optional): Period type - "daily", "weekly", or "total" (default: "total")
- `weight_source` (optional): Weight source - "scale", "predict", or "both" (default: "both")

#### `/v1/size-distribution`
- `tenant_id` (required): Tenant identifier
- `house_id` (required): House identifier
- `measurement_date` (required): Measurement date (ISO8601)
- `farm_id` (optional): Farm identifier
- `weight_source` (optional): Weight source - "scale" or "predict" (default: "predict")

## ๐”ง Configuration

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

## ๐“ Statistical Analysis

### Western Electric Rules

The service implements Western Electric rules for anomaly detection:

- **WE-1**: Points beyond 3ฯ limits
- **WE-2**: 2 of 3 consecutive points beyond 2ฯ on same side
- **WE-3**: 4 of 5 consecutive points beyond 1ฯ on same side  
- **WE-4**: 8 consecutive points on same side of center line

### Process Capability Indices

- **Cp**: Process capability (USL - LSL) / (6ฯ)
- **Cpk**: Process capability index (min of CPU, CPL)
- **Pp**: Process performance (USL - LSL) / (6ฯ)
- **Ppk**: Process performance index

## ๐ท FCR (Feed Conversion Ratio) Analysis

### Overview

FCR calculation provides insights into feed efficiency by comparing total feed consumption to animal weight gain.

### Supported Weight Sources

- **Scale**: Direct weight measurements from scales
- **Predict**: AI-predicted weights from image analysis
- **Both**: Combined/averaged data from both sources

### Calculation Logic

```
FCR = Total Feed Consumed (kg) / Total Weight Gain (kg)
```

### Supported Metrics

**Feed Metrics:**
- `feed.batch.mass_kg`
- `feed.consumption.kg`
- `feed.intake.kg`
- `feed.daily.kg`
- `sensors.feed.weight`
- `sensors.feed.mass`

**Weight Metrics:**
- `sensors.weight_scale.total`
- `sensors.weight_scale.individual`
- `sensors.weight_predict.total`
- `sensors.weight_predict.individual`
- `animal.weight.total`
- `animal.weight.avg`
- `flock.weight.total`
- `flock.weight.sum`

## ๐“ Size Distribution Analysis

### Overview

Size distribution analysis provides statistical insights into animal weight distribution within a house.

### Statistical Measures

- **Mean Weight**: Average weight across all animals
- **Median Weight**: Middle value when weights are sorted
- **Standard Deviation**: Measure of weight variability
- **Variance**: Square of standard deviation
- **Range**: Difference between maximum and minimum weights
- **Coefficient of Variation**: Relative variability (std dev / mean)

### Weight Categories

Animals are automatically categorized into 5 groups:
- **Very Small**: Bottom 20% of weight range
- **Small**: 20-40% of weight range
- **Medium**: 40-60% of weight range
- **Large**: 60-80% of weight range
- **Very Large**: Top 20% of weight range

### Quartile Analysis

- **Q1 (25th percentile)**: First quartile
- **Q2 (50th percentile)**: Median (second quartile)
- **Q3 (75th percentile)**: Third quartile
- **IQR**: Interquartile range (Q3 - Q1)

## ๐จ Troubleshooting

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

## ๐“ Project Structure

```
app/
โ”โ”€โ”€ api/
โ”   โ””โ”€โ”€ v1/
โ”       โ”โ”€โ”€ endpoint.py      # Health & metrics endpoints
โ”       โ”โ”€โ”€ agg.py          # Aggregated data API
โ”       โ”โ”€โ”€ events.py       # Event rollup API
โ”       โ”โ”€โ”€ anomalies.py    # Anomaly detection API
โ”       โ”โ”€โ”€ kpi.py          # KPI calculations API
โ”       โ””โ”€โ”€ fcr.py          # FCR & Size Distribution API
โ”โ”€โ”€ config.py               # Configuration management
โ”โ”€โ”€ database.py             # Database connection (sync & async)
โ”โ”€โ”€ domain/
โ”   โ”โ”€โ”€ models.py           # Pydantic models
โ”   โ”โ”€โ”€ rules.py            # Western Electric rules
โ”   โ””โ”€โ”€ windows.py          # Time window utilities
โ”โ”€โ”€ instrumentation/
โ”   โ””โ”€โ”€ metrics.py          # Prometheus metrics
โ”โ”€โ”€ services/
โ”   โ”โ”€โ”€ aggregator.py       # Data aggregation logic
โ”   โ”โ”€โ”€ anomaly_detector.py # Anomaly detection
โ”   โ”โ”€โ”€ kpi.py             # KPI calculations
โ”   โ”โ”€โ”€ spec_limits.py     # Specification limits
โ”   โ”โ”€โ”€ fcr_calculator.py  # FCR calculation logic
โ”   โ””โ”€โ”€ size_distribution.py # Size distribution analysis
โ”โ”€โ”€ utils/
โ”   โ”โ”€โ”€ time.py            # Time utilities
โ”   โ”โ”€โ”€ stats.py           # Statistical functions
โ”   โ””โ”€โ”€ serialization.py   # Data serialization
โ””โ”€โ”€ main.py                # FastAPI application
```

## ๐” Data Flow

1. **Data Ingestion**: Raw sensor data โ’ Kafka topics (analytics-stream)
2. **Data Processing**: Kafka โ’ analytics-worker โ’ PostgreSQL (analytics.minute_features)
3. **API Queries**: FastAPI โ’ PostgreSQL โ’ JSON response
4. **Anomaly Detection**: Statistical analysis โ’ anomaly alerts
5. **KPI Calculation**: Process capability analysis โ’ KPI metrics
6. **FCR Calculation**: Feed consumption + Weight gain โ’ FCR ratio
7. **Size Distribution**: Individual weights โ’ Statistical analysis

## ๐—๏ธ Architecture Overview

```
โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
โ”   Sensors/      โ”    โ”  analytics-     โ”    โ”  analytics-     โ”
โ”   Edge Devices  โ”โ”€โ”€โ”€โ–ถโ”     stream      โ”โ”€โ”€โ”€โ–ถโ”     worker      โ”
โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
                                                         โ”
                                                         โ–ผ
โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
โ”   analytics-    โ”    โ”   PostgreSQL    โ”    โ”   analytics-    โ”
โ”     alerts      โ”โ—€โ”€โ”€โ”€โ”  TimescaleDB    โ”โ—€โ”€โ”€โ”€โ”      api        โ”
โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
```

### Service Responsibilities

- **analytics-stream**: Data ingestion from sensors to Kafka
- **analytics-worker**: Data processing, aggregation, and storage
- **analytics-api**: Business logic, FCR calculation, Size distribution analysis
- **analytics-alerts**: Alert rules and notifications

## ๐ค Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## ๐“ License

This project is part of the FarmIQ platform.