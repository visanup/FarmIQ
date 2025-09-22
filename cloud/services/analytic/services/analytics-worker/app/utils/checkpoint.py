from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import text
from app.database import SessionLocal


DDL = """
CREATE TABLE IF NOT EXISTS analytics.worker_job_checkpoints (
  key TEXT PRIMARY KEY,
  watermark TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


def ensure_checkpoint_table() -> None:
    db = SessionLocal()
    try:
        db.execute(text(DDL))
        db.commit()
    finally:
        db.close()


def get_checkpoint(key: str) -> Optional[datetime]:
    db = SessionLocal()
    try:
        row = db.execute(
            text("SELECT watermark FROM analytics.worker_job_checkpoints WHERE key=:k"), {"k": key}
        ).fetchone()
        return row[0].replace(tzinfo=timezone.utc) if row and row[0] else None
    finally:
        db.close()


def set_checkpoint(key: str, ts: datetime) -> None:
    db = SessionLocal()
    try:
        db.execute(
            text(
                """
                INSERT INTO analytics.worker_job_checkpoints (key, watermark)
                VALUES (:k, :t)
                ON CONFLICT (key) DO UPDATE SET watermark = EXCLUDED.watermark, updated_at = NOW()
                """
            ),
            {"k": key, "t": ts},
        )
        db.commit()
    finally:
        db.close()


def list_checkpoints(limit: int = 200) -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        rows = db.execute(
            text(
                "SELECT key, watermark, updated_at FROM analytics.worker_job_checkpoints ORDER BY updated_at DESC LIMIT :lim"
            ),
            {"lim": limit},
        )
        return [
            {"key": r.key, "watermark": r.watermark, "updated_at": r.updated_at}
            for r in rows
        ]
    finally:
        db.close()


def list_checkpoints_by_prefix(prefix: str, limit: int = 200) -> List[Dict[str, Any]]:
    db = SessionLocal()
    try:
        rows = db.execute(
            text(
                "SELECT key, watermark, updated_at FROM analytics.worker_job_checkpoints WHERE key LIKE :pfx ORDER BY updated_at DESC LIMIT :lim"
            ),
            {"pfx": f"{prefix}%", "lim": limit},
        )
        return [
            {"key": r.key, "watermark": r.watermark, "updated_at": r.updated_at}
            for r in rows
        ]
    finally:
        db.close()


def delete_checkpoint(key: str) -> bool:
    db = SessionLocal()
    try:
        res = db.execute(text("DELETE FROM analytics.worker_job_checkpoints WHERE key=:k"), {"k": key})
        db.commit()
        return res.rowcount > 0
    finally:
        db.close()
