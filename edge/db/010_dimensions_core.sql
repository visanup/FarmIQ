-- ────────────────────────────────────────────────────────────────────────────
-- migrations/010_dimensions_core.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.houses (
  tenant_id TEXT NOT NULL,
  house_id  TEXT NOT NULL,
  name      TEXT,
  meta      JSONB,
  PRIMARY KEY (tenant_id, house_id)
);

CREATE TABLE IF NOT EXISTS sensors.zones (
  tenant_id   TEXT NOT NULL,
  house_id    TEXT NOT NULL,
  zone_id     TEXT NOT NULL,
  row_idx     INT,
  col_idx     INT,
  meta        JSONB,
  PRIMARY KEY (tenant_id, house_id, zone_id),
  FOREIGN KEY (tenant_id, house_id)
    REFERENCES sensors.houses(tenant_id, house_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sensors.robots (
  tenant_id TEXT NOT NULL,
  robot_id  TEXT NOT NULL,
  house_id  TEXT,
  name      TEXT,
  spec      JSONB,
  PRIMARY KEY (tenant_id, robot_id),
  FOREIGN KEY (tenant_id, house_id)
    REFERENCES sensors.houses(tenant_id, house_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sensors.robot_expected (
  tenant_id  TEXT NOT NULL,
  robot_id   TEXT NOT NULL,
  sweep_every_min          INT NOT NULL DEFAULT 180,
  sample_during_sweep_sec  INT NOT NULL DEFAULT 60,
  PRIMARY KEY (tenant_id, robot_id),
  FOREIGN KEY (tenant_id, robot_id)
    REFERENCES sensors.robots(tenant_id, robot_id) ON DELETE CASCADE
);