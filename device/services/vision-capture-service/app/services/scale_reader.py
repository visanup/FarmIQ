# app/services/scale_reader.py
import re, time
from typing import Optional
import serial

class ScaleReader:
    def __init__(self, port: str, baud: int):
        self.port = port
        self.baud = baud

    def _open(self):
        return serial.Serial(self.port, self.baud, timeout=0.2)

    @staticmethod
    def _parse_weight(line: str) -> Optional[float]:
        # หาเลขทศนิยม + หน่วยทั่วไป (g|kg); customize ได้ตามยี่ห้อ
        m = re.search(r"([-+]?\d+(?:\.\d+)?)\s*(kg|g)?", line.lower())
        if not m:
            return None
        val = float(m.group(1))
        unit = m.group(2) or "g"
        return val*1000.0 if unit == "kg" else val

    def wait_stable(self, min_grams: float, delta: float, stable_ms: int, timeout_ms: int) -> Optional[float]:
        t0 = time.time()
        buf = []
        stable_t0 = None
        with self._open() as ser:
            while (time.time() - t0) * 1000 < timeout_ms:
                line = ser.readline().decode("utf-8", errors="ignore").strip()
                w = self._parse_weight(line)
                if w is None:
                    continue
                if w < min_grams:
                    buf.clear(); stable_t0 = None
                    continue
                buf.append(w)
                # keep last N
                buf = buf[-10:]
                if max(buf) - min(buf) <= delta:
                    if stable_t0 is None:
                        stable_t0 = time.time()
                    if (time.time() - stable_t0) * 1000 >= stable_ms:
                        return sum(buf)/len(buf)
                else:
                    stable_t0 = None
        return None
