# app/config.py
from __future__ import annotations
import os, json, socket, urllib.parse
from pathlib import Path
from dotenv import load_dotenv
from typing import List

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

load_dotenv(_find_dotenv())

def _get_list(key: str, default: List[str] | List[int]):
    """
    รองรับทั้ง JSON list และ comma-separated
    เช่น WINDOWS="[60,300]" หรือ WINDOWS="60,300"
    """
    raw = os.getenv(key)
    if raw is None or raw == "":
        return default
    try:
        v = json.loads(raw)
        if isinstance(v, list):
            return v
    except Exception:
        pass
    # comma-separated
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    # เดาว่าเป็น int ถ้า default เป็น list[int]
    if default and isinstance(default[0], int):
        return [int(p) for p in parts]
    return parts

def _env(key: str, default: str) -> str:
    return os.getenv(key, default)

# ---------- config ----------
class Config:
    # Identity
    APP_NAME: str = "analytics-worker"
    ENV: str = _env("ENV", "dev")

    # ---- Database (cloud) ----
    DB_HOST: str = _env("DB_HOST", "timescaledb")
    DB_PORT: int = int(_env("DB_PORT", "5432"))
    DB_NAME: str = _env("DB_NAME", "sensor_cloud_db")
    DB_USER: str = _env("DB_USER", "postgres")
    DB_PASSWORD: str = _env("DB_PASSWORD", "password")
    DB_SCHEMA: str = _env("DB_SCHEMA", "analytics")

    @classmethod
    def FULL_DATABASE_URL(cls) -> str:
        # ใส่ search_path=analytics,public ผ่าน query options
        # ต้อง percent-encode เป็น -csearch_path%3Danalytics%2Cpublic
        opts = "-csearch_path=" + f"{cls.DB_SCHEMA},public"
        q = urllib.parse.urlencode({"options": opts})
        return f"postgresql+psycopg://{cls.DB_USER}:{urllib.parse.quote(cls.DB_PASSWORD)}@" \
               f"{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}?{q}"

    # ---- Kafka ----
    KAFKA_BROKERS: str = _env("KAFKA_BROKERS", "kafka:9092")
    CONSUMER_GROUP: str = _env("CONSUMER_GROUP", "analytic-service.v1")
    KAFKA_CLIENT_ID: str = _env("KAFKA_CLIENT_ID", f"analytics-worker-{socket.gethostname()}")

    # topics ที่จะ consume
    KAFKA_TOPICS: List[str] = _get_list(
        "KAFKA_TOPICS",
        ["sensors.device.readings", "sensors.lab.readings"]
    )

    # Aggregation windows (seconds)
    WINDOWS: List[int] = _get_list("WINDOWS", [60, 300, 3600])

    # API
    API_HOST: str = _env("API_HOST", "0.0.0.0")
    API_PORT: int = int(_env("ANALYTICS_API_PORT", "7304"))
