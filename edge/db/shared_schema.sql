-- Shared Database Schema for Edge Services
-- This file creates schemas for each microservice to ensure isolation

-- Create schemas for each service
CREATE SCHEMA IF NOT EXISTS sensor_service;
CREATE SCHEMA IF NOT EXISTS image_service;
CREATE SCHEMA IF NOT EXISTS weight_service;
CREATE SCHEMA IF NOT EXISTS orchestrator_service;
CREATE SCHEMA IF NOT EXISTS sync_service;

-- Grant permissions to postgres user for all schemas
GRANT ALL PRIVILEGES ON SCHEMA sensor_service TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA image_service TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA weight_service TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA orchestrator_service TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA sync_service TO postgres;

-- Create tables for sensor_service
CREATE TABLE IF NOT EXISTS sensor_service.sensor_readings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_id TEXT NOT NULL,
    farm_id TEXT,
    house_id TEXT,
    tenant_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    location JSONB,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    quality TEXT DEFAULT 'raw',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time ON sensor_service.sensor_readings(device_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_tenant_sensor_time ON sensor_service.sensor_readings(tenant_id, sensor_type, timestamp);

CREATE TABLE IF NOT EXISTS sensor_service.device_health (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    status TEXT NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL,
    battery_level INTEGER,
    signal_strength INTEGER,
    temperature DOUBLE PRECISION,
    errors TEXT[],
    warnings TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_health_device_last_seen ON sensor_service.device_health(device_id, last_seen);
CREATE INDEX IF NOT EXISTS idx_device_health_tenant_status ON sensor_service.device_health(tenant_id, status);

CREATE TABLE IF NOT EXISTS sensor_service.sweep_readings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_id TEXT NOT NULL,
    farm_id TEXT,
    tenant_id TEXT NOT NULL,
    sweep_id TEXT NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sweep_readings_device_sweep_time ON sensor_service.sweep_readings(device_id, sweep_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_sweep_readings_tenant_time ON sensor_service.sweep_readings(tenant_id, timestamp);

-- Create tables for image_service
CREATE TABLE IF NOT EXISTS image_service.media_objects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    media_id TEXT UNIQUE NOT NULL,
    tenant_id TEXT NOT NULL,
    farm_id TEXT,
    house_id TEXT,
    station_id TEXT,
    sensor_id TEXT,
    bucket TEXT NOT NULL,
    object_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    sha256 TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    metadata JSONB,
    time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_objects_tenant_time ON image_service.media_objects(tenant_id, time);
CREATE INDEX IF NOT EXISTS idx_media_objects_bucket_key ON image_service.media_objects(bucket, object_key);
CREATE INDEX IF NOT EXISTS idx_media_objects_media_id ON image_service.media_objects(media_id);

CREATE TABLE IF NOT EXISTS image_service.reading_media_map (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    media_id TEXT NOT NULL,
    reading_id TEXT NOT NULL,
    delta_ms INTEGER NOT NULL,
    strategy TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(media_id, reading_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_media_map_media_id ON image_service.reading_media_map(media_id);
CREATE INDEX IF NOT EXISTS idx_reading_media_map_reading_id ON image_service.reading_media_map(reading_id);

-- Create tables for weight_service
CREATE TABLE IF NOT EXISTS weight_service.weight_readings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id TEXT NOT NULL,
    farm_id TEXT,
    house_id TEXT,
    station_id TEXT,
    sensor_id TEXT,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    quality TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_readings_tenant_time ON weight_service.weight_readings(tenant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_weight_readings_sensor_time ON weight_service.weight_readings(sensor_id, timestamp);

CREATE TABLE IF NOT EXISTS weight_service.lab_readings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sample_id TEXT UNIQUE NOT NULL,
    farm_id TEXT,
    tenant_id TEXT NOT NULL,
    test_type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    result TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_readings_sample_test ON weight_service.lab_readings(sample_id, test_type);
CREATE INDEX IF NOT EXISTS idx_lab_readings_tenant_time ON weight_service.lab_readings(tenant_id, timestamp);

CREATE TABLE IF NOT EXISTS weight_service.weight_associations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    media_id TEXT NOT NULL,
    reading_id TEXT NOT NULL,
    delta_ms INTEGER NOT NULL,
    strategy TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(media_id, reading_id)
);

CREATE INDEX IF NOT EXISTS idx_weight_associations_media_id ON weight_service.weight_associations(media_id);
CREATE INDEX IF NOT EXISTS idx_weight_associations_reading_id ON weight_service.weight_associations(reading_id);

-- Create tables for orchestrator_service
CREATE TABLE IF NOT EXISTS orchestrator_service.dataset_exports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dataset_s3 TEXT NOT NULL,
    rows INTEGER NOT NULL,
    meta_json JSONB,
    tenant_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dataset_exports_tenant_created ON orchestrator_service.dataset_exports(tenant_id, created_at);

CREATE TABLE IF NOT EXISTS orchestrator_service.model_registry (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    model_id TEXT UNIQUE NOT NULL,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    config JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_registry_tenant_status ON orchestrator_service.model_registry(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_model_registry_model_id ON orchestrator_service.model_registry(model_id);

CREATE TABLE IF NOT EXISTS orchestrator_service.weight_mappings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    media_id TEXT NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    tenant_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_mappings_media_id ON orchestrator_service.weight_mappings(media_id);
CREATE INDEX IF NOT EXISTS idx_weight_mappings_tenant_created ON orchestrator_service.weight_mappings(tenant_id, created_at);

-- Create tables for sync_service
CREATE TABLE IF NOT EXISTS sync_service.sync_states (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    endpoint TEXT UNIQUE NOT NULL,
    last_sync TIMESTAMPTZ,
    cursor TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_states_endpoint ON sync_service.sync_states(endpoint);
CREATE INDEX IF NOT EXISTS idx_sync_states_status_last_sync ON sync_service.sync_states(status, last_sync);

CREATE TABLE IF NOT EXISTS sync_service.sync_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    endpoint TEXT NOT NULL,
    status TEXT NOT NULL,
    records INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    error TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_endpoint_timestamp ON sync_service.sync_logs(endpoint, timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status_timestamp ON sync_service.sync_logs(status, timestamp);
