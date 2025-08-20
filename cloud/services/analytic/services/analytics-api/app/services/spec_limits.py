# app/services/spec_limits.py

from typing import Iterable, Dict
from app.domain.models import Anomaly

def apply_we1(points: Iterable[Dict], cl: float, ucl: float, lcl: float):
    # Rule WE-1: out of 3-sigma
    for p in points:
        v = p["value"]
        if (ucl is not None and v > ucl) or (lcl is not None and v < lcl):
            yield Anomaly(
                time=p["time"], tenant_id=p["tenant_id"], factory_id=p["factory_id"],
                machine_id=p["machine_id"], sensor_id=p.get("sensor_id"), metric=p["metric"],
                rule_code="WE-1", severity=3, value=v, cl=cl, ucl=ucl, lcl=lcl,
                zscore=None, details={"source": "stream"}
            ).model_dump()
