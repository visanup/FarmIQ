-- =========================
-- 05_analytics_dimensions.sql
-- Snapshot dimensions populated by analytic-stream
-- =========================

CREATE SCHEMA IF NOT EXISTS analytics;

-- helper: touch updated_at
CREATE OR REPLACE FUNCTION analytics.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- dim_device
CREATE TABLE IF NOT EXISTS analytics.dim_device (
  tenant_id  TEXT NOT NULL,
  device_id  TEXT NOT NULL,
  farm_id    TEXT,
  house_id   TEXT,
  type       TEXT,
  status     TEXT,
  name       TEXT,
  model      TEXT,
  vendor     TEXT,
  serial_no  TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, device_id)
);
CREATE INDEX IF NOT EXISTS ix_dim_device_farm  ON analytics.dim_device(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS ix_dim_device_house ON analytics.dim_device(tenant_id, house_id);
CREATE INDEX IF NOT EXISTS gin_dim_device_meta ON analytics.dim_device USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_device_touch ON analytics.dim_device;
CREATE TRIGGER trg_dim_device_touch BEFORE UPDATE ON analytics.dim_device
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_farm
CREATE TABLE IF NOT EXISTS analytics.dim_farm (
  tenant_id  TEXT NOT NULL,
  farm_id    TEXT NOT NULL,
  name       TEXT,
  lat        DOUBLE PRECISION,
  lon        DOUBLE PRECISION,
  region     TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, farm_id)
);
CREATE INDEX IF NOT EXISTS gin_dim_farm_meta ON analytics.dim_farm USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_farm_touch ON analytics.dim_farm;
CREATE TRIGGER trg_dim_farm_touch BEFORE UPDATE ON analytics.dim_farm
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_house
CREATE TABLE IF NOT EXISTS analytics.dim_house (
  tenant_id  TEXT NOT NULL,
  house_id   TEXT NOT NULL,
  farm_id    TEXT NOT NULL,
  name       TEXT,
  capacity   INTEGER,
  type       TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, house_id)
);
CREATE INDEX IF NOT EXISTS ix_dim_house_farm ON analytics.dim_house(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_dim_house_meta ON analytics.dim_house USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_house_touch ON analytics.dim_house;
CREATE TRIGGER trg_dim_house_touch BEFORE UPDATE ON analytics.dim_house
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

-- dim_flock
CREATE TABLE IF NOT EXISTS analytics.dim_flock (
  tenant_id   TEXT NOT NULL,
  flock_id    TEXT NOT NULL,
  house_id    TEXT NOT NULL,
  farm_id     TEXT,
  breed       TEXT,
  sex         TEXT,
  population  INTEGER,
  start_date  DATE,
  end_date    DATE,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, flock_id)
);
CREATE INDEX IF NOT EXISTS ix_dim_flock_house ON analytics.dim_flock(tenant_id, house_id);
CREATE INDEX IF NOT EXISTS ix_dim_flock_farm  ON analytics.dim_flock(tenant_id, farm_id);
CREATE INDEX IF NOT EXISTS gin_dim_flock_meta ON analytics.dim_flock USING GIN (meta);
DROP TRIGGER IF EXISTS trg_dim_flock_touch ON analytics.dim_flock;
CREATE TRIGGER trg_dim_flock_touch BEFORE UPDATE ON analytics.dim_flock
FOR EACH ROW EXECUTE PROCEDURE analytics.touch_updated_at();

