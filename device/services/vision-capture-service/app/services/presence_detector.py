# app/services/presence_detector.py
import time
from typing import Optional, Tuple
import cv2
import numpy as np

class MotionPresence:
    def __init__(self, min_area: int, min_frames: int, roi: Optional[Tuple[int,int,int,int]] = None):
        self.sub = cv2.createBackgroundSubtractorMOG2(history=200, varThreshold=16, detectShadows=False)
        self.min_area = min_area
        self.min_frames = min_frames
        self.roi = roi

    def _apply_roi(self, frame):
        if not self.roi:
            return frame
        x1,y1,x2,y2 = self.roi
        crop = frame[max(y1,0):y2, max(x1,0):x2]
        return crop

    def present_now(self, frame) -> bool:
        frame = self._apply_roi(frame)
        fg = self.sub.apply(frame)
        fg = cv2.medianBlur(fg, 5)
        _, th = cv2.threshold(fg, 200, 255, cv2.THRESH_BINARY)
        th = cv2.dilate(th, None, iterations=2)
        cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        area = max((cv2.contourArea(c) for c in cnts), default=0)
        return area >= self.min_area

    def wait_for_presence(self, get_frame, timeout_ms: int) -> bool:
        need = self.min_frames
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
            time.sleep(0.03)  # ~30 fps
        return False
