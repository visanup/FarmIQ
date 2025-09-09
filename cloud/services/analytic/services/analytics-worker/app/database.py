# app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.config import Config
import logging

logger = logging.getLogger(__name__)

engine = create_engine(
    Config.FULL_DATABASE_URL(),
    pool_pre_ping=True,
    pool_size=20,  # Increased pool size for worker
    max_overflow=30,  # Increased max overflow
    poolclass=QueuePool,
    pool_recycle=3600,  # Recycle connections every hour
    echo=Config.ENV == "dev",  # Enable SQL logging in dev
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False
