CREATE SCHEMA IF NOT EXISTS farms_operational;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- สำหรับ gen_random_uuid()

-- touch helper
CREATE OR REPLACE FUNCTION farms_operational.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ================== 1) FEED INTAKE ==================
CREATE TABLE IF NOT EXISTS farms_operational.feed_intake (
  tenant_id     TEXT NOT NULL,
  intake_id     TEXT NOT NULL DEFAULT gen_random_uuid(),
  farm_id       TEXT,
  house_id      TEXT,
  animal_id     TEXT,
  batch_id      TEXT,
  quantity      NUMERIC,
  unit          TEXT,
  time          TIMESTAMPTZ NOT NULL,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, intake_id)
);
CREATE INDEX IF NOT EXISTS ix_feed_intake_time
  ON farms_operational.feed_intake(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_feed_intake_anchor
  ON farms_operational.feed_intake(tenant_id, house_id, farm_id, batch_id);
CREATE TRIGGER trg_feed_intake_touch
  BEFORE UPDATE ON farms_operational.feed_intake
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 2) GENETIC FACTORS ==================
CREATE TABLE IF NOT EXISTS farms_operational.genetic_factors (
  tenant_id     TEXT NOT NULL,
  id            TEXT NOT NULL DEFAULT gen_random_uuid(),
  animal_id     TEXT NOT NULL,
  batch_id      TEXT,
  test_type     TEXT,
  result        TEXT,
  time          TIMESTAMPTZ,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS ix_genetic_time
  ON farms_operational.genetic_factors(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_genetic_anchor
  ON farms_operational.genetic_factors(tenant_id, animal_id, batch_id);
CREATE TRIGGER trg_genetic_touch
  BEFORE UPDATE ON farms_operational.genetic_factors
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 3) FEED PROGRAMS ==================
CREATE TABLE IF NOT EXISTS farms_operational.feed_programs (
  tenant_id       TEXT NOT NULL,
  program_id      TEXT NOT NULL DEFAULT gen_random_uuid(),
  farm_id         TEXT,
  house_id        TEXT,
  batch_id        TEXT,
  name            TEXT NOT NULL,
  description     TEXT,
  effective_start TIMESTAMPTZ NOT NULL,
  effective_end   TIMESTAMPTZ,
  meta            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, program_id)
);
CREATE INDEX IF NOT EXISTS ix_feed_programs_range
  ON farms_operational.feed_programs(tenant_id, farm_id, house_id, batch_id, effective_start DESC);
CREATE TRIGGER trg_feed_programs_touch
  BEFORE UPDATE ON farms_operational.feed_programs
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 4) ENVIRONMENTAL FACTORS ==================
CREATE TABLE IF NOT EXISTS farms_operational.environmental_factors (
  tenant_id        TEXT NOT NULL,
  id               TEXT NOT NULL DEFAULT gen_random_uuid(),
  farm_id          TEXT,
  house_id         TEXT,
  batch_id         TEXT,
  ventilation_rate NUMERIC,
  note             TEXT,
  time             TIMESTAMPTZ NOT NULL,         -- เดิม measurement_date (DATE)
  effective_start  TIMESTAMPTZ,
  effective_end    TIMESTAMPTZ,
  meta             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS ix_env_time
  ON farms_operational.environmental_factors(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_env_anchor
  ON farms_operational.environmental_factors(tenant_id, house_id, farm_id, batch_id);
CREATE TRIGGER trg_env_touch
  BEFORE UPDATE ON farms_operational.environmental_factors
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 5) HOUSING CONDITIONS ==================
CREATE TABLE IF NOT EXISTS farms_operational.housing_conditions (
  tenant_id        TEXT NOT NULL,
  id               TEXT NOT NULL DEFAULT gen_random_uuid(),
  farm_id          TEXT,
  house_id         TEXT,
  batch_id         TEXT,
  flooring_humidity NUMERIC,
  animal_density   INTEGER,
  area             NUMERIC,
  effective_start  TIMESTAMPTZ NOT NULL,
  effective_end    TIMESTAMPTZ,
  meta             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS ix_housing_range
  ON farms_operational.housing_conditions(tenant_id, house_id, farm_id, batch_id, effective_start DESC);
CREATE TRIGGER trg_housing_touch
  BEFORE UPDATE ON farms_operational.housing_conditions
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 6) WATER QUALITY ==================
CREATE TABLE IF NOT EXISTS farms_operational.water_quality (
  tenant_id     TEXT NOT NULL,
  id            TEXT NOT NULL DEFAULT gen_random_uuid(),
  farm_id       TEXT,
  house_id      TEXT,
  batch_id      TEXT,
  fe            NUMERIC,
  pb            NUMERIC,
  note          TEXT,
  time          TIMESTAMPTZ,                     -- เดิม measurement_date
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS ix_water_time
  ON farms_operational.water_quality(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_water_anchor
  ON farms_operational.water_quality(tenant_id, house_id, farm_id, batch_id);
CREATE TRIGGER trg_water_touch
  BEFORE UPDATE ON farms_operational.water_quality
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 7) HEALTH RECORDS ==================
CREATE TABLE IF NOT EXISTS farms_operational.health_records (
  tenant_id     TEXT NOT NULL,
  id            TEXT NOT NULL DEFAULT gen_random_uuid(),
  animal_id     TEXT NOT NULL,
  batch_id      TEXT,
  health_status TEXT,
  disease       TEXT,
  vaccine       TEXT,
  time          TIMESTAMPTZ,                     -- เดิม recorded_date
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS ix_health_time
  ON farms_operational.health_records(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_health_anchor
  ON farms_operational.health_records(tenant_id, animal_id, batch_id);
CREATE TRIGGER trg_health_touch
  BEFORE UPDATE ON farms_operational.health_records
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 8) WELFARE INDICATORS ==================
CREATE TABLE IF NOT EXISTS farms_operational.welfare_indicators (
  tenant_id      TEXT NOT NULL,
  id             TEXT NOT NULL DEFAULT gen_random_uuid(),
  animal_id      TEXT NOT NULL,
  batch_id       TEXT,
  footpad_lesion BOOLEAN,
  stress_hormone NUMERIC,
  time           TIMESTAMPTZ,                    -- เดิม recorded_date
  meta           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS ix_welfare_time
  ON farms_operational.welfare_indicators(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_welfare_anchor
  ON farms_operational.welfare_indicators(tenant_id, animal_id, batch_id);
CREATE TRIGGER trg_welfare_touch
  BEFORE UPDATE ON farms_operational.welfare_indicators
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 9) OPERATIONAL RECORDS ==================
CREATE TABLE IF NOT EXISTS farms_operational.operational_records (
  tenant_id   TEXT NOT NULL,
  id          TEXT NOT NULL DEFAULT gen_random_uuid(),
  farm_id     TEXT,
  house_id    TEXT,
  batch_id    TEXT,
  type        TEXT,
  description TEXT,
  time        TIMESTAMPTZ,                       -- เดิม record_date
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS ix_opsrec_time
  ON farms_operational.operational_records(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_opsrec_anchor
  ON farms_operational.operational_records(tenant_id, house_id, farm_id, batch_id);
CREATE TRIGGER trg_opsrec_touch
  BEFORE UPDATE ON farms_operational.operational_records
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 10) PERFORMANCE METRICS (partition by time) ==================
CREATE TABLE IF NOT EXISTS farms_operational.performance_metrics (
  tenant_id            TEXT NOT NULL,
  id                   BIGSERIAL NOT NULL,
  animal_id            TEXT NOT NULL,
  batch_id             TEXT,
  adg                  NUMERIC,
  fcr                  NUMERIC,
  survival_rate        NUMERIC,
  pi_score             NUMERIC,
  mortality_rate       NUMERIC,
  health_score         NUMERIC,
  behavior_score       NUMERIC,
  body_condition_score NUMERIC,
  stress_level         NUMERIC,
  disease_incidence_rate NUMERIC,
  vaccination_status   TEXT,
  recorded_at          DATE NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- ตัวอย่างพาร์ทิชัน (เพิ่มตามปีจริงที่ใช้งาน)
CREATE TABLE IF NOT EXISTS farms_operational.performance_metrics_2025
  PARTITION OF farms_operational.performance_metrics
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE INDEX IF NOT EXISTS ix_perf_metrics_anchor
  ON farms_operational.performance_metrics(tenant_id, animal_id, batch_id, recorded_at);

CREATE TRIGGER trg_perf_metrics_touch
  BEFORE UPDATE ON farms_operational.performance_metrics
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 11) OPS EVENT LEDGER (ตรงกับ payload ใน ops.ts) ==================
CREATE TABLE IF NOT EXISTS farms_operational.ops_event (
  tenant_id  TEXT NOT NULL,
  event_id   TEXT NOT NULL DEFAULT gen_random_uuid(),
  farm_id    TEXT,
  house_id   TEXT,
  device_id  TEXT,
  category   TEXT NOT NULL,
  type       TEXT NOT NULL,
  time       TIMESTAMPTZ NOT NULL,
  quantity   NUMERIC,
  unit       TEXT,
  severity   TEXT,
  actor      TEXT,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, event_id)
);
CREATE INDEX IF NOT EXISTS ix_ops_event_time
  ON farms_operational.ops_event(tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_ops_event_anchor
  ON farms_operational.ops_event(tenant_id, house_id, device_id, farm_id);
CREATE TRIGGER trg_ops_event_touch
  BEFORE UPDATE ON farms_operational.ops_event
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.touch_updated_at();

-- ================== 12) OUTBOX สำหรับ Kafka ==================
CREATE TABLE IF NOT EXISTS farms_operational.events_outbox (
  id           BIGSERIAL PRIMARY KEY,
  topic        TEXT NOT NULL,
  payload      JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_ops_outbox_unpub
  ON farms_operational.events_outbox(published_at) WHERE published_at IS NULL;

CREATE OR REPLACE FUNCTION farms_operational.enqueue_event(_topic text, _payload jsonb)
RETURNS void AS $$
BEGIN INSERT INTO farms_operational.events_outbox(topic,payload) VALUES (_topic,_payload); END;
$$ LANGUAGE plpgsql;

