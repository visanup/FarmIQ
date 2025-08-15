-- database: devices_db
CREATE SCHEMA IF NOT EXISTS devices;

-- ========= Common helper: updated_at trigger function =========
CREATE OR REPLACE FUNCTION devices.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========= ENUM types (create-if-not-exists) =========
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
                 WHERE t.typname='device_status_enum' AND n.nspname='devices') THEN
    CREATE TYPE devices.device_status_enum AS ENUM ('active','inactive','maintenance','retired','faulty');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
                 WHERE t.typname='ota_status_enum' AND n.nspname='devices') THEN
    CREATE TYPE devices.ota_status_enum AS ENUM ('offered','downloading','installing','verifying','success','failed','rolledback');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
                 WHERE t.typname='device_event_enum' AND n.nspname='devices') THEN
    CREATE TYPE devices.device_event_enum AS ENUM (
      'config_update','reboot','error','ota_offer','ota_progress','ota_success','ota_failed','shadow_update','shadow_report','heartbeat'
    );
  END IF;
END $$;

-- ========= 2.50) device_groups =========
CREATE TABLE IF NOT EXISTS devices.device_groups (
  group_id      SERIAL PRIMARY KEY,
  customer_id   INT NOT NULL,
  name          VARCHAR(100) NOT NULL,
  note          TEXT,
  category      VARCHAR(50),
  parent_id     INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_device_groups_parent
    FOREIGN KEY (parent_id) REFERENCES devices.device_groups(group_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_device_groups_cust ON devices.device_groups(customer_id);

DROP TRIGGER IF EXISTS update_device_groups_updated_at ON devices.device_groups;
CREATE TRIGGER update_device_groups_updated_at
BEFORE UPDATE ON devices.device_groups
FOR EACH ROW EXECUTE PROCEDURE devices.update_updated_at_column();

-- ========= 2.51) device_types =========
CREATE TABLE IF NOT EXISTS devices.device_types (
  type_id           SERIAL PRIMARY KEY,
  name              VARCHAR(100) UNIQUE NOT NULL,
  icon_css_class    VARCHAR(50),
  default_image_url TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_device_types_updated_at ON devices.device_types;
CREATE TRIGGER update_device_types_updated_at
BEFORE UPDATE ON devices.device_types
FOR EACH ROW EXECUTE PROCEDURE devices.update_updated_at_column();

-- ========= 2.52) devices =========
CREATE TABLE IF NOT EXISTS devices.devices (
  device_id          SERIAL PRIMARY KEY,
  customer_id        INT NOT NULL,
  house_id           INTEGER,
  type_id            INTEGER REFERENCES devices.device_types(type_id) ON DELETE SET NULL,
  group_id           INTEGER REFERENCES devices.device_groups(group_id) ON DELETE SET NULL,
  model              VARCHAR(100),
  serial_number      VARCHAR(100),
  install_date       DATE,
  calibration_date   DATE,
  last_maintenance   DATE,
  location_detail    TEXT,
  manufacturer       VARCHAR(255),
  purchase_date      DATE,
  warranty_expiry    DATE,
  specs              JSONB,
  location_latitude  NUMERIC,
  location_longitude NUMERIC,
  firmware_version   VARCHAR(50),
  ip_address         VARCHAR(45),
  mac_address        VARCHAR(17),
  last_seen          TIMESTAMPTZ,
  tags               TEXT[] DEFAULT '{}',
  config             JSONB,
  credentials        JSONB,
  build_code         TEXT,
  build_date         TIMESTAMPTZ,
  status             devices.device_status_enum NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_latitude  CHECK (location_latitude  IS NULL OR (location_latitude  >= -90  AND location_latitude  <= 90)),
  CONSTRAINT chk_longitude CHECK (location_longitude IS NULL OR (location_longitude >= -180 AND location_longitude <= 180))
);

-- partial unique เพื่อกัน serial ซ้ำใน tenant (ยอมให้ NULL ซ้ำได้)
CREATE UNIQUE INDEX IF NOT EXISTS uq_devices_customer_serial
  ON devices.devices(customer_id, serial_number) WHERE serial_number IS NOT NULL;

-- index ทั่วไป
CREATE INDEX IF NOT EXISTS idx_devices_cust_house ON devices.devices(customer_id, house_id);
CREATE INDEX IF NOT EXISTS idx_devices_group ON devices.devices(group_id);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices.devices(type_id);

-- JSONB GIN index สำหรับค้น config/specs เร็วขึ้น
CREATE INDEX IF NOT EXISTS gin_devices_specs  ON devices.devices USING GIN (specs);
CREATE INDEX IF NOT EXISTS gin_devices_config ON devices.devices USING GIN (config);
CREATE INDEX IF NOT EXISTS gin_devices_tags   ON devices.devices USING GIN (tags);

DROP TRIGGER IF EXISTS update_devices_updated_at ON devices.devices;
CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON devices.devices
FOR EACH ROW EXECUTE PROCEDURE devices.update_updated_at_column();

-- ========= 2.53) device_logs (audit) =========
CREATE TABLE IF NOT EXISTS devices.device_logs (
  log_id       SERIAL PRIMARY KEY,
  customer_id  INT NOT NULL,
  device_id    INTEGER NOT NULL REFERENCES devices.devices(device_id) ON DELETE CASCADE,
  event_type   devices.device_event_enum NOT NULL,
  event_data   JSONB,
  performed_by VARCHAR(100),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_device_logs_cust_device ON devices.device_logs(customer_id, device_id);
CREATE INDEX IF NOT EXISTS gin_device_logs_event_data ON devices.device_logs USING GIN (event_data);

-- ========= 2.54) device_status_history =========
CREATE TABLE IF NOT EXISTS devices.device_status_history (
  id           SERIAL PRIMARY KEY,
  customer_id  INT NOT NULL,
  device_id    INTEGER NOT NULL REFERENCES devices.devices(device_id) ON DELETE CASCADE,
  performed_by VARCHAR(100),
  status       devices.device_status_enum NOT NULL,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note         TEXT
);
CREATE INDEX IF NOT EXISTS idx_device_status_history_cust_device ON devices.device_status_history(customer_id, device_id);

-- ========= 1) device_shadow =========
CREATE TABLE IF NOT EXISTS devices.device_shadow (
  device_id  INT PRIMARY KEY REFERENCES devices.devices(device_id) ON DELETE CASCADE,
  desired    JSONB NOT NULL DEFAULT '{}'::jsonb,
  reported   JSONB NOT NULL DEFAULT '{}'::jsonb,
  version    INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_device_shadow_updated_at ON devices.device_shadow;
CREATE TRIGGER update_device_shadow_updated_at
BEFORE UPDATE ON devices.device_shadow
FOR EACH ROW EXECUTE PROCEDURE devices.update_updated_at_column();

-- สร้าง shadow อัตโนมัติเมื่อเพิ่ม device ใหม่
CREATE OR REPLACE FUNCTION devices.fn_init_device_shadow() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO devices.device_shadow(device_id, desired, reported, version)
  VALUES (NEW.device_id, '{}'::jsonb, '{}'::jsonb, 1)
  ON CONFLICT (device_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_init_device_shadow ON devices.devices;
CREATE TRIGGER trg_init_device_shadow
AFTER INSERT ON devices.devices
FOR EACH ROW EXECUTE PROCEDURE devices.fn_init_device_shadow();

-- ========= 2) device_firmwares =========
CREATE TABLE IF NOT EXISTS devices.device_firmwares (
  firmware_id     SERIAL PRIMARY KEY,
  type_id         INT NOT NULL REFERENCES devices.device_types(type_id) ON DELETE CASCADE,
  version         VARCHAR(32) NOT NULL,
  build_code      TEXT,
  size_bytes      BIGINT,
  checksum_sha256 CHAR(64) NOT NULL,
  signature_b64   TEXT,
  storage_url     TEXT NOT NULL,
  created_by      VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type_id, version)
);

DROP TRIGGER IF EXISTS update_device_firmwares_updated_at ON devices.device_firmwares;
CREATE TRIGGER update_device_firmwares_updated_at
BEFORE UPDATE ON devices.device_firmwares
FOR EACH ROW EXECUTE PROCEDURE devices.update_updated_at_column();

-- ========= 3) device_ota_jobs =========
CREATE TABLE IF NOT EXISTS devices.device_ota_jobs (
  ota_id        SERIAL PRIMARY KEY,
  device_id     INT NOT NULL REFERENCES devices.devices(device_id) ON DELETE CASCADE,
  firmware_id   INT NOT NULL REFERENCES devices.device_firmwares(firmware_id) ON DELETE RESTRICT,
  status        devices.ota_status_enum NOT NULL DEFAULT 'offered',
  progress_pct  INT DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  error_code    VARCHAR(50),
  error_detail  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ota_jobs_device ON devices.device_ota_jobs(device_id, status);
CREATE INDEX IF NOT EXISTS idx_ota_jobs_firmware ON devices.device_ota_jobs(firmware_id);

DROP TRIGGER IF EXISTS update_device_ota_jobs_updated_at ON devices.device_ota_jobs;
CREATE TRIGGER update_device_ota_jobs_updated_at
BEFORE UPDATE ON devices.device_ota_jobs
FOR EACH ROW EXECUTE PROCEDURE devices.update_updated_at_column();

-- ========= Convenience views =========
-- มุมมองสถานะล่าสุดของอุปกรณ์
CREATE OR REPLACE VIEW devices.v_device_latest_status AS
SELECT d.device_id,
       d.customer_id,
       d.status AS current_status,
       (SELECT dsh.status
          FROM devices.device_status_history dsh
         WHERE dsh.device_id = d.device_id
         ORDER BY dsh.changed_at DESC
         LIMIT 1) AS last_status_event,
       d.last_seen,
       d.firmware_version
FROM devices.devices d;

-- มุมมอง OTA ล่าสุดต่ออุปกรณ์
CREATE OR REPLACE VIEW devices.v_device_last_ota AS
SELECT j.device_id,
       j.firmware_id,
       f.version AS firmware_version,
       j.status,
       j.progress_pct,
       j.updated_at
FROM devices.device_ota_jobs j
JOIN LATERAL (
  SELECT ota_id
  FROM devices.device_ota_jobs j2
  WHERE j2.device_id = j.device_id
  ORDER BY j2.updated_at DESC
  LIMIT 1
) last ON last.ota_id = j.ota_id
JOIN devices.device_firmwares f ON f.firmware_id = j.firmware_id;
