# app/instrumentation/metrics.py

from prometheus_client import Counter, Gauge, Histogram, generate_latest, CONTENT_TYPE_LATEST

ingested = Counter("aw_ingested_msgs", "Messages ingested")
lag = Gauge("aw_consumer_lag", "Consumer lag (approx)")
proc_time = Histogram("aw_proc_time_seconds", "Batch processing time")

def metrics_response():
    return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}
