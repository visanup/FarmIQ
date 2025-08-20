# app\instrumentation\tracing.py

from __future__ import annotations
import os
from contextlib import contextmanager

# มี fallback no-op ถ้าไม่ได้ติดตั้ง OTEL
try:
    from opentelemetry import trace
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    OTEL_AVAILABLE = True
except Exception:  # pragma: no cover
    OTEL_AVAILABLE = False

from app.config import Config

def init_tracer():
    if not OTEL_AVAILABLE:
        return None
    resource = Resource.create({"service.name": Config.APP_NAME, "service.env": Config.ENV})
    provider = TracerProvider(resource=resource)
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if endpoint:
        exporter = OTLPSpanExporter(endpoint=endpoint)
    else:
        exporter = ConsoleSpanExporter()
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    return trace.get_tracer(Config.APP_NAME)

@contextmanager
def span(name: str):
    """contextmanager สำหรับสร้าง span แบบสั้น ๆ; ถ้าไม่มี OTEL ก็ no-op"""
    if not OTEL_AVAILABLE:
        yield None
        return
    tracer = trace.get_tracer(Config.APP_NAME)
    with tracer.start_as_current_span(name) as s:
        yield s
