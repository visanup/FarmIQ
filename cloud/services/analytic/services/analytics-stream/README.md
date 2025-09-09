# Analytics Stream Service

Analytics stream service for FarmIQ - processes real-time sensor data from Kafka and generates analytics features.

## 🏗️ Architecture

- **Framework**: Fastify + Prisma + TypeScript
- **Database**: PostgreSQL with TimescaleDB (analytics schema)
- **Message Queue**: Kafka
- **Cache**: Redis
- **Port**: 7303

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL with TimescaleDB extension
- Kafka
- Redis

## 🚀 Quick Start

### 1. Database Setup

#### Option A: Using Ultimate Schema (Recommended)

Run the complete analytics schema that includes all tables, views, and TimescaleDB configurations:

```bash
# Connect to PostgreSQL and run the ultimate schema
psql -h localhost -U postgres -d farmiq_cloud -f ../../../db/11_analytics_ultimate_schema.sql
```

This will create:
- ✅ Complete analytics schema with all tables
- ✅ TimescaleDB hypertables with compression and retention policies
- ✅ Continuous aggregates (5m, 1h, 1d)
- ✅ Dimension tables (device, farm, house, flock)
- ✅ Analytics tables (agg, events, kpi, anomaly, alerts)
- ✅ Views and functions
- ✅ Proper indexes and permissions

#### Option B: Manual Database Setup

If you prefer to set up manually:

```sql
-- Connect to your PostgreSQL database
\c farmiq_cloud

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create minute_features table (main hypertable)
CREATE TABLE analytics.minute_features (
    bucket TIMESTAMPTZ NOT NULL,
    tenant_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    sensor_id TEXT NOT NULL DEFAULT '',
    metric TEXT NOT NULL,
    tags JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags_hash TEXT GENERATED ALWAYS AS (md5(tags::text)) STORED,
    value_count BIGINT NOT NULL DEFAULT 0,
    value_sum DOUBLE PRECISION NOT NULL DEFAULT 0,
    value_min DOUBLE PRECISION NOT NULL,
    value_max DOUBLE PRECISION NOT NULL,
    value_sumsq DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT minute_features_pk
        PRIMARY KEY (bucket, tenant_id, device_id, metric, sensor_id, tags_hash)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('analytics.minute_features','bucket',
                         chunk_time_interval => INTERVAL '7 days',
                         if_not_exists => TRUE);

-- Create indexes
CREATE INDEX ix_minute_features_brin_bucket
  ON analytics.minute_features USING BRIN (bucket);
CREATE INDEX ix_minute_features_metric_time
  ON analytics.minute_features (tenant_id, metric, bucket DESC);
CREATE INDEX ix_minute_features_device_time
  ON analytics.minute_features (tenant_id, device_id, bucket DESC);
CREATE INDEX ix_minute_features_tags_gin
  ON analytics.minute_features USING GIN (tags);

-- Set compression and retention policies
ALTER TABLE analytics.minute_features
  SET (timescaledb.compress,
       timescaledb.compress_segmentby = 'tenant_id, device_id, metric, sensor_id, tags_hash',
       timescaledb.compress_orderby   = 'bucket');

SELECT add_compression_policy('analytics.minute_features', INTERVAL '3 days');
SELECT add_retention_policy('analytics.minute_features', INTERVAL '180 days');
```

### 2. Environment Setup

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres1611@postgres:5432/farmiq_cloud?schema=analytics"
DB_HOST=postgres
DB_PORT=5432
DB_NAME=farmiq_cloud
DB_USER=postgres
DB_PASSWORD=postgres1611
DB_SCHEMA=analytics

# Kafka
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=analytics-stream
CONSUMER_GROUP=analytic-service.v1

# Redis
REDIS_URL=redis://redis:6379

# Service
ANALYTIC_STREAM_PORT=7303
ENV=dev
LOG_LEVEL=info

# Topics (comma-separated)
KAFKA_TOPICS_IN=sensors.device.readings.v1,sensors.device.health.v1,sensors.lab.readings.v1,sensors.sweep.readings.v1,external.weather.observation.v1,farms.operational.event.v1,feed.batch.created.v1,feed.quality.result.v1,economics.cost.txn.v1,devices.device.snapshot.v1,farms.farm.snapshot.v1,farms.house.snapshot.v1,farms.flock.snapshot.v1
```

### 3. Prisma Setup

After setting up the database, configure Prisma:

```bash
# Install dependencies
yarn install

# Generate Prisma client from the database schema
yarn prisma generate

# (Optional) Push schema changes to database
yarn prisma db push

# (Optional) View database in Prisma Studio
yarn prisma studio
```

### 4. Installation & Development

```bash
# Development mode
yarn dev

# Build
yarn build

# Production
yarn start

# Type checking
yarn typecheck

# Linting
yarn lint
```

### 5. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f ../../../docker-compose.apps.yml up analytics-stream --build

# Or run standalone
docker build -t analytics-stream .
docker run -p 7303:7303 --env-file .env analytics-stream
```

## 🧪 Testing

### Health Checks

```bash
# Health check
curl http://localhost:7303/health

# Readiness check
curl http://localhost:7303/ready

# Metrics
curl http://localhost:7303/metrics
```

### Database Testing

#### Using Prisma Client

```typescript
// Test Prisma connection
import { prisma } from './src/lib/prisma';

// Test database connection
const result = await prisma.$queryRaw`SELECT 1`;
console.log('Database connected:', result);

// Test minute_features table
const testData = await prisma.minuteFeatures.create({
  data: {
    bucket: new Date(),
    tenantId: 'tenant1',
    deviceId: 'device1',
    sensorId: 'sensor1',
    metric: 'temperature',
    valueCount: 1,
    valueSum: 25.5,
    valueMin: 25.5,
    valueMax: 25.5,
    valueSumsq: 650.25,
    tags: { unit: 'celsius' }
  }
});

// Query data
const readings = await prisma.minuteFeatures.findMany({
  where: { tenantId: 'tenant1' },
  orderBy: { bucket: 'desc' },
  take: 10
});
```

#### Using Direct SQL

```sql
-- Test data insertion
INSERT INTO analytics.minute_features 
(bucket, tenant_id, device_id, sensor_id, metric, value_count, value_sum, value_min, value_max, value_sumsq, tags)
VALUES 
(NOW(), 'tenant1', 'device1', 'sensor1', 'temperature', 1, 25.5, 25.5, 25.5, 650.25, '{"unit": "celsius"}');

-- Query data
SELECT * FROM analytics.minute_features 
WHERE tenant_id = 'tenant1' 
ORDER BY bucket DESC 
LIMIT 10;

-- Test continuous aggregates
SELECT * FROM analytics.minute_features_5m 
WHERE tenant_id = 'tenant1' 
ORDER BY bucket DESC 
LIMIT 5;
```

### Kafka Testing

```bash
# Send test message to Kafka
docker exec -it farmiq-kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic sensors.device.readings.v1 \
  --property "parse.key=true" \
  --property "key.separator=:"

# Example message:
# device1:{"device_id":"device1","sensor_type":"temperature","value":25.5,"timestamp":"2024-01-01T00:00:00Z","tenant_id":"tenant1"}
```

## 📊 Monitoring

### Prometheus Metrics

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `kafka_consumer_lag` - Kafka consumer lag
- `redis_operations_total` - Redis operations

### Logs

```bash
# View logs
docker logs farmiq-analytics-stream -f

# Filter specific log levels
docker logs farmiq-analytics-stream | grep ERROR
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `KAFKA_BROKERS` | `kafka:9092` | Kafka broker addresses |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `ANALYTIC_STREAM_PORT` | `7303` | HTTP server port |
| `LOG_LEVEL` | `info` | Logging level |

### Kafka Topics

The service consumes from these topics:
- `sensors.device.readings.v1` - Device sensor readings
- `sensors.device.health.v1` - Device health status
- `sensors.lab.readings.v1` - Laboratory readings
- `sensors.sweep.readings.v1` - Sweep readings
- `external.weather.observation.v1` - Weather data
- `farms.operational.event.v1` - Farm operations
- `feed.batch.created.v1` - Feed batch events
- `feed.quality.result.v1` - Feed quality results
- `economics.cost.txn.v1` - Economic transactions
- `devices.device.snapshot.v1` - Device snapshots
- `farms.farm.snapshot.v1` - Farm snapshots
- `farms.house.snapshot.v1` - House snapshots
- `farms.flock.snapshot.v1` - Flock snapshots

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database connectivity
   docker exec -it farmiq-postgres psql -U postgres -d farmiq_cloud -c "SELECT 1;"
   ```

2. **Kafka Connection Failed**
   ```bash
   # Check Kafka status
   docker exec -it farmiq-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list
   ```

3. **Redis Connection Failed**
   ```bash
   # Check Redis connectivity
   docker exec -it farmiq-redis redis-cli ping
   ```

4. **Prisma Client Not Generated**
   ```bash
   # Generate Prisma client
   yarn prisma generate
   
   # If schema is out of sync, push changes
   yarn prisma db push
   ```

5. **Database Schema Mismatch**
   ```bash
   # Check if database schema matches Prisma schema
   yarn prisma db pull
   
   # Compare with current schema
   diff prisma/schema.prisma prisma/schema.prisma.backup
   ```

6. **TimescaleDB Extension Missing**
   ```sql
   -- Check if TimescaleDB is installed
   SELECT * FROM pg_extension WHERE extname = 'timescaledb';
   
   -- Install if missing
   CREATE EXTENSION IF NOT EXISTS timescaledb;
   ```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug yarn dev

# Check Prisma queries
DEBUG=prisma:* yarn dev
```

## 📁 Project Structure

```
src/
├── configs/
│   └── config.ts          # Configuration management
├── consumers/
│   ├── index.ts           # Consumer orchestration
│   ├── router.ts          # Message routing
│   └── sensorReadings.consumer.ts
├── lib/
│   └── prisma.ts          # Prisma client
├── models/
│   ├── analyticsMinuteFeature.entity.ts  # TypeORM entity (legacy)
│   └── analyticsAggregates.views.ts      # View definitions
├── pipelines/
│   ├── dimUpserts.ts      # Dimension upserts
│   └── map/               # Data mapping functions
├── services/
│   └── featurePublisher.ts # Feature publishing
├── stores/
│   ├── analyticsFeature.repo.ts  # Repository layer
│   └── redis.ts           # Redis client
├── types/
│   ├── events.ts          # Event type definitions
│   └── measurement.ts     # Measurement types
├── utils/
│   ├── dataSource.ts      # TypeORM data source (legacy)
│   ├── kafka.ts           # Kafka utilities
│   ├── logger.ts          # Logging utilities
│   └── scheduler.ts       # Background job scheduler
└── server.ts              # Fastify server
```

## 🔄 Migration from TypeORM

This service has been migrated from TypeORM to Prisma:

- ✅ Fastify server implementation
- ✅ Prisma client setup with complete schema mapping
- ✅ Database schema aligned with `11_analytics_ultimate_schema.sql`
- ✅ Type-safe database operations
- ✅ TimescaleDB integration
- ⏳ Repository layer migration (in progress)
- ⏳ Remove legacy TypeORM dependencies

### Prisma Schema Features

- **Multi-schema support**: Uses `analytics` schema
- **TimescaleDB compatibility**: All hypertables properly mapped
- **Type safety**: Full TypeScript support for all tables
- **Generated columns**: Supports `tags_hash` generated column
- **JSONB support**: Proper mapping for `tags` and `metadata` fields
- **Composite keys**: Correct primary key definitions

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |
| GET | `/metrics` | Prometheus metrics |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the FarmIQ platform.