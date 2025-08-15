-- ────────────────────────────────────────────────────────────────────────────
-- migrations/001_schema_enums.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS sensors;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
    WHERE t.typname='quality_enum' AND n.nspname='sensors'
  ) THEN
    CREATE TYPE sensors.quality_enum AS ENUM (
      'raw','clean','anomaly','dlq','invalid','calibrating','stale'
    );
  ELSE
    BEGIN
      ALTER TYPE sensors.quality_enum ADD VALUE IF NOT EXISTS 'invalid';
      ALTER TYPE sensors.quality_enum ADD VALUE IF NOT EXISTS 'calibrating';
      ALTER TYPE sensors.quality_enum ADD VALUE IF NOT EXISTS 'stale';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
    WHERE t.typname='run_status_enum' AND n.nspname='sensors'
  ) THEN
    CREATE TYPE sensors.run_status_enum AS ENUM ('planned','running','completed','aborted');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
    WHERE t.typname='alert_status' AND n.nspname='sensors'
  ) THEN
    CREATE TYPE sensors.alert_status AS ENUM ('open','ack','closed');
  END IF;
END $$;