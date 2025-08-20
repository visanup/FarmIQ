# app\utils\serialization.py

from __future__ import annotations
import json
from datetime import datetime, date
from decimal import Decimal
from typing import Any

def _default(o: Any):
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    if isinstance(o, Decimal):
        return float(o)
    raise TypeError(f"Type not serializable: {type(o)}")

def to_json(obj: Any) -> str:
    return json.dumps(obj, default=_default, ensure_ascii=False)

def to_json_bytes(obj: Any) -> bytes:
    return to_json(obj).encode("utf-8")
