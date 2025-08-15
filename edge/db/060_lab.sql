-- ────────────────────────────────────────────────────────────────────────────
-- migrations/060_lab.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.lab_stations (
  tenant_id  TEXT NOT NULL,
  station_id TEXT NOT NULL,
  name       TEXT,
  house_id   TEXT,
  spec       JSONB,
  PRIMARY KEY (tenant_id, station_id),
  FOREIGN KEY (tenant_id, house_id)
    REFERENCES sensors.houses(tenant_id, house_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sensors.lab_readings (
  time       TIMESTAMPTZ          NOT NULL,
  tenant_id  TEXT                 NOT NULL,
  station_id TEXT                 NOT NULL,
  sensor_id  TEXT                 NOT NULL,
  metric     TEXT                 NOT NULL,
  value      DOUBLE PRECISION     NOT NULL,
  quality    sensors.quality_enum NOT NULL DEFAULT 'clean',
  payload    JSONB,
  PRIMARY KEY (time, tenant_id, station_id, sensor_id, metric),
  FOREIGN KEY (tenant_id, station_id)
    REFERENCES sensors.lab_stations(tenant_id, station_id) ON DELETE CASCADE
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    EXECUTE $cmd$
      SELECT public.create_hypertable('sensors.lab_readings','time',
        chunk_time_interval => INTERVAL '7 days',
        if_not_exists => TRUE, migrate_data => TRUE)
    $cmd$;

    EXECUTE $cmd$
      ALTER TABLE sensors.lab_readings SET (
        timescaledb.compress,
        timescaledb.compress_orderby = 'time DESC',
        timescaledb.compress_segmentby = 'tenant_id, station_id')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_compression_policy('sensors.lab_readings', INTERVAL '30 days')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_retention_policy('sensors.lab_readings',  INTERVAL '365 days')
    $cmd$;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lab_latest
  ON sensors.lab_readings (tenant_id, station_id, metric, time DESC);