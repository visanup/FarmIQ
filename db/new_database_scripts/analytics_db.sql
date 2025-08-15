-- database: analytics_db;

CREATE SCHEMA IF NOT EXISTS analytics;

----------------------------------------------------------------
-- 0. Staging table for unified time-series events
----------------------------------------------------------------
DROP TABLE IF EXISTS analytics.ts_events CASCADE;
CREATE TABLE analytics.ts_events (
    event_id          BIGSERIAL PRIMARY KEY,
    ts                TIMESTAMPTZ   NOT NULL,
    source            VARCHAR(50)   NOT NULL,
    customer_id       INT           NOT NULL,
    farm_id           INT,
    animal_id         INT,
    batch_id          VARCHAR(50),
    feed_assignment_id INT,
    key               TEXT          NOT NULL,
    value             NUMERIC,
    raw_json          JSONB,
    created_at        TIMESTAMPTZ   DEFAULT NOW() NOT NULL
)
PARTITION BY RANGE (ts);

-- Monthly partitions + DEFAULT
DO $$
BEGIN
  FOR month_start IN ARRAY[
    '2025-01-01'::date,
    '2025-02-01'::date
    -- ...เพิ่มตามต้องการ
  ] LOOP
    EXECUTE format($$
      CREATE TABLE IF NOT EXISTS analytics.ts_events_%s
      PARTITION OF analytics.ts_events
      FOR VALUES FROM (%L) TO (%L)
    $$,
    to_char(month_start, 'YYYY_MM'),
    month_start,
    month_start + INTERVAL '1 month');
  END LOOP;
  -- catch-all
  EXECUTE $$
    CREATE TABLE IF NOT EXISTS analytics.ts_events_default
    PARTITION OF analytics.ts_events DEFAULT
  $$;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_tsevents_ts_source
    ON analytics.ts_events(ts, source);
CREATE INDEX IF NOT EXISTS idx_tsevents_rawjson
    ON analytics.ts_events USING GIN(raw_json);

----------------------------------------------------------------
-- 1. Feature Store
----------------------------------------------------------------
DROP TABLE IF EXISTS analytics.feature_store CASCADE;
CREATE TABLE IF NOT EXISTS analytics.feature_store (
    feature_id          BIGSERIAL PRIMARY KEY,
    customer_id         INT            NOT NULL,
    farm_id             INT            NOT NULL,
    animal_id           INT            NOT NULL,
    batch_id            VARCHAR(50),
    feed_assignment_id  INT,
    feature_name        VARCHAR(100)   NOT NULL,
    feature_value       NUMERIC        NOT NULL,
    feature_date        TIMESTAMPTZ    NOT NULL,
    created_at          TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_fs_batch
      FOREIGN KEY(batch_id) REFERENCES farms_master.batches(batch_id),
    CONSTRAINT fk_fs_feed_assignment
      FOREIGN KEY(feed_assignment_id) REFERENCES feeds.feed_batch_assignments(assignment_id)
) PARTITION BY RANGE (feature_date);

-- Monthly partitions
DO $$
DECLARE
  d date := date_trunc('month', now()) - INTERVAL '2 months';
BEGIN
  FOR i IN 0..5 LOOP  -- สร้างล่วงหน้า 6 เดือน
    EXECUTE format($$
      CREATE TABLE IF NOT EXISTS analytics.feature_store_%s
      PARTITION OF analytics.feature_store
      FOR VALUES FROM (%L) TO (%L)
    $$,
    to_char(d + i * INTERVAL '1 month', 'YYYY_MM'),
    d + i * INTERVAL '1 month',
    d + (i+1) * INTERVAL '1 month');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_feature_store_cust_farm_animal_date
    ON analytics.feature_store(customer_id, farm_id, animal_id, feature_date);
CREATE INDEX IF NOT EXISTS idx_feature_store_batch_date
    ON analytics.feature_store(batch_id, feature_date);
CREATE INDEX IF NOT EXISTS idx_feature_store_feed_assignment
    ON analytics.feature_store(feed_assignment_id);

----------------------------------------------------------------
-- 2. Model Results
----------------------------------------------------------------
DROP TABLE IF EXISTS analytics.model_results CASCADE;
CREATE TABLE IF NOT EXISTS analytics.model_results (
    result_id           BIGSERIAL PRIMARY KEY,
    customer_id         INT            NOT NULL,
    farm_id             INT            NOT NULL,
    animal_id           INT            NOT NULL,
    batch_id            VARCHAR(50),
    feed_assignment_id  INT,
    model_name          VARCHAR(100)   NOT NULL,
    prediction          JSONB          NOT NULL,
    anomaly_score       NUMERIC,
    result_date         TIMESTAMPTZ    NOT NULL,
    created_at          TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_mr_batch
      FOREIGN KEY(batch_id) REFERENCES farms_master.batches(batch_id),
    CONSTRAINT fk_mr_feed_assignment
      FOREIGN KEY(feed_assignment_id) REFERENCES feeds.feed_batch_assignments(assignment_id)
) PARTITION BY RANGE (result_date);

-- Quarterly partitions
DO $$
DECLARE
  start_q date := date_trunc('quarter', now()) - INTERVAL '4 quarters';
BEGIN
  FOR i IN 0..7 LOOP  -- ครอบคลุม 8 ไตรมาส
    EXECUTE format($$
      CREATE TABLE IF NOT EXISTS analytics.model_results_%s
      PARTITION OF analytics.model_results
      FOR VALUES FROM (%L) TO (%L)
    $$,
    to_char(start_q + i * INTERVAL '3 months', 'YYYY_Q'),
    start_q + i * INTERVAL '3 months',
    start_q + (i+1) * INTERVAL '3 months');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_model_results_cust_farm_animal_date
    ON analytics.model_results(customer_id, farm_id, animal_id, result_date);
CREATE INDEX IF NOT EXISTS idx_model_results_batch_date
    ON analytics.model_results(batch_id, result_date);
CREATE INDEX IF NOT EXISTS idx_model_results_feed_assignment
    ON analytics.model_results(feed_assignment_id);

----------------------------------------------------------------
-- 3. Data Quality Logs
----------------------------------------------------------------
DROP TABLE IF EXISTS analytics.data_quality_logs CASCADE;
CREATE TABLE IF NOT EXISTS analytics.data_quality_logs (
    log_id           BIGSERIAL PRIMARY KEY,
    run_id           UUID         NOT NULL,
    table_name       TEXT         NOT NULL,
    record_id        TEXT,
    issue_type       TEXT         NOT NULL,
    details          JSONB,
    logged_at        TIMESTAMPTZ  DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dqlogs_run_table
    ON analytics.data_quality_logs(run_id, table_name);

----------------------------------------------------------------
-- 4. Metadata & Lineage
----------------------------------------------------------------
DROP TABLE IF EXISTS analytics.pipeline_metadata CASCADE;
CREATE TABLE IF NOT EXISTS analytics.pipeline_metadata (
    run_id           UUID PRIMARY KEY,
    pipeline_name    TEXT      NOT NULL,
    version          TEXT      NOT NULL,
    started_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    finished_at      TIMESTAMPTZ,
    status           TEXT      NOT NULL,
    metrics          JSONB
);

----------------------------------------------------------------
-- 5. updated_at triggers
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION analytics.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- feature_store
DROP TRIGGER IF EXISTS trg_fs_updated_at ON analytics.feature_store;
CREATE TRIGGER trg_fs_updated_at
  BEFORE UPDATE ON analytics.feature_store
  FOR EACH ROW EXECUTE PROCEDURE analytics.update_updated_at_column();

-- model_results
DROP TRIGGER IF EXISTS trg_mr_updated_at ON analytics.model_results;
CREATE TRIGGER trg_mr_updated_at
  BEFORE UPDATE ON analytics.model_results
  FOR EACH ROW EXECUTE PROCEDURE analytics.update_updated_at_column();

----------------------------------------------------------------
-- 6. Retention Functions
----------------------------------------------------------------
-- Feature Store retention
CREATE OR REPLACE FUNCTION analytics.drop_old_feature_partitions(retention_days INT)
RETURNS VOID AS $$
DECLARE
  p text;
BEGIN
  FOR p IN
    SELECT relname FROM pg_class
    WHERE relname ~ '^feature_store_[0-9]{4}_[0-9]{2}$'
      AND relname < format('feature_store_%s', to_char(now() - retention_days * interval '1 day', 'YYYY_MM'))
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS analytics.%I CASCADE', p);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Model Results retention
CREATE OR REPLACE FUNCTION analytics.drop_old_model_partitions(retention_days INT)
RETURNS VOID AS $$
DECLARE
  p text;
BEGIN
  FOR p IN
    SELECT relname FROM pg_class
    WHERE relname ~ '^model_results_[0-9]{4}_Q[1-4]$'
      AND relname < format('model_results_%s', to_char(now() - retention_days * interval '1 day', 'YYYY_Q'))
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS analytics.%I CASCADE', p);
  END LOOP;
END;
$$ LANGUAGE plpgsql;
