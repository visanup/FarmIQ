## app/adapters/repository.py

from sqlalchemy import text
from sqlalchemy.orm import Session

class AnalyticsRepo:
    def __init__(self, db: Session): self.db = db

    def upsert_agg(self, row: dict):
        sql = text("""
        INSERT INTO analytics.analytics_agg (
          bucket_start, window_s, tenant_id, factory_id, machine_id, sensor_id, metric,
          count_n, sum_val, avg_val, min_val, max_val, stddev_val, p95_val
        ) VALUES (
          :bucket_start, :window_s, :tenant_id, :factory_id, :machine_id, :sensor_id, :metric,
          :count_n, :sum_val, :avg_val, :min_val, :max_val, :stddev_val, :p95_val
        )
        ON CONFLICT (tenant_id, factory_id, machine_id, metric, window_s, bucket_start)
        DO UPDATE SET
          count_n    = analytics.analytics_agg.count_n + EXCLUDED.count_n,
          sum_val    = COALESCE(analytics.analytics_agg.sum_val,0) + COALESCE(EXCLUDED.sum_val,0),
          avg_val    = EXCLUDED.avg_val,
          min_val    = LEAST(analytics.analytics_agg.min_val, EXCLUDED.min_val),
          max_val    = GREATEST(analytics.analytics_agg.max_val, EXCLUDED.max_val),
          stddev_val = EXCLUDED.stddev_val,
          p95_val    = EXCLUDED.p95_val,
          updated_at = NOW();
        """)
        self.db.execute(sql, row)

    def insert_anomaly(self, row: dict):
        sql = text("""
        INSERT INTO analytics.analytics_anomaly
        (time, tenant_id, factory_id, machine_id, sensor_id, metric,
         rule_code, severity, value, cl, ucl, lcl, zscore, details)
        VALUES (:time,:tenant_id,:factory_id,:machine_id,:sensor_id,:metric,
                :rule_code,:severity,:value,:cl,:ucl,:lcl,:zscore,CAST(:details AS JSONB))
        ON CONFLICT DO NOTHING;
        """)
        self.db.execute(sql, row)
