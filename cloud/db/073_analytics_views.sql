-- 10_analytics_views.sql
CREATE SCHEMA IF NOT EXISTS analytics;

-- ล่าสุดต่อ key+window (ช่วย API ดึงเร็ว)
CREATE OR REPLACE VIEW analytics.v_agg_latest AS
SELECT *
FROM (
  SELECT a.*,
         ROW_NUMBER() OVER (
           PARTITION BY tenant_id, factory_id, machine_id, sensor_id, metric, window_s
           ORDER BY bucket_start DESC
         ) AS rn
  FROM analytics.analytics_agg a
) z
WHERE z.rn = 1;

-- anomalies ล่าสุด 7 วัน (ปรับตามต้องการ)
CREATE OR REPLACE VIEW analytics.v_anomaly_recent AS
SELECT *
FROM analytics.analytics_anomaly
WHERE time >= NOW() - INTERVAL '7 days';

-- KPI ล่าสุดต่อ period/metric
CREATE OR REPLACE VIEW analytics.v_kpi_latest AS
SELECT *
FROM (
  SELECT k.*,
         ROW_NUMBER() OVER (
           PARTITION BY tenant_id, factory_id, machine_id, sensor_id, metric, period
           ORDER BY period_start DESC
         ) rn
  FROM analytics.analytics_kpi k
) zz
WHERE rn = 1;

-- สรุป event รายวัน (นับจำนวน/รวม value) — ใช้กับแดชบอร์ด ops/feed
CREATE OR REPLACE VIEW analytics.v_event_daily AS
SELECT
  time_bucket('1 day', bucket_start) AS day,
  tenant_id, domain, entity_type, entity_id, event_type,
  SUM(count_n) AS count_n,
  SUM(sum_val) AS sum_val
FROM analytics.analytics_event_rollup
GROUP BY day, tenant_id, domain, entity_type, entity_id, event_type;
