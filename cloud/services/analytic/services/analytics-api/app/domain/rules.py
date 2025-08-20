# app\domain\rules.py

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Sequence, Optional

@dataclass
class RuleHit:
    index: int
    code: str
    detail: Optional[dict] = None

def _side(v: float, cl: float) -> int:
    if v > cl: return 1
    if v < cl: return -1
    return 0

def we1(values: Sequence[float], cl: float, std: float) -> List[RuleHit]:
    """Western Electric #1: ค่าเกิน 3σ"""
    if std <= 0:
        return []
    ucl, lcl = cl + 3*std, cl - 3*std
    return [RuleHit(i, "WE-1", {"ucl": ucl, "lcl": lcl, "v": v})
            for i, v in enumerate(values) if (v > ucl or v < lcl)]

def we2(values: Sequence[float], cl: float, std: float) -> List[RuleHit]:
    """WE-2: 2 จาก 3 จุดอยู่เลย 2σ ฝั่งเดียวกัน"""
    if std <= 0 or len(values) < 3: return []
    thr_hi, thr_lo = cl + 2*std, cl - 2*std
    hits: List[RuleHit] = []
    for i in range(2, len(values)):
        window = values[i-2:i+1]
        s = [_side(v, cl) for v in window]
        over2 = [v for v in window if (v > thr_hi or v < thr_lo)]
        same_side = len(set([_side(v, cl) for v in over2])) <= 1 if over2 else False
        if len(over2) >= 2 and same_side:
            hits.append(RuleHit(i, "WE-2", {"window": window}))
    return hits

def we3(values: Sequence[float], cl: float, std: float) -> List[RuleHit]:
    """WE-3: 4 จาก 5 จุดเลย 1σ ฝั่งเดียวกัน"""
    if std <= 0 or len(values) < 5: return []
    thr_hi, thr_lo = cl + 1*std, cl - 1*std
    out: List[RuleHit] = []
    for i in range(4, len(values)):
        window = values[i-4:i+1]
        over1 = [v for v in window if (v > thr_hi or v < thr_lo)]
        if len(over1) >= 4:
            if len(set([_side(v, cl) for v in over1])) == 1:
                out.append(RuleHit(i, "WE-3", {"window": window}))
    return out

def we4(values: Sequence[float], cl: float, std: float) -> List[RuleHit]:
    """WE-4: 8 จุดติดกันอยู่ฝั่งเดียวของ CL"""
    if len(values) < 8: return []
    out: List[RuleHit] = []
    for i in range(7, len(values)):
        window = values[i-7:i+1]
        s = [_side(v, cl) for v in window]
        if all(x >= 0 for x in s) or all(x <= 0 for x in s):
            if any(x != 0 for x in s):  # มีอย่างน้อย 1 จุดไม่เท่ากับ CL
                out.append(RuleHit(i, "WE-4", {"window": window}))
    return out

def evaluate(values: Sequence[float], cl: float, std: float) -> List[RuleHit]:
    """รวมกติกาหลัก ๆ; สามารถเพิ่ม Nelson rules ได้ในอนาคต"""
    hits = []
    hits += we1(values, cl, std)
    hits += we2(values, cl, std)
    hits += we3(values, cl, std)
    hits += we4(values, cl, std)
    # เรียงตาม index เพื่อ deterministic
    return sorted(hits, key=lambda h: h.index)
