# app/pipelines/__init__.py
from app.pipelines.registry import register
from app.pipelines.map.sensor import handle_sensor_reading
from app.pipelines.map.device_health import handle_device_health
from app.pipelines.map.sweep import handle_sweep_reading
from app.pipelines.map.lab import handle_lab_record

def init_registry():
    # Register topics that match analytics-stream configuration
    register("sensors.device.readings.v1",  handle_sensor_reading,  domain="sensor")  # numeric → agg
    register("sensors.device.health.v1",    handle_device_health,   domain="device")  # event/measurement
    register("sensors.sweep.readings.v1",   handle_sweep_reading,   domain="sweep")   # event (summary)
    register("sensors.lab.readings.v1",     handle_lab_record,      domain="lab")     # measurement → agg

