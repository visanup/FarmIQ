-- ────────────────────────────────────────────────────────────────────────────
-- 045_device_readings.sql  (FIXED: use generated column for PK)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sensors.device_readings (
  time            TIMESTAMPTZ      NOT NULL,
  tenant_id       TEXT             NOT NULL,
  device_id       TEXT             NOT NULL,
  sensor_id       TEXT             DEFAULT NULL,
  -- คอลัมน์ที่ใช้ทำ PK (normalize null -> '-')
  sensor_id_norm  TEXT GENERATED ALWAYS AS (COALESCE(sensor_id,'-')) STORED,
  metric          TEXT             NOT NULL,
  value           DOUBLE PRECISION NOT NULL,
  quality         sensors.quality_enum NOT NULL DEFAULT 'clean',
  payload         JSONB,
  PRIMARY KEY (time, tenant_id, device_id, metric, sensor_id_norm)
);

-- กรณีอัปเกรดจากตารางเดิมที่ยังไม่มี sensor_id_norm / หรือ PK ยังไม่ถูกต้อง
DO $fix$
BEGIN
  -- เพิ่มคอลัมน์ generated ถ้ายังไม่มี
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='sensors' AND table_name='device_readings' AND column_name='sensor_id_norm'
  ) THEN
    ALTER TABLE sensors.device_readings
      ADD COLUMN sensor_id_norm TEXT GENERATED ALWAYS AS (COALESCE(sensor_id,'-')) STORED;
  END IF;

  -- ถ้า PK ตอนนี้ยังไม่ใช่ (time, tenant_id, device_id, metric, sensor_id_norm) ให้แก้
  -- (DROP PK เดิมถ้ามี แล้วตั้ง PK ใหม่)
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='sensors' AND table_name='device_readings' AND constraint_type='PRIMARY KEY'
  ) THEN
    ALTER TABLE sensors.device_readings DROP CONSTRAINT device_readings_pkey;
  END IF;

  ALTER TABLE sensors.device_readings
    ADD PRIMARY KEY (time, tenant_id, device_id, metric, sensor_id_norm);
END
$fix$;

-- ทำ hypertable + policies (ถ้ามี TimescaleDB)
DO $ts$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    PERFORM public.create_hypertable(
      'sensors.device_readings','time',
      chunk_time_interval => INTERVAL '7 days',
      if_not_exists => TRUE, migrate_data => TRUE
    );

    ALTER TABLE sensors.device_readings SET (
      timescaledb.compress,
      timescaledb.compress_orderby = 'time DESC',
      timescaledb.compress_segmentby = 'tenant_id, device_id'
    );

    PERFORM public.add_compression_policy('sensors.device_readings', INTERVAL '30 days');
    PERFORM public.add_retention_policy('sensors.device_readings',  INTERVAL '365 days');
  END IF;
END
$ts$;

-- ช่วยเสริม index สำหรับ query ทั่วไป (optional แต่แนะนำ)
CREATE INDEX IF NOT EXISTS idx_devread_latest
  ON sensors.device_readings (tenant_id, device_id, metric, time DESC);

-- ฟังก์ชัน ingest แบบ upsert โดยใช้ PK ใหม่ (sensor_id_norm)
CREATE OR REPLACE FUNCTION sensors.fn_ingest_device_reading(
  _tenant  TEXT,
  _device  TEXT,
  _time    TIMESTAMPTZ,
  _sensor  TEXT,
  _metric  TEXT,
  _value   DOUBLE PRECISION,
  _quality sensors.quality_enum DEFAULT 'clean',
  _payload JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  INSERT INTO sensors.device_readings(
    time, tenant_id, device_id, sensor_id, metric, value, quality, payload
  )
  VALUES (_time, _tenant, _device, _sensor, _metric, _value, _quality, _payload)
  ON CONFLICT (time, tenant_id, device_id, metric, sensor_id_norm)
  DO UPDATE SET
    value   = EXCLUDED.value,
    quality = EXCLUDED.quality,
    payload = EXCLUDED.payload;
END
$$ LANGUAGE plpgsql;
