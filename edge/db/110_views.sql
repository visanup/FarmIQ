-- ────────────────────────────────────────────────────────────────────────────
-- migrations/110_views.sql
-- ────────────────────────────────────────────────────────────────────────────
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