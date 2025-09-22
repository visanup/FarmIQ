# app/instrumentation/metrics.py

from prometheus_client import Counter, Gauge, Histogram, generate_latest, CONTENT_TYPE_LATEST

ingested = Counter("aw_ingested_msgs", "Messages ingested")
lag = Gauge("aw_consumer_lag", "Consumer lag (approx)")
proc_time = Histogram("aw_proc_time_seconds", "Batch processing time")

# Job run counters
job_runs = Counter(
    "aw_job_runs_total",
    "Number of scheduler job runs",
    labelnames=("job", "status"),
)

# Records processed counters
calc_records = Counter(
    "aw_calc_records_total",
    "Number of farm calculations attempted",
    labelnames=("job", "status"),
)

def metrics_response():
    return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}
