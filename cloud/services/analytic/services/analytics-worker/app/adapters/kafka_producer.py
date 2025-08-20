# app/adapters/kafka_producer.py

from __future__ import annotations
import json
from typing import Optional, Dict, Any
from confluent_kafka import Producer
from app.config import Config

_producer: Optional[Producer] = None

def _delivery_report(err, msg):  # pragma: no cover
    if err is not None:
        # ใช้ print ตรง ๆ เพื่อไม่ต้องพึ่ง logging ใน callback
        print(f"[kafka] delivery failed: {err} (topic={msg.topic()} partition={msg.partition()})")
    # else: delivered OK

def build_producer() -> Producer:
    global _producer
    if _producer is not None:
        return _producer
    conf = {
        "bootstrap.servers": Config.KAFKA_BROKERS,
        "client.id": f"{Config.KAFKA_CLIENT_ID}-producer",
        "enable.idempotence": True,       # ส่งซ้ำได้โดยไม่ซ้ำซ้อน
        "linger.ms": 5,
        "batch.num.messages": 10000,
        "acks": "all",
    }
    _producer = Producer(conf)
    return _producer

def send_json(topic: str, value: Dict[str, Any], key: Optional[str] = None,
              headers: Optional[Dict[str, str]] = None, flush: bool = False):
    p = build_producer()
    payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
    p.produce(topic=topic, key=key, value=payload,
              headers=[(k, v.encode("utf-8")) for k, v in (headers or {}).items()],
              on_delivery=_delivery_report)
    p.poll(0)
    if flush:
        p.flush(5)
