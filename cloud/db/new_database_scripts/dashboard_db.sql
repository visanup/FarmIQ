-- database: dashboard_db;

CREATE SCHEMA IF NOT EXISTS dashboard;

-- 1. dashboard_cache: aggregated metrics per farm/animal/batch/feed
DROP TABLE IF EXISTS dashboard.dashboard_cache CASCADE;
CREATE TABLE dashboard.dashboard_cache (
    cache_id           BIGSERIAL PRIMARY KEY,
    customer_id        INT            NOT NULL,
    farm_id            INT            NOT NULL,
    animal_id          INT,
    batch_id           VARCHAR(50),
    feed_assignment_id INT,
    metric_name        VARCHAR(100)   NOT NULL,
    metric_value       NUMERIC        NOT NULL,
    metric_date        TIMESTAMPTZ    NOT NULL,
    created_at         TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
    updated_at         TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
    -- Foreign keys
    CONSTRAINT fk_cache_batch      FOREIGN KEY(batch_id)           REFERENCES farms_master.batches(batch_id),
    CONSTRAINT fk_cache_feed_assign FOREIGN KEY(feed_assignment_id) REFERENCES feeds.feed_batch_assignments(assignment_id)
);
-- Index for tenant/farm/metric/date filtering
CREATE INDEX idx_dashboard_cache_cust_farm_animal_metric_date
    ON dashboard.dashboard_cache(customer_id, farm_id, animal_id, metric_name, metric_date);

-- 2. user_dashboard_config: per-user layout/preferences
DROP TABLE IF EXISTS dashboard.user_dashboard_config CASCADE;
CREATE TABLE dashboard.user_dashboard_config (
    config_id     BIGSERIAL PRIMARY KEY,
    customer_id   INT            NOT NULL,
    user_id       INT            NOT NULL,
    config        JSONB          NOT NULL,
    created_at    TIMESTAMPTZ    DEFAULT NOW() NOT NULL,
    updated_at    TIMESTAMPTZ    DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_user_dashboard_config_cust_user
    ON dashboard.user_dashboard_config(customer_id, user_id);

-- 3. Trigger function for updated_at
CREATE OR REPLACE FUNCTION dashboard.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS update_dashboard_cache_updated_at ON dashboard.dashboard_cache;
CREATE TRIGGER update_dashboard_cache_updated_at
  BEFORE UPDATE ON dashboard.dashboard_cache
  FOR EACH ROW EXECUTE PROCEDURE dashboard.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_dashboard_config_updated_at ON dashboard.user_dashboard_config;
CREATE TRIGGER update_user_dashboard_config_updated_at
  BEFORE UPDATE ON dashboard.user_dashboard_config
  FOR EACH ROW EXECUTE PROCEDURE dashboard.update_updated_at_column();

-- 4. Optional: views for dashboard queries
-- Example: latest metrics per farm
CREATE OR REPLACE VIEW dashboard.latest_metrics_per_farm AS
SELECT customer_id, farm_id, metric_name,
       (SELECT metric_value FROM dashboard.dashboard_cache dc2
        WHERE dc2.customer_id = dc.customer_id
          AND dc2.farm_id = dc.farm_id
          AND dc2.metric_name = dc.metric_name
        ORDER BY metric_date DESC LIMIT 1) AS latest_value,
       (SELECT metric_date FROM dashboard.dashboard_cache dc3
        WHERE dc3.customer_id = dc.customer_id
          AND dc3.farm_id = dc.farm_id
          AND dc3.metric_name = dc.metric_name
        ORDER BY metric_date DESC LIMIT 1) AS latest_date
FROM dashboard.dashboard_cache dc
GROUP BY customer_id, farm_id, metric_name;

-- Example: user-specific dashboard config join default
CREATE OR REPLACE VIEW dashboard.user_config_with_defaults AS
SELECT u.customer_id, u.user_id, COALESCE(u.config, '{}'::JSONB) AS config
FROM dashboard.user_dashboard_config u;


