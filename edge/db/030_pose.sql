-- ────────────────────────────────────────────────────────────────────────────
-- migrations/030_pose.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.robot_pose (
  time       TIMESTAMPTZ NOT NULL,
  tenant_id  TEXT        NOT NULL,
  robot_id   TEXT        NOT NULL,
  run_id     BIGINT      NOT NULL REFERENCES sensors.sweep_runs(run_id) ON DELETE CASCADE,
  x          DOUBLE PRECISION,
  y          DOUBLE PRECISION,
  heading    DOUBLE PRECISION,
  speed_mps  DOUBLE PRECISION,
  battery_v  DOUBLE PRECISION,
  meta       JSONB,
  PRIMARY KEY (time, robot_id, run_id)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    EXECUTE $cmd$
      SELECT create_hypertable(
        'sensors.robot_pose','time',
        chunk_time_interval => INTERVAL '7 days',
        if_not_exists       => TRUE,
        migrate_data        => TRUE,
        partitioning_column => 'run_id',
        number_partitions   => 8
      )
    $cmd$;

    EXECUTE $cmd$
      ALTER TABLE sensors.robot_pose
        SET (timescaledb.compress,
             timescaledb.compress_orderby = 'time DESC',
             timescaledb.compress_segmentby = 'run_id, robot_id')
    $cmd$;

    EXECUTE $cmd$
      SELECT add_compression_policy('sensors.robot_pose', INTERVAL '14 days')
    $cmd$;

    EXECUTE $cmd$
      SELECT add_retention_policy('sensors.robot_pose',  INTERVAL '365 days')
    $cmd$;
  END IF;
END $$;