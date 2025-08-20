# app\utils\stats.py

from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable, List, Optional

@dataclass
class OnlineStats:
    n: int = 0
    mean: float = 0.0
    M2: float = 0.0  # sum of squares of differences from the current mean (Welford)

    def push(self, x: float):
        self.n += 1
        delta = x - self.mean
        self.mean += delta / self.n
        delta2 = x - self.mean
        self.M2 += delta * delta2

    @property
    def variance(self) -> float:
        return (self.M2 / self.n) if self.n > 0 else 0.0

    @property
    def std(self) -> float:
        return self.variance ** 0.5

def percentile(values: List[float], q: float) -> Optional[float]:
    """
    q: 0..1
    """
    if not values:
        return None
    if q <= 0: return min(values)
    if q >= 1: return max(values)
    values = sorted(values)
    idx = int(round(q * (len(values) - 1)))
    return values[idx]
