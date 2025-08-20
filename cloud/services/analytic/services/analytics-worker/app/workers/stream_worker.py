# app/workers/stream_worker.py
from __future__ import annotations

import json
import os
import signal
import threading
from contextlib import contextmanager
from datetime import timezone

from confluent_kafka import KafkaException

from app.pipelines.registry import handler_for, topics as reg_topics
from app.adapters.kafka_consumer import build_consumer
from app.adapters.repository import AnalyticsRepo
from app.database import SessionLocal
from app.services.aggregator import aggregate
from app.utils.time import floor_to_bucket
from app.config import Config

# --- graceful shutdown flag ---
_stop = threading.Event()

def _handle_sig(*_):
    _stop.set()

# --- DB session scope (auto commit/rollback) ---
@contextmanager
def session_scope():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def run_worker():
    # ติดตั้ง signal handler
    try:
        signal.signal(signal.SIGINT, _handle_sig)
        signal.signal(signal.SIGTERM, _handle_sig)
    except Exception:
        # บาง runtime (เช่น Windows thread) อาจ set signal ไม่ได้ — ข้ามไป
        pass

    c = build_consumer()

    # ถ้าไม่ได้กำหนด KAFKA_TOPICS ใน .env ให้ subscribe ตาม registry
    if not os.getenv("KAFKA_TOPICS"):
        c.subscribe(reg_topics())

    while not _stop.is_set():
        try:
            msgs = c.consume(num_messages=500, timeout=1.0)
        except KafkaException:
            continue

        if not msgs:
            continue

        measurements, events = [], []

        for m in msgs:
            if m.error():
                continue
            try:
                o = json.loads(m.value())
            except Exception:
                # payload พัง ข้าม
                continue

            h = handler_for(m.topic())
            if not h:
                # ไม่มี handler ของ topic นี้
                continue

            try:
                kind, payload = h(o)
            except Exception:
                # mapper error ข้าม record นี้ไป
                continue

            if kind == "measurement":
                measurements.append(payload)
            elif kind == "event":
                events.append(payload)
            else:
                # ชนิดไม่รู้จัก
                continue

        # เขียนลง DB
        if not measurements and not events:
            c.commit(asynchronous=True)
            continue

        with session_scope() as db:
            repo = AnalyticsRepo(db)

            # 1) events → raw + rollup
            if events:
                for e in events:
                    try:
                        repo.insert_event(e)
                    except Exception:
                        # เขียน raw event พลาด -> ไม่ล้มทั้ง batch
                        pass

                # rollup ทีละ window
                for w in Config.WINDOWS:
                    grouped = {}
                    for e in events:
                        # บาง event อาจไม่มี value (นับเป็น count อย่างเดียว)
                        bucket = floor_to_bucket(e["time"], w).astimezone(timezone.utc)
                        key = (
                            e["tenant_id"], e["domain"], e["entity_type"],
                            e["entity_id"], e["event_type"], w, bucket
                        )
                        arr = grouped.setdefault(key, [])
                        arr.append(e.get("value"))

                    for (tenant, domain, etype, eid, ev, window, bucket), vals in grouped.items():
                        numeric_vals = [v for v in vals if isinstance(v, (int, float))]
                        n = len(numeric_vals) if numeric_vals else len(vals)  # ถ้าไม่มี value นับจากจำนวน event
                        s = sum(numeric_vals) if numeric_vals else None
                        avg = (s / n) if (s is not None and n > 0) else None
                        mn = min(numeric_vals) if numeric_vals else None
                        mx = max(numeric_vals) if numeric_vals else None

                        repo.upsert_event_rollup({
                            "bucket_start": bucket, "window_s": window,
                            "tenant_id": tenant, "domain": domain,
                            "entity_type": etype, "entity_id": eid,
                            "event_type": ev,
                            "count_n": n, "sum_val": s, "avg_val": avg,
                            "min_val": mn, "max_val": mx,
                        })

            # 2) measurements → aggregate เดิม
            if measurements:
                try:
                    aggs = list(aggregate(measurements, Config.WINDOWS))
                    for row in aggs:
                        repo.upsert_agg(row)
                except Exception:
                    # อย่าให้ล้มทั้ง batch
                    pass

        # commit offset หลังเขียนสำเร็จ
        c.commit(asynchronous=False)

    # ปิด consumer เมื่อได้รับสัญญาณหยุด
    try:
        c.close()
    except Exception:
        pass