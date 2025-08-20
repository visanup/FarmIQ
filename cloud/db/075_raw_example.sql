-- 90_raw_example.sql
-- ตัวอย่างตาราง raw สำหรับ backfill (ใช้ได้กับ services/backfill.py)
CREATE SCHEMA IF NOT EXISTS sensors;

CREATE TABLE IF NOT EXISTS sensors.device_readings (
  time        TIMESTAMPTZ NOT NULL,
  tenant_id   TEXT NOT NULL,
  factory_id  TEXT NOT NULL,
  machine_id  TEXT NOT NULL,
  sensor_id   TEXT,
  metric      TEXT NOT NULL,
  value       DOUBLE PRECISION NOT NULL,
  payload     JSONB
);

SELECT create_hypertable('sensors.device_readings','time',
                         if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS idx_device_readings_lookup
  ON sensors.device_readings (factory_id, machine_id, metric, time DESC);
