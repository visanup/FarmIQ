-- ================= External Factors (microservice-friendly) =================
CREATE SCHEMA IF NOT EXISTS external_factors;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- สำหรับ gen_random_uuid()

-- touch helper
CREATE OR REPLACE FUNCTION external_factors.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- บันทึกปัจจัยภายนอกแบบ event ledger (หนึ่งแถว = หนึ่ง observation)
-- - multi-tenant: tenant_id TEXT
-- - logical FK: farm_id/house_id/batch_id/feed_assignment_id เป็น TEXT (ไม่ผูก FK ข้าม service)
-- - เวลาจริง: time TIMESTAMPTZ (แทน record_date DATE)
-- - JSONB มี default {} เพื่อ query/GIN ง่าย
CREATE TABLE IF NOT EXISTS external_factors.external_events (
  tenant_id          TEXT NOT NULL,
  event_id           TEXT NOT NULL DEFAULT gen_random_uuid(),

  -- anchors (ตาม availability)
  farm_id            TEXT,
  house_id           TEXT,
  batch_id           TEXT,
  feed_assignment_id TEXT,

  -- แหล่งข้อมูล (optional)
  source             TEXT,            -- e.g. 'noaa', 'openweather', 'dept_livestock'
  provider           TEXT,            -- ชื่อผู้ให้บริการ/ระบบ
  region_code        TEXT,            -- รหัสพื้นที่ภายนอก ถ้ามี

  -- payloads
  weather            JSONB NOT NULL DEFAULT '{}'::jsonb,
  disease_alert      JSONB NOT NULL DEFAULT '{}'::jsonb,
  market_price       JSONB NOT NULL DEFAULT '{}'::jsonb,
  feed_supply        JSONB NOT NULL DEFAULT '{}'::jsonb,
  weather_forecast   JSONB NOT NULL DEFAULT '{}'::jsonb,

  disease_risk_score NUMERIC,
  regulatory_changes TEXT,

  time               TIMESTAMPTZ NOT NULL,   -- เมื่อข้อมูลนี้เกิดขึ้น/ออกรายงาน
  meta               JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (tenant_id, event_id),
  CONSTRAINT chk_disease_risk_score_range
    CHECK (disease_risk_score IS NULL OR (disease_risk_score >= 0 AND disease_risk_score <= 1))
);

-- Indexes ที่ใช้จริง
CREATE INDEX IF NOT EXISTS ix_ext_events_time
  ON external_factors.external_events (tenant_id, time DESC);
CREATE INDEX IF NOT EXISTS ix_ext_events_anchor
  ON external_factors.external_events (tenant_id, farm_id, house_id, batch_id);
CREATE INDEX IF NOT EXISTS gin_ext_events_weather
  ON external_factors.external_events USING GIN (weather);
CREATE INDEX IF NOT EXISTS gin_ext_events_disease
  ON external_factors.external_events USING GIN (disease_alert);

-- อัปเดต updated_at อัตโนมัติ
DROP TRIGGER IF EXISTS trg_ext_events_touch ON external_factors.external_events;
CREATE TRIGGER trg_ext_events_touch
  BEFORE UPDATE ON external_factors.external_events
  FOR EACH ROW EXECUTE PROCEDURE external_factors.touch_updated_at();

-- (ถ้าข้อมูลเยอะมาก) แนะนำ partition ตามเวลา
-- หมายเหตุ: เพิ่มพาร์ทิชันตามปี/ไตรมาสที่ใช้งานจริง
-- ALTER TABLE external_factors.external_events
--   PARTITION BY RANGE (time);
-- CREATE TABLE external_factors.external_events_2025
--   PARTITION OF external_factors.external_events
--   FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ================= Outbox สำหรับ publish ไป Kafka =================
CREATE TABLE IF NOT EXISTS external_factors.events_outbox (
  id           BIGSERIAL PRIMARY KEY,
  topic        TEXT NOT NULL,
  payload      JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_external_outbox_unpublished
  ON external_factors.events_outbox (published_at) WHERE published_at IS NULL;

CREATE OR REPLACE FUNCTION external_factors.enqueue_event(_topic text, _payload jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO external_factors.events_outbox(topic, payload) VALUES (_topic, _payload);
END;
$$ LANGUAGE plpgsql;
