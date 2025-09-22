# app/workers/scheduler.py
from __future__ import annotations
from typing import Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.services.kpi import compute_kpi
from app.workers.analytics_scheduler import AnalyticsScheduler

_scheduler: Optional[BackgroundScheduler] = None
_analytics_scheduler = AnalyticsScheduler()

def _job_compute_kpi():
    db = SessionLocal()
    try:
        compute_kpi(db, period="day", use_window_s=60)
    finally:
        db.close()

def _job_daily_analytics():
    """Run daily analytics calculations"""
    _analytics_scheduler.run_daily_analytics()

def _job_hourly_analytics():
    """Run hourly analytics calculations"""
    _analytics_scheduler.run_hourly_analytics()

def _job_weekly_analytics():
    """Run weekly analytics calculations"""
    _analytics_scheduler.run_weekly_analytics()

def start_scheduler() -> BackgroundScheduler:
    global _scheduler
    if _scheduler is not None:
        return _scheduler
    s = BackgroundScheduler(timezone="UTC")
    
    # Existing KPI job (every 5 minutes)
    s.add_job(_job_compute_kpi, CronTrigger.from_crontab("*/5 * * * *"))
    
    # Analytics jobs
    s.add_job(_job_hourly_analytics, CronTrigger.from_crontab("0 * * * *"))  # Every hour
    s.add_job(_job_daily_analytics, CronTrigger.from_crontab("0 1 * * *"))   # Daily at 1 AM
    s.add_job(_job_weekly_analytics, CronTrigger.from_crontab("0 2 * * 0"))  # Weekly on Sunday at 2 AM
    # Rollup analytics_agg every 10 minutes for recent 2 hours
    s.add_job(lambda: _analytics_scheduler.run_window_rollup(120), CronTrigger.from_crontab("*/10 * * * *"))
    
    s.start()
    _scheduler = s
    return s

def shutdown_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
