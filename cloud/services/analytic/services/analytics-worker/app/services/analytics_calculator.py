# app/services/analytics_calculator.py
"""
Analytics Calculator Service
Calculates analytics metrics from minute_features data and stores results
"""

from __future__ import annotations

import logging
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy import text
from app.database import SessionLocal
from app.adapters.repository import AnalyticsRepo
import math
import uuid
from app.config import Config

logger = logging.getLogger(__name__)

class AnalyticsCalculator:
    """Calculates analytics metrics from minute_features data"""
    
    def __init__(self):
        self.db = SessionLocal()
    
    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()
    
    def _rollback_if_needed(self):
        """Rollback transaction if it's in a failed state"""
        try:
            self.db.rollback()
        except:
            pass
    
    def calculate_fcr_metrics(self, tenant_id: str, farm_id: str, house_id: str, 
                            flock_id: str, start_date: datetime, end_date: datetime) -> Optional[Dict]:
        """Calculate FCR (Feed Conversion Ratio) metrics"""
        try:
            # Query feed intake and weight data from minute_features
            query = text("""
                WITH daily_weights AS (
                    SELECT 
                        bucket::date AS date,
                        AVG(value_sum / NULLIF(value_count, 0)) AS avg_weight
                    FROM analytics.minute_features 
                    WHERE tenant_id = :tenant_id 
                        AND device_id = :device_id
                        AND metric IN ('sensors.weight_scale.current_kg', 'sensors.weight_predict.current_kg')
                        AND bucket::date >= :start_date
                        AND bucket::date <= :end_date
                    GROUP BY bucket::date
                    ORDER BY bucket::date
                ),
                weight_gain AS (
                    SELECT 
                        COALESCE(MAX(avg_weight) - MIN(avg_weight), 0) AS total_gain,
                        COUNT(*) AS days
                    FROM daily_weights
                ),
                feed_data AS (
                    SELECT 
                        COALESCE(SUM(value_sum), 0) AS total_feed
                    FROM analytics.minute_features 
                    WHERE tenant_id = :tenant_id 
                        AND device_id = :device_id
                        AND metric = 'feed.intake.kg'
                        AND bucket::date >= :start_date
                        AND bucket::date <= :end_date
                )
                SELECT 
                    wg.total_gain,
                    wg.days,
                    fd.total_feed,
                    CASE WHEN wg.total_gain > 0 THEN fd.total_feed / wg.total_gain ELSE 0 END AS feed_efficiency
                FROM weight_gain wg CROSS JOIN feed_data fd
            """)
            
            result = self.db.execute(query, {
                'tenant_id': tenant_id,
                'device_id': farm_id,
                'start_date': start_date,
                'end_date': end_date
            }).fetchone()
            
            # Guard: need at least some feed and at least 1 day of weights
            if not result or result.total_feed is None or result.days is None or result.days < 1:
                logger.warning(f"No data found for FCR calculation: tenant={tenant_id} device={farm_id} days={getattr(result,'days',None)} total_feed={getattr(result,'total_feed',None)} total_gain={getattr(result,'total_gain',None)}")
                return None

            total_feed = float(result.total_feed or 0)
            total_gain = float(result.total_gain or 0)
            days = int(result.days or 0)

            if total_feed <= 0:
                logger.warning(f"FCR skip (no feed): tenant={tenant_id} device={farm_id} total_feed={total_feed}")
                return None

            # Avoid division by zero; allow tiny gains using a minimum threshold
            minimal_gain = 0.01
            effective_gain = total_gain if total_gain > minimal_gain else minimal_gain
            if total_gain <= 0:
                logger.info(f"FCR using minimal_gain because total_gain={total_gain} <= 0; tenant={tenant_id} device={farm_id}")
            fcr_value = total_feed / effective_gain
            logger.info(f"FCR computed: tenant={tenant_id} device={farm_id} days={days} total_feed={total_feed} total_gain={total_gain} fcr={fcr_value}")
            
            return {
                'id': 'fcr_' + uuid.uuid4().hex,
                'tenant_id': tenant_id,
                'farm_id': farm_id,
                'house_id': house_id,
                'flock_id': flock_id,
                'period_start': start_date,
                'period_end': end_date,
                'total_feed': total_feed,
                'total_weight': total_gain,
                'fcr_value': fcr_value,
                'feed_days': days,
                'weight_days': days,
                'metadata': json.dumps({
                    'calculated_at': datetime.now(timezone.utc).isoformat(),
                    'data_source': 'minute_features',
                    'raw': {
                        'total_feed': total_feed,
                        'total_gain': total_gain,
                        'days': days
                    }
                })
            }
            
        except Exception as e:
            logger.error(f"Error calculating FCR metrics: {e}")
            self._rollback_if_needed()
            return None
    
    def calculate_health_metrics(self, tenant_id: str, farm_id: str, house_id: str, 
                               flock_id: str, measurement_date: datetime) -> Optional[Dict]:
        """Calculate health metrics"""
        try:
            # Query environmental and health data
            query = text("""
                WITH env_data AS (
                    SELECT 
                        metric,
                        AVG(value_sum / NULLIF(value_count, 0)) as avg_value,
                        MIN(value_min) as min_value,
                        MAX(value_max) as max_value
                    FROM analytics.minute_features 
                    WHERE tenant_id = :tenant_id 
                        AND device_id = :device_id
                        AND metric IN ('sensor.temperature', 'sensor.humidity', 'sensor.co2', 'sensor.nh3')
                        AND bucket::date = :measurement_date
                    GROUP BY metric
                )
                SELECT 
                    AVG(CASE WHEN metric = 'sensor.temperature' THEN avg_value END) as avg_temperature,
                    AVG(CASE WHEN metric = 'sensor.humidity' THEN avg_value END) as avg_humidity,
                    AVG(CASE WHEN metric = 'sensor.co2' THEN avg_value END) as avg_co2,
                    AVG(CASE WHEN metric = 'sensor.nh3' THEN avg_value END) as avg_nh3
                FROM env_data
            """)
            
            result = self.db.execute(query, {
                'tenant_id': tenant_id,
                'device_id': farm_id,
                'measurement_date': measurement_date.date()
            }).fetchone()
            
            if not result:
                logger.warning(f"No health data found: {tenant_id}/{farm_id}/{house_id}")
                return None
            
            return {
                'tenant_id': tenant_id,
                'farm_id': farm_id,
                'house_id': house_id,
                'flock_id': flock_id,
                'measurement_date': measurement_date,
                'temperature': float(result.avg_temperature) if result.avg_temperature else None,
                'humidity': float(result.avg_humidity) if result.avg_humidity else None,
                'co2_level': float(result.avg_co2) if result.avg_co2 else None,
                'nh3_level': float(result.avg_nh3) if result.avg_nh3 else None,
                'metadata': json.dumps({
                    'calculated_at': datetime.now(timezone.utc).isoformat(),
                    'data_source': 'minute_features'
                })
            }
            
        except Exception as e:
            logger.error(f"Error calculating health metrics: {e}")
            self._rollback_if_needed()
            return None
    
    def calculate_production_metrics(self, tenant_id: str, farm_id: str, house_id: str, 
                                   flock_id: str, start_date: datetime, end_date: datetime) -> Optional[Dict]:
        """Calculate production metrics"""
        try:
            # Query production data (weight gain, feed efficiency)
            query = text("""
                WITH daily_weights AS (
                    SELECT 
                        bucket::date AS date,
                        AVG(value_sum / NULLIF(value_count, 0)) AS avg_weight
                    FROM analytics.minute_features 
                    WHERE tenant_id = :tenant_id 
                        AND device_id = :device_id
                        AND metric IN ('sensors.weight_scale.current_kg', 'sensors.weight_predict.current_kg')
                        AND bucket::date >= :start_date
                        AND bucket::date <= :end_date
                    GROUP BY bucket::date
                    ORDER BY bucket::date
                ),
                weight_gain AS (
                    SELECT 
                        COALESCE(MAX(avg_weight) - MIN(avg_weight), 0) AS total_gain,
                        COUNT(*) AS days
                    FROM daily_weights
                ),
                feed_data AS (
                    SELECT 
                        COALESCE(SUM(value_sum), 0) AS total_feed
                    FROM analytics.minute_features 
                    WHERE tenant_id = :tenant_id 
                        AND device_id = :device_id
                        AND metric = 'feed.intake.kg'
                        AND bucket::date >= :start_date
                        AND bucket::date <= :end_date
                )
                SELECT 
                    wg.total_gain,
                    wg.days,
                    fd.total_feed,
                    CASE WHEN wg.total_gain > 0 THEN fd.total_feed / wg.total_gain ELSE 0 END AS feed_efficiency
                FROM weight_gain wg CROSS JOIN feed_data fd
            """)
            
            result = self.db.execute(query, {
                'tenant_id': tenant_id,
                'device_id': farm_id,
                'start_date': start_date,
                'end_date': end_date
            }).fetchone()
            
            if not result:
                logger.warning(f"No production data found: {tenant_id}/{farm_id}/{house_id}")
                return None
            
            return {
                'tenant_id': tenant_id,
                'farm_id': farm_id,
                'house_id': house_id,
                'flock_id': flock_id,
                'period_start': start_date,
                'period_end': end_date,
                'total_production': float(result.total_gain) if result.total_gain else 0,
                'daily_production': float(result.total_gain / result.days) if result.days > 0 else 0,
                'production_rate': float(result.feed_efficiency) if result.feed_efficiency else 0,
                'quality_score': 0.0,  # Placeholder
                'efficiency': float(result.feed_efficiency) if result.feed_efficiency else 0,
                'metadata': json.dumps({
                    'calculated_at': datetime.now(timezone.utc).isoformat(),
                    'data_source': 'minute_features',
                    'days': result.days
                })
            }
            
        except Exception as e:
            logger.error(f"Error calculating production metrics: {e}")
            self._rollback_if_needed()
            return None
    
    def store_fcr_calculation(self, data: Dict) -> bool:
        """Store FCR calculation in database"""
        try:
            query = text("""
                INSERT INTO analytics.fcr_calculations 
                (id, tenant_id, farm_id, house_id, flock_id, period_start, period_end, 
                 total_feed, total_weight, fcr_value, metadata, created_at, updated_at)
                VALUES (:id, :tenant_id, :farm_id, :house_id, :flock_id, :period_start, :period_end,
                        :total_feed, :total_weight, :fcr_value, CAST(:metadata AS JSONB), NOW(), NOW())
                ON CONFLICT (tenant_id, farm_id, house_id, flock_id, period_start, period_end)
                DO UPDATE SET
                    total_feed = EXCLUDED.total_feed,
                    total_weight = EXCLUDED.total_weight,
                    fcr_value = EXCLUDED.fcr_value,
                    metadata = EXCLUDED.metadata,
                    updated_at = NOW()
            """)
            
            self.db.execute(query, data)
            self.db.commit()
            logger.info(f"Stored FCR calculation: {data['tenant_id']}/{data['farm_id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing FCR calculation: {e}")
            self.db.rollback()
            return False
    
    def store_health_metrics(self, data: Dict) -> bool:
        """Store health metrics in database"""
        try:
            query = text("""
                INSERT INTO analytics.health_metrics 
                (tenant_id, farm_id, house_id, flock_id, measurement_date, 
                 temperature, humidity, co2_level, nh3_level, metadata, created_at, updated_at)
                VALUES (:tenant_id, :farm_id, :house_id, :flock_id, :measurement_date,
                        :temperature, :humidity, :co2_level, :nh3_level, :metadata, NOW(), NOW())
                ON CONFLICT (tenant_id, farm_id, house_id, flock_id, measurement_date)
                DO UPDATE SET
                    temperature = EXCLUDED.temperature,
                    humidity = EXCLUDED.humidity,
                    co2_level = EXCLUDED.co2_level,
                    nh3_level = EXCLUDED.nh3_level,
                    metadata = EXCLUDED.metadata,
                    updated_at = NOW()
            """)
            
            self.db.execute(query, data)
            self.db.commit()
            logger.info(f"Stored health metrics: {data['tenant_id']}/{data['farm_id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing health metrics: {e}")
            self.db.rollback()
            return False
    
    def store_production_metrics(self, data: Dict) -> bool:
        """Store production metrics in database"""
        try:
            query = text("""
                INSERT INTO analytics.production_metrics 
                (tenant_id, farm_id, house_id, flock_id, period_start, period_end,
                 total_production, daily_production, production_rate, quality_score, 
                 efficiency, metadata, created_at)
                VALUES (:tenant_id, :farm_id, :house_id, :flock_id, :period_start, :period_end,
                        :total_production, :daily_production, :production_rate, :quality_score,
                        :efficiency, CAST(:metadata AS JSONB), NOW())
                ON CONFLICT (tenant_id, farm_id, house_id, flock_id, period_start, period_end)
                DO UPDATE SET
                    total_production = EXCLUDED.total_production,
                    daily_production = EXCLUDED.daily_production,
                    production_rate = EXCLUDED.production_rate,
                    quality_score = EXCLUDED.quality_score,
                    efficiency = EXCLUDED.efficiency,
                    metadata = EXCLUDED.metadata
            """)
            
            self.db.execute(query, data)
            self.db.commit()
            logger.info(f"Stored production metrics: {data['tenant_id']}/{data['farm_id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing production metrics: {e}")
            self.db.rollback()
            return False
    
    # ---------------------
    # Rollup into analytics_agg from minute_features
    # ---------------------
    def aggregate_to_analytics_agg(self, window_s: int, start_date: datetime, end_date: datetime) -> int:
        """Aggregate analytics.minute_features into analytics.analytics_agg for a time window.

        Returns number of rows upserted.
        """
        try:
            # Group minute_features into target windows and pre-aggregate basic stats
            query = text(
                """
                SELECT
                  to_timestamp(floor(extract(epoch from bucket)/:w)*:w) AT TIME ZONE 'UTC' AS bucket_start,
                  tenant_id,
                  device_id AS farm_id,
                  COALESCE(NULLIF(tags->>'house_id',''), '') AS house_id,
                  sensor_id,
                  metric,
                  SUM(value_count)::bigint AS count_n,
                  SUM(value_sum) AS sum_val,
                  SUM(value_sumsq) AS sumsq,
                  MIN(value_min) AS min_val,
                  MAX(value_max) AS max_val
                FROM analytics.minute_features
                WHERE bucket >= :start AND bucket < :end
                GROUP BY 1, tenant_id, farm_id, house_id, sensor_id, metric
                ORDER BY 1
                """
            )

            rows = self.db.execute(query, {"w": window_s, "start": start_date, "end": end_date}).fetchall()
            repo = AnalyticsRepo(self.db)
            upserted = 0
            for r in rows:
                cnt = int(r.count_n) if r.count_n else 0
                if cnt <= 0:
                    continue
                sum_val = float(r.sum_val or 0)
                avg = sum_val / cnt if cnt else 0.0
                sumsq = float(r.sumsq or 0)
                var = max(0.0, (sumsq / cnt) - (avg * avg)) if cnt else 0.0
                sd = math.sqrt(var)
                p95 = float(r.max_val or 0)  # approximate with max

                repo.upsert_agg({
                    "bucket_start": r.bucket_start,
                    "window_s": window_s,
                    "tenant_id": r.tenant_id,
                    "farm_id": r.farm_id,
                    "house_id": r.house_id,
                    "sensor_id": r.sensor_id,
                    "metric": r.metric,
                    "count_n": cnt,
                    "sum_val": sum_val,
                    "avg_val": avg,
                    "min_val": float(r.min_val or 0),
                    "max_val": float(r.max_val or 0),
                    "stddev_val": sd,
                    "p95_val": p95,
                })
                upserted += 1

            self.db.commit()
            return upserted
        except Exception as e:
            logger.error(f"Error aggregating to analytics_agg: {e}")
            self.db.rollback()
            return 0
    
    def close(self):
        """Close database connection"""
        if self.db:
            self.db.close()
