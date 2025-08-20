CREATE SCHEMA IF NOT EXISTS formulas;
CREATE OR REPLACE FUNCTION formulas.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS formulas.formula (
  tenant_id  TEXT NOT NULL,
  formula_id TEXT NOT NULL,
  formula_no TEXT NOT NULL,
  name       TEXT NOT NULL,
  description TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, formula_id),
  UNIQUE (tenant_id, formula_no)
);
CREATE TRIGGER trg_upd_formula BEFORE UPDATE ON formulas.formula
FOR EACH ROW EXECUTE PROCEDURE formulas.touch_updated_at();

CREATE TABLE IF NOT EXISTS formulas.formula_composition (
  tenant_id  TEXT NOT NULL,
  id         BIGSERIAL PRIMARY KEY,
  formula_id TEXT NOT NULL,
  ingredient TEXT NOT NULL,
  percentage NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_comp_formula ON formulas.formula_composition(tenant_id, formula_id);
CREATE TRIGGER trg_upd_comp BEFORE UPDATE ON formulas.formula_composition
FOR EACH ROW EXECUTE PROCEDURE formulas.touch_updated_at();

-- outbox
CREATE TABLE IF NOT EXISTS formulas.events_outbox (
  id BIGSERIAL PRIMARY KEY, topic TEXT NOT NULL, payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_form_outbox_unpub ON formulas.events_outbox(published_at) WHERE published_at IS NULL;

