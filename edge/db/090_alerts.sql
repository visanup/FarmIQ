-- ────────────────────────────────────────────────────────────────────────────
-- migrations/090_alerts.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.alerts (
  alert_id   BIGSERIAL PRIMARY KEY,
  time       TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id  TEXT NOT NULL,
  robot_id   TEXT,
  run_id     BIGINT,
  station_id TEXT,
  metric     TEXT,
  severity   INT,
  title      TEXT,
  message    TEXT,
  context    JSONB,
  status     sensors.alert_status NOT NULL DEFAULT 'open'
);

CREATE INDEX IF NOT EXISTS idx_alerts_tenant_time
  ON sensors.alerts (tenant_id, time DESC);
