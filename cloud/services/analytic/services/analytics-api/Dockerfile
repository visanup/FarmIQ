# syntax=docker/dockerfile:1.7
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_EXTRA_INDEX_URL=https://www.piwheels.org/simple

# เปิด/ปิดการติดตั้ง deps สำหรับ RealSense ด้วย ARG
ARG ENABLE_REALSENSE=false

# ── System deps ────────────────────────────────────────────────────────────────
# - ca-certificates: TLS สำหรับ pip/HTTP
# - librdkafka1: runtime ของ confluent-kafka
# - libpq5: runtime ของ PostgreSQL client (เผื่อใช้กับ psycopg)
# - tini: init process ช่วยจัดการ signal/defunct
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      libglib2.0-0 \
      libstdc++6 \
      libusb-1.0-0 \
      udev \
      librdkafka1 \
      libpq5 \
      tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python deps (layer แยกเพื่อ cache) ────────────────────────────────────────
COPY requirements.txt .

# ใช้ pip cache เร่ง build; ติดตั้ง pyrealsense2 แบบ opt-in
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install --upgrade pip setuptools wheel && \
    if [ "$ENABLE_REALSENSE" = "true" ]; then \
      pip install --no-cache-dir pyrealsense2 || echo "pyrealsense2 not available for this arch"; \
    fi && \
    pip install --no-cache-dir -r requirements.txt

# ── App code ──────────────────────────────────────────────────────────────────
COPY app ./app

# ── Non-root user ─────────────────────────────────────────────────────────────
RUN groupadd -g 10001 app && useradd -r -u 10001 -g app appuser && \
    chown -R appuser:app /app
USER appuser

# พอร์ต FastAPI (ปรับใน compose ได้)
EXPOSE 7304

# ใช้ tini เป็น entrypoint เพื่อจัดการสัญญาณกับ worker thread ให้เรียบร้อย
ENTRYPOINT ["/usr/bin/tini","-g","--"]
CMD ["python","-m","app.main"]
