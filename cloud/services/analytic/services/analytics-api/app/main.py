from __future__ import annotations

from fastapi import FastAPI
from app.config import Config
from app.api.v1.endpoint import router as base_router
from app.api.v1.agg import router as agg_router
# ถ้ามี events table
try:
    from app.v1.events import router as events_router
except Exception:
    events_router = None

app = FastAPI(title=f"{Config.APP_NAME}-api")

app.include_router(base_router)
app.include_router(agg_router)
if events_router:
    app.include_router(events_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=getattr(Config, "API_HOST", "0.0.0.0"), port=int(getattr(Config, "API_PORT", 7305)))

