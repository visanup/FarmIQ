"""Entry point for the vision inference FastAPI service."""

from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import FastAPI, HTTPException

from .config import settings
from .schemas import ErrorResponse, HealthResponse, InferenceRequest, InferenceResponse
from .services.inference import get_engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.engine = get_engine(settings.model_path)
    logger.info("Vision inference service starting in %s mode", settings.environment)
    try:
        yield
    finally:
        logger.info("Vision inference service shutdown complete")


app = FastAPI(
    title="Vision Inference Service",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def healthcheck() -> HealthResponse:
    """Simple health probe endpoint."""
    return HealthResponse()


@app.post(
    "/inference",
    response_model=InferenceResponse,
    responses={500: {"model": ErrorResponse}},
)
async def run_inference(payload: InferenceRequest) -> InferenceResponse:
    """Trigger an inference job for a captured media item."""
    engine = getattr(app.state, "engine", None)
    if engine is None:  # pragma: no cover - defensive guard
        logger.error("Inference engine not initialised")
        raise HTTPException(status_code=500, detail="Inference engine unavailable")

    approximation_hint = _extract_weight_hint(payload.metadata)
    inference_result = engine.predict(approximation_hint=approximation_hint)
    result_payload = asdict(inference_result)

    now = datetime.now(tz=timezone.utc)
    job_id = str(uuid.uuid4())
    model_version = payload.model_id or inference_result.model_version

    await _persist_job(
        job_id=job_id,
        payload=payload,
        result=result_payload,
        model_version=model_version,
        timestamp=now,
    )

    return InferenceResponse(
        job_id=job_id,
        media_id=payload.media_id,
        predicted_weight=inference_result.predicted_weight,
        confidence=inference_result.confidence,
        model_version=model_version,
        inference_time_ms=inference_result.inference_time_ms,
        created_at=now,
        metadata=payload.metadata,
    )


def _extract_weight_hint(metadata: Dict[str, Any]) -> float | None:
    hint = metadata.get("approx_weight_kg")
    try:
        return float(hint) if hint is not None else None
    except (TypeError, ValueError):
        logger.debug("Invalid approximation hint supplied: %s", hint)
        return None


async def _persist_job(
    job_id: str,
    payload: InferenceRequest,
    result: Dict[str, Any],
    model_version: str,
    timestamp: datetime,
) -> None:
    """Send weight prediction to sensor-service via API call."""
    import httpx
    
    try:
        # Send weight prediction to sensor-service
        sensor_service_url = "http://sensor-service:6300/api/weight-predictions"
        
        weight_data = {
            "id": job_id,
            "mediaId": payload.media_id,
            "tenantId": payload.tenant_id,
            "farmId": payload.farm_id,
            "houseId": payload.house_id,
            "stationId": payload.station_id,
            "predictedWeight": result.get("predicted_weight", 0.0),
            "confidence": result.get("confidence", 0.0),
            "modelVersion": model_version,
            "inferenceTime": result.get("inference_time_ms", 0),
            "bbox": result.get("bbox"),
            "metadata": payload.metadata,
            "timestamp": timestamp.isoformat(),
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                sensor_service_url,
                json=weight_data,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            response.raise_for_status()
            logger.info("Weight prediction sent to sensor-service successfully")
            
    except Exception as exc:
        logger.exception("Failed to send weight prediction to sensor-service: %s", exc)


if __name__ == "__main__":  # pragma: no cover - manual execution helper
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=6306, reload=True)
