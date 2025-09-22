# app/main.py
from __future__ import annotations

import os
import threading
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Config
from app.api.v1.endpoint import router
from app.workers.scheduler import start_scheduler, shutdown_scheduler
from app.pipelines import init_registry

try:
    from app.workers.stream_worker import run_worker
except Exception as e:  # pragma: no cover
    run_worker = None
    print(f"[boot] stream_worker not available: {e}")

_worker_thread: Optional[threading.Thread] = None

def _enabled(key: str, default: str = "1") -> bool:
    return os.getenv(key, default).strip().lower() in ("1", "true", "yes", "on")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize pipeline registry
    init_registry()
    print(f"[boot] ENV={Config.ENV} DB={Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME} schema={Config.DB_SCHEMA}")
    print(f"[boot] Kafka client={Config.KAFKA_CLIENT_ID} group={Config.CONSUMER_GROUP} brokers={Config.KAFKA_BROKERS}")
    print(f"[boot] Topics (env override? {'yes' if os.getenv('KAFKA_TOPICS') else 'no'}) -> {Config.KAFKA_TOPICS}")
    
    if _enabled("ENABLE_SCHEDULER", "1"):
        start_scheduler()

    if _enabled("ENABLE_WORKER", "1") and run_worker is not None:
        global _worker_thread
        _worker_thread = threading.Thread(
            target=run_worker, name="analytics-stream-worker", daemon=True
        )
        _worker_thread.start()
        print("[boot] stream worker started")

    yield
    shutdown_scheduler()

app = FastAPI(
    title=Config.APP_NAME,
    description="Analytics worker service for FarmIQ - processes real-time data from Kafka",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=Config.API_HOST, port=Config.API_PORT, reload=False)
