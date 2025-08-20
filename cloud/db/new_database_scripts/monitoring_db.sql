CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE OR REPLACE FUNCTION monitoring.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS monitoring.alert_rules (
  tenant_id   TEXT NOT NULL,
  rule_id     TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  threshold   NUMERIC NOT NULL,
  condition   TEXT NOT NULL,      -- '>', '<', '>=' ...
  scope       JSONB NOT NULL DEFAULT '{}'::jsonb, -- filter: farm_id/house_id/device_id/tags
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, rule_id)
);
CREATE INDEX IF NOT EXISTS ix_rules_metric ON monitoring.alert_rules(tenant_id, metric_name);
CREATE TRIGGER trg_upd_rules BEFORE UPDATE ON monitoring.alert_rules
FOR EACH ROW EXECUTE PROCEDURE monitoring.touch_updated_at();

CREATE TABLE IF NOT EXISTS monitoring.alerts (
  tenant_id   TEXT NOT NULL,
  alert_id    TEXT NOT NULL,
  alert_type  TEXT NOT NULL,
  severity    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  farm_id     TEXT,
  house_id    TEXT,
  device_id   TEXT,
  batch_id    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, alert_id)
);
CREATE INDEX IF NOT EXISTS ix_alerts_status ON monitoring.alerts(tenant_id, status, severity, created_at DESC);
CREATE TRIGGER trg_upd_alerts BEFORE UPDATE ON monitoring.alerts
FOR EACH ROW EXECUTE PROCEDURE monitoring.touch_updated_at();

-- (optional) device health ledger → ใช้ publish 'sensors.device.health'
CREATE TABLE IF NOT EXISTS monitoring.device_health_log (
  tenant_id TEXT NOT NULL,
  id        BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  status    TEXT NOT NULL,      -- up/down/degraded
  time      TIMESTAMPTZ NOT NULL,
  meta      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_health_time ON monitoring.device_health_log(tenant_id, device_id, time DESC);

-- outbox
CREATE TABLE IF NOT EXISTS monitoring.events_outbox (
  id BIGSERIAL PRIMARY KEY, topic TEXT NOT NULL, payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_mon_outbox_unpub ON monitoring.events_outbox(published_at) WHERE published_at IS NULL;




