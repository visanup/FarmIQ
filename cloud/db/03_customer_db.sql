-- schema: customers
CREATE SCHEMA IF NOT EXISTS customers;

-- ลูกค้า/องค์กร
CREATE TABLE IF NOT EXISTS customers.customers (
  customer_id      BIGSERIAL PRIMARY KEY,
  tenant_id        VARCHAR(64) NOT NULL,              -- จาก JWT (org/tenant)
  external_id      VARCHAR(128),                      -- ผูกกับ ERP/CRM ภายนอก
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(255),
  phone            VARCHAR(50),
  address          TEXT,
  billing_info     JSONB,
  status           VARCHAR(32) DEFAULT 'active',      -- active|suspended|deleted
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_tenant_name
  ON customers.customers(tenant_id, name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email
  ON customers.customers(email);

-- ผู้ติดต่อ
CREATE TABLE IF NOT EXISTS customers.contacts (
  contact_id   BIGSERIAL PRIMARY KEY,
  customer_id  BIGINT NOT NULL REFERENCES customers.customers(customer_id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255),
  phone        VARCHAR(50),
  role         VARCHAR(64),            -- e.g. owner, ops, billing
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ผู้ใช้ (จาก auth-service) เป็นสมาชิกของลูกค้า
CREATE TABLE IF NOT EXISTS customers.customer_users (
  customer_user_id BIGSERIAL PRIMARY KEY,
  customer_id  BIGINT NOT NULL REFERENCES customers.customers(customer_id) ON DELETE CASCADE,
  user_id      VARCHAR(128) NOT NULL,  -- auth-service user id (sub)
  role         VARCHAR(32) NOT NULL DEFAULT 'member',  -- owner|admin|member|viewer
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (customer_id, user_id)
);

-- แคตตาล็อกแผน (เพื่อไม่ hardcode)
CREATE TABLE IF NOT EXISTS customers.plan_catalog (
  plan_code     VARCHAR(64) PRIMARY KEY,          -- e.g. PRO, TEAM, ENTERPRISE
  name          VARCHAR(128) NOT NULL,
  description   TEXT,
  entitlements  JSONB,                            -- {max_devices: 50, alerting: true, ...}
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- การสมัครใช้งาน
CREATE TABLE IF NOT EXISTS customers.subscriptions (
  subscription_id BIGSERIAL PRIMARY KEY,
  customer_id     BIGINT NOT NULL REFERENCES customers.customers(customer_id) ON DELETE CASCADE,
  plan_code       VARCHAR(64) NOT NULL REFERENCES customers.plan_catalog(plan_code),
  start_date      DATE NOT NULL,
  end_date        DATE,
  status          VARCHAR(32) NOT NULL DEFAULT 'active', -- active|paused|canceled|expired
  meta            JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at trigger (re-use function)
CREATE OR REPLACE FUNCTION customers.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='tg_customers_touch') THEN
    CREATE TRIGGER tg_customers_touch BEFORE UPDATE ON customers.customers
    FOR EACH ROW EXECUTE PROCEDURE customers.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='tg_contacts_touch') THEN
    CREATE TRIGGER tg_contacts_touch BEFORE UPDATE ON customers.contacts
    FOR EACH ROW EXECUTE PROCEDURE customers.touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='tg_subs_touch') THEN
    CREATE TRIGGER tg_subs_touch BEFORE UPDATE ON customers.subscriptions
    FOR EACH ROW EXECUTE PROCEDURE customers.touch_updated_at();
  END IF;
END $$;
