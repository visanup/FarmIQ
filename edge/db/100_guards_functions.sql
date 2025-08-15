-- ────────────────────────────────────────────────────────────────────────────
-- migrations/100_guards_functions.sql
-- ────────────────────────────────────────────────────────────────────────────
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
  ON CONFLICT (time, robot_id, run_id)
  DO UPDATE SET
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
