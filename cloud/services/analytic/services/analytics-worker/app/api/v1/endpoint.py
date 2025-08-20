# app/v1/endpoint.py
from fastapi import APIRouter, Response
from app.instrumentation.metrics import metrics_response

router = APIRouter(prefix="/v1")

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/metrics")
def metrics():
    body, code, headers = metrics_response()
    return Response(content=body, status_code=code, media_type=headers["Content-Type"])


