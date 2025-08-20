
CREATE SCHEMA IF NOT EXISTS economics;
CREATE OR REPLACE FUNCTION economics.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE plpgsql;

-- ledger ตามสคีมาของ mapper econ.ts
CREATE TABLE IF NOT EXISTS economics.txn (
  tenant_id     TEXT NOT NULL,
  txn_id        TEXT NOT NULL,
  farm_id       TEXT,
  house_id      TEXT,
  cost_center   TEXT,
  device_id     TEXT,
  category      TEXT NOT NULL,
  subcategory   TEXT,
  item_code     TEXT,
  description   TEXT,
  amount        NUMERIC,
  currency      TEXT,
  quantity      NUMERIC,
  unit          TEXT,
  base_currency TEXT,
  rate_to_base  NUMERIC,
  vendor_id     TEXT,
  invoice_id    TEXT,
  time          TIMESTAMPTZ NOT NULL,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, txn_id)
);
CREATE INDEX IF NOT EXISTS ix_txn_time ON economics.txn(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_txn_cat  ON economics.txn(tenant_id, category, subcategory);
CREATE INDEX IF NOT EXISTS ix_txn_anchor ON economics.txn(tenant_id, house_id, farm_id, cost_center, device_id);
CREATE TRIGGER trg_upd_txn BEFORE UPDATE ON economics.txn
FOR EACH ROW EXECUTE PROCEDURE economics.touch_updated_at();

-- outbox
CREATE TABLE IF NOT EXISTS economics.events_outbox (
  id BIGSERIAL PRIMARY KEY, topic TEXT NOT NULL, payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_econ_outbox_unpub ON economics.events_outbox(published_at) WHERE published_at IS NULL;
