-- TimescaleDB Setup Migration
-- This migration sets up TimescaleDB extensions and converts tables to hypertables

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create sensors schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS sensors;

-- Convert sensor_readings table to hypertable
-- Note: This should be run after the main Prisma migration
SELECT create_hypertable('sensors.sensor_readings', 'timestamp', if_not_exists => TRUE);

-- Convert sweep_readings table to hypertable
SELECT create_hypertable('sensors.sweep_readings', 'timestamp', if_not_exists => TRUE);

-- Convert lab_readings table to hypertable
SELECT create_hypertable('sensors.lab_readings', 'timestamp', if_not_exists => TRUE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_timestamp 
ON sensors.sensor_readings (device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_type_timestamp 
ON sensors.sensor_readings (sensor_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sweep_readings_device_timestamp 
ON sensors.sweep_readings (device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_lab_readings_sample_timestamp 
ON sensors.lab_readings (sample_id, timestamp DESC);

-- Create continuous aggregates for common queries
-- Hourly sensor data aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS sensors.sensor_readings_hourly
WITH (timescaledb.continuous) AS
SELECT 
    device_id,
    sensor_type,
    time_bucket('1 hour', timestamp) AS bucket,
    AVG(value) AS avg_value,
    MAX(value) AS max_value,
    MIN(value) AS min_value,
    COUNT(*) AS record_count
FROM sensors.sensor_readings
GROUP BY device_id, sensor_type, bucket;

-- Create refresh policy for continuous aggregates
SELECT add_continuous_aggregate_policy('sensors.sensor_readings_hourly',
    start_offset => INTERVAL '1 day',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

-- Daily sensor data aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS sensors.sensor_readings_daily
WITH (timescaledb.continuous) AS
SELECT 
    device_id,
    sensor_type,
    time_bucket('1 day', timestamp) AS bucket,
    AVG(value) AS avg_value,
    MAX(value) AS max_value,
    MIN(value) AS min_value,
    COUNT(*) AS record_count
FROM sensors.sensor_readings
GROUP BY device_id, sensor_type, bucket;

-- Create refresh policy for daily aggregates
SELECT add_continuous_aggregate_policy('sensors.sensor_readings_daily',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day');

-- Create data retention policy (keep data for 1 year)
SELECT add_retention_policy('sensors.sensor_readings', INTERVAL '1 year');
SELECT add_retention_policy('sensors.sweep_readings', INTERVAL '1 year');
SELECT add_retention_policy('sensors.lab_readings', INTERVAL '1 year');

-- Create compression policy for older data
SELECT add_compression_policy('sensors.sensor_readings', INTERVAL '7 days');
SELECT add_compression_policy('sensors.sweep_readings', INTERVAL '7 days');
SELECT add_compression_policy('sensors.lab_readings', INTERVAL '7 days');
