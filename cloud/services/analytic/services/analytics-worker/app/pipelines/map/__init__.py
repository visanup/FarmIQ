# app/pipelines/__init__.py
from app.pipelines.registry import register
from app.pipelines.map.device_health import handle_device_health
from app.pipelines.map.econ import handle_econ_event
from app.pipelines.map.lab import handle_lab_record
from app.pipelines.map.ops import handle_ops_event
from app.pipelines.map.sweep import handle_sweep_reading
from app.pipelines.map.weather import handle_weather_record

def init_registry():
    register("device.health", handle_device_health)
    register("econ.events", handle_econ_event)
    register("lab.results", handle_lab_record)
    register("ops.events", handle_ops_event)
    register("sensors.sweep.readings", handle_sweep_reading)
    register("weather.readings", handle_weather_record)

