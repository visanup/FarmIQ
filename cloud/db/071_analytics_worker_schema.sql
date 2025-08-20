-- analytics_worker_schema_v1_1.sql
-- PostgreSQL + TimescaleDB

-----------------------------
-- 0) EXTENSIONS & SCHEMA  --
-----------------------------
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-----------------------------
-- 1) HELPER ENUMS/TYPES   --
-----------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kpi_period') THEN
    CREATE TYPE kpi_period AS ENUM ('day','week','month');
  END IF;
END$$;

-----------------------------
-- 2) AGGREGATES (HYPERTABLE)
-----------------------------
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

ALTER TABLE analytics.analytics_agg SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,factory_id,machine_id,metric,window_s'
);

-- ✅ policies (idempotent)
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

-----------------------------
-- 3) ANOMALIES (HYPERTABLE)
-----------------------------
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

-----------------------------
-- 4) KPI / CAPABILITY
-----------------------------
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

------------------------------------
-- 5) SPEC LIMITS / CONTROL LIMITS
------------------------------------
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

------------------------------------
-- 6) WORKER CHECKPOINTS / OFFSETS
------------------------------------
CREATE TABLE IF NOT EXISTS analytics.worker_checkpoints (
  group_id     TEXT NOT NULL,
  topic        TEXT NOT NULL,
  partition_id INT  NOT NULL,
  last_offset  BIGINT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT worker_checkpoints_pk PRIMARY KEY (group_id, topic, partition_id)
);
