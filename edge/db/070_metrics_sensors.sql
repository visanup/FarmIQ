-- ────────────────────────────────────────────────────────────────────────────
-- migrations/070_metrics_sensors.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.metrics_dim (
  metric     TEXT PRIMARY KEY,
  unit       TEXT NOT NULL,
  thresholds JSONB,
  meta       JSONB
);

CREATE TABLE IF NOT EXISTS sensors.sensor_modules (
  tenant_id  TEXT NOT NULL,
  sensor_id  TEXT NOT NULL,
  robot_id   TEXT,
  station_id TEXT,
  kind       TEXT NOT NULL,
  calib      JSONB,
  meta       JSONB,
  PRIMARY KEY (tenant_id, sensor_id),
  FOREIGN KEY (tenant_id, robot_id)
    REFERENCES sensors.robots(tenant_id, robot_id)   ON DELETE SET NULL,
  FOREIGN KEY (tenant_id, station_id)
    REFERENCES sensors.lab_stations(tenant_id, station_id) ON DELETE SET NULL
);