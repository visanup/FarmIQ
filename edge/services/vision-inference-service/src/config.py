"""Application configuration utilities."""

from functools import lru_cache
import logging
from typing import Optional

from pydantic import BaseModel, Field, ValidationError
import os


class Settings(BaseModel):
    """Runtime settings resolved from environment variables."""

    model_path: str = Field(default="models/latest.pt", alias="VISION_MODEL_PATH")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    environment: str = Field(default="development", alias="ENVIRONMENT")

    class Config:
        allow_population_by_field_name = True

    def configure_logging(self) -> None:
        """Configure application-wide logging."""
        numeric_level = getattr(logging, self.log_level.upper(), logging.INFO)
        logging.basicConfig(level=numeric_level,
                            format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    try:
        settings = Settings()
    except ValidationError as exc:  # pragma: no cover - configuration errors are fatal
        missing = ", ".join(err["loc"][0] for err in exc.errors())
        raise RuntimeError(f"Missing required configuration values: {missing}") from exc

    settings.configure_logging()
    return settings


settings = get_settings()
