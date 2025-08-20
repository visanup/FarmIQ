CREATE SCHEMA IF NOT EXISTS devices;

-- helpers
CREATE OR REPLACE FUNCTION devices.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE plpgsql;

-- enums (scoped ใน schema นี้)
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
    CREATE TYPE devices.device_event_enum AS ENUM
    ('config_update','reboot','error','ota_offer','ota_progress','ota_success','ota_failed','shadow_update','shadow_report','heartbeat');
  END IF;
END $$;

-- core entities (ทุกอย่างผูกด้วย (tenant_id, id) เป็นคีย์จริง)
CREATE TABLE IF NOT EXISTS devices.device_types (
  tenant_id   TEXT NOT NULL,
  type_id     TEXT NOT NULL,        -- UUID/ulid/slug
  name        TEXT NOT NULL,
  icon_css    TEXT,
  default_image_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, type_id),
  UNIQUE (tenant_id, name)
);
CREATE TRIGGER trg_upd_devtypes BEFORE UPDATE ON devices.device_types
FOR EACH ROW EXECUTE PROCEDURE devices.touch_updated_at();

CREATE TABLE IF NOT EXISTS devices.device_groups (
  tenant_id   TEXT NOT NULL,
  group_id    TEXT NOT NULL,
  name        TEXT NOT NULL,
  note        TEXT,
  category    TEXT,
  parent_id   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, group_id)
);
CREATE INDEX IF NOT EXISTS ix_devgroups_tenant_name ON devices.device_groups(tenant_id, name);
CREATE TRIGGER trg_upd_devgroups BEFORE UPDATE ON devices.device_groups
FOR EACH ROW EXECUTE PROCEDURE devices.touch_updated_at();

CREATE TABLE IF NOT EXISTS devices.devices (
  tenant_id       TEXT NOT NULL,
  device_id       TEXT NOT NULL,                   -- **TEXT** ให้ตรงกับ event
  type_id         TEXT,
  group_id        TEXT,
  farm_id         TEXT,                            -- logical FK ไป farms service
  house_id        TEXT,
  model           TEXT,
  serial_number   TEXT,
  manufacturer    TEXT,
  status          devices.device_status_enum NOT NULL DEFAULT 'active',
  last_seen       TIMESTAMPTZ,
  specs           JSONB NOT NULL DEFAULT '{}'::jsonb,
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,
  credentials     JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, device_id)
);
CREATE INDEX IF NOT EXISTS ix_devices_tenant_serial ON devices.devices(tenant_id, serial_number);
CREATE INDEX IF NOT EXISTS gin_devices_specs ON devices.devices USING GIN (specs);
CREATE INDEX IF NOT EXISTS gin_devices_tags  ON devices.devices USING GIN (tags);
CREATE TRIGGER trg_upd_devices BEFORE UPDATE ON devices.devices
FOR EACH ROW EXECUTE PROCEDURE devices.touch_updated_at();

-- shadows (optional)
CREATE TABLE IF NOT EXISTS devices.device_shadow (
  tenant_id   TEXT NOT NULL,
  device_id   TEXT NOT NULL,
  desired     JSONB NOT NULL DEFAULT '{}'::jsonb,
  reported    JSONB NOT NULL DEFAULT '{}'::jsonb,
  version     INT NOT NULL DEFAULT 1,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, device_id)
);
CREATE TRIGGER trg_upd_shadow BEFORE UPDATE ON devices.device_shadow
FOR EACH ROW EXECUTE PROCEDURE devices.touch_updated_at();

-- audit/logs
CREATE TABLE IF NOT EXISTS devices.device_logs (
  tenant_id   TEXT NOT NULL,
  log_id      BIGSERIAL PRIMARY KEY,
  device_id   TEXT NOT NULL,
  event_type  devices.device_event_enum NOT NULL,
  event_data  JSONB,
  actor       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_devlogs_tenant_device ON devices.device_logs(tenant_id, device_id);
CREATE INDEX IF NOT EXISTS gin_devlogs_event ON devices.device_logs USING GIN (event_data);

-- OTA
CREATE TABLE IF NOT EXISTS devices.device_firmwares (
  tenant_id     TEXT NOT NULL,
  firmware_id   TEXT NOT NULL,
  type_id       TEXT NOT NULL,
  version       TEXT NOT NULL,
  size_bytes    BIGINT,
  checksum_sha256 TEXT NOT NULL,
  storage_url   TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, firmware_id),
  UNIQUE (tenant_id, type_id, version)
);
CREATE TRIGGER trg_upd_fw BEFORE UPDATE ON devices.device_firmwares
FOR EACH ROW EXECUTE PROCEDURE devices.touch_updated_at();

CREATE TABLE IF NOT EXISTS devices.device_ota_jobs (
  tenant_id     TEXT NOT NULL,
  ota_id        TEXT NOT NULL,
  device_id     TEXT NOT NULL,
  firmware_id   TEXT NOT NULL,
  status        devices.ota_status_enum NOT NULL DEFAULT 'offered',
  progress_pct  INT CHECK (progress_pct BETWEEN 0 AND 100) DEFAULT 0,
  error_code    TEXT,
  error_detail  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, ota_id)
);
CREATE INDEX IF NOT EXISTS ix_ota_device ON devices.device_ota_jobs(tenant_id, device_id, status);
CREATE TRIGGER trg_upd_ota BEFORE UPDATE ON devices.device_ota_jobs
FOR EACH ROW EXECUTE PROCEDURE devices.touch_updated_at();

-- outbox (publish → Kafka)
CREATE TABLE IF NOT EXISTS devices.events_outbox (
  id           BIGSERIAL PRIMARY KEY,
  topic        TEXT NOT NULL,
  payload      JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_outbox_unpub ON devices.events_outbox(published_at) WHERE published_at IS NULL;

CREATE OR REPLACE FUNCTION devices.enqueue_event(_topic text, _payload jsonb)
RETURNS void AS $$
BEGIN INSERT INTO devices.events_outbox(topic,payload) VALUES (_topic,_payload); END;
$$ LANGUAGE plpgsql;

