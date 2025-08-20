# app\domain\windows.py

from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Iterable, Iterator, Tuple
from app.utils.time import floor_to_bucket

def iter_time_buckets(start: datetime, end: datetime, window_s: int) -> Iterator[datetime]:
    """ไล่ bucket เริ่มต้นตั้งแต่ start..end (UTC)"""
    start = floor_to_bucket(start, window_s)
    cur = start
    step = timedelta(seconds=window_s)
    while cur < end:
        yield cur
        cur = cur + step

def group_key(rec: dict) -> Tuple[str, str, str, str | None, str]:
    """key หลักในการ aggregate"""
    return (rec["tenant_id"], rec["factory_id"], rec["machine_id"], rec.get("sensor_id"), rec["metric"])

def bucket_of(rec: dict, window_s: int) -> datetime:
    return floor_to_bucket(rec["time"], window_s).astimezone(timezone.utc)
