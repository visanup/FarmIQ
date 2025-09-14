from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import Config
from app.api.v1.endpoint import router as base_router
from app.api.v1.agg import router as agg_router
from app.api.v1.events import router as events_router
from app.api.v1.anomalies import router as anomalies_router
from app.api.v1.kpi import router as kpi_router
from app.api.v1.fcr import router as fcr_router
from app.api.v1.catalog import router as catalog_router
from app.api.v1.top import router as top_router

app = FastAPI(
    title=f"{Config.APP_NAME}",
    description=(
        "Analytics API service for FarmIQ - provides statistical analysis, "
        "anomaly detection, and KPI calculations"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(base_router)
app.include_router(agg_router)
app.include_router(events_router)
app.include_router(anomalies_router)
app.include_router(kpi_router)
app.include_router(fcr_router, prefix="/v1", tags=["FCR & Size Distribution"])
app.include_router(catalog_router)
app.include_router(top_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=getattr(Config, "API_HOST", "0.0.0.0"),
        port=int(getattr(Config, "API_PORT", 7305)),
    )