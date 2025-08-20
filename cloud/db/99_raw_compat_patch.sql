-- 99_raw_compat_patch_v2.sql
-- ทำตาราง sensors.device_readings ให้เข้ากับสคีมามาตรฐานที่ backfill ใช้

CREATE SCHEMA IF NOT EXISTS sensors;

-- 1) เพิ่มคอลัมน์มาตรฐาน (ถ้ามีอยู่แล้วจะข้าม)
ALTER TABLE sensors.device_readings
  ADD COLUMN IF NOT EXISTS tenant_id   TEXT,
  ADD COLUMN IF NOT EXISTS factory_id  TEXT,
  ADD COLUMN IF NOT EXISTS machine_id  TEXT,
  ADD COLUMN IF NOT EXISTS sensor_id   TEXT,
  ADD COLUMN IF NOT EXISTS metric      TEXT,
  ADD COLUMN IF NOT EXISTS value       DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS payload     JSONB;

-- 2) map ค่าเดิม -> คอลัมน์ใหม่ (ใช้ dynamic SQL เพื่อกัน error ถ้า column เดิมไม่มีจริง)

DO $plpgsql$
BEGIN
  -- factory_id <- site_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='sensors' AND table_name='device_readings' AND column_name='site_id'
  ) THEN
    EXECUTE 'UPDATE sensors.device_readings
             SET factory_id = COALESCE(factory_id, site_id)
             WHERE factory_id IS NULL';
  END IF;

  -- factory_id <- farm_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='sensors' AND table_name='device_readings' AND column_name='farm_id'
  ) THEN
    EXECUTE 'UPDATE sensors.device_readings
             SET factory_id = COALESCE(factory_id, farm_id)
             WHERE factory_id IS NULL';
  END IF;
END
$plpgsql$;

DO $plpgsql$
BEGIN
  -- machine_id <- device_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='sensors' AND table_name='device_readings' AND column_name='device_id'
  ) THEN
    EXECUTE 'UPDATE sensors.device_readings
             SET machine_id = COALESCE(machine_id, device_id)
             WHERE machine_id IS NULL';
  END IF;

  -- machine_id <- asset_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='sensors' AND table_name='device_readings' AND column_name='asset_id'
  ) THEN
    EXECUTE 'UPDATE sensors.device_readings
             SET machine_id = COALESCE(machine_id, asset_id)
             WHERE machine_id IS NULL';
  END IF;
END
$plpgsql$;

-- 3) เติมจาก payload JSON (ถ้ามีคีย์มาตรฐาน)
UPDATE sensors.device_readings
SET tenant_id  = COALESCE(tenant_id,  payload->>'tenant_id'),
    factory_id = COALESCE(factory_id, payload->>'factory_id'),
    machine_id = COALESCE(machine_id, payload->>'machine_id'),
    sensor_id  = COALESCE(sensor_id,  payload->>'sensor_id'),
    metric     = COALESCE(metric,     payload->>'metric')
WHERE (tenant_id IS NULL OR factory_id IS NULL OR machine_id IS NULL OR sensor_id IS NULL OR metric IS NULL)
  AND payload IS NOT NULL;

-- value จาก payload->>'value' (ถ้าเก็บเป็น string)
UPDATE sensors.device_readings
SET value = COALESCE(value, NULLIF(payload->>'value','')::double precision)
WHERE value IS NULL AND payload IS NOT NULL;

-- 4) ดัชนีช่วยค้นหา
CREATE INDEX IF NOT EXISTS idx_device_readings_lookup
  ON sensors.device_readings (factory_id, machine_id, metric, time DESC);
