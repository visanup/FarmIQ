"""Pydantic schemas for request and response payloads."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "vision-inference-service"


class InferenceRequest(BaseModel):
    media_id: str = Field(..., description="Identifier for the captured media asset")
    tenant_id: str = Field(..., description="Tenant identifier for multi-tenant isolation")
    farm_id: Optional[str] = None
    house_id: Optional[str] = None
    station_id: Optional[str] = None
    model_id: Optional[str] = Field(default=None, description="Requested model identifier")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    image_uri: Optional[str] = Field(
        default=None,
        description="Optional URI pointing to the stored image object",
    )


class InferenceResponse(BaseModel):
    job_id: str
    media_id: str
    predicted_weight: float
    confidence: float
    model_version: str
    inference_time_ms: int
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    detail: str
