-- 02_analytics_events.sql
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE SCHEMA IF NOT EXISTS analytics;

-- 1) Raw domain events
CREATE TABLE IF NOT EXISTS analytics.analytics_event (
  time         TIMESTAMPTZ NOT NULL,
  tenant_id    TEXT NOT NULL,
  domain       TEXT NOT NULL,        -- 'feed','ops','device','econ','weather','lab',...
  entity_type  TEXT NOT NULL,        -- 'silo','batch','machine','station','workorder',...
  entity_id    TEXT NOT NULL,
  event_type   TEXT NOT NULL,        -- 'delivery_received','status','alarm','price_update',...
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

-- 2) Event rollup by window
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
