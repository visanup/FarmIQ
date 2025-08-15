# app/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from apscheduler.schedulers.background import BackgroundScheduler

from app.config import Config
from app.services.camera import Camera
from app.services.ingest_client import IngestClient
from app.services.mqtt_bus import MqttBus
from app.services.capture_service import CaptureService
from app.v1.endpoint import bind_routes

# ---- logging setup ----
_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, _level_name, logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

cfg = Config()
app = FastAPI(title=cfg.APP_NAME)

# ---- CORS (ตามค่าใน .env) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.cors_allowed_origins,
    allow_credentials=cfg.CORS_ALLOW_CREDENTIALS,
    allow_methods=cfg.cors_allow_methods,
    allow_headers=cfg.cors_allow_headers,
)

# ---- Wiring ----
camera = Camera(cfg.CAMERA_SOURCE, cfg.RESOLUTION, cfg.FPS)
ingest = IngestClient(
    cfg.INGEST_BASE_URL,
    cfg.INGEST_API_PATH,
    token="",  # ไม่ใช้ Bearer
    api_key=cfg.API_KEY,
    api_key_id=cfg.API_KEY_ID,
    use_request_signing=cfg.USE_REQUEST_SIGNING,
    verify_tls=cfg.VERIFY_TLS,
)

mqtt = MqttBus(
    client_id=f"{cfg.APP_NAME}-{cfg.CAM_ID}",
    lwt_topic=cfg.topic_stat,
    qos=cfg.MQTT_QOS,
    keepalive=cfg.MQTT_KEEPALIVE,
    parsed=cfg.mqtt_parsed,  # ใช้ host/port/user/pass จาก config
)

identity = {
    "tenant": cfg.TENANT,
    "house": cfg.HOUSE,
    "station": cfg.station if hasattr(cfg, "station") else cfg.STATION,  # กันพลาดชื่อ field
    "cam_id": cfg.CAM_ID,
}

capture_service = CaptureService(
    camera=camera,
    ingest=ingest,
    mqtt=mqtt,
    topic_evt_captured=cfg.topic_evt_captured,
    spool_dir=cfg.SPOOL_DIR,
    identity=identity,
    cfg=cfg,  # ส่ง config เข้าไปใช้กับ presence/scale/cooldown
)

# ---- REST ----
app.include_router(bind_routes(capture_service), prefix="/v1")

# ---- Scheduler ----
sched = BackgroundScheduler()

@app.on_event("startup")
def on_start():
    mqtt.connect()
    mqtt.set_cmd_handler(cfg.topic_cmd_start, capture_service.handle_mqtt_cmd)
    capture_service.start()

    # โหมด cron
    if cfg.CAPTURE_MODE in ("cron", "mixed") and cfg.CRON:
        m, h, dom, mon, dow = cfg.CRON.split()
        sched.add_job(
            lambda: capture_service.capture_once(reason="cron"),
            trigger="cron",
            minute=m,
            hour=h,
            day=dom,
            month=mon,
            day_of_week=dow,
            id="cron_cap",
            replace_existing=True,
        )

    # โหมด interval
    if cfg.CAPTURE_MODE in ("interval", "mixed") and cfg.INTERVAL_SEC:
        sched.add_job(
            lambda: capture_service.capture_once(reason="interval"),
            trigger="interval",
            seconds=cfg.INTERVAL_SEC,
            id="interval_cap",
            replace_existing=True,
        )

    sched.start()
    logging.getLogger("main").info("Service started")

@app.on_event("shutdown")
def on_stop():
    try:
        sched.shutdown(wait=False)
    except Exception:
        pass
    capture_service.stop()
    camera.close()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=cfg.HTTP_PORT, reload=False)
