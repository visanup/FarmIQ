# app/services/aggregator.py

from collections import defaultdict
from statistics import mean, pstdev
from typing import Iterable, Dict, Tuple, List
from datetime import datetime, timezone
from app.utils.time import floor_to_bucket

def aggregate(measurements: Iterable[dict], windows: List[int]) -> Iterable[dict]:
    # group by (key, window, bucket_start)
    buckets: Dict[Tuple, list] = defaultdict(list)
    for m in measurements:
        key = (m["tenant_id"], m["factory_id"], m["machine_id"], m.get("sensor_id"), m["metric"])
        t: datetime = m["time"]
        for w in windows:
            b = floor_to_bucket(t, w)
            buckets[(key, w, b)].append(m["value"])

    for (key, w, b), vals in buckets.items():
        n = len(vals)
        avg = mean(vals)
        mn, mx = min(vals), max(vals)
        sd = pstdev(vals) if n > 1 else 0.0
        p95 = sorted(vals)[max(0, int(0.95*n)-1)]
        (tenant, factory, machine, sensor, metric) = key
        yield {
            "bucket_start": b.replace(tzinfo=timezone.utc),
            "window_s": w,
            "tenant_id": tenant, "factory_id": factory, "machine_id": machine,
            "sensor_id": sensor, "metric": metric,
            "count_n": n, "sum_val": sum(vals), "avg_val": avg,
            "min_val": mn, "max_val": mx, "stddev_val": sd, "p95_val": p95
        }
