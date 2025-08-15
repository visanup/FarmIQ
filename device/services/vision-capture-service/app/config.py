# app/config.py
from __future__ import annotations
from pathlib import Path
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv
import os

# ---------- helpers ----------
def _find_dotenv() -> Path:
    if os.getenv("DOTENV_PATH"):
        return Path(os.getenv("DOTENV_PATH"))
    p = Path(__file__).resolve()
    for parent in list(p.parents)[:5]:
        cand = parent / ".env"
        if cand.exists():
            return cand
    return Path(".env")

def _env_int(key: str, default: int) -> int:
    try:
        return int(os.getenv(key, default))
    except (TypeError, ValueError):
        return default

def _env_bool(key: str, default: bool = False) -> bool:
    v = os.getenv(key)
    if v is None:
        return default
    return str(v).strip().lower() in ("1", "true", "yes", "y", "on")

def _env_path(key: str, default: str) -> Path:
    return Path(os.getenv(key, default))

load_dotenv(_find_dotenv())

# ---------- config ----------
class Config:
    # Identity
    APP_NAME: str = os.getenv("APP_NAME", "vision-capture-service")
    TENANT: str = os.getenv("TENANT", "t1")
    HOUSE: str = os.getenv("HOUSE", "h01")      # เดิมพิมพ์ผิดเป็น st01
    STATION: str = os.getenv("STATION", "st01")
    CAM_ID: str = os.getenv("CAM_ID", "cam01")

    # Camera
    CAMERA_SOURCE: str = os.getenv("CAMERA_SOURCE", "0")
    RESOLUTION: str = os.getenv("RESOLUTION", "1280x720")
    FPS: int = _env_int("FPS", 10)
    IMG_FORMAT: str = os.getenv("IMG_FORMAT", "jpg")
    MEDIA_DIR: Path = _env_path("MEDIA_DIR", "/data/media")
    SPOOL_DIR: Path = _env_path("SPOOL_DIR", "/data/spool")

    # Ingestion HTTP API
    INGEST_BASE_URL: str = os.getenv("INGEST_BASE_URL", "http://image-ingestion-service:8080")
    INGEST_API_PATH: str = os.getenv("INGEST_API_PATH", "/api/v1/images/upload")
    VERIFY_TLS: bool = _env_bool("VERIFY_TLS", False)

    # MQTT (รองรับทั้ง URL เดียว หรือแยก user/pass)
    MQTT_BROKER_URL: str = os.getenv("MQTT_BROKER_URL", "mqtt://localhost:1883")
    MQTT_USER: str = os.getenv("MQTT_USER", "")            # ถ้ากรอก จะ override ค่าใน URL
    MQTT_PASSWORD: str = os.getenv("MQTT_PASSWORD", "")
    MQTT_QOS: int = _env_int("MQTT_QOS", 1)
    MQTT_KEEPALIVE: int = _env_int("MQTT_KEEPALIVE", 30)

    # Scheduler
    CRON: str | None = os.getenv("CRON") or None
    INTERVAL_SEC: int | None = _env_int("INTERVAL_SEC", 0) or None

    # HTTP server
    # คุณตั้งชื่อไว้ IMAGE_INGESTION_PORT — ผม map ให้เป็น HTTP_PORT ให้อ่านง่ายขึ้น
    HTTP_PORT: int = _env_int("HTTP_PORT", _env_int("IMAGE_INGESTION_PORT", 8081))

    # Security / misc
    API_KEY: str = os.getenv("API_KEY", "")
    API_KEY_ID: str = os.getenv("API_KEY_ID", "")
    USE_REQUEST_SIGNING: bool = _env_bool("USE_REQUEST_SIGNING", False)

    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # CORS
    CORS_ALLOW_CREDENTIALS: bool = _env_bool("CORS_ALLOW_CREDENTIALS", True)
    CORS_ALLOWED_ORIGINS_RAW: str = os.getenv("CORS_ALLOWED_ORIGINS", "*")
    CORS_ALLOW_METHODS_RAW: str = os.getenv("CORS_ALLOW_METHODS", "*")
    CORS_ALLOW_HEADERS_RAW: str = os.getenv("CORS_ALLOW_HEADERS", "*")
    
    # เพิ่มท้าย Config
    CAPTURE_MODE: str = os.getenv("CAPTURE_MODE", "mixed")  # cron|interval|robot|mixed
    SETTLE_MS: int = _env_int("SETTLE_MS", 0)
    BURST_COUNT: int = _env_int("BURST_COUNT", 1)
    BURST_INTERVAL_MS: int = _env_int("BURST_INTERVAL_MS", 100)
    BLUR_VAR_MIN: float = float(os.getenv("BLUR_VAR_MIN", "0"))
    MAX_RETRIES: int = _env_int("MAX_RETRIES", 0)
    
    # Presence
    PRESENCE_MODE: str = os.getenv("PRESENCE_MODE", "none")
    PRESENCE_MIN_AREA: int = _env_int("PRESENCE_MIN_AREA", 1500)
    PRESENCE_MIN_FRAMES: int = _env_int("PRESENCE_MIN_FRAMES", 3)
    PRESENCE_TIMEOUT_MS: int = _env_int("PRESENCE_TIMEOUT_MS", 5000)
    PRESENCE_ROI: str = os.getenv("PRESENCE_ROI", "")
    COOLDOWN_SEC: int = _env_int("COOLDOWN_SEC", 2)

    # Scale
    SCALE_ID: str = os.getenv("SCALE_ID", "sc01")
    SCALE_ENABLED: bool = _env_bool("SCALE_ENABLED", False)
    SCALE_PORT: str = os.getenv("SCALE_PORT", "/dev/ttyUSB0")
    SCALE_BAUD: int = _env_int("SCALE_BAUD", 9600)
    SCALE_MIN_GRAMS: int = _env_int("SCALE_MIN_GRAMS", 50)
    SCALE_STABLE_DELTA: int = _env_int("SCALE_STABLE_DELTA", 2)
    SCALE_STABLE_MS: int = _env_int("SCALE_STABLE_MS", 800)
    SCALE_TIMEOUT_MS: int = _env_int("SCALE_TIMEOUT_MS", 6000)

    # ---------- Derived / helpers ----------
    @property
    def ingestion_upload_url(self) -> str:
        return self.INGEST_BASE_URL.rstrip("/") + self.INGEST_API_PATH

    @property
    def cors_allowed_origins(self) -> list[str]:
        raw = self.CORS_ALLOWED_ORIGINS_RAW.strip()
        return ["*"] if raw == "*" else [x.strip() for x in raw.split(",") if x.strip()]

    @property
    def cors_allow_methods(self) -> list[str]:
        raw = self.CORS_ALLOW_METHODS_RAW.strip()
        return ["*"] if raw == "*" else [x.strip() for x in raw.split(",") if x.strip()]

    @property
    def cors_allow_headers(self) -> list[str]:
        raw = self.CORS_ALLOW_HEADERS_RAW.strip()
        return ["*"] if raw == "*" else [x.strip() for x in raw.split(",") if x.strip()]

    # MQTT parsed (host/port/user/pass/tls)
    @property
    def mqtt_parsed(self) -> dict:
        u = urlparse(self.MQTT_BROKER_URL)
        scheme = u.scheme or "mqtt"
        host = u.hostname or "localhost"
        port = u.port or (8883 if scheme == "mqtts" else 1883)
        # explicit env overrides URL creds
        username = self.MQTT_USER or (unquote(u.username) if u.username else "")
        password = self.MQTT_PASSWORD or (unquote(u.password) if u.password else "")
        return {
            "scheme": scheme,
            "host": host,
            "port": port,
            "username": username,
            "password": password,
            "tls": scheme == "mqtts",
        }

    # MQTT topics
    @property
    def topic_cmd_start(self) -> str:
        return f"edge/cmd/{self.TENANT}/{self.HOUSE}/lab/{self.STATION}/camera/{self.CAM_ID}/start_capture"

    @property
    def topic_cmd_stop(self) -> str:
        return f"edge/cmd/{self.TENANT}/{self.HOUSE}/lab/{self.STATION}/camera/{self.CAM_ID}/stop_capture"

    @property
    def topic_evt_captured(self) -> str:
        return f"edge/evt/{self.TENANT}/{self.HOUSE}/lab/{self.STATION}/camera/{self.CAM_ID}/captured"

    @property
    def topic_stat(self) -> str:
        return f"edge/stat/{self.TENANT}/{self.HOUSE}/camera/{self.CAM_ID}"
    
    @property
    def topic_evt_weight(self) -> str:
        # ถ้าไม่ใช้ SCALE_ID ก็ return แบบไม่มี {SCALE_ID} ได้
        return f"edge/evt/{self.TENANT}/{self.HOUSE}/lab/{self.STATION}/scale/{self.SCALE_ID}/weight"
