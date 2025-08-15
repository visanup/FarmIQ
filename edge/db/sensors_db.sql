-- ===========================================
-- FarmIQ Edge — Robot Sweep (Run-based + Lab)
-- FULL SQL SCHEMA (PostgreSQL + TimescaleDB)
-- ===========================================

-- Schema & Extension ---------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS sensors;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ENUMs ----------------------------------------------------------------------
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
    -- Ensure new values exist (PostgreSQL 12+ supports IF NOT EXISTS)
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

-- Core Dimensions ------------------------------------------------------------
-- Houses (barn/building)
CREATE TABLE IF NOT EXISTS sensors.houses (
  tenant_id TEXT NOT NULL,
  house_id  TEXT NOT NULL,
  name      TEXT,
  meta      JSONB,
  PRIMARY KEY (tenant_id, house_id)
);

-- Zones inside a house (no PostGIS in this version)
CREATE TABLE IF NOT EXISTS sensors.zones (
  tenant_id   TEXT NOT NULL,
  house_id    TEXT NOT NULL,
  zone_id     TEXT NOT NULL,    -- e.g. A1, B3 or grid_x_y
  row_idx     INT,
  col_idx     INT,
  meta        JSONB,
  PRIMARY KEY (tenant_id, house_id, zone_id),
  FOREIGN KEY (tenant_id, house_id)
    REFERENCES sensors.houses(tenant_id, house_id) ON DELETE CASCADE
);

-- Robots registry
CREATE TABLE IF NOT EXISTS sensors.robots (
  tenant_id TEXT NOT NULL,
  robot_id  TEXT NOT NULL,
  house_id  TEXT,
  name      TEXT,
  spec      JSONB,              -- HW/Sensors details
  PRIMARY KEY (tenant_id, robot_id),
  FOREIGN KEY (tenant_id, house_id)
    REFERENCES sensors.houses(tenant_id, house_id) ON DELETE SET NULL
);

-- Expected sweep cadence per robot
CREATE TABLE IF NOT EXISTS sensors.robot_expected (
  tenant_id  TEXT NOT NULL,
  robot_id   TEXT NOT NULL,
  sweep_every_min          INT NOT NULL DEFAULT 180,  -- every 3 hours
  sample_during_sweep_sec  INT NOT NULL DEFAULT 60,   -- sample every 1 min during sweep
  PRIMARY KEY (tenant_id, robot_id),
  FOREIGN KEY (tenant_id, robot_id) REFERENCES sensors.robots(tenant_id, robot_id) ON DELETE CASCADE
);

-- Runs (sweeps)
CREATE TABLE IF NOT EXISTS sensors.sweep_runs (
  run_id      BIGSERIAL PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  robot_id    TEXT NOT NULL,
  house_id    TEXT,
  status      sensors.run_status_enum NOT NULL DEFAULT 'planned',
  cadence_sec INT NOT NULL DEFAULT 60,
  started_at  TIMESTAMPTZ,
  ended_at    TIMESTAMPTZ,
  plan        JSONB,
  summary     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, robot_id) REFERENCES sensors.robots(tenant_id, robot_id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, house_id) REFERENCES sensors.houses(tenant_id, house_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_robot_time
  ON sensors.sweep_runs (tenant_id, robot_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_robot_status_started
  ON sensors.sweep_runs (tenant_id, robot_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_runs_active
  ON sensors.sweep_runs (tenant_id, robot_id, started_at DESC)
  WHERE status IN ('planned','running');

-- Waypoints (planned/actual) - enriched with tenant/house to FK zones
CREATE TABLE IF NOT EXISTS sensors.sweep_waypoints (
  run_id     BIGINT NOT NULL REFERENCES sensors.sweep_runs(run_id) ON DELETE CASCADE,
  seq        INT NOT NULL,
  planned_ts TIMESTAMPTZ,
  actual_ts  TIMESTAMPTZ,
  tenant_id  TEXT,   -- auto-filled from run via trigger if NULL
  house_id   TEXT,   -- auto-filled from run via trigger if NULL
  zone_id    TEXT,
  x          DOUBLE PRECISION,
  y          DOUBLE PRECISION,
  note       TEXT,
  PRIMARY KEY (run_id, seq),
  FOREIGN KEY (tenant_id, house_id, zone_id) REFERENCES sensors.zones(tenant_id, house_id, zone_id)
);

-- Auto-fill tenant_id/house_id on waypoints from the run
CREATE OR REPLACE FUNCTION sensors.trg_fill_waypoint_tenant_house()
RETURNS trigger AS $$
BEGIN
  IF NEW.tenant_id IS NULL OR NEW.house_id IS NULL THEN
    SELECT r.tenant_id, r.house_id INTO NEW.tenant_id, NEW.house_id
    FROM sensors.sweep_runs r WHERE r.run_id = NEW.run_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_ins_upd_sweep_waypoints ON sensors.sweep_waypoints;
CREATE TRIGGER before_ins_upd_sweep_waypoints
BEFORE INSERT OR UPDATE ON sensors.sweep_waypoints
FOR EACH ROW EXECUTE FUNCTION sensors.trg_fill_waypoint_tenant_house();

-- Hypertables (Commercial / Run-based) --------------------------------------
-- Robot pose
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
  PRIMARY KEY (time, robot_id)
);

SELECT create_hypertable(
  'sensors.robot_pose','time',
  chunk_time_interval => INTERVAL '7 days',
  if_not_exists       => TRUE,
  migrate_data        => TRUE,
  partitioning_column => 'run_id',
  number_partitions   => 8
);

CREATE INDEX IF NOT EXISTS idx_pose_run_time ON sensors.robot_pose (run_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_pose_robot_time ON sensors.robot_pose (tenant_id, robot_id, time DESC);

ALTER TABLE sensors.robot_pose
  SET (timescaledb.compress,
       timescaledb.compress_orderby = 'time DESC',
       timescaledb.compress_segmentby = 'run_id, robot_id');

SELECT add_compression_policy('sensors.robot_pose', INTERVAL '14 days');
SELECT add_retention_policy  ('sensors.robot_pose',  INTERVAL '365 days');

-- Sweep readings
CREATE TABLE IF NOT EXISTS sensors.sweep_readings (
  time        TIMESTAMPTZ          NOT NULL,
  tenant_id   TEXT                 NOT NULL,
  robot_id    TEXT                 NOT NULL,
  run_id      BIGINT               NOT NULL REFERENCES sensors.sweep_runs(run_id) ON DELETE CASCADE,
  sensor_id   TEXT                 NOT NULL,
  metric      TEXT                 NOT NULL,          -- TEMP/HUM/CO2/NH3/WEIGHT ...
  zone_id     TEXT,
  x           DOUBLE PRECISION,
  y           DOUBLE PRECISION,
  value       DOUBLE PRECISION     NOT NULL,
  quality     sensors.quality_enum NOT NULL DEFAULT 'clean',
  payload     JSONB,
  PRIMARY KEY (time, robot_id, run_id, sensor_id, metric)
);

SELECT create_hypertable(
  'sensors.sweep_readings','time',
  chunk_time_interval => INTERVAL '7 days',
  if_not_exists       => TRUE,
  migrate_data        => TRUE,
  partitioning_column => 'run_id',
  number_partitions   => 8
);

CREATE INDEX IF NOT EXISTS idx_swr_run_metric_time
  ON sensors.sweep_readings (run_id, metric, time DESC);

CREATE INDEX IF NOT EXISTS idx_swr_zone_time
  ON sensors.sweep_readings (zone_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_swr_run_zone_metric
  ON sensors.sweep_readings (run_id, zone_id, metric);

CREATE INDEX IF NOT EXISTS idx_readings_latest
  ON sensors.sweep_readings (tenant_id, robot_id, metric, time DESC);

ALTER TABLE sensors.sweep_readings
  SET (timescaledb.compress,
       timescaledb.compress_orderby = 'time DESC',
       timescaledb.compress_segmentby = 'run_id, robot_id');

SELECT add_compression_policy('sensors.sweep_readings', INTERVAL '30 days');
SELECT add_retention_policy  ('sensors.sweep_readings',  INTERVAL '730 days'); -- 2 years

-- Device health / LWT
CREATE TABLE IF NOT EXISTS sensors.device_health (
  time        TIMESTAMPTZ NOT NULL,
  tenant_id   TEXT        NOT NULL,
  device_id   TEXT        NOT NULL,  -- robot_id or critical module id
  online      BOOLEAN,
  source      TEXT,                  -- 'health' | 'lwt'
  rssi        INT,
  uptime_s    BIGINT,
  meta        JSONB,
  PRIMARY KEY (time, tenant_id, device_id)
);

SELECT create_hypertable(
  'sensors.device_health','time',
  chunk_time_interval => INTERVAL '7 days',
  if_not_exists       => TRUE,
  migrate_data        => TRUE
);

CREATE INDEX IF NOT EXISTS idx_dh_tenant_dev_time
  ON sensors.device_health (tenant_id, device_id, time DESC);

ALTER TABLE sensors.device_health
  SET (timescaledb.compress,
       timescaledb.compress_orderby = 'time DESC',
       timescaledb.compress_segmentby = 'tenant_id, device_id');

SELECT add_compression_policy('sensors.device_health', INTERVAL '30 days');
SELECT add_retention_policy  ('sensors.device_health',  INTERVAL '365 days');

-- Lab-Scale Tables (no run_id) ----------------------------------------------
CREATE TABLE IF NOT EXISTS sensors.lab_stations (
  tenant_id  TEXT NOT NULL,
  station_id TEXT NOT NULL,
  name       TEXT,
  house_id   TEXT,
  spec       JSONB,
  PRIMARY KEY (tenant_id, station_id),
  FOREIGN KEY (tenant_id, house_id) REFERENCES sensors.houses(tenant_id, house_id) ON DELETE SET NULL
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
  FOREIGN KEY (tenant_id, station_id) REFERENCES sensors.lab_stations(tenant_id, station_id) ON DELETE CASCADE
);

SELECT create_hypertable('sensors.lab_readings','time',
  chunk_time_interval => INTERVAL '7 days',
  if_not_exists => TRUE, migrate_data => TRUE);

ALTER TABLE sensors.lab_readings SET (
  timescaledb.compress,
  timescaledb.compress_orderby = 'time DESC',
  timescaledb.compress_segmentby = 'tenant_id, station_id'
);

SELECT add_compression_policy('sensors.lab_readings', INTERVAL '30 days');
SELECT add_retention_policy  ('sensors.lab_readings',  INTERVAL '365 days');

CREATE INDEX IF NOT EXISTS idx_lab_latest
  ON sensors.lab_readings (tenant_id, station_id, metric, time DESC);

-- Sensor & Metric Dimensions -------------------------------------------------
CREATE TABLE IF NOT EXISTS sensors.metrics_dim (
  metric     TEXT PRIMARY KEY,      -- 'TEMP','HUM','CO2','NH3','WEIGHT', ...
  unit       TEXT NOT NULL,         -- '°C','%','ppm','kg', ...
  thresholds JSONB,                 -- {"warn":..., "crit":...}
  meta       JSONB
);

CREATE TABLE IF NOT EXISTS sensors.sensor_modules (
  tenant_id  TEXT NOT NULL,
  sensor_id  TEXT NOT NULL,
  robot_id   TEXT,                  -- NULL for lab-only modules
  station_id TEXT,                  -- for lab stations
  kind       TEXT NOT NULL,         -- 'ENV','DEPTH','VOC','CAM','LIDAR', ...
  calib      JSONB,                 -- calibration/model versions
  meta       JSONB,
  PRIMARY KEY (tenant_id, sensor_id),
  FOREIGN KEY (tenant_id, robot_id)  REFERENCES sensors.robots(tenant_id, robot_id)   ON DELETE SET NULL,
  FOREIGN KEY (tenant_id, station_id) REFERENCES sensors.lab_stations(tenant_id, station_id) ON DELETE SET NULL
);

-- Media Objects & Mapping ----------------------------------------------------
CREATE TABLE IF NOT EXISTS sensors.media_objects (
  media_id    BIGSERIAL PRIMARY KEY,
  time        TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id   TEXT NOT NULL,
  kind        TEXT NOT NULL,        -- 'raw_image','processed_image','mask','pointcloud', ...
  bucket      TEXT NOT NULL,
  object_key  TEXT NOT NULL,
  sha256      TEXT,
  width       INT,
  height      INT,
  meta        JSONB
);

CREATE TABLE IF NOT EXISTS sensors.reading_media_map (
  time        TIMESTAMPTZ NOT NULL,
  tenant_id   TEXT        NOT NULL,
  robot_id    TEXT,
  run_id      BIGINT,
  station_id  TEXT,
  sensor_id   TEXT,
  metric      TEXT        NOT NULL,
  media_id    BIGINT      NOT NULL REFERENCES sensors.media_objects(media_id) ON DELETE CASCADE,
  PRIMARY KEY (time, tenant_id, COALESCE(robot_id,'-'), COALESCE(station_id,'-'), COALESCE(sensor_id,'-'), metric, media_id)
);

-- Alerts ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensors.alerts (
  alert_id   BIGSERIAL PRIMARY KEY,
  time       TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id  TEXT NOT NULL,
  robot_id   TEXT,
  run_id     BIGINT,
  station_id TEXT,
  metric     TEXT,
  severity   INT,            -- 1..5
  title      TEXT,
  message    TEXT,
  context    JSONB,
  status     sensors.alert_status NOT NULL DEFAULT 'open'
);

CREATE INDEX IF NOT EXISTS idx_alerts_tenant_time ON sensors.alerts (tenant_id, time DESC);

-- Guard: ensure run_id matches tenant/robot on ingest ------------------------
CREATE OR REPLACE FUNCTION sensors._assert_run_matches(_run BIGINT, _tenant TEXT, _robot TEXT)
RETURNS VOID AS $$
DECLARE ok BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM sensors.sweep_runs
    WHERE run_id = _run AND tenant_id = _tenant AND robot_id = _robot
  ) INTO ok;
  IF NOT ok THEN
    RAISE EXCEPTION 'run_id % does not belong to tenant % / robot %', _run, _tenant, _robot;
  END IF;
END; $$ LANGUAGE plpgsql;

-- Ingest & Run Management Functions -----------------------------------------
CREATE OR REPLACE FUNCTION sensors.fn_run_start(
  _tenant TEXT, _robot TEXT, _house TEXT DEFAULT NULL,
  _cadence_sec INT DEFAULT 60, _plan JSONB DEFAULT '{}'::jsonb
) RETURNS BIGINT AS $$
DECLARE _run BIGINT;
BEGIN
  INSERT INTO sensors.sweep_runs(tenant_id, robot_id, house_id, status, cadence_sec, started_at, plan)
  VALUES (_tenant, _robot, _house, 'running', _cadence_sec, now(), _plan)
  RETURNING run_id INTO _run;
  RETURN _run;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sensors.fn_run_end(
  _run BIGINT, _summary JSONB DEFAULT '{}'::jsonb, _status sensors.run_status_enum DEFAULT 'completed'
) RETURNS VOID AS $$
BEGIN
  UPDATE sensors.sweep_runs
     SET ended_at = COALESCE(ended_at, now()),
         status   = _status,
         summary  = _summary
   WHERE run_id = _run;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sensors.fn_ingest_pose(
  _tenant TEXT,_robot TEXT,_run BIGINT,_time TIMESTAMPTZ,
  _x DOUBLE PRECISION,_y DOUBLE PRECISION,_heading DOUBLE PRECISION,
  _speed DOUBLE PRECISION,_battery DOUBLE PRECISION,_meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  PERFORM sensors._assert_run_matches(_run, _tenant, _robot);
  INSERT INTO sensors.robot_pose(time,tenant_id,robot_id,run_id,x,y,heading,speed_mps,battery_v,meta)
  VALUES (_time,_tenant,_robot,_run,_x,_y,_heading,_speed,_battery,_meta)
  ON CONFLICT (time, robot_id)
  DO UPDATE SET
    run_id    = EXCLUDED.run_id,
    x         = EXCLUDED.x,
    y         = EXCLUDED.y,
    heading   = EXCLUDED.heading,
    speed_mps = EXCLUDED.speed_mps,
    battery_v = EXCLUDED.battery_v,
    meta      = EXCLUDED.meta;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sensors.fn_ingest_reading(
  _tenant TEXT,_robot TEXT,_run BIGINT,_sensor TEXT,_metric TEXT,
  _time TIMESTAMPTZ,_value DOUBLE PRECISION,_zone TEXT DEFAULT NULL,
  _x DOUBLE PRECISION DEFAULT NULL,_y DOUBLE PRECISION DEFAULT NULL,
  _quality sensors.quality_enum DEFAULT 'clean', _payload JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  PERFORM sensors._assert_run_matches(_run, _tenant, _robot);
  INSERT INTO sensors.sweep_readings(
    time, tenant_id, robot_id, run_id, sensor_id, metric, zone_id, x, y, value, quality, payload
  )
  VALUES (
    _time, _tenant, _robot, _run, _sensor, _metric, _zone, _x, _y, _value, _quality, _payload
  )
  ON CONFLICT (time, robot_id, run_id, sensor_id, metric)
  DO UPDATE SET
    zone_id = EXCLUDED.zone_id,
    x       = EXCLUDED.x,
    y       = EXCLUDED.y,
    value   = EXCLUDED.value,
    quality = EXCLUDED.quality,
    payload = EXCLUDED.payload;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sensors.fn_ingest_health(
  _tenant TEXT,_device TEXT,_time TIMESTAMPTZ,_online BOOLEAN,_source TEXT,
  _rssi INT DEFAULT NULL,_uptime BIGINT DEFAULT NULL,_meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  INSERT INTO sensors.device_health(time,tenant_id,device_id,online,source,rssi,uptime_s,meta)
  VALUES (_time,_tenant,_device,_online,_source,_rssi,_uptime,_meta)
  ON CONFLICT (time, tenant_id, device_id) DO NOTHING;
END; $$ LANGUAGE plpgsql;

-- Views ----------------------------------------------------------------------
CREATE OR REPLACE VIEW sensors.robot_latest_status AS
WITH latest_health AS (
  SELECT DISTINCT ON (tenant_id, device_id)
         tenant_id, device_id AS robot_id, time AS last_seen, online, source, meta
    FROM sensors.device_health
   ORDER BY tenant_id, device_id, time DESC
),
latest_run AS (
  SELECT DISTINCT ON (tenant_id, robot_id)
         tenant_id, robot_id, run_id, status, started_at, ended_at
    FROM sensors.sweep_runs
   ORDER BY tenant_id, robot_id, started_at DESC
)
SELECT
  h.tenant_id,
  h.robot_id,
  h.last_seen,
  now() - h.last_seen AS age,
  COALESCE(h.online, FALSE) AS online,
  r.run_id, r.status AS run_status, r.started_at, r.ended_at
FROM latest_health h
LEFT JOIN latest_run r
  ON r.tenant_id = h.tenant_id AND r.robot_id = h.robot_id;

CREATE OR REPLACE VIEW sensors.sweep_zone_summary AS
SELECT
  run_id, tenant_id, robot_id, zone_id, metric,
  avg(value) AS avg_value,
  min(value) AS min_value,
  max(value) AS max_value,
  count(*)   AS samples
FROM sensors.sweep_readings
GROUP BY run_id, tenant_id, robot_id, zone_id, metric;

-- Continuous Aggregates (Dashboard-friendly) ---------------------------------
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
WITH NO DATA;

SELECT add_continuous_aggregate_policy('sensors.cagg_sweep_readings_5m',
  start_offset => INTERVAL '7 days',
  end_offset   => INTERVAL '1 hour',
  schedule_interval => INTERVAL '15 minutes');

-- Example Grants (adjust to your roles) -------------------------------------
-- CREATE USER edge WITH PASSWORD 'EdgeStrong!123';
-- GRANT USAGE ON SCHEMA sensors TO edge;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sensors TO edge;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA sensors
--   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO edge;

-- END OF FILE ----------------------------------------------------------------
