-- ────────────────────────────────────────────────────────────────────────────
-- migrations/050_health.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.device_health (
  time        TIMESTAMPTZ NOT NULL,
  tenant_id   TEXT        NOT NULL,
  device_id   TEXT        NOT NULL,
  online      BOOLEAN,
  source      TEXT,
  rssi        INT,
  uptime_s    BIGINT,
  meta        JSONB,
  PRIMARY KEY (time, tenant_id, device_id)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    EXECUTE $cmd$
      SELECT public.create_hypertable(
        'sensors.device_health','time',
        chunk_time_interval => INTERVAL '7 days',
        if_not_exists       => TRUE,
        migrate_data        => TRUE
      )
    $cmd$;

    EXECUTE $cmd$
      ALTER TABLE sensors.device_health
        SET (timescaledb.compress,
             timescaledb.compress_orderby = 'time DESC',
             timescaledb.compress_segmentby = 'tenant_id, device_id')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_compression_policy('sensors.device_health', INTERVAL '30 days')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_retention_policy('sensors.device_health',  INTERVAL '365 days')
    $cmd$;
  END IF;
END $$;