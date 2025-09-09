# Analytics Database Schema - FarmIQ Cloud

## 📊 Overview

This document describes the analytics database schema for FarmIQ Cloud system, which uses a **single database (`farmiq_cloud`) with separate schemas** for different data types.

## 🏗️ Database Architecture

### Database: `farmiq_cloud`
- **Single PostgreSQL database** with TimescaleDB extension
- **Two main schemas:**
  - `sensors.*` - Raw sensor data (from sensor-streamer-service)
  - `analytics.*` - Processed analytics data (from analytics services)

### Schema Separation

```
farmiq_cloud/
├── sensors/           # Raw data schema
│   ├── sensor_readings
│   ├── device_health
│   ├── lab_readings
│   └── sweep_readings
└── analytics/         # Processed data schema
    ├── minute_features
    ├── analytics_agg
    ├── analytics_event
    ├── analytics_kpi
    ├── analytics_anomaly
    ├── analytics_alerts
    └── dim_* (dimensions)
```

## 🚀 Quick Setup

### 1. Prerequisites
- PostgreSQL with TimescaleDB extension
- `farmiq_cloud` database already exists (created by sensor-streamer-service)

### 2. Run Schema Setup
```bash
# Connect to farmiq_cloud database
psql -h localhost -U postgres -d farmiq_cloud

# Run the analytics schema
\i 11_analytics_ultimate_schema.sql
```

### 3. Verify Installation
```bash
# Check schemas
\dn

# Check analytics tables
\dt analytics.*

# Check TimescaleDB hypertables
SELECT * FROM timescaledb_information.hypertables 
WHERE hypertable_schema = 'analytics';
```

## 📋 Schema Components

### Core Tables

#### 1. **minute_features** (Hypertable + CAGGs)
- **Purpose**: Core time-series data with statistical aggregation
- **Features**: 
  - TimescaleDB hypertable with 7-day chunks
  - Continuous aggregates (5m, 1h, 1d)
  - Compression and retention policies
  - Generated columns for performance

#### 2. **Dimension Tables**
- `dim_device` - Device information
- `dim_farm` - Farm information  
- `dim_house` - House information
- `dim_flock` - Flock information

#### 3. **Analytics Tables**
- `analytics_agg` - Aggregated data
- `analytics_event` - Raw domain events
- `analytics_event_rollup` - Event rollups by time windows
- `analytics_kpi` - KPI calculations (Cp, Cpk, Pp, Ppk)
- `analytics_anomaly` - Anomaly detection results
- `analytics_alerts` - Alert management

#### 4. **Helper Tables**
- `analytics_spec_limits` - Control limits
- `worker_checkpoints` - Kafka consumer offsets
- `feature_publish_log` - Publishing logs
- `minute_watermark` - Watermark tracking
- `metric_catalog` - Metric definitions

### Views

#### Performance Views
- `v_minute_stats` - Basic statistics with avg/stddev
- `v_minute_with_dims` - Data with dimension joins
- `v_minute_stats_enriched` - Enriched statistics
- `v_latest_feature` - Latest values per key

#### Analytics Views
- `v_agg_latest` - Latest aggregated data
- `v_anomaly_recent` - Recent anomalies
- `v_kpi_latest` - Latest KPI values
- `v_event_daily` - Daily event summaries

#### Alert Views
- `recent_alerts` - Recent alerts (last 7 days)
- `unresolved_alerts_summary` - Unresolved alerts summary
- `kpi_summary` - KPI summary by period

### Functions

#### Core Functions
- `upsert_minute_feature()` - Upsert minute-level data
- `touch_updated_at()` - Update timestamp trigger

## 🔧 Configuration

### Environment Variables

#### Analytics Services
```bash
# Database connection
DATABASE_URL="postgresql://postgres:password@postgres:5432/farmiq_cloud?schema=analytics"
DB_NAME=farmiq_cloud
DB_SCHEMA=analytics

# Or for individual components
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=farmiq_cloud
DB_SCHEMA=analytics
```

#### Sensor Streamer Service
```bash
# Already configured for farmiq_cloud
DATABASE_URL="postgresql://postgres:password@postgres:5432/farmiq_cloud?schema=sensors"
```

## 📊 Data Flow

### 1. Raw Data Ingestion
```
Sensor Data → sensor-streamer-service → sensors.* tables
```

### 2. Analytics Processing
```
sensors.* → analytics-worker → analytics.* tables
```

### 3. API Consumption
```
Dashboard → analytics-api → analytics.* tables
```

## 🔍 Monitoring & Maintenance

### Check Hypertable Status
```sql
-- Check hypertables
SELECT * FROM timescaledb_information.hypertables 
WHERE hypertable_schema = 'analytics';

-- Check compression status
SELECT * FROM timescaledb_information.compression_stats 
WHERE hypertable_schema = 'analytics';

-- Check retention policies
SELECT * FROM timescaledb_information.data_retention_policies 
WHERE hypertable_schema = 'analytics';
```

### Check Continuous Aggregates
```sql
-- Check CAGGs
SELECT * FROM timescaledb_information.continuous_aggregates 
WHERE view_schema = 'analytics';

-- Check CAGG policies
SELECT * FROM timescaledb_information.jobs 
WHERE hypertable_schema = 'analytics';
```

### Performance Monitoring
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'analytics'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'analytics';
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Schema Not Found
```sql
-- Check if analytics schema exists
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name = 'analytics';

-- Create if missing
CREATE SCHEMA analytics;
```

#### 2. TimescaleDB Not Available
```sql
-- Check TimescaleDB extension
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- Install if missing
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

#### 3. Permission Issues
```sql
-- Grant permissions to analytics_app role
GRANT USAGE ON SCHEMA analytics TO analytics_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO analytics_app;
```

### Health Checks

#### Database Connection
```bash
# Test connection
psql -h localhost -U postgres -d farmiq_cloud -c "SELECT 1;"

# Test analytics schema
psql -h localhost -U postgres -d farmiq_cloud -c "SELECT COUNT(*) FROM analytics.minute_features;"
```

#### Service Health
```bash
# Check analytics-api
curl http://localhost:7304/v1/health

# Check analytics-alerts
curl http://localhost:7307/api/alerts

# Check sensor-streamer
curl http://localhost:7302/health
```

## 📈 Performance Optimization

### Indexing Strategy
- **BRIN indexes** for time-based queries
- **GIN indexes** for JSONB columns
- **Composite indexes** for common query patterns

### Compression Settings
- **3-day compression** for minute_features
- **7-day compression** for analytics_agg
- **14-day compression** for events and anomalies

### Retention Policies
- **180 days** for minute_features
- **365 days** for events and anomalies
- **730 days** for event rollups

## 🔄 Migration from Old Schema

If migrating from `sensor_cloud_db`:

### 1. Backup Data
```bash
# Backup old database
pg_dump -h localhost -U postgres sensor_cloud_db > backup_sensor_cloud_db.sql
```

### 2. Update Service Configurations
```bash
# Update all analytics services to use farmiq_cloud
# Change DATABASE_URL from sensor_cloud_db to farmiq_cloud
# Change schema from default to analytics
```

### 3. Run New Schema
```bash
# Run the new schema on farmiq_cloud
psql -h localhost -U postgres -d farmiq_cloud -f 11_analytics_ultimate_schema.sql
```

## 📚 Additional Resources

- [TimescaleDB Documentation](https://docs.timescale.com/)
- [PostgreSQL Schema Management](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [FarmIQ Analytics Services](../services/analytic/README.md)

---

**Last Updated**: 2024-01-XX  
**Version**: 1.0.0  
**Database**: farmiq_cloud  
**Schema**: analytics
