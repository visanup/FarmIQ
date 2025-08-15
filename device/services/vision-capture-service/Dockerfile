# syntax=docker/dockerfile:1.7
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_EXTRA_INDEX_URL=https://www.piwheels.org/simple

# เปิด-ปิดการติดตั้ง deps สำหรับ RealSense ด้วย ARG
ARG ENABLE_REALSENSE=false

RUN apt-get update && apt-get install -y --no-install-recommends \
      libglib2.0-0 \
      libstdc++6 \
      libusb-1.0-0 \
      udev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# ถ้า ENABLE_REALSENSE=true ให้ติดตั้ง pyrealsense2 เพิ่ม (ระวัง: อาจไม่มี wheel สำหรับบางสถาปัตย์)
RUN if [ "$ENABLE_REALSENSE" = "true" ]; then \
      pip install --no-cache-dir pyrealsense2 || echo "pyrealsense2 not available for this arch"; \
    fi \
    && pip install --no-cache-dir -r requirements.txt

COPY app ./app

RUN useradd -r -u 10001 -g users appuser && chown -R appuser:users /app
USER appuser

CMD ["python", "-m", "app.main"]
