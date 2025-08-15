-- ────────────────────────────────────────────────────────────────────────────
-- migrations/020_runs_waypoints.sql
-- ────────────────────────────────────────────────────────────────────────────
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
  FOREIGN KEY (tenant_id, robot_id)
    REFERENCES sensors.robots(tenant_id, robot_id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, house_id)
    REFERENCES sensors.houses(tenant_id, house_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_robot_time
  ON sensors.sweep_runs (tenant_id, robot_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_robot_status_started
  ON sensors.sweep_runs (tenant_id, robot_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_runs_active
  ON sensors.sweep_runs (tenant_id, robot_id, started_at DESC)
  WHERE status IN ('planned','running');

CREATE TABLE IF NOT EXISTS sensors.sweep_waypoints (
  run_id     BIGINT NOT NULL REFERENCES sensors.sweep_runs(run_id) ON DELETE CASCADE,
  seq        INT NOT NULL,
  planned_ts TIMESTAMPTZ,
  actual_ts  TIMESTAMPTZ,
  tenant_id  TEXT,
  house_id   TEXT,
  zone_id    TEXT,
  x          DOUBLE PRECISION,
  y          DOUBLE PRECISION,
  note       TEXT,
  PRIMARY KEY (run_id, seq),
  FOREIGN KEY (tenant_id, house_id, zone_id)
    REFERENCES sensors.zones(tenant_id, house_id, zone_id)
);

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