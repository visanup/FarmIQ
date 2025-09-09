-- TimescaleDB Helper Functions
-- This migration creates useful functions for time-series queries

-- Function to get latest sensor reading for a device
CREATE OR REPLACE FUNCTION sensors.get_latest_sensor_reading(device_id_param TEXT)
RETURNS TABLE (
    id TEXT,
    device_id TEXT,
    sensor_type TEXT,
    value DOUBLE PRECISION,
    unit TEXT,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.device_id,
        sr.sensor_type,
        sr.value,
        sr.unit,
        sr.timestamp
    FROM sensors.sensor_readings sr
    WHERE sr.device_id = device_id_param
    ORDER BY sr.timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get sensor readings in time range
CREATE OR REPLACE FUNCTION sensors.get_sensor_readings_in_range(
    device_id_param TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    sensor_type_param TEXT DEFAULT NULL
)
RETURNS TABLE (
    id TEXT,
    device_id TEXT,
    sensor_type TEXT,
    value DOUBLE PRECISION,
    unit TEXT,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.device_id,
        sr.sensor_type,
        sr.value,
        sr.unit,
        sr.timestamp
    FROM sensors.sensor_readings sr
    WHERE sr.device_id = device_id_param
        AND sr.timestamp >= start_time
        AND sr.timestamp <= end_time
        AND (sensor_type_param IS NULL OR sr.sensor_type = sensor_type_param)
    ORDER BY sr.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get aggregated sensor data
CREATE OR REPLACE FUNCTION sensors.get_aggregated_sensor_data(
    device_id_param TEXT,
    sensor_type_param TEXT,
    bucket_interval INTERVAL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
)
RETURNS TABLE (
    bucket TIMESTAMPTZ,
    avg_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    min_value DOUBLE PRECISION,
    record_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        time_bucket(bucket_interval, sr.timestamp) AS bucket,
        AVG(sr.value) AS avg_value,
        MAX(sr.value) AS max_value,
        MIN(sr.value) AS min_value,
        COUNT(*) AS record_count
    FROM sensors.sensor_readings sr
    WHERE sr.device_id = device_id_param
        AND sr.sensor_type = sensor_type_param
        AND sr.timestamp >= start_time
        AND sr.timestamp <= end_time
    GROUP BY bucket
    ORDER BY bucket;
END;
$$ LANGUAGE plpgsql;

-- Function to get device health summary
CREATE OR REPLACE FUNCTION sensors.get_device_health_summary(device_id_param TEXT)
RETURNS TABLE (
    device_id TEXT,
    status TEXT,
    last_seen TIMESTAMPTZ,
    battery_level INTEGER,
    signal_strength INTEGER,
    temperature DOUBLE PRECISION,
    error_count INTEGER,
    warning_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dh.device_id,
        dh.status::TEXT,
        dh.last_seen,
        dh.battery_level,
        dh.signal_strength,
        dh.temperature,
        COALESCE(array_length(dh.errors, 1), 0) AS error_count,
        COALESCE(array_length(dh.warnings, 1), 0) AS warning_count
    FROM sensors.device_health dh
    WHERE dh.device_id = device_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data (for maintenance)
CREATE OR REPLACE FUNCTION sensors.cleanup_old_data(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete old sensor readings
    DELETE FROM sensors.sensor_readings 
    WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old sweep readings
    DELETE FROM sensors.sweep_readings 
    WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- Delete old lab readings
    DELETE FROM sensors.lab_readings 
    WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
