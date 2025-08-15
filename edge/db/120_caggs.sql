-- ────────────────────────────────────────────────────────────────────────────
-- migrations/120_caggs.sql
-- ────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    EXECUTE $cmd$
      CREATE MATERIALIZED VIEW IF NOT EXISTS sensors.cagg_sweep_readings_5m
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket(INTERVAL '5 minutes', time) AS bucket,
        tenant_id, robot_id, run_id, metric, zone_id,
        avg(value) AS avg_value,
        min(value) AS min_value,
        max(value) AS max_value,
        count(*)   AS samples
      FROM sensors.sweep_readings
      GROUP BY bucket, tenant_id, robot_id, run_id, metric, zone_id
      WITH NO DATA
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_continuous_aggregate_policy('sensors.cagg_sweep_readings_5m',
        start_offset => INTERVAL '7 days',
        end_offset   => INTERVAL '1 hour',
        schedule_interval => INTERVAL '15 minutes')
    $cmd$;
  END IF;
END $$;