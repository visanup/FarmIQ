# app/services/camera.py
from __future__ import annotations
import logging
from pathlib import Path
from uuid import uuid4
from typing import Optional

import cv2
import numpy as np

log = logging.getLogger("camera")

# พยายามรองรับ Intel RealSense ถ้ามี
try:
    import pyrealsense2 as rs  # type: ignore
except Exception:
    rs = None


class Camera:
    """
    Unified camera wrapper.

    source:
      - "realsense" | "d457" | "rs:"  -> ใช้ Intel RealSense (พยายามเปิด color; ถ้าไม่มีจะ fallback เป็น infrared)
      - "rs:ir"                        -> บังคับโหมด infrared
      - "0","1",...                    -> OpenCV VideoCapture จาก index
      - "rtsp://..." / "http(s)://..." -> OpenCV ผ่าน URL

    read_frame() -> ndarray (BGR, uint8)
    capture_still(out_dir, img_format="jpg") -> Path
    """

    def __init__(self, source: str, resolution: str, fps: int):
        self.source_raw = (source or "0").strip()
        self.w, self.h = [int(x) for x in resolution.lower().split("x")]
        self.fps = int(fps)

        s = self.source_raw.lower()
        self.use_rs = s in ("realsense", "d457") or s.startswith("rs:")
        self.force_ir = s.startswith("rs:ir")

        # OpenCV state
        self.cap: Optional[cv2.VideoCapture] = None
        self.cv_source: int | str = int(self.source_raw) if self.source_raw.isdigit() else self.source_raw

        # RealSense state
        self.pipeline: Optional["rs.pipeline"] = None
        self.stream_is_color: bool = True  # ถ้า false = infrared

    # ---------- open/close ----------
    def _open(self):
        if self.use_rs:
            self._open_rs()
        else:
            self._open_cv()

    def _open_cv(self):
        if self.cap is not None:
            return
        self.cap = cv2.VideoCapture(self.cv_source)
        # ตั้งค่าพื้นฐาน (บางไดรเวอร์อาจไม่รับ แต่ลอง set ไว้ก่อน)
        try:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.w)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.h)
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
        except Exception:
            pass
        log.info("OpenCV camera opened: %s", self.cv_source)

    def _open_rs(self):
        if rs is None:
            raise RuntimeError("pyrealsense2 not installed but CAMERA_SOURCE requires RealSense")
        if self.pipeline is not None:
            return
        self.pipeline = rs.pipeline()
        cfg = rs.config()

        # โหมดสีปกติ (bgr8); ถ้าไม่มีหรือบังคับ IR -> fallback
        if self.force_ir:
            self.stream_is_color = False
        else:
            self.stream_is_color = True

        try:
            if self.stream_is_color:
                cfg.enable_stream(rs.stream.color, self.w, self.h, rs.format.bgr8, self.fps)
            else:
                cfg.enable_stream(rs.stream.infrared, 1, self.w, self.h, rs.format.y8, self.fps)
            self.pipeline.start(cfg)
            log.info("RealSense pipeline started (color=%s)", self.stream_is_color)
        except Exception as e:
            if not self.force_ir:
                # ลอง fallback infrared
                log.warning("Color stream not available, falling back to infrared: %s", e)
                self.stream_is_color = False
                cfg.disable_all_streams()
                cfg.enable_stream(rs.stream.infrared, 1, self.w, self.h, rs.format.y8, self.fps)
                self.pipeline.start(cfg)
            else:
                raise

    def close(self):
        if self.use_rs and self.pipeline is not None:
            try:
                self.pipeline.stop()
            except Exception:
                pass
            self.pipeline = None
            log.info("RealSense pipeline stopped")
        if not self.use_rs and self.cap is not None:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None
            log.info("OpenCV camera released")

    # ---------- frame capture ----------
    def read_frame(self) -> np.ndarray:
        """
        Return a BGR image (uint8).
        For infrared frames (grayscale), it converts to BGR for consistency.
        """
        self._open()
        if self.use_rs:
            assert self.pipeline is not None
            frames = self.pipeline.wait_for_frames()
            if self.stream_is_color:
                color = frames.get_color_frame()
                if not color:
                    raise RuntimeError("No color frame from RealSense")
                frame = np.asanyarray(color.get_data())  # already BGR (rs.format.bgr8)
            else:
                ir = frames.get_infrared_frame()
                if not ir:
                    raise RuntimeError("No infrared frame from RealSense")
                gray = np.asanyarray(ir.get_data())  # Y8
                frame = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
            return frame

        # OpenCV VideoCapture
        assert self.cap is not None
        ok, frame = self.cap.read()
        if not ok or frame is None:
            # ลอง reopen หนึ่งครั้ง
            log.warning("Frame read failed; reopening VideoCapture...")
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None
            self._open_cv()
            ok, frame = self.cap.read()
            if not ok or frame is None:
                raise RuntimeError("Failed to read frame from camera")
        return frame

    def capture_still(self, out_dir: Path, img_format: str = "jpg") -> Path:
        """
        Capture single frame and save to disk.
        Returns saved file path.
        """
        frame = self.read_frame()
        out_dir.mkdir(parents=True, exist_ok=True)
        fname = f"{uuid4()}.{img_format.lower()}"
        out_path = out_dir / fname

        ext = img_format.lower()
        if ext in ("jpg", "jpeg"):
            cv2.imwrite(str(out_path), frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
        elif ext == "png":
            cv2.imwrite(str(out_path), frame, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        else:
            # default to PNG ifไม่รู้จัก
            cv2.imwrite(str(out_path.with_suffix(".png")), frame, [cv2.IMWRITE_PNG_COMPRESSION, 3])
            out_path = out_path.with_suffix(".png")

        return out_path
