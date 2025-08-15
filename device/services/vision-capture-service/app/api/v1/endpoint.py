# app/v1/endpoint.py
from fastapi import APIRouter, Response
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

router = APIRouter()

# ====== Models ======
class CaptureReq(BaseModel):
    session_id: Optional[str] = Field(default=None, description="ใส่มาเองได้เพื่อผูกกับงาน/เหตุการณ์")
    # ตัวเลือกเสริม (ทั้งหมด optional):
    only_if_present: bool = Field(default=False, description="ถ่ายเฉพาะเมื่อมีวัตถุในเฟรม (ต้องเปิด presence detector ที่ config)")
    wait_weight: bool = Field(default=False, description="ถ่ายเมื่อเครื่องชั่งนิ่งแล้ว (ต้องเปิด SCALE at config)")
    settle_ms: Optional[int] = Field(default=None, ge=0, description="ดีเลย์ก่อนถ่าย")
    burst_count: Optional[int] = Field(default=None, ge=1, description="จำนวนรูปต่อการสั่งครั้งนี้")
    burst_interval_ms: Optional[int] = Field(default=None, ge=1, description="หน่วงระหว่างรูปใน burst")

class CaptureResp(BaseModel):
    session_id: str
    local_path: str
    sha256: str

# ====== Routes ======
def bind_routes(capture_service):
    @router.get("/health")
    def health():
        return {
            "status": "ok",
            "service": "vision-capture-service",
            "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }

    @router.post("/capture", response_model=CaptureResp, responses={204: {"description": "Skipped (no presence/weight/cooldown)"}})
    def capture(req: CaptureReq):
        # map options เฉพาะที่ผู้ใช้ส่งมา (อย่าส่ง None เข้าไป)
        opts = {}
        if req.only_if_present:
            opts["only_if_present"] = True
        if req.wait_weight:
            opts["wait_weight"] = True
        if req.settle_ms is not None:
            opts["settle_ms"] = req.settle_ms
        if req.burst_count is not None:
            opts["burst_count"] = req.burst_count
        if req.burst_interval_ms is not None:
            opts["burst_interval_ms"] = req.burst_interval_ms

        res = capture_service.capture_once(session_id=req.session_id, reason="rest", options=opts)

        # ถ้า service แจ้งว่า skip (เช่น ไม่มีวัตถุ / ชั่งไม่นิ่ง / ติดคูลดาวน์) จะคืน 204
        if not res.get("local_path"):
            return Response(status_code=204)

        return CaptureResp(**res)

    return router
