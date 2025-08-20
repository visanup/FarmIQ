-- =========================
-- 04_analytic_db.sql
-- Core tables, hypertable, CAGGs, policies, and upsert function
-- =========================

-- Extensions & schema
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Main hypertable: minute_features
-- เก็บสถิติแบบ Welford-friendly ต่อคีย์ (bucket, tenant, device, metric, sensor_id, tags_hash)
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

SELECT add_compression_policy('analytics.minute_features', INTERVAL '3 days');    -- ปรับตามความเหมาะสม
SELECT add_retention_policy  ('analytics.minute_features', INTERVAL '180 days');

-- Continuous Aggregates (5m / 1h / 1d)
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

-- Enable real-time for CAGGs (ไม่ต้องรอ materialization)
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

-- Upsert function (ใช้จาก service ได้ทันที)
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

-- Optional helper tables (publisher & catalog)
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
  rollup        TEXT NOT NULL DEFAULT 'avg',  -- avg|sum|min|max|last|rate|hist
  decimals      INT DEFAULT 2,
  lower_bound   DOUBLE PRECISION,
  upper_bound   DOUBLE PRECISION,
  tags_schema   JSONB DEFAULT '{}'::jsonb,
  description   TEXT
);