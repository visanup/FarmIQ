# time.py

from datetime import datetime, timezone, timedelta

def floor_to_bucket(ts: datetime, window_s: int) -> datetime:
    ts = ts.astimezone(timezone.utc)
    seconds = int(ts.timestamp())
    floored = seconds - (seconds % window_s)
    return datetime.fromtimestamp(floored, tz=timezone.utc)
