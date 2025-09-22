# app/workers/analytics_scheduler.py
"""
Analytics Scheduler
Runs analytics calculations on a schedule
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy import text
from app.services.analytics_calculator import AnalyticsCalculator
from app.utils.checkpoint import ensure_checkpoint_table, get_checkpoint, set_checkpoint
from app.adapters.kafka_producer import send_json
from app.config import Config
from app.instrumentation.metrics import job_runs, calc_records
from app.database import SessionLocal

logger = logging.getLogger(__name__)

class AnalyticsScheduler:
    """Schedules and runs analytics calculations"""
    
    def __init__(self):
        self.calculator = AnalyticsCalculator()
        ensure_checkpoint_table()
    
    def get_active_farms(self, window_days: int = 7) -> List[Dict[str, Any]]:
        """Get list of active farms from minute_features data within the last N days."""
        try:
            db = SessionLocal()
            query = text("""
                SELECT DISTINCT 
                    tenant_id,
                    device_id AS farm_id,
                    COALESCE(NULLIF(tags->>'house_id', ''), SUBSTRING(device_id FROM 'house_([^_]+)')) AS house_id,
                    COALESCE(NULLIF(tags->>'flock_id', ''), 'flock_001') AS flock_id
                FROM analytics.minute_features 
                WHERE bucket >= NOW() - (:days || ' days')::interval
                ORDER BY tenant_id, device_id
            """)
            
            result = db.execute(query, {"days": window_days})
            farms = []
            for row in result:
                house_id = row.house_id or f"house_{row.farm_id}"
                flock_id = row.flock_id or 'flock_001'
                farms.append({
                    'tenant_id': row.tenant_id,
                    'farm_id': row.farm_id,
                    'house_id': house_id,
                    'flock_id': flock_id
                })
            
            db.close()
            return farms
            
        except Exception as e:
            logger.error(f"Error getting active farms: {e}")
            return []
    
    def run_daily_analytics(self, window_days: int = 7):
        """Run daily analytics calculations using the last N days (default 7)."""
        logger.info("Starting daily analytics calculations")
        
        try:
            today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

            farms = self.get_active_farms(window_days=window_days)
            if not farms:
                logger.warning("No active farms found for analytics calculation")
                job_runs.labels(job="daily", status="empty").inc()
                return
        
            yesterday = today - timedelta(days=1)
            since = today - timedelta(days=window_days)
            
            fcr_success = 0
            health_success = 0
            production_success = 0
            
            for farm in farms:
                tenant_id = farm['tenant_id']
                farm_id = farm['farm_id']
                house_id = farm['house_id']
                flock_id = farm['flock_id']
                
                logger.info(f"Processing analytics for {tenant_id}/{farm_id}/{house_id}")
                ck = f"daily:{tenant_id}:{farm_id}:{house_id}:{flock_id}"
                last = get_checkpoint(ck)
                if last and last >= today:
                    calc_records.labels(job="daily", status="skip").inc()
                    continue
                
                fcr_data = self.calculator.calculate_fcr_metrics(
                    tenant_id, farm_id, house_id, flock_id, since, yesterday
                )
                if fcr_data:
                    if self.calculator.store_fcr_calculation(fcr_data):
                        fcr_success += 1
                        calc_records.labels(job="daily_fcr", status="ok").inc()
                    else:
                        calc_records.labels(job="daily_fcr", status="error").inc()
                        try:
                            send_json(Config.KAFKA_TOPIC_DLQ, {"job":"daily_fcr","farm":farm,"payload":fcr_data or {},"reason":"store_failed"})
                        except Exception:
                            pass
                
                health_data = self.calculator.calculate_health_metrics(
                    tenant_id, farm_id, house_id, flock_id, yesterday
                )
                if health_data:
                    if self.calculator.store_health_metrics(health_data):
                        health_success += 1
                        calc_records.labels(job="daily_health", status="ok").inc()
                    else:
                        calc_records.labels(job="daily_health", status="error").inc()
                        try:
                            send_json(Config.KAFKA_TOPIC_DLQ, {"job":"daily_health","farm":farm,"payload":health_data or {},"reason":"store_failed"})
                        except Exception:
                            pass
                
                production_data = self.calculator.calculate_production_metrics(
                    tenant_id, farm_id, house_id, flock_id, since, yesterday
                )
                if production_data:
                    if self.calculator.store_production_metrics(production_data):
                        production_success += 1
                        calc_records.labels(job="daily_production", status="ok").inc()
                    else:
                        calc_records.labels(job="daily_production", status="error").inc()
                        try:
                            send_json(Config.KAFKA_TOPIC_DLQ, {"job":"daily_production","farm":farm,"payload":production_data or {},"reason":"store_failed"})
                        except Exception:
                            pass
                set_checkpoint(ck, today)
            
            logger.info(f"Daily analytics completed: FCR={fcr_success}, Health={health_success}, Production={production_success}")
            set_checkpoint("daily_analytics", today)
            job_runs.labels(job="daily", status="ok").inc()
            
        except Exception as e:
            logger.error(f"Error in daily analytics: {e}")
            job_runs.labels(job="daily", status="error").inc()
            try:
                send_json(Config.KAFKA_TOPIC_DLQ, {"job":"daily","error":str(e)})
            except Exception:
                pass
        finally:
            self.calculator.close()
    
    def run_hourly_analytics(self):
        """Run hourly analytics calculations (for real-time metrics)"""
        logger.info("Starting hourly analytics calculations")
        
        try:
            # base watermark for this hour (per-entity checkpoints in-loop)
            now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

            farms = self.get_active_farms()
            if not farms:
                job_runs.labels(job="hourly", status="empty").inc()
                return
        
            hour_ago = now - timedelta(hours=1)
            
            health_success = 0
            
            for farm in farms:
                tenant_id = farm['tenant_id']
                farm_id = farm['farm_id']
                house_id = farm['house_id']
                flock_id = farm['flock_id']
                
                ck = f"hourly:{tenant_id}:{farm_id}:{house_id}:{flock_id}"
                last = get_checkpoint(ck)
                if last and last >= now:
                    calc_records.labels(job="hourly", status="skip").inc()
                    continue

                # Calculate Health metrics (hourly)
                health_data = self.calculator.calculate_health_metrics(
                    tenant_id, farm_id, house_id, flock_id, hour_ago
                )
                if health_data:
                    if self.calculator.store_health_metrics(health_data):
                        health_success += 1
                        calc_records.labels(job="hourly_health", status="ok").inc()
                    else:
                        calc_records.labels(job="hourly_health", status="error").inc()
                        try:
                            send_json(Config.KAFKA_TOPIC_DLQ, {"job":"hourly_health","farm":farm,"payload":health_data or {},"reason":"store_failed"})
                        except Exception:
                            pass
                set_checkpoint(ck, now)
            
            logger.info(f"Hourly analytics completed: Health={health_success}")
            job_runs.labels(job="hourly", status="ok").inc()
            
        except Exception as e:
            logger.error(f"Error in hourly analytics: {e}")
            job_runs.labels(job="hourly", status="error").inc()
            try:
                send_json(Config.KAFKA_TOPIC_DLQ, {"job":"hourly","error":str(e)})
            except Exception:
                pass
        finally:
            self.calculator.close()
    
    def run_weekly_analytics(self, window_days: int = 7):
        """Run weekly analytics calculations using the last N days (default 7)."""
        logger.info("Starting weekly analytics calculations")
        
        try:
            now = datetime.now(timezone.utc)
            monday = now - timedelta(days=now.weekday())
            monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)

            farms = self.get_active_farms(window_days=window_days)
            if not farms:
                job_runs.labels(job="weekly", status="empty").inc()
                return
        
            since = now - timedelta(days=window_days)
            
            fcr_success = 0
            production_success = 0
            
            for farm in farms:
                tenant_id = farm['tenant_id']
                farm_id = farm['farm_id']
                house_id = farm['house_id']
                flock_id = farm['flock_id']
                
                ck = f"weekly:{tenant_id}:{farm_id}:{house_id}:{flock_id}"
                last = get_checkpoint(ck)
                if last and last >= monday:
                    calc_records.labels(job="weekly", status="skip").inc()
                    continue

                fcr_data = self.calculator.calculate_fcr_metrics(
                    tenant_id, farm_id, house_id, flock_id, since, now
                )
                if fcr_data:
                    if self.calculator.store_fcr_calculation(fcr_data):
                        fcr_success += 1
                
                production_data = self.calculator.calculate_production_metrics(
                    tenant_id, farm_id, house_id, flock_id, since, now
                )
                if production_data:
                    if self.calculator.store_production_metrics(production_data):
                        production_success += 1
                        calc_records.labels(job="weekly_production", status="ok").inc()
                    else:
                        calc_records.labels(job="weekly_production", status="error").inc()
                        try:
                            send_json(Config.KAFKA_TOPIC_DLQ, {"job":"weekly_production","farm":farm,"payload":production_data or {},"reason":"store_failed"})
                        except Exception:
                            pass
                set_checkpoint(ck, monday)
            
            logger.info(f"Weekly analytics completed: FCR={fcr_success}, Production={production_success}")
            job_runs.labels(job="weekly", status="ok").inc()
            
        except Exception as e:
            logger.error(f"Error in weekly analytics: {e}")
            job_runs.labels(job="weekly", status="error").inc()
            try:
                send_json(Config.KAFKA_TOPIC_DLQ, {"job":"weekly","error":str(e)})
            except Exception:
                pass
        finally:
            self.calculator.close()
    
    def close(self):
        """Close database connection"""
        if hasattr(self, 'calculator') and self.calculator:
            self.calculator.close()
    
    # ------------------
    # Rollup minute_features -> analytics_agg
    # ------------------
    def run_window_rollup(self, since_minutes: int = 120, windows: List[int] | None = None):
        logger.info("Starting window rollup into analytics_agg")
        try:
            now = datetime.now(timezone.utc)
            start = now - timedelta(minutes=since_minutes)
            wins = windows or [60, 300, 3600]
            total = 0
            for w in wins:
                n = self.calculator.aggregate_to_analytics_agg(w, start, now)
                total += n
                job_runs.labels(job=f"rollup_{w}s", status="ok").inc()
            logger.info(f"Rollup completed: rows upserted={total}")
        except Exception as e:
            logger.error(f"Error in window rollup: {e}")
            job_runs.labels(job="rollup", status="error").inc()

