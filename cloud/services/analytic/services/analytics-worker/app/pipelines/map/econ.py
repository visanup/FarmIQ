# app\pipelines\map\econ.py

from __future__ import annotations
from datetime import datetime, timezone
from typing import Tuple, Dict, Any

def _ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)

def handle_econ_event(o: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Economic/market feed (prices, indexes)
    Examples:
    {
      "time":"2025-08-20T02:00:00Z",
      "tenant_id":"t1",
      "commodity":"corn",           # หรือ "soymeal","diesel"
      "price": 256.7,
      "currency": "USD/MT",
      "source":"bloomberg"
    }
    → event: domain="econ", entity_type="commodity", event_type="price_update"
    """
    t = _ts(o["time"])
    tenant = o["tenant_id"]
    comm = (o.get("commodity") or o.get("symbol") or "unknown").lower()
    price = o.get("price")
    unit = o.get("currency") or o.get("unit") or "USD"

    return "event", {
        "time": t,
        "tenant_id": tenant,
        "domain": "econ",
        "entity_type": "commodity",
        "entity_id": comm,
        "event_type": "price_update",
        "value": float(price) if price is not None else None,
        "unit": unit,
        "severity": 1,
        "payload": {k:v for k,v in o.items() if k not in ("tenant_id","time")}
    }
