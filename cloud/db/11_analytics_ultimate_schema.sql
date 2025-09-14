-- =====================================================
-- Ultimate Analytics Database Schema
-- FarmIQ Analytics Services - Complete Database Setup
-- Uses farmiq_cloud database with analytics schema
-- Combines ALL old and new schema files for maximum functionality
-- =====================================================

-- =====================================================
-- 1. DATABASE & EXTENSIONS SETUP
-- =====================================================

-- Connect to farmiq_cloud database (assumes it already exists)
-- \c farmiq_cloud;

-- Create analytics schema (separate from sensors schema)
CREATE SCHEMA IF NOT EXISTS analytics;

-- Enable TimescaleDB extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable btree_gist for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =====================================================
-- 2. HELPER ENUMS/TYPES
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kpi_period') THEN
    CREATE TYPE kpi_period AS ENUM ('day','week','month');
  END IF;
END$$;

-- =====================================================
-- 3. CORE MINUTE FEATURES TABLE (from 04_analytic_db.sql)
-- =====================================================

-- Main hypertable: minute_features (from old schema - better structure)
CREATE TABLE IF NOT EXISTS analytics.minute_features (
  bucket       TIMESTAMPTZ NOT NULL,
  tenant_id    TEXT        NOT NULL,
  device_id    TEXT        NOT NULL,
  sensor_id    TEXT        NOT NULL DEFAULT '',
  metric       TEXT        NOT NULL,
  tags         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  tags_hash    TEXT        GENERATED ALWAYS AS (md5(tags::text)) STORED,

  value_count  BIGINT            NOT NULL DEFAULT 0,
  value_sum    DOUBLE PRECISION  NOT NULL DEFAULT 0,
  value_min    DOUBLE PRECISION  NOT NULL,
  value_max    DOUBLE PRECISION  NOT NULL,
  value_sumsq  DOUBLE PRECISION  NOT NULL DEFAULT 0,

  CONSTRAINT minute_features_pk
    PRIMARY KEY (bucket, tenant_id, device_id, metric, sensor_id, tags_hash)
);

-- Hypertable (chunk 7 days)
SELECT create_hypertable('analytics.minute_features','bucket',
                         chunk_time_interval => INTERVAL '7 days',
                         if_not_exists => TRUE);

-- Indexes
CREATE INDEX IF NOT EXISTS ix_minute_features_brin_bucket
  ON analytics.minute_features USING BRIN (bucket);
CREATE INDEX IF NOT EXISTS ix_minute_features_metric_time
  ON analytics.minute_features (tenant_id, metric, bucket DESC);
CREATE INDEX IF NOT EXISTS ix_minute_features_device_time
  ON analytics.minute_features (tenant_id, device_id, bucket DESC);
CREATE INDEX IF NOT EXISTS ix_minute_features_tags_gin
  ON analytics.minute_features USING GIN (tags);

-- Compression & retention
ALTER TABLE analytics.minute_features
  SET (timescaledb.compress,
       timescaledb.compress_segmentby = 'tenant_id, device_id, metric, sensor_id, tags_hash',
       timescaledb.compress_orderby   = 'bucket');

SELECT add_compression_policy('analytics.minute_features', INTERVAL '3 days');
SELECT add_retention_policy  ('analytics.minute_features', INTERVAL '180 days');

-- =====================================================
-- 4. CONTINUOUS AGGREGATES (from 04_analytic_db.sql)
-- =====================================================

-- 5-minute aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.minute_features_5m
WITH (timescaledb.continuous) AS
SELECT time_bucket('5 minutes', bucket) AS bucket,
       tenant_id, device_id, sensor_id, metric, tags, tags_hash,
       sum(value_count) AS value_count,
       sum(value_sum)   AS value_sum,
       min(value_min)   AS value_min,
       max(value_max)   AS value_max,
       sum(value_sumsq) AS value_sumsq
FROM analytics.minute_features
GROUP BY 1,2,3,4,5,6,7
WITH NO DATA;

-- 1-hour aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.minute_features_1h
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', bucket) AS bucket,
       tenant_id, device_id, sensor_id, metric, tags, tags_hash,
       sum(value_count) AS value_count,
       sum(value_sum)   AS value_sum,
       min(value_min)   AS value_min,
       max(value_max)   AS value_max,
       sum(value_sumsq) AS value_sumsq
FROM analytics.minute_features
GROUP BY 1,2,3,4,5,6,7
WITH NO DATA;

-- 1-day aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.minute_features_1d
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 day', bucket) AS bucket,
       tenant_id, device_id, sensor_id, metric, tags, tags_hash,
       sum(value_count) AS value_count,
       sum(value_sum)   AS value_sum,
       min(value_min)   AS value_min,
       max(value_max)   AS value_max,
       sum(value_sumsq) AS value_sumsq
FROM analytics.minute_features
GROUP BY 1,2,3,4,5,6,7
WITH NO DATA;

-- Enable real-time for CAGGs
ALTER MATERIALIZED VIEW analytics.minute_features_5m SET (timescaledb.materialized_only = false);
ALTER MATERIALIZED VIEW analytics.minute_features_1h SET (timescaledb.materialized_only = false);
ALTER MATERIALIZED VIEW analytics.minute_features_1d SET (timescaledb.materialized_only = false);

-- CAGG policies
SELECT add_continuous_aggregate_policy('analytics.minute_features_5m',
  start_offset => INTERVAL '2 hours',
  end_offset   => INTERVAL '5 minutes',
  schedule_interval => INTERVAL '1 minute');

SELECT add_continuous_aggregate_policy('analytics.minute_features_1h',
  start_offset => INTERVAL '7 days',
  end_offset   => INTERVAL '1 hour',
  schedule_interval => INTERVAL '15 minutes');

SELECT add_continuous_aggregate_policy('analytics.minute_features_1d',
  start_offset => INTERVAL '180 days',
  end_offset   => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 hour');

-- =====================================================
-- 5. DIMENSION TABLES (from 05_analytics_dimensions.sql)
-- =====================================================

-- Helper function for touch updated_at
CREATE OR REPLACE FUNCTION analytics.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- dim_device
CREATE TABLE IF NOT EXISTS analytics.dim_device (
  tenant_id  TEXT NOT NULL,
  device_id  TEXT NOT NULL,
  farm_id    TEXT,
  house_id   TEXT,
  type       TEXT,
  status     TEXT,
  name       TEXT,
  model      TEXT,
  vendor     TEXT,
  serial_no  TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, device_id)
);
CREATE INDEX IF NOT EXISTS ix_dim_device_farm  ON analytics.dim_device(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS ix_dim_device_house ON analytics.dim_device(tenant_id, house_id);
CREATE INDEX IF NOT EXISTS gin_dim_device_meta ON analytics.dim_device USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_device_touch ON analytics.dim_device;
CREATE TRIGGER trg_dim_device_touch BEFORE UPDATE ON analytics.dim_device
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_farm
CREATE TABLE IF NOT EXISTS analytics.dim_farm (
  tenant_id  TEXT NOT NULL,
  farm_id    TEXT NOT NULL,
  name       TEXT,
  lat        DOUBLE PRECISION,
  lon        DOUBLE PRECISION,
  region     TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, farm_id)
);
CREATE INDEX IF NOT EXISTS gin_dim_farm_meta ON analytics.dim_farm USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_farm_touch ON analytics.dim_farm;
CREATE TRIGGER trg_dim_farm_touch BEFORE UPDATE ON analytics.dim_farm
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_house
CREATE TABLE IF NOT EXISTS analytics.dim_house (
  tenant_id  TEXT NOT NULL,
  house_id   TEXT NOT NULL,
  farm_id    TEXT NOT NULL,
  name       TEXT,
  capacity   INTEGER,
  type       TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, house_id)
);
CREATE INDEX IF NOT EXISTS ix_dim_house_farm ON analytics.dim_house(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_dim_house_meta ON analytics.dim_house USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_house_touch ON analytics.dim_house;
CREATE TRIGGER trg_dim_house_touch BEFORE UPDATE ON analytics.dim_house
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_flock
CREATE TABLE IF NOT EXISTS analytics.dim_flock (
  tenant_id   TEXT NOT NULL,
  flock_id    TEXT NOT NULL,
  house_id    TEXT NOT NULL,
  farm_id     TEXT,
  breed       TEXT,
  sex         TEXT,
  population  INTEGER,
  start_date  DATE,
  end_date    DATE,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, flock_id)
);
CREATE INDEX IF NOT EXISTS ix_dim_flock_house ON analytics.dim_flock(tenant_id, house_id);
CREATE INDEX IF NOT EXISTS ix_dim_flock_farm  ON analytics.dim_flock(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_dim_flock_meta ON analytics.dim_flock USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_flock_touch ON analytics.dim_flock;
CREATE TRIGGER trg_dim_flock_touch BEFORE UPDATE ON analytics.dim_flock
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- Additional dimension tables from master-service
-- dim_customer
CREATE TABLE IF NOT EXISTS analytics.dim_customer (
  tenant_id  TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  name       TEXT,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, customer_id)
);
CREATE INDEX IF NOT EXISTS gin_dim_customer_meta ON analytics.dim_customer USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_customer_touch ON analytics.dim_customer;
CREATE TRIGGER trg_dim_customer_touch BEFORE UPDATE ON analytics.dim_customer
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_animal_type
CREATE TABLE IF NOT EXISTS analytics.dim_animal_type (
  tenant_id     TEXT NOT NULL,
  animal_type_id TEXT NOT NULL,
  name          TEXT,
  category      TEXT, -- "poultry", "livestock", "aquaculture"
  description   TEXT,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, animal_type_id)
);
CREATE INDEX IF NOT EXISTS gin_dim_animal_type_meta ON analytics.dim_animal_type USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_animal_type_touch ON analytics.dim_animal_type;
CREATE TRIGGER trg_dim_animal_type_touch BEFORE UPDATE ON analytics.dim_animal_type
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_breed
CREATE TABLE IF NOT EXISTS analytics.dim_breed (
  tenant_id     TEXT NOT NULL,
  breed_id      TEXT NOT NULL,
  animal_type_id TEXT NOT NULL,
  name          TEXT,
  description   TEXT,
  characteristics JSONB DEFAULT '{}'::jsonb,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, breed_id)
);
CREATE INDEX IF NOT EXISTS ix_dim_breed_animal_type ON analytics.dim_breed(tenant_id, animal_type_id);
CREATE INDEX IF NOT EXISTS gin_dim_breed_meta ON analytics.dim_breed USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_breed_touch ON analytics.dim_breed;
CREATE TRIGGER trg_dim_breed_touch BEFORE UPDATE ON analytics.dim_breed
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_feed_type
CREATE TABLE IF NOT EXISTS analytics.dim_feed_type (
  tenant_id     TEXT NOT NULL,
  feed_type_id  TEXT NOT NULL,
  name          TEXT,
  category      TEXT, -- "starter", "grower", "finisher", "layer"
  description   TEXT,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, feed_type_id)
);
CREATE INDEX IF NOT EXISTS gin_dim_feed_type_meta ON analytics.dim_feed_type USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_feed_type_touch ON analytics.dim_feed_type;
CREATE TRIGGER trg_dim_feed_type_touch BEFORE UPDATE ON analytics.dim_feed_type
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_formula
CREATE TABLE IF NOT EXISTS analytics.dim_formula (
  tenant_id     TEXT NOT NULL,
  formula_id    TEXT NOT NULL,
  name          TEXT,
  description   TEXT,
  composition   JSONB DEFAULT '{}'::jsonb, -- { "protein": 20, "fat": 5, "fiber": 3, "ash": 8 }
  energy        DECIMAL(10,4), -- kcal/kg
  cost          DECIMAL(10,4), -- THB/kg
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, formula_id)
);
CREATE INDEX IF NOT EXISTS gin_dim_formula_meta ON analytics.dim_formula USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_formula_touch ON analytics.dim_formula;
CREATE TRIGGER trg_dim_formula_touch BEFORE UPDATE ON analytics.dim_formula
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- =====================================================
-- 6. AGGREGATED DATA TABLES (from complete schema)
-- =====================================================

-- Main aggregated data table
CREATE TABLE IF NOT EXISTS analytics.analytics_agg (
  bucket_start     TIMESTAMPTZ NOT NULL,
  window_s         INT NOT NULL,
  tenant_id        TEXT NOT NULL,
  factory_id       TEXT NOT NULL,
  machine_id       TEXT NOT NULL,
  sensor_id        TEXT,
  metric           TEXT NOT NULL,
  count_n          BIGINT NOT NULL DEFAULT 0,
  sum_val          DOUBLE PRECISION,
  avg_val          DOUBLE PRECISION,
  min_val          DOUBLE PRECISION,
  max_val          DOUBLE PRECISION,
  stddev_val       DOUBLE PRECISION,
  p95_val          DOUBLE PRECISION,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT analytics_agg_pk PRIMARY KEY
  (tenant_id, factory_id, machine_id, metric, window_s, bucket_start)
);

SELECT create_hypertable('analytics.analytics_agg','bucket_start',
                         if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS idx_agg_lookup
  ON analytics.analytics_agg (factory_id, machine_id, metric, window_s, bucket_start DESC);

-- TimescaleDB compression and retention policies
ALTER TABLE analytics.analytics_agg SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,factory_id,machine_id,metric,window_s'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics'
      AND hypertable_name='analytics_agg'
      AND proc_name='policy_compression'
  ) THEN
    PERFORM add_compression_policy('analytics.analytics_agg', INTERVAL '7 days');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics'
      AND hypertable_name='analytics_agg'
      AND proc_name='policy_retention'
  ) THEN
    PERFORM add_retention_policy('analytics.analytics_agg', INTERVAL '180 days');
  END IF;
END$$;

-- =====================================================
-- 7. EVENT TABLES (from complete schema)
-- =====================================================

-- Raw domain events
CREATE TABLE IF NOT EXISTS analytics.analytics_event (
  time         TIMESTAMPTZ NOT NULL,
  tenant_id    TEXT NOT NULL,
  domain       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  event_type   TEXT NOT NULL,
  value        DOUBLE PRECISION,
  unit         TEXT,
  severity     SMALLINT,
  payload      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT analytics_event_pk PRIMARY KEY
    (tenant_id, domain, entity_type, entity_id, event_type, time)
);

SELECT create_hypertable('analytics.analytics_event','time',
                         if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS idx_event_lookup
  ON analytics.analytics_event (domain, entity_type, entity_id, event_type, time DESC);

ALTER TABLE analytics.analytics_event SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,domain,entity_type,entity_id,event_type'
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics' AND hypertable_name='analytics_event'
      AND proc_name='policy_compression'
  ) THEN PERFORM add_compression_policy('analytics.analytics_event', INTERVAL '14 days');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics' AND hypertable_name='analytics_event'
      AND proc_name='policy_retention'
  ) THEN PERFORM add_retention_policy('analytics.analytics_event', INTERVAL '365 days');
  END IF;
END $$;

-- Event rollup by window
CREATE TABLE IF NOT EXISTS analytics.analytics_event_rollup (
  bucket_start  TIMESTAMPTZ NOT NULL,
  window_s      INT NOT NULL,
  tenant_id     TEXT NOT NULL,
  domain        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  count_n       BIGINT NOT NULL DEFAULT 0,
  sum_val       DOUBLE PRECISION,
  avg_val       DOUBLE PRECISION,
  min_val       DOUBLE PRECISION,
  max_val       DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT analytics_event_rollup_pk PRIMARY KEY
   (tenant_id, domain, entity_type, entity_id, event_type, window_s, bucket_start)
);

SELECT create_hypertable('analytics.analytics_event_rollup','bucket_start',
                         if_not_exists => TRUE, chunk_time_interval => INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_event_rollup_lookup
  ON analytics.analytics_event_rollup (domain, entity_type, entity_id, event_type, window_s, bucket_start DESC);

ALTER TABLE analytics.analytics_event_rollup SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,domain,entity_type,entity_id,event_type,window_s'
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics' AND hypertable_name='analytics_event_rollup'
      AND proc_name='policy_compression'
  ) THEN PERFORM add_compression_policy('analytics.analytics_event_rollup', INTERVAL '30 days');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics' AND hypertable_name='analytics_event_rollup'
      AND proc_name='policy_retention'
  ) THEN PERFORM add_retention_policy('analytics.analytics_event_rollup', INTERVAL '730 days');
  END IF;
END $$;

-- =====================================================
-- 8. KPI / CAPABILITY TABLES (from complete schema)
-- =====================================================

-- KPI table
CREATE TABLE IF NOT EXISTS analytics.analytics_kpi (
  period          kpi_period NOT NULL,
  period_start    TIMESTAMPTZ NOT NULL,
  tenant_id       TEXT NOT NULL,
  factory_id      TEXT NOT NULL,
  machine_id      TEXT NOT NULL,
  sensor_id       TEXT,
  metric          TEXT NOT NULL,
  n               BIGINT NOT NULL DEFAULT 0,
  mean_val        DOUBLE PRECISION,
  stddev_val      DOUBLE PRECISION,
  cp              DOUBLE PRECISION,
  cpk             DOUBLE PRECISION,
  pp              DOUBLE PRECISION,
  ppk             DOUBLE PRECISION,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT analytics_kpi_pk PRIMARY KEY
  (tenant_id, factory_id, machine_id, metric, period, period_start)
);

SELECT create_hypertable('analytics.analytics_kpi','period_start',
                         if_not_exists => TRUE, chunk_time_interval => INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_kpi_lookup
  ON analytics.analytics_kpi (factory_id, machine_id, metric, period, period_start DESC);

ALTER TABLE analytics.analytics_kpi SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,factory_id,machine_id,metric,period'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics'
      AND hypertable_name='analytics_kpi'
      AND proc_name='policy_compression'
  ) THEN
    PERFORM add_compression_policy('analytics.analytics_kpi', INTERVAL '30 days');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics'
      AND hypertable_name='analytics_kpi'
      AND proc_name='policy_retention'
  ) THEN
    PERFORM add_retention_policy('analytics.analytics_kpi', INTERVAL '730 days');
  END IF;
END$$;

-- =====================================================
-- 9. ANOMALY DETECTION TABLES (from complete schema)
-- =====================================================

-- Anomaly table
CREATE TABLE IF NOT EXISTS analytics.analytics_anomaly (
  time            TIMESTAMPTZ NOT NULL,
  tenant_id       TEXT NOT NULL,
  factory_id      TEXT NOT NULL,
  machine_id      TEXT NOT NULL,
  sensor_id       TEXT,
  metric          TEXT NOT NULL,
  rule_code       TEXT NOT NULL,
  severity        SMALLINT NOT NULL DEFAULT 1,
  value           DOUBLE PRECISION NOT NULL,
  cl              DOUBLE PRECISION,
  ucl             DOUBLE PRECISION,
  lcl             DOUBLE PRECISION,
  zscore          DOUBLE PRECISION,
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT analytics_anomaly_pk PRIMARY KEY
  (tenant_id, factory_id, machine_id, metric, time, rule_code)
);

SELECT create_hypertable('analytics.analytics_anomaly','time',
                         if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS idx_anomaly_lookup
  ON analytics.analytics_anomaly (factory_id, machine_id, metric, time DESC);

ALTER TABLE analytics.analytics_anomaly SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,factory_id,machine_id,metric,rule_code'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics'
      AND hypertable_name='analytics_anomaly'
      AND proc_name='policy_compression'
  ) THEN
    PERFORM add_compression_policy('analytics.analytics_anomaly', INTERVAL '14 days');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM timescaledb_information.jobs
    WHERE hypertable_schema='analytics'
      AND hypertable_name='analytics_anomaly'
      AND proc_name='policy_retention'
  ) THEN
    PERFORM add_retention_policy('analytics.analytics_anomaly', INTERVAL '365 days');
  END IF;
END$$;

-- =====================================================
-- 10. ALERT MANAGEMENT TABLES (from complete schema)
-- =====================================================

-- Alerts table
CREATE TABLE IF NOT EXISTS analytics.analytics_alerts (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    tenant_id TEXT NOT NULL,
    factory_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    metric TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    alert_time TIMESTAMPTZ NOT NULL,
    severity TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    additional_info JSONB
);

-- =====================================================
-- 11. MASTER DATA TABLES (from master-service)
-- =====================================================

-- Master data tables for reference and analytics
-- customers
CREATE TABLE IF NOT EXISTS analytics.customers (
  id        TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  email     TEXT UNIQUE,
  phone     TEXT,
  address   TEXT,
  meta      JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_customers_tenant ON analytics.customers(tenant_id);
CREATE INDEX IF NOT EXISTS gin_customers_meta ON analytics.customers USING GIN (meta);

-- farms
CREATE TABLE IF NOT EXISTS analytics.farms (
  id          TEXT PRIMARY KEY,
  farm_id     TEXT NOT NULL UNIQUE,
  tenant_id   TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  name        TEXT NOT NULL,
  location    JSONB, -- { "lat": 13.7563, "lon": 100.5018, "address": "..." }
  region      TEXT,
  farm_type   TEXT, -- "poultry", "livestock", "mixed"
  total_area  INTEGER,
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, farm_id)
);
CREATE INDEX IF NOT EXISTS ix_farms_tenant ON analytics.farms(tenant_id);
CREATE INDEX IF NOT EXISTS ix_farms_customer ON analytics.farms(customer_id);
CREATE INDEX IF NOT EXISTS gin_farms_meta ON analytics.farms USING GIN (meta);

-- houses
CREATE TABLE IF NOT EXISTS analytics.houses (
  id           TEXT PRIMARY KEY,
  house_id     TEXT NOT NULL UNIQUE,
  tenant_id    TEXT NOT NULL,
  farm_id      TEXT NOT NULL,
  name         TEXT NOT NULL,
  type         TEXT, -- "broiler", "layer", "breeding", "quarantine"
  capacity     INTEGER,
  dimensions   JSONB, -- { "length": 50, "width": 20, "height": 3 }
  ventilation  TEXT, -- "natural", "mechanical", "mixed"
  heating      TEXT, -- "gas", "electric", "solar"
  meta         JSONB DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, farm_id, house_id)
);
CREATE INDEX IF NOT EXISTS ix_houses_tenant_farm ON analytics.houses(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_houses_meta ON analytics.houses USING GIN (meta);

-- devices
CREATE TABLE IF NOT EXISTS analytics.devices (
  id          TEXT PRIMARY KEY,
  device_id   TEXT NOT NULL UNIQUE,
  tenant_id   TEXT NOT NULL,
  farm_id     TEXT NOT NULL,
  house_id    TEXT NOT NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL, -- "controller", "sensor", "actuator", "gateway"
  model       TEXT,
  vendor      TEXT,
  serial_no   TEXT UNIQUE,
  status      TEXT DEFAULT 'active', -- "active", "inactive", "maintenance", "error"
  location    JSONB, -- { "x": 0, "y": 0, "z": 0 }
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, farm_id, house_id, device_id)
);
CREATE INDEX IF NOT EXISTS ix_devices_tenant_farm_house ON analytics.devices(tenant_id, farm_id, house_id);
CREATE INDEX IF NOT EXISTS ix_devices_type ON analytics.devices(type);
CREATE INDEX IF NOT EXISTS gin_devices_meta ON analytics.devices USING GIN (meta);

-- flocks
CREATE TABLE IF NOT EXISTS analytics.flocks (
  id          TEXT PRIMARY KEY,
  flock_id    TEXT NOT NULL UNIQUE,
  tenant_id   TEXT NOT NULL,
  farm_id     TEXT NOT NULL,
  house_id    TEXT NOT NULL,
  breed_id    TEXT,
  animal_type_id TEXT,
  sex         TEXT,
  population  INTEGER,
  start_date  DATE,
  end_date    DATE,
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, farm_id, house_id, flock_id)
);
CREATE INDEX IF NOT EXISTS ix_flocks_tenant_farm_house ON analytics.flocks(tenant_id, farm_id, house_id);
CREATE INDEX IF NOT EXISTS ix_flocks_breed ON analytics.flocks(breed_id);
CREATE INDEX IF NOT EXISTS gin_flocks_meta ON analytics.flocks USING GIN (meta);

-- animal_types
CREATE TABLE IF NOT EXISTS analytics.animal_types (
  id          TEXT PRIMARY KEY,
  animal_type_id TEXT NOT NULL UNIQUE,
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT, -- "poultry", "livestock", "aquaculture"
  description TEXT,
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, animal_type_id)
);
CREATE INDEX IF NOT EXISTS ix_animal_types_tenant ON analytics.animal_types(tenant_id);
CREATE INDEX IF NOT EXISTS gin_animal_types_meta ON analytics.animal_types USING GIN (meta);

-- breeds
CREATE TABLE IF NOT EXISTS analytics.breeds (
  id            TEXT PRIMARY KEY,
  breed_id      TEXT NOT NULL UNIQUE,
  tenant_id     TEXT NOT NULL,
  animal_type_id TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  characteristics JSONB DEFAULT '{}'::jsonb,
  meta          JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, breed_id)
);
CREATE INDEX IF NOT EXISTS ix_breeds_tenant_animal_type ON analytics.breeds(tenant_id, animal_type_id);
CREATE INDEX IF NOT EXISTS gin_breeds_meta ON analytics.breeds USING GIN (meta);

-- feed_types
CREATE TABLE IF NOT EXISTS analytics.feed_types (
  id          TEXT PRIMARY KEY,
  feed_type_id TEXT NOT NULL UNIQUE,
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT, -- "starter", "grower", "finisher", "layer"
  description TEXT,
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, feed_type_id)
);
CREATE INDEX IF NOT EXISTS ix_feed_types_tenant ON analytics.feed_types(tenant_id);
CREATE INDEX IF NOT EXISTS gin_feed_types_meta ON analytics.feed_types USING GIN (meta);

-- formulas
CREATE TABLE IF NOT EXISTS analytics.formulas (
  id          TEXT PRIMARY KEY,
  formula_id  TEXT NOT NULL UNIQUE,
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  composition JSONB DEFAULT '{}'::jsonb, -- { "protein": 20, "fat": 5, "fiber": 3, "ash": 8 }
  energy      DECIMAL(10,4), -- kcal/kg
  cost        DECIMAL(10,4), -- THB/kg
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, formula_id)
);
CREATE INDEX IF NOT EXISTS ix_formulas_tenant ON analytics.formulas(tenant_id);
CREATE INDEX IF NOT EXISTS gin_formulas_meta ON analytics.formulas USING GIN (meta);

-- economic_data
CREATE TABLE IF NOT EXISTS analytics.economic_data (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  data_type   TEXT NOT NULL, -- "FeedCost", "AnimalPrice", "LaborCost"
  region      TEXT,
  value       DECIMAL(10,4) NOT NULL,
  unit        TEXT, -- "THB/kg", "THB/head"
  currency    TEXT DEFAULT 'THB',
  timestamp   TIMESTAMPTZ DEFAULT NOW(),
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_economic_data_type_region ON analytics.economic_data(data_type, region, timestamp);
CREATE INDEX IF NOT EXISTS gin_economic_data_meta ON analytics.economic_data USING GIN (meta);

-- external_data_sources
CREATE TABLE IF NOT EXISTS analytics.external_data_sources (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL UNIQUE, -- "กรมอุตุนิยมวิทยา", "MarketPriceAPI"
  type        TEXT, -- "Weather", "Market", "Government"
  api_url     TEXT,
  api_key     TEXT,
  description TEXT,
  status      TEXT DEFAULT 'active', -- "active", "inactive", "error"
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_external_sources_tenant ON analytics.external_data_sources(tenant_id);
CREATE INDEX IF NOT EXISTS gin_external_sources_meta ON analytics.external_data_sources USING GIN (meta);

-- zones
CREATE TABLE IF NOT EXISTS analytics.zones (
  id        TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id   TEXT NOT NULL,
  house_id  TEXT,
  name      TEXT NOT NULL,
  geometry  JSONB, -- GeoJSON polygon
  type      TEXT, -- "Feeding", "Resting", "Watering"
  capacity  INTEGER,
  meta      JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, farm_id, name)
);
CREATE INDEX IF NOT EXISTS ix_zones_tenant_farm ON analytics.zones(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_zones_meta ON analytics.zones USING GIN (meta);

-- stations
CREATE TABLE IF NOT EXISTS analytics.stations (
  id        TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id   TEXT NOT NULL,
  house_id  TEXT,
  name      TEXT NOT NULL,
  location  JSONB, -- { "lat": ..., "lon": ... }
  type      TEXT, -- "Lab", "FeedingStation", "WaterStation"
  status    TEXT DEFAULT 'active', -- "active", "inactive", "maintenance"
  meta      JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, farm_id, name)
);
CREATE INDEX IF NOT EXISTS ix_stations_tenant_farm ON analytics.stations(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_stations_meta ON analytics.stations USING GIN (meta);

-- device_health
CREATE TABLE IF NOT EXISTS analytics.device_health (
  id             TEXT PRIMARY KEY,
  device_id      TEXT NOT NULL UNIQUE,
  tenant_id      TEXT NOT NULL,
  status         TEXT NOT NULL, -- "ONLINE", "OFFLINE", "ERROR", "MAINTENANCE"
  last_seen      TIMESTAMPTZ NOT NULL,
  battery_level  INTEGER,
  signal_strength INTEGER,
  temperature    DECIMAL(5,2),
  errors         TEXT[], -- Array of error codes
  warnings       TEXT[], -- Array of warning codes
  meta           JSONB DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_device_health_tenant_device ON analytics.device_health(tenant_id, device_id);
CREATE INDEX IF NOT EXISTS ix_device_health_status ON analytics.device_health(status);
CREATE INDEX IF NOT EXISTS gin_device_health_meta ON analytics.device_health USING GIN (meta);

-- master_events
CREATE TABLE IF NOT EXISTS analytics.master_events (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  event_type  TEXT NOT NULL, -- "customer.created", "farm.updated"
  entity_type TEXT NOT NULL, -- "Customer", "Farm", "Device"
  entity_id   TEXT NOT NULL,
  data        JSONB, -- Event payload
  metadata    JSONB DEFAULT '{}'::jsonb,
  timestamp   TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_master_events_type_entity ON analytics.master_events(event_type, entity_type, timestamp);
CREATE INDEX IF NOT EXISTS ix_master_events_tenant ON analytics.master_events(tenant_id, timestamp);
CREATE INDEX IF NOT EXISTS gin_master_events_data ON analytics.master_events USING GIN (data);

-- =====================================================
-- 12. MONITORING TABLES (from monitoring-service)
-- =====================================================

-- monitoring_alerts (compatible with monitoring-service)
CREATE TABLE IF NOT EXISTS analytics.monitoring_alerts (
  tenant_id   TEXT NOT NULL,
  alert_id    TEXT NOT NULL,
  alert_type  TEXT NOT NULL,
  severity    TEXT NOT NULL,
  status      TEXT DEFAULT 'active',
  description TEXT,
  farm_id     TEXT,
  house_id    TEXT,
  device_id   TEXT,
  batch_id    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, alert_id)
);
CREATE INDEX IF NOT EXISTS ix_monitoring_alerts_status ON analytics.monitoring_alerts(tenant_id, status, severity, created_at);

-- monitoring_alert_rules
CREATE TABLE IF NOT EXISTS analytics.monitoring_alert_rules (
  tenant_id   TEXT NOT NULL,
  rule_id     TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  threshold   DECIMAL NOT NULL,
  condition   TEXT NOT NULL,
  scope       JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, rule_id)
);
CREATE INDEX IF NOT EXISTS ix_monitoring_rules_metric ON analytics.monitoring_alert_rules(tenant_id, metric_name);

-- monitoring_device_health_log
CREATE TABLE IF NOT EXISTS analytics.monitoring_device_health_log (
  tenant_id  TEXT NOT NULL,
  id         BIGSERIAL,
  device_id  TEXT NOT NULL,
  status     TEXT NOT NULL,
  time       TIMESTAMPTZ NOT NULL,
  meta       JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS ix_monitoring_health_time ON analytics.monitoring_device_health_log(tenant_id, device_id, time);

-- =====================================================
-- 13. ADDITIONAL TABLES (from complete schema)
-- =====================================================

-- Spec limits / Control limits
CREATE TABLE IF NOT EXISTS analytics.analytics_spec_limits (
  tenant_id     TEXT NOT NULL,
  factory_id    TEXT NOT NULL,
  machine_id    TEXT NOT NULL,
  sensor_id     TEXT,
  metric        TEXT NOT NULL,
  period        TSTZRANGE NOT NULL,
  cl            DOUBLE PRECISION,
  ucl           DOUBLE PRECISION,
  lcl           DOUBLE PRECISION,
  method        TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT analytics_spec_limits_pk PRIMARY KEY
  (tenant_id, factory_id, machine_id, metric, period)
);

ALTER TABLE analytics.analytics_spec_limits
  ADD CONSTRAINT spec_no_overlap EXCLUDE USING gist (
    tenant_id WITH =,
    factory_id WITH =,
    machine_id WITH =,
    metric WITH =,
    period WITH &&
  );

CREATE INDEX IF NOT EXISTS idx_spec_lookup
  ON analytics.analytics_spec_limits (factory_id, machine_id, metric);

-- Worker checkpoints / Offsets
CREATE TABLE IF NOT EXISTS analytics.worker_checkpoints (
  group_id     TEXT NOT NULL,
  topic        TEXT NOT NULL,
  partition_id INT  NOT NULL,
  last_offset  BIGINT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT worker_checkpoints_pk PRIMARY KEY (group_id, topic, partition_id)
);

-- Helper tables (from 04_analytic_db.sql)
CREATE TABLE IF NOT EXISTS analytics.feature_publish_log (
  id           BIGSERIAL PRIMARY KEY,
  tenant_id    TEXT NOT NULL,
  bucket       TIMESTAMPTZ NOT NULL,
  device_id    TEXT NOT NULL,
  sensor_id    TEXT NOT NULL DEFAULT '',
  metric       TEXT NOT NULL,
  tags_hash    TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_publog_bucket ON analytics.feature_publish_log(tenant_id, bucket DESC);

CREATE TABLE IF NOT EXISTS analytics.minute_watermark (
  tenant_id TEXT PRIMARY KEY,
  watermark TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics.metric_catalog (
  metric        TEXT PRIMARY KEY,
  display_name  TEXT,
  unit          TEXT,
  rollup        TEXT NOT NULL DEFAULT 'avg',
  decimals      INT DEFAULT 2,
  lower_bound   DOUBLE PRECISION,
  upper_bound   DOUBLE PRECISION,
  tags_schema   JSONB DEFAULT '{}'::jsonb,
  description   TEXT
);

-- =====================================================
-- 12. INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for alerts
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_tenant_factory_device 
ON analytics.analytics_alerts (tenant_id, factory_id, device_id);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_metric_time 
ON analytics.analytics_alerts (metric, alert_time);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_resolved 
ON analytics.analytics_alerts (is_resolved, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_severity 
ON analytics.analytics_alerts (severity, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_type 
ON analytics.analytics_alerts (alert_type, created_at);

-- =====================================================
-- 13. VIEWS (from 06_analytics_views.sql + complete schema)
-- =====================================================

-- Basic statistics from minute_features
CREATE OR REPLACE VIEW analytics.v_minute_stats AS
SELECT bucket, tenant_id, device_id, sensor_id, metric, tags, tags_hash,
       value_count,
       value_sum,
       value_min,
       value_max,
       value_sumsq,
       CASE WHEN value_count > 0 THEN value_sum / value_count ELSE NULL END AS avg,
       CASE
         WHEN value_count > 1 THEN
           sqrt(GREATEST(value_sumsq - (value_sum*value_sum)/value_count, 0) / (value_count-1))
         ELSE NULL
       END AS stddev
FROM analytics.minute_features;

-- Join with dimension device for contextual queries
CREATE OR REPLACE VIEW analytics.v_minute_with_dims AS
SELECT mf.bucket, mf.tenant_id, mf.device_id, d.farm_id, d.house_id,
       mf.sensor_id, mf.metric, mf.tags, mf.tags_hash,
       mf.value_count, mf.value_sum, mf.value_min, mf.value_max, mf.value_sumsq
FROM analytics.minute_features mf
LEFT JOIN analytics.dim_device d
  ON d.tenant_id = mf.tenant_id AND d.device_id = mf.device_id;

-- Enriched statistics with dimensions
CREATE OR REPLACE VIEW analytics.v_minute_stats_enriched AS
SELECT x.*,
       CASE WHEN value_count > 0 THEN value_sum/value_count ELSE NULL END AS avg,
       CASE WHEN value_count > 1 THEN
         sqrt(GREATEST(value_sumsq - (value_sum*value_sum)/value_count, 0) / (value_count-1))
       ELSE NULL END AS stddev
FROM analytics.v_minute_with_dims x;

-- Latest feature per key
CREATE OR REPLACE VIEW analytics.v_latest_feature AS
SELECT DISTINCT ON (tenant_id, device_id, sensor_id, metric, tags_hash)
  tenant_id, device_id, sensor_id, metric, tags, tags_hash,
  bucket, value_count, value_sum, value_min, value_max, value_sumsq,
  CASE WHEN value_count>0 THEN value_sum/value_count END AS avg
FROM analytics.minute_features
ORDER BY tenant_id, device_id, sensor_id, metric, tags_hash, bucket DESC;

-- Latest aggregated data per key+window
CREATE OR REPLACE VIEW analytics.v_agg_latest AS
SELECT *
FROM (
  SELECT a.*,
         ROW_NUMBER() OVER (
           PARTITION BY tenant_id, factory_id, machine_id, sensor_id, metric, window_s
           ORDER BY bucket_start DESC
         ) AS rn
  FROM analytics.analytics_agg a
) z
WHERE z.rn = 1;

-- Recent anomalies (last 7 days)
CREATE OR REPLACE VIEW analytics.v_anomaly_recent AS
SELECT *
FROM analytics.analytics_anomaly
WHERE time >= NOW() - INTERVAL '7 days';

-- Latest KPI per period/metric
CREATE OR REPLACE VIEW analytics.v_kpi_latest AS
SELECT *
FROM (
  SELECT k.*,
         ROW_NUMBER() OVER (
           PARTITION BY tenant_id, factory_id, machine_id, sensor_id, metric, period
           ORDER BY period_start DESC
         ) rn
  FROM analytics.analytics_kpi k
) zz
WHERE rn = 1;

-- Daily event summary
CREATE OR REPLACE VIEW analytics.v_event_daily AS
SELECT
  time_bucket('1 day', bucket_start) AS day,
  tenant_id, domain, entity_type, entity_id, event_type,
  SUM(count_n) AS count_n,
  SUM(sum_val) AS sum_val
FROM analytics.analytics_event_rollup
GROUP BY day, tenant_id, domain, entity_type, entity_id, event_type;

-- Recent alerts view
CREATE OR REPLACE VIEW analytics.recent_alerts AS
SELECT 
    id,
    type,
    message,
    severity,
    alert_type,
    tenant_id,
    factory_id,
    device_id,
    metric,
    value,
    alert_time,
    is_resolved,
    created_at,
    resolved_at
FROM analytics.analytics_alerts
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Unresolved alerts summary
CREATE OR REPLACE VIEW analytics.unresolved_alerts_summary AS
SELECT 
    tenant_id,
    factory_id,
    severity,
    COUNT(*) as alert_count,
    MIN(created_at) as oldest_alert,
    MAX(created_at) as newest_alert
FROM analytics.analytics_alerts
WHERE is_resolved = FALSE
GROUP BY tenant_id, factory_id, severity
ORDER BY alert_count DESC;

-- KPI summary by period
CREATE OR REPLACE VIEW analytics.kpi_summary AS
SELECT 
    period,
    metric,
    COUNT(*) as calculation_count,
    AVG(cp) as avg_cp,
    AVG(cpk) as avg_cpk,
    MIN(period_start) as earliest_period,
    MAX(period_start) as latest_period
FROM analytics.analytics_kpi
GROUP BY period, metric
ORDER BY period, metric;

-- =====================================================
-- 14. FUNCTIONS (from 04_analytic_db.sql)
-- =====================================================

-- Upsert function for minute features
CREATE OR REPLACE FUNCTION analytics.upsert_minute_feature(
  _tenant_id text,
  _device_id text,
  _sensor_id text,
  _metric    text,
  _time      timestamptz,
  _value     double precision,
  _tags      jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
DECLARE
  _bucket timestamptz := time_bucket('1 minute', _time);
BEGIN
  INSERT INTO analytics.minute_features AS t
    (bucket, tenant_id, device_id, sensor_id, metric, tags,
     value_count, value_sum, value_min, value_max, value_sumsq)
  VALUES
    (_bucket, _tenant_id, _device_id, COALESCE(_sensor_id,''), _metric, COALESCE(_tags,'{}'::jsonb),
     1, _value, _value, _value, _value*_value)
  ON CONFLICT (bucket, tenant_id, device_id, metric, sensor_id, tags_hash)
  DO UPDATE SET
    value_count = t.value_count + 1,
    value_sum   = t.value_sum   + EXCLUDED.value_sum,
    value_min   = LEAST(t.value_min, EXCLUDED.value_min),
    value_max   = GREATEST(t.value_max, EXCLUDED.value_max),
    value_sumsq = t.value_sumsq + EXCLUDED.value_sumsq;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 15. ROLES AND PERMISSIONS
-- =====================================================

-- Create role for analytics applications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='analytics_app') THEN
    CREATE ROLE analytics_app LOGIN PASSWORD 'change_me';
  END IF;
END $$;

GRANT USAGE ON SCHEMA analytics TO analytics_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO analytics_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO analytics_app;

-- Grant permissions to postgres user as well
GRANT USAGE ON SCHEMA analytics TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA analytics TO postgres;

-- Grant permissions to analytics views
GRANT SELECT ON analytics.v_minute_stats TO analytics_app, postgres;
GRANT SELECT ON analytics.v_minute_with_dims TO analytics_app, postgres;
GRANT SELECT ON analytics.v_minute_stats_enriched TO analytics_app, postgres;
GRANT SELECT ON analytics.v_latest_feature TO analytics_app, postgres;
GRANT SELECT ON analytics.v_agg_latest TO analytics_app, postgres;
GRANT SELECT ON analytics.v_anomaly_recent TO analytics_app, postgres;
GRANT SELECT ON analytics.v_kpi_latest TO analytics_app, postgres;
GRANT SELECT ON analytics.v_event_daily TO analytics_app, postgres;
GRANT SELECT ON analytics.recent_alerts TO analytics_app, postgres;
GRANT SELECT ON analytics.unresolved_alerts_summary TO analytics_app, postgres;
GRANT SELECT ON analytics.kpi_summary TO analytics_app, postgres;

-- =====================================================
-- 16. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Ultimate Analytics Database Schema Created Successfully!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Database: farmiq_cloud';
    RAISE NOTICE 'Schema: analytics (separate from sensors schema)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '- Complete minute_features with CAGGs and compression';
    RAISE NOTICE '- All dimension tables (device, farm, house, flock)';
    RAISE NOTICE '- All analytics tables (agg, events, kpi, anomaly, alerts)';
    RAISE NOTICE '- TimescaleDB compression and retention policies';
    RAISE NOTICE '- Comprehensive views for dashboards and APIs';
    RAISE NOTICE '- Helper functions and tables';
    RAISE NOTICE '- Proper role and permission management';
    RAISE NOTICE '';
    RAISE NOTICE 'Schema Structure:';
    RAISE NOTICE '- sensors.* (raw data from sensor-streamer-service)';
    RAISE NOTICE '- analytics.* (processed data from analytics services)';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- analytics.minute_features (TimescaleDB hypertable + CAGGs)';
    RAISE NOTICE '- analytics.dim_device, dim_farm, dim_house, dim_flock, dim_customer';
    RAISE NOTICE '- analytics.dim_animal_type, dim_breed, dim_feed_type, dim_formula';
    RAISE NOTICE '- analytics.analytics_agg (TimescaleDB hypertable)';
    RAISE NOTICE '- analytics.analytics_event (TimescaleDB hypertable)';
    RAISE NOTICE '- analytics.analytics_event_rollup (TimescaleDB hypertable)';
    RAISE NOTICE '- analytics.analytics_kpi (TimescaleDB hypertable)';
    RAISE NOTICE '- analytics.analytics_anomaly (TimescaleDB hypertable)';
    RAISE NOTICE '- analytics.analytics_alerts';
    RAISE NOTICE '- analytics.analytics_spec_limits';
    RAISE NOTICE '- analytics.worker_checkpoints';
    RAISE NOTICE '- analytics.feature_publish_log, minute_watermark, metric_catalog';
    RAISE NOTICE '- analytics.customers, farms, houses, devices, flocks (Master Data)';
    RAISE NOTICE '- analytics.animal_types, breeds, feed_types, formulas (Reference Data)';
    RAISE NOTICE '- analytics.economic_data, external_data_sources (External Data)';
    RAISE NOTICE '- analytics.zones, stations, device_health, master_events (Extended Features)';
    RAISE NOTICE '- analytics.monitoring_alerts, monitoring_alert_rules, monitoring_device_health_log (Monitoring)';
    RAISE NOTICE '';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '- analytics.v_minute_stats, v_minute_with_dims, v_minute_stats_enriched';
    RAISE NOTICE '- analytics.v_latest_feature, v_agg_latest, v_anomaly_recent';
    RAISE NOTICE '- analytics.v_kpi_latest, v_event_daily';
    RAISE NOTICE '- analytics.recent_alerts, unresolved_alerts_summary, kpi_summary';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '- analytics.upsert_minute_feature()';
    RAISE NOTICE '- analytics.touch_updated_at()';
    RAISE NOTICE '';
    RAISE NOTICE 'Database Connection:';
    RAISE NOTICE 'psql -h localhost -U postgres -d farmiq_cloud';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for production use!';
    RAISE NOTICE '=====================================================';
END $$;
