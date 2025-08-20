# app/workers/scheduler.py
from __future__ import annotations
from typing import Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.services.kpi import compute_kpi

_scheduler: Optional[BackgroundScheduler] = None

def _job_compute_kpi():
    db = SessionLocal()
    try:
        compute_kpi(db, period="day", use_window_s=60)
    finally:
        db.close()

def start_scheduler() -> BackgroundScheduler:
    global _scheduler
    if _scheduler is not None:
        return _scheduler
    s = BackgroundScheduler(timezone="UTC")
    s.add_job(_job_compute_kpi, CronTrigger.from_crontab("*/5 * * * *"))
    s.start()
    _scheduler = s
    return s

def shutdown_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
