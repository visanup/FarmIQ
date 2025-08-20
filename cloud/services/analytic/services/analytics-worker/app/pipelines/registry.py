# app/pipelines/registry.py
from __future__ import annotations

import os
from typing import Callable, Dict, List, Tuple, Optional

# handler จะคืน ("measurement" | "event", payload_dict)
Handler = Callable[[dict], Tuple[str, dict]]

_REGISTRY: Dict[str, Handler] = {}        # topic -> handler
_TOPIC_DOMAIN: Dict[str, str] = {}        # topic -> domain (sensor/feed/lab/...)


def _enabled_domains() -> List[str]:
    raw = os.getenv("DOMAINS_ENABLED", "sensor")
    return [x.strip() for x in raw.split(",") if x.strip()]


def register(topic: str, handler: Handler, *, domain: str = "sensor") -> None:
    _REGISTRY[topic] = handler
    _TOPIC_DOMAIN[topic] = domain


def topics() -> List[str]:
    enabled = set(_enabled_domains())
    # คืนเฉพาะ topic ที่ domain ถูกเปิดไว้
    return [t for t, d in _TOPIC_DOMAIN.items() if d in enabled]


def handler_for(topic: str) -> Optional[Handler]:
    h = _REGISTRY.get(topic)
    d = _TOPIC_DOMAIN.get(topic)
    if h is None:
        return None
    if d and d not in _enabled_domains():
        return None
    return h
