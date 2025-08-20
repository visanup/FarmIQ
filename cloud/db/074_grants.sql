-- 20_grants.sql
-- สร้าง role สำหรับแอป และให้สิทธิ์เฉพาะที่จำเป็น
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='analytics_app') THEN
    CREATE ROLE analytics_app LOGIN PASSWORD 'change_me';
  END IF;
END $$;

GRANT USAGE ON SCHEMA analytics TO analytics_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO analytics_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO analytics_app;

-- ถ้าใช้ sequences/identity ในอนาคต:
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA analytics TO analytics_app;

-- (ถ้าคุณอยากบังคับ search_path ระดับ user)
-- ALTER ROLE analytics_app IN DATABASE your_db SET search_path = analytics, public;
