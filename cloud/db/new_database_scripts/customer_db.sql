-- database: customers_db;

CREATE SCHEMA IF NOT EXISTS customers;

CREATE TABLE customers.customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    billing_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers.customers(email);

CREATE OR REPLACE FUNCTION customers.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers.customers;

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers.customers
FOR EACH ROW EXECUTE PROCEDURE customers.update_updated_at_column();

-- ถ้าต้องการ เพิ่มตาราง subscription ในฐานข้อมูลเดียวกัน
DROP TABLE IF EXISTS customers.subscriptions CASCADE;

CREATE TABLE customers.subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers.customers(customer_id) ON DELETE CASCADE,
    plan_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_subscriptions_customer_id;
CREATE INDEX idx_subscriptions_customer_id ON customers.subscriptions(customer_id);

DROP FUNCTION IF EXISTS customers.update_subscriptions_updated_at_column();
CREATE OR REPLACE FUNCTION customers.update_subscriptions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON customers.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON customers.subscriptions
FOR EACH ROW EXECUTE PROCEDURE customers.update_subscriptions_updated_at_column();