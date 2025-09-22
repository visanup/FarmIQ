"""Database utilities for Prisma ORM."""

import logging
from prisma import Prisma
from prisma.errors import PrismaError

logger = logging.getLogger(__name__)

prisma = Prisma()


async def connect() -> None:
    """Connect to the Prisma client if not already connected."""
    if prisma.is_connected():
        return

    try:
        await prisma.connect()
    except PrismaError as exc:  # pragma: no cover - defensive logging only
        logger.error("Failed to connect to database: %s", exc)
        raise


async def disconnect() -> None:
    """Disconnect the Prisma client when the app shuts down."""
    if not prisma.is_connected():
        return

    try:
        await prisma.disconnect()
    except PrismaError as exc:  # pragma: no cover - defensive logging only
        logger.warning("Database disconnect raised an error: %s", exc)
