CREATE SCHEMA IF NOT EXISTS feeds;
CREATE OR REPLACE FUNCTION feeds.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE plpgsql;

-- batches (catalog/ledger)
CREATE TABLE IF NOT EXISTS feeds.batch (
  tenant_id   TEXT NOT NULL,
  batch_id    TEXT NOT NULL,
  feed_type   TEXT,
  production_time TIMESTAMPTZ,
  mass_kg     NUMERIC,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, batch_id)
);
CREATE TRIGGER trg_upd_feed_batch BEFORE UPDATE ON feeds.batch
FOR EACH ROW EXECUTE PROCEDURE feeds.touch_updated_at();

-- quality results (หนึ่งแถวต่อ sample)
CREATE TABLE IF NOT EXISTS feeds.quality_result (
  tenant_id   TEXT NOT NULL,
  result_id   TEXT NOT NULL,
  batch_id    TEXT NOT NULL,
  status      TEXT,                  -- 'pass'/'fail'
  moisture_pct  NUMERIC,
  protein_pct   NUMERIC,
  fat_pct       NUMERIC,
  fiber_pct     NUMERIC,
  ash_pct       NUMERIC,
  salt_pct      NUMERIC,
  energy_mjkg   NUMERIC,
  aflatoxin_ppb NUMERIC,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  measured_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, result_id)
);
CREATE INDEX IF NOT EXISTS ix_quality_batch ON feeds.quality_result(tenant_id, batch_id, measured_at DESC);
CREATE TRIGGER trg_upd_quality BEFORE UPDATE ON feeds.quality_result
FOR EACH ROW EXECUTE PROCEDURE feeds.touch_updated_at();

-- assignment ไปยัง farm/house/silo
CREATE TABLE IF NOT EXISTS feeds.assignment (
  tenant_id    TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  batch_id     TEXT NOT NULL,
  farm_id      TEXT,
  house_id     TEXT,
  silo_id      TEXT,
  assigned_start TIMESTAMPTZ NOT NULL,
  assigned_end   TIMESTAMPTZ,
  feed_quantity  NUMERIC,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, assignment_id)
);
CREATE INDEX IF NOT EXISTS ix_assign_batch ON feeds.assignment(tenant_id, batch_id);
CREATE INDEX IF NOT EXISTS ix_assign_farm_house ON feeds.assignment(tenant_id, farm_id, house_id, assigned_start DESC);
CREATE TRIGGER trg_upd_assign BEFORE UPDATE ON feeds.assignment
FOR EACH ROW EXECUTE PROCEDURE feeds.touch_updated_at();

-- outbox
CREATE TABLE IF NOT EXISTS feeds.events_outbox (
  id BIGSERIAL PRIMARY KEY, topic TEXT NOT NULL, payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_feeds_outbox_unpub ON feeds.events_outbox(published_at) WHERE published_at IS NULL;
