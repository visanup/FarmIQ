-- ────────────────────────────────────────────────────────────────────────────
-- migrations/130_weight.sql
-- ────────────────────────────────────────────────────────────────────────────

-- 1) ENUM สถานะ session
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname='weigh_status_enum' AND n.nspname='sensors'
  ) THEN
    CREATE TYPE sensors.weigh_status_enum AS ENUM ('open','finalized','discarded');
  END IF;
END $$;

-- 2) ตาราง weigh_sessions (มี CHECK scope ในตัว)
CREATE TABLE IF NOT EXISTS sensors.weigh_sessions (
  session_id        BIGSERIAL PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  station_id        TEXT,     -- Lab
  robot_id          TEXT,     -- Commercial
  run_id            BIGINT,
  scale_sensor_id   TEXT,     -- sensors.sensor_modules.sensor_id (เครื่องชั่ง)
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at          TIMESTAMPTZ,
  trigger_source    TEXT,     -- 'scale'|'camera'|'manual'
  status            sensors.weigh_status_enum NOT NULL DEFAULT 'open',
  ground_truth_kg   DOUBLE PRECISION,
  primary_media_id  BIGINT REFERENCES sensors.media_objects(media_id),
  meta              JSONB,
  CONSTRAINT chk_weigh_sessions_scope
    CHECK (
      (station_id IS NOT NULL AND robot_id IS NULL) OR
      (station_id IS NULL AND robot_id IS NOT NULL)
    )
);

-- 2.1) เพิ่ม FK/CHK ภายหลังแบบ idempotent (ไม่มี IF NOT EXISTS ตรง ๆ)
-- FK: (tenant_id, station_id) → lab_stations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE c.conname='fk_weigh_sessions_station'
      AND n.nspname='sensors'
      AND r.relname='weigh_sessions'
  ) THEN
    ALTER TABLE sensors.weigh_sessions
      ADD CONSTRAINT fk_weigh_sessions_station
      FOREIGN KEY (tenant_id, station_id)
      REFERENCES sensors.lab_stations(tenant_id, station_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- FK: (tenant_id, robot_id) → robots
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE c.conname='fk_weigh_sessions_robot'
      AND n.nspname='sensors'
      AND r.relname='weigh_sessions'
  ) THEN
    ALTER TABLE sensors.weigh_sessions
      ADD CONSTRAINT fk_weigh_sessions_robot
      FOREIGN KEY (tenant_id, robot_id)
      REFERENCES sensors.robots(tenant_id, robot_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- FK: run_id → sweep_runs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE c.conname='fk_weigh_sessions_run'
      AND n.nspname='sensors'
      AND r.relname='weigh_sessions'
  ) THEN
    ALTER TABLE sensors.weigh_sessions
      ADD CONSTRAINT fk_weigh_sessions_run
      FOREIGN KEY (run_id)
      REFERENCES sensors.sweep_runs(run_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- FK: (tenant_id, scale_sensor_id) → sensor_modules
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE c.conname='fk_weigh_sessions_scale_sensor'
      AND n.nspname='sensors'
      AND r.relname='weigh_sessions'
  ) THEN
    ALTER TABLE sensors.weigh_sessions
      ADD CONSTRAINT fk_weigh_sessions_scale_sensor
      FOREIGN KEY (tenant_id, scale_sensor_id)
      REFERENCES sensors.sensor_modules(tenant_id, sensor_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- CHK: ถ้ามี run_id ต้องมี robot_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE c.conname='chk_weigh_sessions_run_robot'
      AND n.nspname='sensors'
      AND r.relname='weigh_sessions'
  ) THEN
    ALTER TABLE sensors.weigh_sessions
      ADD CONSTRAINT chk_weigh_sessions_run_robot
      CHECK (run_id IS NULL OR robot_id IS NOT NULL);
  END IF;
END $$;

-- ดัชนีสำหรับ query บ่อย
CREATE INDEX IF NOT EXISTS idx_weigh_sessions_tenant_time
  ON sensors.weigh_sessions (tenant_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_weigh_sessions_station_time
  ON sensors.weigh_sessions (tenant_id, station_id, started_at DESC)
  WHERE station_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_weigh_sessions_robot_time
  ON sensors.weigh_sessions (tenant_id, robot_id, started_at DESC)
  WHERE robot_id IS NOT NULL;

-- 3) ตาราง weigh_events (เหตุการณ์ภายใน session)
CREATE TABLE IF NOT EXISTS sensors.weigh_events (
  session_id  BIGINT NOT NULL REFERENCES sensors.weigh_sessions(session_id) ON DELETE CASCADE,
  seq         INT NOT NULL,
  time        TIMESTAMPTZ NOT NULL,
  kind        TEXT NOT NULL,        -- 'scale'|'frame'|'inference'
  weight_kg   DOUBLE PRECISION,     -- เมื่อ kind='scale' หรือ 'inference'
  media_id    BIGINT REFERENCES sensors.media_objects(media_id), -- เมื่อ kind='frame'
  stable      BOOLEAN,
  meta        JSONB,
  PRIMARY KEY (session_id, time, seq) -- ❗ เปลี่ยนให้มี time
);

CREATE INDEX IF NOT EXISTS idx_weigh_events_time
  ON sensors.weigh_events (time, kind);
CREATE INDEX IF NOT EXISTS idx_weigh_events_session_time
  ON sensors.weigh_events (session_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_weigh_events_session_kind_time
  ON sensors.weigh_events (session_id, kind, time DESC);

-- ทำเป็น hypertable (ถ้ามี TimescaleDB)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='timescaledb') THEN
    EXECUTE $cmd$
      SELECT public.create_hypertable(
        'sensors.weigh_events','time',
        chunk_time_interval => INTERVAL '7 days',
        if_not_exists       => TRUE,
        migrate_data        => TRUE
      )
    $cmd$;

    EXECUTE $cmd$
      ALTER TABLE sensors.weigh_events
        SET (timescaledb.compress,
             timescaledb.compress_orderby = 'time DESC',
             timescaledb.compress_segmentby = 'session_id')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_compression_policy('sensors.weigh_events', INTERVAL '14 days')
    $cmd$;

    EXECUTE $cmd$
      SELECT public.add_retention_policy('sensors.weigh_events',  INTERVAL '365 days')
    $cmd$;
  END IF;
END $$;

-- 4) ฟังก์ชันช่วยเปิด/เพิ่มเหตุการณ์/ปิด session
CREATE OR REPLACE FUNCTION sensors.fn_weigh_open(
  _tenant TEXT,
  _station TEXT DEFAULT NULL,
  _robot   TEXT DEFAULT NULL,
  _run     BIGINT DEFAULT NULL,
  _scale_sensor TEXT DEFAULT NULL,
  _trigger TEXT DEFAULT 'scale',
  _meta JSONB DEFAULT '{}'::jsonb
) RETURNS BIGINT AS $$
DECLARE _sid BIGINT;
BEGIN
  IF NOT ( (_station IS NOT NULL AND _robot IS NULL) OR (_station IS NULL AND _robot IS NOT NULL) ) THEN
    RAISE EXCEPTION 'fn_weigh_open: must specify exactly one of station or robot';
  END IF;

  IF _run IS NOT NULL AND _robot IS NOT NULL THEN
    PERFORM sensors._assert_run_matches(_run, _tenant, _robot);
  END IF;

  INSERT INTO sensors.weigh_sessions(
    tenant_id, station_id, robot_id, run_id,
    scale_sensor_id, trigger_source, meta
  ) VALUES (
    _tenant, _station, _robot, _run,
    _scale_sensor, _trigger, _meta
  )
  RETURNING session_id INTO _sid;

  RETURN _sid;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sensors.fn_weigh_add_scale(
  _session BIGINT,
  _time TIMESTAMPTZ,
  _weight_kg DOUBLE PRECISION,
  _stable BOOLEAN DEFAULT FALSE,
  _meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
DECLARE _next INT;
BEGIN
  PERFORM pg_advisory_xact_lock(_session);
  SELECT COALESCE(MAX(seq),0)+1 INTO _next
  FROM sensors.weigh_events WHERE session_id=_session;

  INSERT INTO sensors.weigh_events(session_id,seq,time,kind,weight_kg,stable,meta)
  VALUES (_session,_next,_time,'scale',_weight_kg,_stable,_meta);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sensors.fn_weigh_add_frame(
  _session BIGINT,
  _time TIMESTAMPTZ,
  _media_id BIGINT,
  _meta JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
DECLARE _next INT;
BEGIN
  PERFORM pg_advisory_xact_lock(_session);
  SELECT COALESCE(MAX(seq),0)+1 INTO _next
  FROM sensors.weigh_events WHERE session_id=_session;

  INSERT INTO sensors.weigh_events(session_id,seq,time,kind,media_id,meta)
  VALUES (_session,_next,_time,'frame',_media_id,_meta);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sensors.fn_weigh_finalize(
  _session BIGINT
) RETURNS VOID AS $$
DECLARE
  _gt DOUBLE PRECISION;
  _gt_ts TIMESTAMPTZ;
  _media BIGINT;
  _tenant TEXT;
  _station TEXT;
  _robot TEXT;
  _run BIGINT;
  _scale_sensor TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(_session);

  SELECT
    CASE
      WHEN EXISTS (SELECT 1 FROM sensors.weigh_events WHERE session_id=_session AND kind='scale' AND stable IS TRUE)
      THEN (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY weight_kg)
            FROM sensors.weigh_events
            WHERE session_id=_session AND kind='scale' AND stable IS TRUE)
      ELSE (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY weight_kg)
            FROM sensors.weigh_events
            WHERE session_id=_session AND kind='scale')
    END,
    COALESCE(
      (SELECT time FROM sensors.weigh_events
       WHERE session_id=_session AND kind='scale' AND stable IS TRUE
       ORDER BY time DESC LIMIT 1),
      (SELECT time FROM sensors.weigh_events
       WHERE session_id=_session AND kind='scale'
       ORDER BY time DESC LIMIT 1)
    )
  INTO _gt, _gt_ts;

  SELECT e.media_id
  FROM sensors.weigh_events e
  WHERE e.session_id=_session AND e.kind='frame' AND e.media_id IS NOT NULL
  ORDER BY ABS(EXTRACT(EPOCH FROM (e.time - _gt_ts))) ASC
  LIMIT 1
  INTO _media;

  UPDATE sensors.weigh_sessions s
  SET ended_at = COALESCE(ended_at, now()),
      ground_truth_kg = COALESCE(_gt, ground_truth_kg),
      primary_media_id = COALESCE(_media, primary_media_id),
      status = 'finalized'
  WHERE s.session_id = _session;

  SELECT tenant_id, station_id, robot_id, run_id, scale_sensor_id
    INTO _tenant, _station, _robot, _run, _scale_sensor
  FROM sensors.weigh_sessions WHERE session_id=_session;

  IF _media IS NOT NULL AND _gt_ts IS NOT NULL THEN
    INSERT INTO sensors.reading_media_map(time, tenant_id, robot_id, run_id, station_id, sensor_id, metric, media_id)
    VALUES (_gt_ts, _tenant, _robot, _run, _station, _scale_sensor, 'WEIGHT', _media)
    ON CONFLICT DO NOTHING;
  END IF;
END; $$ LANGUAGE plpgsql;
