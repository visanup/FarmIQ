CREATE SCHEMA IF NOT EXISTS farms;
CREATE OR REPLACE FUNCTION farms.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS farms.farm (
  tenant_id  TEXT NOT NULL,
  farm_id    TEXT NOT NULL,
  name       TEXT,
  lat        DOUBLE PRECISION,
  lon        DOUBLE PRECISION,
  region     TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, farm_id)
);
CREATE TRIGGER trg_upd_farm BEFORE UPDATE ON farms.farm
FOR EACH ROW EXECUTE PROCEDURE farms.touch_updated_at();

CREATE TABLE IF NOT EXISTS farms.house (
  tenant_id  TEXT NOT NULL,
  house_id   TEXT NOT NULL,
  farm_id    TEXT NOT NULL,
  name       TEXT,
  capacity   INT,
  type       TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, house_id)
);
CREATE INDEX IF NOT EXISTS ix_house_farm ON farms.house(tenant_id, farm_id);
CREATE TRIGGER trg_upd_house BEFORE UPDATE ON farms.house
FOR EACH ROW EXECUTE PROCEDURE farms.touch_updated_at();

CREATE TABLE IF NOT EXISTS farms.flock (
  tenant_id   TEXT NOT NULL,
  flock_id    TEXT NOT NULL,
  house_id    TEXT NOT NULL,
  farm_id     TEXT,
  breed       TEXT,
  sex         TEXT,
  population  INT,
  start_date  DATE,
  end_date    DATE,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, flock_id)
);
CREATE INDEX IF NOT EXISTS ix_flock_house ON farms.flock(tenant_id, house_id);
CREATE TRIGGER trg_upd_flock BEFORE UPDATE ON farms.flock
FOR EACH ROW EXECUTE PROCEDURE farms.touch_updated_at();

-- outbox
CREATE TABLE IF NOT EXISTS farms.events_outbox (
  id BIGSERIAL PRIMARY KEY, topic TEXT NOT NULL, payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_farms_outbox_unpub ON farms.events_outbox(published_at) WHERE published_at IS NULL;

