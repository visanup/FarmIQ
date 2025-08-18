-- เปิดใช้งาน TimescaleDB (ถ้ามี)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- สร้าง schema สำหรับข้อมูลเซนเซอร์
CREATE SCHEMA IF NOT EXISTS sensors;

-- ===========================
-- 1) sensors.device_readings
-- ===========================
CREATE TABLE IF NOT EXISTS sensors.device_readings (
  "time"      timestamptz NOT NULL,
  tenant_id   text        NOT NULL,
  device_id   text        NOT NULL,
  metric      text        NOT NULL,
  sensor_id   text        NULL,
  value       double precision NOT NULL,
  quality     text        NOT NULL DEFAULT 'clean',
  payload     jsonb       NULL,
  CONSTRAINT pk_device_readings PRIMARY KEY ("time", tenant_id, device_id, metric)
);

-- index ช่วย query ยอดนิยม
CREATE INDEX IF NOT EXISTS idx_device_readings_tenant_device_metric_time
  ON sensors.device_readings (tenant_id, device_id, metric, "time");

-- เปลี่ยนเป็น hypertable (ปลอดภัยแม้มีตารางอยู่แล้ว)
SELECT create_hypertable('sensors.device_readings', 'time',
                         if_not_exists => TRUE,
                         migrate_data  => TRUE,
                         chunk_time_interval => INTERVAL '7 days');

-- ===========================
-- 2) sensors.device_health
-- ===========================
CREATE TABLE IF NOT EXISTS sensors.device_health (
  "time"      timestamptz NOT NULL,
  tenant_id   text        NOT NULL,
  device_id   text        NOT NULL,
  online      boolean     NULL,
  source      text        NULL,
  rssi        integer     NULL,
  uptime_s    bigint      NULL,
  meta        jsonb       NULL,
  CONSTRAINT pk_device_health PRIMARY KEY ("time", tenant_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_device_health_tenant_device_time
  ON sensors.device_health (tenant_id, device_id, "time");

SELECT create_hypertable('sensors.device_health', 'time',
                         if_not_exists => TRUE,
                         migrate_data  => TRUE,
                         chunk_time_interval => INTERVAL '7 days');

-- ===========================
-- 3) sensors.lab_readings
-- ===========================
CREATE TABLE IF NOT EXISTS sensors.lab_readings (
  "time"      timestamptz NOT NULL,
  tenant_id   text        NOT NULL,
  station_id  text        NOT NULL,
  sensor_id   text        NOT NULL,
  metric      text        NOT NULL,
  value       double precision NOT NULL,
  quality     text        NOT NULL DEFAULT 'clean',
  payload     jsonb       NULL,
  CONSTRAINT pk_lab_readings PRIMARY KEY ("time", tenant_id, station_id, sensor_id, metric)
);

CREATE INDEX IF NOT EXISTS idx_lab_readings_tenant_station_metric_time
  ON sensors.lab_readings (tenant_id, station_id, metric, "time");

SELECT create_hypertable('sensors.lab_readings', 'time',
                         if_not_exists => TRUE,
                         migrate_data  => TRUE,
                         chunk_time_interval => INTERVAL '7 days');

-- ===========================
-- 4) sensors.sweep_readings
-- ===========================
CREATE TABLE IF NOT EXISTS sensors.sweep_readings (
  "time"      timestamptz NOT NULL,
  tenant_id   text        NOT NULL,
  robot_id    text        NOT NULL,
  run_id      bigint      NOT NULL,
  sensor_id   text        NOT NULL,
  metric      text        NOT NULL,
  zone_id     text        NULL,
  x           double precision NULL,
  y           double precision NULL,
  value       double precision NOT NULL,
  quality     text        NOT NULL DEFAULT 'clean',
  payload     jsonb       NULL,
  CONSTRAINT pk_sweep_readings PRIMARY KEY ("time", tenant_id, robot_id, run_id, sensor_id, metric)
);

-- ดัชนีตามที่ใช้ค้นหาในงานจริง
CREATE INDEX IF NOT EXISTS idx_sweep_readings_run_metric_time
  ON sensors.sweep_readings (run_id, metric, "time");
CREATE INDEX IF NOT EXISTS idx_sweep_readings_zone_time
  ON sensors.sweep_readings (zone_id, "time");

SELECT create_hypertable('sensors.sweep_readings', 'time',
                         if_not_exists => TRUE,
                         migrate_data  => TRUE,
                         chunk_time_interval => INTERVAL '3 days');

-- ==================================
-- 5) sensors.sync_state
CREATE TABLE IF NOT EXISTS sensors.sync_state (
  table_name text PRIMARY KEY,
  last_ts    timestamptz NOT NULL DEFAULT to_timestamp(0)
);

-- 6) sensors.stream_state  (ให้ match กับ entity StreamState ที่คุณเขียน)
CREATE TABLE IF NOT EXISTS sensors.stream_state (
  name       text PRIMARY KEY,
  last_time  timestamptz NULL,
  tenant_id  text        NULL,
  robot_id   text        NULL,
  run_id     text        NULL,   -- ถ้าในโค้ดคุณอยากให้เป็น bigint เปลี่ยนเป็น bigint ได้
  sensor_id  text        NULL,
  metric     text        NULL,
  last_key     jsonb       NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ตัวอย่างนโยบาย (เลือกใช้ตามต้องการ):
-- 1) นโยบายเก็บข้อมูล 180 วัน
-- SELECT add_retention_policy('sensors.device_readings', INTERVAL '180 days');
-- SELECT add_retention_policy('sensors.device_health',   INTERVAL '180 days');
-- SELECT add_retention_policy('sensors.lab_readings',    INTERVAL '365 days');
-- SELECT add_retention_policy('sensors.sweep_readings',  INTERVAL '90 days');

-- 2) เปิด compression (ต้องใช้ TimescaleDB 2.x ขึ้นไป)
-- ALTER TABLE sensors.device_readings SET (timescaledb.compress, timescaledb.compress_segmentby = 'tenant_id,device_id,metric');
-- SELECT add_compression_policy('sensors.device_readings', INTERVAL '30 days');

-- เสริมความปลอดภัย/สิทธิ์ (ถ้าต้องการแบ่ง role)
-- GRANT USAGE ON SCHEMA sensors TO postgres;
-- GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA sensors TO postgres;
