CREATE SCHEMA IF NOT EXISTS sensors;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. สร้างตาราง sensor_data
CREATE TABLE IF NOT EXISTS sensors.sensor_data (
    time         TIMESTAMPTZ       NOT NULL,
    device_id    INTEGER           NOT NULL,
    topic        TEXT              NOT NULL,
    value        DOUBLE PRECISION  NOT NULL,
    raw_payload  JSONB,
    PRIMARY KEY (time, device_id, topic)
);

-- 2. แปลงตารางให้เป็น Hypertable
SELECT create_hypertable(
    'sensors.sensor_data',   -- schema.table
    'time',                         -- คอลัมน์เวลาสำหรับ partition
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists       => TRUE,
    migrate_data        => TRUE
);

-- 3. สร้าง Index เสริม
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_time
    ON sensors.sensor_data (device_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_data_topic_time
    ON sensors.sensor_data (topic, time DESC);
