-- ────────────────────────────────────────────────────────────────────────────
-- migrations/040_readings.sql  (DROP-IN REPLACEMENT)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.sweep_readings (
  time        TIMESTAMPTZ          NOT NULL,
  tenant_id   TEXT                 NOT NULL,
  robot_id    TEXT                 NOT NULL,
  run_id      BIGINT               NOT NULL REFERENCES sensors.sweep_runs(run_id) ON DELETE CASCADE,
  sensor_id   TEXT                 NOT NULL,
  metric      TEXT                 NOT NULL,
  zone_id     TEXT,
  x           DOUBLE PRECISION,
  y           DOUBLE PRECISION,
  value       DOUBLE PRECISION     NOT NULL,
  quality     sensors.quality_enum NOT NULL DEFAULT 'clean',
  payload     JSONB,
  PRIMARY KEY (time, robot_id, run_id, sensor_id, metric)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    -- ใช้ชื่อเต็ม public.create_hypertable เพื่อเลี่ยงปัญหา search_path
    EXECUTE $cmd$
      SELECT public.create_hypertable(
        'sensors.sweep_readings','time',
        chunk_time_interval => INTERVAL '7 days',
        if_not_exists       => TRUE,
        migrate_data        => TRUE,
        partitioning_column => 'run_id',
        number_partitions   => 8
      )
    $cmd$;

    EXECUTE $cmd$
      ALTER TABLE sensors.sweep_readings
        SET (timescaledb.compress,
             timescaledb.compress_orderby = 'time DESC',
             timescaledb.compress_segmentby = 'run_id, robot_id')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_compression_policy('sensors.sweep_readings', INTERVAL '30 days')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_retention_policy('sensors.sweep_readings',  INTERVAL '730 days')
    $cmd$;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_swr_run_metric_time
  ON sensors.sweep_readings (run_id, metric, time DESC);
CREATE INDEX IF NOT EXISTS idx_swr_zone_time
  ON sensors.sweep_readings (zone_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_swr_run_zone_metric
  ON sensors.sweep_readings (run_id, zone_id, metric);
CREATE INDEX IF NOT EXISTS idx_readings_latest
  ON sensors.sweep_readings (tenant_id, robot_id, metric, time DESC);
