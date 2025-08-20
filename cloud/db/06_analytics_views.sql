-- =========================
-- 06_analytics_views.sql
-- Convenience views for dashboards & APIs
-- =========================

CREATE SCHEMA IF NOT EXISTS analytics;

-- สถิติพื้นฐานจาก minute_features (avg/stddev)
CREATE OR REPLACE VIEW analytics.v_minute_stats AS
SELECT bucket, tenant_id, device_id, sensor_id, metric, tags, tags_hash,
       value_count,
       value_sum,
       value_min,
       value_max,
       value_sumsq,
       CASE WHEN value_count > 0 THEN value_sum / value_count ELSE NULL END AS avg,
       CASE
         WHEN value_count > 1 THEN
           sqrt(GREATEST(value_sumsq - (value_sum*value_sum)/value_count, 0) / (value_count-1))
         ELSE NULL
       END AS stddev
FROM analytics.minute_features;

-- Join กับ dimension device เพื่อการ query แบบบริบท
CREATE OR REPLACE VIEW analytics.v_minute_with_dims AS
SELECT mf.bucket, mf.tenant_id, mf.device_id, d.farm_id, d.house_id,
       mf.sensor_id, mf.metric, mf.tags, mf.tags_hash,
       mf.value_count, mf.value_sum, mf.value_min, mf.value_max, mf.value_sumsq
FROM analytics.minute_features mf
LEFT JOIN analytics.dim_device d
  ON d.tenant_id = mf.tenant_id AND d.device_id = mf.device_id;

-- สถิติ enriched (มี avg/stddev) พร้อม dims
CREATE OR REPLACE VIEW analytics.v_minute_stats_enriched AS
SELECT x.*,
       CASE WHEN value_count > 0 THEN value_sum/value_count ELSE NULL END AS avg,
       CASE WHEN value_count > 1 THEN
         sqrt(GREATEST(value_sumsq - (value_sum*value_sum)/value_count, 0) / (value_count-1))
       ELSE NULL END AS stddev
FROM analytics.v_minute_with_dims x;

-- ค่า “ล่าสุด” ต่อ key (tenant, device, sensor, metric, tags_hash)
CREATE OR REPLACE VIEW analytics.v_latest_feature AS
SELECT DISTINCT ON (tenant_id, device_id, sensor_id, metric, tags_hash)
  tenant_id, device_id, sensor_id, metric, tags, tags_hash,
  bucket, value_count, value_sum, value_min, value_max, value_sumsq,
  CASE WHEN value_count>0 THEN value_sum/value_count END AS avg
FROM analytics.minute_features
ORDER BY tenant_id, device_id, sensor_id, metric, tags_hash, bucket DESC;
