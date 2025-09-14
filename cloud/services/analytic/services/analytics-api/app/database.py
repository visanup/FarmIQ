# app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import Config
import logging
import asyncio

logger = logging.getLogger(__name__)

# Synchronous engine for legacy code
engine = create_engine(
    Config.FULL_DATABASE_URL(),
    pool_pre_ping=True,
    pool_size=20,  # Increased pool size
    max_overflow=30,  # Increased max overflow
    poolclass=QueuePool,
    pool_recycle=3600,  # Recycle connections every hour
    echo=Config.ENV == "dev",  # Enable SQL logging in dev
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Async engine for new FCR and Size Distribution services
async_engine = create_async_engine(
    Config.FULL_DATABASE_URL().replace("postgresql://", "postgresql+asyncpg://"),
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=30,
    pool_recycle=3600,
    echo=Config.ENV == "dev",
)

AsyncSessionLocal = async_sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

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

async def get_db_session():
    """Async database session for FCR and Size Distribution services"""
    session = AsyncSessionLocal()
    try:
        yield session
    except Exception as e:
        logger.error(f"Async database error: {e}")
        await session.rollback()
        raise
    finally:
        await session.close()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

async def test_async_connection():
    """Test async database connection"""
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Async database connection test failed: {e}")
        return False
