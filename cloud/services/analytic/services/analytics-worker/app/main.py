# app/main.py
from __future__ import annotations

import os
import threading
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.config import Config
from app.api.v1.endpoint import router
from app.workers.scheduler import start_scheduler, shutdown_scheduler

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

app = FastAPI(title=Config.APP_NAME, lifespan=lifespan)
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=Config.API_HOST, port=Config.API_PORT, reload=False)
