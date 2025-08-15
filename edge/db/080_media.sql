-- ────────────────────────────────────────────────────────────────────────────
-- migrations/080_media.sql
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors.media_objects (
  media_id    BIGSERIAL PRIMARY KEY,
  time        TIMESTAMPTZ NOT NULL DEFAULT now(),
  tenant_id   TEXT NOT NULL,
  kind        TEXT NOT NULL,
  bucket      TEXT NOT NULL,
  object_key  TEXT NOT NULL,
  sha256      TEXT,
  width       INT,
  height      INT,
  meta        JSONB
);

CREATE TABLE IF NOT EXISTS sensors.reading_media_map (
  map_id     BIGSERIAL PRIMARY KEY,
  time       TIMESTAMPTZ NOT NULL,
  tenant_id  TEXT        NOT NULL,
  robot_id   TEXT,
  run_id     BIGINT,
  station_id TEXT,
  sensor_id  TEXT,
  metric     TEXT        NOT NULL,
  media_id   BIGINT      NOT NULL REFERENCES sensors.media_objects(media_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reading_media_map_norm
  ON sensors.reading_media_map (
    time,
    tenant_id,
    (COALESCE(robot_id,'-')),
    (COALESCE(station_id,'-')),
    (COALESCE(sensor_id,'-')),
    metric,
    media_id
  );