# app\utils\ids.py

from __future__ import annotations
from typing import Tuple, Optional

SEP = "|"

def key_of(tenant_id: str, factory_id: str, machine_id: str, sensor_id: Optional[str], metric: str) -> str:
    sensor = sensor_id or "-"
    return SEP.join([tenant_id, factory_id, machine_id, sensor, metric])

def parse_key(key: str) -> Tuple[str, str, str, Optional[str], str]:
    t, f, m, s, metric = key.split(SEP, 4)
    return t, f, m, (None if s == "-" else s), metric

def agg_pk(tenant_id: str, factory_id: str, machine_id: str, metric: str, window_s: int, bucket_start_iso: str) -> str:
    return f"{tenant_id}{SEP}{factory_id}{SEP}{machine_id}{SEP}{metric}{SEP}{window_s}{SEP}{bucket_start_iso}"
