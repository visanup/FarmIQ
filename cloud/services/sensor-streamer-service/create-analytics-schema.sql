-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Enable TimescaleDB extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable btree_gist for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create dimension tables
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

-- Create main analytics tables
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

-- Convert to hypertable
SELECT create_hypertable('analytics.minute_features','bucket',
                         chunk_time_interval => INTERVAL '7 days',
                         if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_minute_features_brin_bucket
  ON analytics.minute_features USING BRIN (bucket);
CREATE INDEX IF NOT EXISTS ix_minute_features_metric_time
  ON analytics.minute_features (tenant_id, metric, bucket DESC);
CREATE INDEX IF NOT EXISTS ix_minute_features_device_time
  ON analytics.minute_features (tenant_id, device_id, bucket DESC);
CREATE INDEX IF NOT EXISTS ix_minute_features_tags_gin
  ON analytics.minute_features USING GIN (tags);

-- Create alerts table
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

-- Grant permissions
GRANT USAGE ON SCHEMA analytics TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO postgres;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Analytics schema created successfully!';
    RAISE NOTICE 'Tables created: dim_device, dim_farm, dim_house, dim_flock, minute_features, analytics_alerts';
END $$;


