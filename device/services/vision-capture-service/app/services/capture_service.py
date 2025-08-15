# app/services/capture_service.py
from __future__ import annotations
import json
import logging
import threading
import time
import os
from pathlib import Path
from uuid import uuid4
from collections import deque
from typing import Optional, Tuple

import cv2
import numpy as np

from .camera import Camera
from .ingest_client import IngestClient
from .mqtt_bus import MqttBus
from app.utils.hashing import sha256_of_file
from app.utils.time import utc_now_iso

log = logging.getLogger("capture")


# ---------- Presence (motion) ----------
class MotionPresence:
    """ตรวจการมีวัตถุแบบเบา ๆ ด้วย background subtraction + area threshold"""
    def __init__(self, min_area: int, min_frames: int, roi: Optional[Tuple[int, int, int, int]] = None):
        self.sub = cv2.createBackgroundSubtractorMOG2(history=200, varThreshold=16, detectShadows=False)
        self.min_area = int(min_area)
        self.min_frames = int(min_frames)
        self.roi = roi

    def _crop(self, frame):
        if not self.roi:
            return frame
        x1, y1, x2, y2 = self.roi
        return frame[max(y1, 0):y2, max(x1, 0):x2]

    def present_now(self, frame) -> bool:
        frame = self._crop(frame)
        fg = self.sub.apply(frame)
        fg = cv2.medianBlur(fg, 5)
        _, th = cv2.threshold(fg, 200, 255, cv2.THRESH_BINARY)
        th = cv2.dilate(th, None, iterations=2)
        cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        area = max((cv2.contourArea(c) for c in cnts), default=0)
        return area >= self.min_area

    def wait_for_presence(self, get_frame, timeout_ms: int, need: Optional[int] = None) -> bool:
        need = int(need or self.min_frames)
        hit = 0
        t0 = time.time()
        while (time.time() - t0) * 1000 < timeout_ms:
            frame = get_frame()
            if self.present_now(frame):
                hit += 1
                if hit >= need:
                    return True
            else:
                hit = 0
            time.sleep(0.03)  # ~30 FPS
        return False


# ---------- Scale (optional via pyserial) ----------
try:
    import serial  # type: ignore
except Exception:
    serial = None  # ถ้าไม่มี pyserial จะปิดฟีเจอร์ชั่งให้อัตโนมัติ


class ScaleReader:
    """อ่านค่าจากเครื่องชั่งผ่าน serial แล้วรอให้นิ่งตามเกณฑ์"""
    def __init__(self, port: str, baud: int):
        if serial is None:
            raise RuntimeError("pyserial is not installed")
        self.port = port
        self.baud = baud

    def _open(self):
        return serial.Serial(self.port, self.baud, timeout=0.2)

    @staticmethod
    def _parse_weight(line: str) -> Optional[float]:
        # ครอบจักรวาลเบื้องต้น: เลข + หน่วย g|kg
        import re
        m = re.search(r"([-+]?\d+(?:\.\d+)?)\s*(kg|g)?", line.lower())
        if not m:
            return None
        val = float(m.group(1))
        unit = m.group(2) or "g"
        return val * 1000.0 if unit == "kg" else val

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
                    buf.clear()
                    stable_t0 = None
                    continue
                buf.append(w)
                buf = buf[-10:]  # keep last 10
                if max(buf) - min(buf) <= delta:
                    if stable_t0 is None:
                        stable_t0 = time.time()
                    if (time.time() - stable_t0) * 1000 >= stable_ms:
                        return sum(buf) / len(buf)
                else:
                    stable_t0 = None
        return None


# ---------- Capture Service ----------
class CaptureService:
    def __init__(
        self,
        *,
        camera: Camera,
        ingest: IngestClient,
        mqtt: MqttBus,
        topic_evt_captured: str,
        spool_dir: Path,
        identity: dict,
        cfg=None,  # ส่ง app.config.Config เข้ามาได้ เพื่อใช้ค่าพวก PRESENCE/ SCALE/ COOLDOWN
    ):
        self.camera = camera
        self.ingest = ingest
        self.mqtt = mqtt
        self.topic_evt_captured = topic_evt_captured
        self.spool_dir = spool_dir
        self.identity = identity
        self.cfg = cfg
        self._uploader_thread = threading.Thread(target=self._uploader_loop, daemon=True)
        self._stop = threading.Event()
        self._seen_events = deque(maxlen=256)
        self._cooldown_until = 0.0

        # Presence setup
        self.presence: Optional[MotionPresence] = None
        if cfg and getattr(cfg, "PRESENCE_MODE", "none") == "motion":
            roi = None
            if getattr(cfg, "PRESENCE_ROI", ""):
                try:
                    x1, y1, x2, y2 = [int(x) for x in cfg.PRESENCE_ROI.split(",")]
                    roi = (x1, y1, x2, y2)
                except Exception:
                    log.warning("Invalid PRESENCE_ROI, use full frame")
            self.presence = MotionPresence(cfg.PRESENCE_MIN_AREA, cfg.PRESENCE_MIN_FRAMES, roi)

        # Scale setup
        self.scale: Optional[ScaleReader] = None
        if cfg and getattr(cfg, "SCALE_ENABLED", False):
            if serial is None:
                log.warning("SCALE_ENABLED=true but pyserial not installed; scale will be disabled")
            else:
                try:
                    self.scale = ScaleReader(cfg.SCALE_PORT, cfg.SCALE_BAUD)
                except Exception as e:
                    log.warning("Scale init failed: %s", e)

    # ===== helper =====
    @staticmethod
    def _blur_variance(img_path: Path) -> float:
        data = np.fromfile(str(img_path), dtype=np.uint8)  # รองรับ path unicode
        img = cv2.imdecode(data, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.0
        return float(cv2.Laplacian(img, cv2.CV_64F).var())

    def _get_frame(self):
        if hasattr(self.camera, "read_frame"):
            return self.camera.read_frame()
        raise RuntimeError("Camera.read_frame() is required for presence detection")

    def _wait_presence_if_needed(self, only_if_present: bool) -> bool:
        if not only_if_present:
            return True
        if not self.presence:
            log.info("only_if_present requested but presence detector is not configured; skip capture")
            return False
        timeout_ms = int(getattr(self.cfg, "PRESENCE_TIMEOUT_MS", 5000) if self.cfg else 5000)
        return self.presence.wait_for_presence(self._get_frame, timeout_ms)

    def _wait_weight_if_needed(self, wait_weight: bool) -> Optional[float]:
        if not wait_weight:
            return None
        if not self.scale:
            log.info("wait_weight requested but scale is not configured; skip capture")
            return None
        cfg = self.cfg
        return self.scale.wait_stable(
            getattr(cfg, "SCALE_MIN_GRAMS", 50),
            getattr(cfg, "SCALE_STABLE_DELTA", 2),
            getattr(cfg, "SCALE_STABLE_MS", 800),
            getattr(cfg, "SCALE_TIMEOUT_MS", 6000),
        )

    # === public ===
    def start(self):
        self.spool_dir.mkdir(parents=True, exist_ok=True)
        self._uploader_thread.start()

    def stop(self):
        self._stop.set()

    # รองรับ payload v1/v2
    def handle_mqtt_cmd(self, payload: dict):
        event_id = payload.get("event_id")
        if event_id and event_id in self._seen_events:
            log.info("Duplicate event_id=%s ignored", event_id)
            return
        if event_id:
            self._seen_events.append(event_id)

        # ACK
        try:
            self.mqtt.publish_json(self.topic_evt_captured.replace("/captured", "/ack"), {
                "schema": "capture_ack@1",
                "event_id": event_id,
                "accepted": True,
                "reason": None,
                "ts": utc_now_iso(),
            })
        except Exception:
            log.exception("Failed to publish ACK")

        opts = {
            "settle_ms": int(payload.get("settle_ms") or 0),
            "burst_count": int(payload.get("burst", {}).get("count") or 1),
            "burst_interval_ms": int(payload.get("burst", {}).get("interval_ms") or 100),
            "deadline_ms": int(payload.get("deadline_ms") or 0),
            "only_if_present": bool(payload.get("only_if_present", False)),
            "wait_weight": bool(payload.get("wait_weight", False)),
        }
        extra_meta = {
            "event_id": event_id,
            "robot_id": payload.get("robot_id"),
            "job_id": payload.get("job_id"),
            "waypoint_id": payload.get("waypoint_id"),
            "pose": payload.get("pose"),
        }
        self.capture_once(reason="mqtt_cmd", options=opts, extra_meta=extra_meta)

    # รองรับ burst + quality + presence/scale
    def capture_once(
        self,
        session_id: str | None = None,
        reason: str = "manual",
        options: dict | None = None,
        extra_meta: dict | None = None,
    ) -> dict:
        session_id = session_id or str(uuid4())
        now_iso = utc_now_iso()
        options = options or {}
        extra_meta = extra_meta or {}

        settle_ms = int(options.get("settle_ms") or 0)
        burst_count = max(1, int(options.get("burst_count") or 1))
        burst_interval_ms = int(options.get("burst_interval_ms") or 100)
        # deadline_ms = int(options.get("deadline_ms") or 0)  # (ยังไม่ได้ enforce ในโค้ดนี้)

        only_if_present = bool(options.get("only_if_present", False))
        wait_weight = bool(options.get("wait_weight", False))

        # cooldown กันรัว
        now = time.time()
        cooldown = float(getattr(self.cfg, "COOLDOWN_SEC", 2) if self.cfg else 2)
        if now < self._cooldown_until:
            log.info("Cooldown active until %.2f, skip capture", self._cooldown_until)
            return {"local_path": "", "session_id": session_id, "sha256": ""}

        # 1) presence
        if not self._wait_presence_if_needed(only_if_present):
            log.info("No presence within timeout, skip capture")
            return {"local_path": "", "session_id": session_id, "sha256": ""}

        # 2) weight stable
        weight_g = None
        if wait_weight:
            weight_g = self._wait_weight_if_needed(True)
            if weight_g is None:
                log.info("Weight not stable within timeout, skip capture")
                return {"local_path": "", "session_id": session_id, "sha256": ""}

        # ✅ เพิ่ม publish น้ำหนักเป็น event แยก (ถ้ามีและมี cfg)
        if weight_g is not None and self.cfg:
            # ใช้ topic จาก cfg ถ้ามี ไม่งั้น fallback มาตาม pattern เดิม
            topic_weight = getattr(self.cfg, "topic_evt_weight", None)
            if not topic_weight:
                scale_id = getattr(self.cfg, "SCALE_ID", "sc01")
                topic_weight = f"edge/evt/{self.identity['tenant']}/{self.identity['house']}/lab/{self.identity['station']}/scale/{scale_id}/weight"
            self.mqtt.publish_json(
                topic_weight,
                {
                    "schema": "scale_weight@1",
                    "ts": now_iso,
                    **self.identity,
                    "session_id": session_id,
                    "event_id": extra_meta.get("event_id"),
                    "weight_g": weight_g,
                    "reason": reason,
                },
                retain=False,  # เปลี่ยนเป็น True ถ้าอยาก retain ค่าน้ำหนักล่าสุด
            )

        if settle_ms > 0:
            time.sleep(settle_ms / 1000.0)

        best = None
        attempts = 0
        total_to_try = burst_count + max(0, int(os.getenv("MAX_RETRIES", "0")))
        for i in range(total_to_try):
            out_path = self.camera.capture_still(out_dir=self.spool_dir)
            sha = sha256_of_file(out_path)
            try:
                blurv = self._blur_variance(out_path)
            except Exception:
                blurv = 0.0

            # publish image event (+ weight_g ติดไปด้วย)
            meta_evt = {
                "schema": "image_captured@2",
                "ts": now_iso,
                "session_id": session_id,
                **self.identity,
                "filename": out_path.name,
                "event_id": extra_meta.get("event_id"),
                "robot_id": extra_meta.get("robot_id"),
                "job_id": extra_meta.get("job_id"),
                "waypoint_id": extra_meta.get("waypoint_id"),
                "quality": {"blur_var": blurv, "attempt": i + 1},
                "weight_g": weight_g,
                "reason": reason,
            }
            self.mqtt.publish_json(self.topic_evt_captured, meta_evt)

            # sidecar for uploader
            sidecar = out_path.with_suffix(out_path.suffix + ".json")
            sidecar.write_text(
                json.dumps(
                    {
                        "sha256": sha,
                        "ts": now_iso,
                        "session_id": session_id,
                        **self.identity,
                        "local_path": str(out_path),
                        **{k: v for k, v in extra_meta.items() if v is not None},
                        "quality_blur_var": blurv,
                        "attempt": i + 1,
                        "weight_g": weight_g,
                        "reason": reason,
                    }
                ),
                encoding="utf-8",
            )

            # pick the best by blur var
            if not best or blurv > best["blur"]:
                best = {"path": out_path, "sha": sha, "blur": blurv}

            attempts += 1
            if i < total_to_try - 1:
                time.sleep(burst_interval_ms / 1000.0)

        log.info("Captured %d frames; best blur_var=%.2f", attempts, best["blur"] if best else -1.0)
        self._cooldown_until = time.time() + cooldown
        return {"local_path": str(best["path"]), "session_id": session_id, "sha256": best["sha"]}

    # === background uploader ===
    def _uploader_loop(self):
        while not self._stop.is_set():
            try:
                files = list(self.spool_dir.glob("*.jpg.json")) + list(self.spool_dir.glob("*.png.json"))
                for sidecar in files:
                    with sidecar.open("r", encoding="utf-8") as f:
                        s = json.load(f)
                    p = Path(s["local_path"])
                    meta = {
                        "tenant": s["tenant"],
                        "house": s["house"],
                        "station": s["station"],
                        "cam_id": s["cam_id"],
                        "ts": s["ts"],
                        "session_id": s.get("session_id"),
                        "sha256": s["sha256"],
                    }
                    # แนบข้อมูลเสริมถ้ามี
                    for k in (
                        "event_id",
                        "robot_id",
                        "job_id",
                        "waypoint_id",
                        "quality_blur_var",
                        "attempt",
                        "pose",
                        "weight_g",
                        "reason",
                    ):
                        if k in s:
                            meta[k] = s[k]

                    try:
                        resp = self.ingest.upload(p, meta)
                        log.info("Uploaded → ingestion: %s", resp)
                        try:
                            p.unlink(missing_ok=True)
                        finally:
                            sidecar.unlink(missing_ok=True)
                    except Exception as e:
                        log.warning("Upload failed, will retry later: %s", e)
                time.sleep(2.0)
            except Exception:
                log.exception("Uploader loop error")
                time.sleep(3.0)
