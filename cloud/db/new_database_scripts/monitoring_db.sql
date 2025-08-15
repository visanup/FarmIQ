-- database: monitoring_db;

CREATE SCHEMA IF NOT EXISTS monitoring;

-- 1. alerts (per-customer)
DROP TABLE IF EXISTS monitoring.alerts CASCADE;
CREATE TABLE monitoring.alerts (
    alert_id     BIGSERIAL       PRIMARY KEY,
    customer_id  INT             NOT NULL,
    farm_id      INT             NOT NULL,
    alert_type   VARCHAR(100)    NOT NULL,
    description  TEXT,
    severity     VARCHAR(50)     NOT NULL,
    status       VARCHAR(50)     NOT NULL DEFAULT 'active',
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ,
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    batch_id     VARCHAR(50),
    feed_assignment_id INT,
    -- Foreign keys to link batch/feed context
    CONSTRAINT fk_alerts_batch           FOREIGN KEY(batch_id)           REFERENCES farms_master.batches(batch_id),
    CONSTRAINT fk_alerts_feed_assignment FOREIGN KEY(feed_assignment_id) REFERENCES feeds.feed_batch_assignments(assignment_id)
);
-- Composite index for tenant/farm/status
CREATE INDEX idx_alerts_cust_farm_status
    ON monitoring.alerts(customer_id, farm_id, status);

-- 2. alert_rules (per-customer)
DROP TABLE IF EXISTS monitoring.alert_rules CASCADE;
CREATE TABLE monitoring.alert_rules (
    rule_id      BIGSERIAL       PRIMARY KEY,
    customer_id  INT             NOT NULL,
    metric_name  VARCHAR(100)    NOT NULL,
    threshold    NUMERIC         NOT NULL,
    condition    VARCHAR(10)     NOT NULL,  -- e.g. '>', '<', '='
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
-- Composite index for tenant-scoped lookup
CREATE INDEX idx_alert_rules_cust_metric
    ON monitoring.alert_rules(customer_id, metric_name);

-- 3. Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION monitoring.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach triggers
DROP TRIGGER IF EXISTS update_alerts_updated_at ON monitoring.alerts;
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON monitoring.alerts
  FOR EACH ROW EXECUTE PROCEDURE monitoring.update_updated_at_column();

DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON monitoring.alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON monitoring.alert_rules
  FOR EACH ROW EXECUTE PROCEDURE monitoring.update_updated_at_column();



