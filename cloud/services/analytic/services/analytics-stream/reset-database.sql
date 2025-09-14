-- Reset Analytics Database Script
-- This script will drop all existing tables and recreate them according to the Prisma schema

-- Connect to the database
\c farmiq_cloud;

-- Drop all tables in analytics schema (in correct order to handle dependencies)
DROP SCHEMA IF EXISTS analytics CASCADE;

-- Recreate analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create enums first
CREATE TYPE analytics.kpi_period AS ENUM ('day','week','month');

-- Create the main tables according to Prisma schema

-- 1. minute_features (main hypertable)
CREATE TABLE analytics.minute_features (
  bucket       TIMESTAMPTZ NOT NULL,
  tenant_id    TEXT        NOT NULL,
  device_id    TEXT        NOT NULL,
  sensor_id    TEXT        NOT NULL DEFAULT '',
  metric       TEXT        NOT NULL,
  tags         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  tags_hash    TEXT        GENERATED ALWAYS AS (md5(tags::text)) STORED,
  value_count  BIGINT      NOT NULL DEFAULT 0,
  value_sum    DOUBLE PRECISION NOT NULL DEFAULT 0,
  value_min    DOUBLE PRECISION NOT NULL,
  value_max    DOUBLE PRECISION NOT NULL,
  value_sumsq  DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT minute_features_pk PRIMARY KEY (bucket, tenant_id, device_id, metric, sensor_id, tags_hash)
);

-- Convert to hypertable
SELECT create_hypertable('analytics.minute_features','bucket', chunk_time_interval => INTERVAL '7 days');

-- 2. Dimension tables
CREATE TABLE analytics.dim_device (
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

CREATE TABLE analytics.dim_farm (
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

CREATE TABLE analytics.dim_house (
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

CREATE TABLE analytics.dim_flock (
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

CREATE TABLE analytics.dim_customer (
  tenant_id   TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, customer_id)
);

CREATE TABLE analytics.dim_animal_type (
  tenant_id      TEXT NOT NULL,
  animal_type_id TEXT NOT NULL,
  name           TEXT,
  category       TEXT,
  description    TEXT,
  meta           JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, animal_type_id)
);

CREATE TABLE analytics.dim_breed (
  tenant_id       TEXT NOT NULL,
  breed_id        TEXT NOT NULL,
  animal_type_id  TEXT NOT NULL,
  name            TEXT,
  code            TEXT,
  description     TEXT,
  characteristics JSONB DEFAULT '{}'::jsonb,
  meta            JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, breed_id)
);

-- 3. Analytics tables
CREATE TABLE analytics.analytics_agg (
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
  CONSTRAINT analytics_agg_pk PRIMARY KEY (tenant_id, factory_id, machine_id, metric, window_s, bucket_start)
);

SELECT create_hypertable('analytics.analytics_agg','bucket_start', chunk_time_interval => INTERVAL '7 days');

CREATE TABLE analytics.analytics_event (
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
  CONSTRAINT analytics_event_pk PRIMARY KEY (tenant_id, domain, entity_type, entity_id, event_type, time)
);

SELECT create_hypertable('analytics.analytics_event','time', chunk_time_interval => INTERVAL '7 days');

CREATE TABLE analytics.analytics_event_rollup (
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
  CONSTRAINT analytics_event_rollup_pk PRIMARY KEY (tenant_id, domain, entity_type, entity_id, event_type, window_s, bucket_start)
);

SELECT create_hypertable('analytics.analytics_event_rollup','bucket_start', chunk_time_interval => INTERVAL '30 days');

CREATE TABLE analytics.analytics_kpi (
  period          analytics.kpi_period NOT NULL,
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
  CONSTRAINT analytics_kpi_pk PRIMARY KEY (tenant_id, factory_id, machine_id, metric, period, period_start)
);

SELECT create_hypertable('analytics.analytics_kpi','period_start', chunk_time_interval => INTERVAL '30 days');

CREATE TABLE analytics.analytics_anomaly (
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
  CONSTRAINT analytics_anomaly_pk PRIMARY KEY (tenant_id, factory_id, machine_id, metric, time, rule_code)
);

SELECT create_hypertable('analytics.analytics_anomaly','time', chunk_time_interval => INTERVAL '7 days');

CREATE TABLE analytics.analytics_alerts (
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

-- 4. New Analytics Models (FCR, Health, Production, etc.)
CREATE TABLE analytics.fcr_calculations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  house_id TEXT NOT NULL,
  flock_id TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_feed DOUBLE PRECISION NOT NULL,
  total_weight DOUBLE PRECISION NOT NULL,
  fcr_value DOUBLE PRECISION NOT NULL,
  population INTEGER,
  breed TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.fcr_targets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  house_id TEXT,
  breed TEXT,
  target_fcr DOUBLE PRECISION NOT NULL,
  min_fcr DOUBLE PRECISION,
  max_fcr DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.size_distributions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  house_id TEXT NOT NULL,
  flock_id TEXT NOT NULL,
  measurement_date TIMESTAMPTZ NOT NULL,
  weight_class TEXT NOT NULL,
  min_weight DOUBLE PRECISION NOT NULL,
  max_weight DOUBLE PRECISION NOT NULL,
  count INTEGER NOT NULL,
  percentage DOUBLE PRECISION,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.prediction_models (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'ACTIVE',
  config JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.predictions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  house_id TEXT,
  flock_id TEXT,
  device_id TEXT,
  prediction_type TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  predicted_value DOUBLE PRECISION NOT NULL,
  confidence DOUBLE PRECISION,
  actual_value DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.health_metrics (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  house_id TEXT NOT NULL,
  flock_id TEXT NOT NULL,
  measurement_date TIMESTAMPTZ NOT NULL,
  mortality_rate DOUBLE PRECISION NOT NULL,
  morbidity_rate DOUBLE PRECISION NOT NULL,
  avg_weight DOUBLE PRECISION,
  feed_intake DOUBLE PRECISION,
  water_intake DOUBLE PRECISION,
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.production_metrics (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  house_id TEXT NOT NULL,
  flock_id TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_production DOUBLE PRECISION NOT NULL,
  daily_production DOUBLE PRECISION NOT NULL,
  production_rate DOUBLE PRECISION NOT NULL,
  quality_score DOUBLE PRECISION,
  efficiency DOUBLE PRECISION,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.environmental_metrics (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  house_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  measurement_date TIMESTAMPTZ NOT NULL,
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  co2_level DOUBLE PRECISION,
  nh3_level DOUBLE PRECISION,
  light_level DOUBLE PRECISION,
  air_velocity DOUBLE PRECISION,
  pressure DOUBLE PRECISION,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.analytics_configs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  config_type TEXT NOT NULL,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.analytics_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  priority INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Helper tables
CREATE TABLE analytics.feature_publish_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  bucket TIMESTAMPTZ NOT NULL,
  device_id TEXT NOT NULL,
  sensor_id TEXT NOT NULL DEFAULT '',
  metric TEXT NOT NULL,
  tags_hash TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics.minute_watermark (
  tenant_id TEXT PRIMARY KEY,
  watermark TIMESTAMPTZ NOT NULL
);

CREATE TABLE analytics.metric_catalog (
  metric TEXT PRIMARY KEY,
  display_name TEXT,
  unit TEXT,
  rollup TEXT NOT NULL DEFAULT 'avg',
  decimals INT DEFAULT 2,
  lower_bound DOUBLE PRECISION,
  upper_bound DOUBLE PRECISION,
  tags_schema JSONB DEFAULT '{}'::jsonb,
  description TEXT
);

CREATE TABLE analytics.worker_checkpoints (
  group_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  partition_id INT NOT NULL,
  last_offset BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT worker_checkpoints_pk PRIMARY KEY (group_id, topic, partition_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_minute_features_brin_bucket ON analytics.minute_features USING BRIN (bucket);
CREATE INDEX IF NOT EXISTS ix_minute_features_metric_time ON analytics.minute_features (tenant_id, metric, bucket DESC);
CREATE INDEX IF NOT EXISTS ix_minute_features_device_time ON analytics.minute_features (tenant_id, device_id, bucket DESC);
CREATE INDEX IF NOT EXISTS ix_minute_features_tags_gin ON analytics.minute_features USING GIN (tags);

-- Dimension table indexes
CREATE INDEX IF NOT EXISTS ix_dim_device_farm ON analytics.dim_device(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS ix_dim_device_house ON analytics.dim_device(tenant_id, house_id);
CREATE INDEX IF NOT EXISTS gin_dim_device_meta ON analytics.dim_device USING GIN (meta);

CREATE INDEX IF NOT EXISTS gin_dim_farm_meta ON analytics.dim_farm USING GIN (meta);

CREATE INDEX IF NOT EXISTS ix_dim_house_farm ON analytics.dim_house(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_dim_house_meta ON analytics.dim_house USING GIN (meta);

CREATE INDEX IF NOT EXISTS ix_dim_flock_house ON analytics.dim_flock(tenant_id, house_id);
CREATE INDEX IF NOT EXISTS ix_dim_flock_farm ON analytics.dim_flock(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_dim_flock_meta ON analytics.dim_flock USING GIN (meta);

CREATE INDEX IF NOT EXISTS gin_dim_customer_meta ON analytics.dim_customer USING GIN (meta);
CREATE INDEX IF NOT EXISTS gin_dim_animal_type_meta ON analytics.dim_animal_type USING GIN (meta);

CREATE INDEX IF NOT EXISTS ix_dim_breed_animal_type ON analytics.dim_breed(tenant_id, animal_type_id);
CREATE INDEX IF NOT EXISTS gin_dim_breed_meta ON analytics.dim_breed USING GIN (meta);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_agg_lookup ON analytics.analytics_agg (factory_id, machine_id, metric, window_s, bucket_start DESC);
CREATE INDEX IF NOT EXISTS idx_event_lookup ON analytics.analytics_event (domain, entity_type, entity_id, event_type, time DESC);
CREATE INDEX IF NOT EXISTS idx_event_rollup_lookup ON analytics.analytics_event_rollup (domain, entity_type, entity_id, event_type, window_s, bucket_start DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_lookup ON analytics.analytics_kpi (factory_id, machine_id, metric, period, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_lookup ON analytics.analytics_anomaly (factory_id, machine_id, metric, time DESC);

-- New analytics table indexes
CREATE INDEX IF NOT EXISTS ix_fcr_calculations_tenant_farm_house_flock ON analytics.fcr_calculations(tenant_id, farm_id, house_id, flock_id);
CREATE INDEX IF NOT EXISTS ix_fcr_calculations_period ON analytics.fcr_calculations(period_start, period_end);
CREATE INDEX IF NOT EXISTS ix_fcr_calculations_fcr_value ON analytics.fcr_calculations(fcr_value);

CREATE INDEX IF NOT EXISTS ix_fcr_targets_tenant_farm_house ON analytics.fcr_targets(tenant_id, farm_id, house_id);
CREATE INDEX IF NOT EXISTS ix_fcr_targets_breed ON analytics.fcr_targets(breed);
CREATE INDEX IF NOT EXISTS ix_fcr_targets_is_active ON analytics.fcr_targets(is_active);

CREATE INDEX IF NOT EXISTS ix_size_distributions_tenant_farm_house_flock ON analytics.size_distributions(tenant_id, farm_id, house_id, flock_id);
CREATE INDEX IF NOT EXISTS ix_size_distributions_measurement_date ON analytics.size_distributions(measurement_date);
CREATE INDEX IF NOT EXISTS ix_size_distributions_weight_class ON analytics.size_distributions(weight_class);

CREATE INDEX IF NOT EXISTS ix_prediction_models_tenant_model_type ON analytics.prediction_models(tenant_id, model_type);
CREATE INDEX IF NOT EXISTS ix_prediction_models_status ON analytics.prediction_models(status);
CREATE INDEX IF NOT EXISTS ix_prediction_models_is_active ON analytics.prediction_models(is_active);

CREATE INDEX IF NOT EXISTS ix_predictions_tenant_model_id ON analytics.predictions(tenant_id, model_id);
CREATE INDEX IF NOT EXISTS ix_predictions_prediction_type_target_date ON analytics.predictions(prediction_type, target_date);
CREATE INDEX IF NOT EXISTS ix_predictions_farm_house_flock ON analytics.predictions(farm_id, house_id, flock_id);

CREATE INDEX IF NOT EXISTS ix_health_metrics_tenant_farm_house_flock ON analytics.health_metrics(tenant_id, farm_id, house_id, flock_id);
CREATE INDEX IF NOT EXISTS ix_health_metrics_measurement_date ON analytics.health_metrics(measurement_date);

CREATE INDEX IF NOT EXISTS ix_production_metrics_tenant_farm_house_flock ON analytics.production_metrics(tenant_id, farm_id, house_id, flock_id);
CREATE INDEX IF NOT EXISTS ix_production_metrics_period ON analytics.production_metrics(period_start, period_end);

CREATE INDEX IF NOT EXISTS ix_environmental_metrics_tenant_farm_house_device ON analytics.environmental_metrics(tenant_id, farm_id, house_id, device_id);
CREATE INDEX IF NOT EXISTS ix_environmental_metrics_measurement_date ON analytics.environmental_metrics(measurement_date);

CREATE INDEX IF NOT EXISTS ix_analytics_configs_tenant_config_type ON analytics.analytics_configs(tenant_id, config_type);
CREATE INDEX IF NOT EXISTS ix_analytics_configs_config_key ON analytics.analytics_configs(config_key);
CREATE INDEX IF NOT EXISTS ix_analytics_configs_is_active ON analytics.analytics_configs(is_active);

CREATE INDEX IF NOT EXISTS ix_analytics_jobs_tenant_job_type ON analytics.analytics_jobs(tenant_id, job_type);
CREATE INDEX IF NOT EXISTS ix_analytics_jobs_status ON analytics.analytics_jobs(status);
CREATE INDEX IF NOT EXISTS ix_analytics_jobs_priority ON analytics.analytics_jobs(priority);

-- Helper table indexes
CREATE INDEX IF NOT EXISTS ix_publog_bucket ON analytics.feature_publish_log(tenant_id, bucket DESC);

-- Grant permissions
GRANT USAGE ON SCHEMA analytics TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO postgres;

-- Success message
SELECT 'Analytics database reset completed successfully!' as status;
