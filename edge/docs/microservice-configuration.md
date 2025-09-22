# Microservice Configuration Guide

## Overview
This document outlines the configuration requirements for all edge microservices to ensure proper microservice architecture and eliminate hardcoded values.

## Database Architecture
All services use a shared PostgreSQL database with separate schemas for isolation:

- **sensor_service**: Sensor readings, device health, sweep readings
- **image_service**: Media objects, reading-media mappings
- **weight_service**: Weight readings, lab readings, weight associations
- **orchestrator_service**: Dataset exports, model registry, weight mappings
- **sync_service**: Sync states, sync logs

## Required Environment Variables

### Common Variables (All Services)
```bash
# Database
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensors_db
DB_USER=postgres
DB_PASSWORD=password
DATABASE_URL=postgresql://postgres:password@timescaledb:5432/sensors_db

# MQTT
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
MQTT_USER=<service_specific_user>
MQTT_PASSWORD=<service_specific_password>

# API Security
API_KEY=admin-key
```

### Service-Specific Variables

#### Sensor Service (Port 6300)
```bash
PORT=6300
DB_SCHEMA=sensor_service
MQTT_SENSOR_USER=edge_sensor_svc
MQTT_SENSOR_PASSWORD=sensor123
SENSOR_RAW_SUB=sensor.raw/+/+/+
DM_HEALTH_SUB=dm/+/+/health
DM_LWT_SUB=dm/+/+/lwt
PUB_NS_CLEAN=sensor.clean
PUB_NS_ANOMALY=sensor.anomaly
PUB_NS_DLQ=sensor.dlq
```

#### Sync Service (Port 6302)
```bash
PORT=6302
DB_SCHEMA=sync_service
CLOUD_API_URL=http://host.docker.internal:7302
CLOUD_API_KEY=admin-key
SYNC_INTERVAL_MINUTES=5
SYNC_MAX_RETRIES=3
SYNC_BACKOFF_MS=1000
```

#### Edge Orchestrator Service (Port 6301)
```bash
PORT=6301
DB_SCHEMA=orchestrator_service
ADMIN_API_KEY=admin-key
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_RAW=raw
MINIO_BUCKET_DATASETS=datasets
MINIO_BUCKET_MODELS=models
ROUTING_KEY=image.created
INFERENCE_BASE_URL=http://vision-inference-service:6314
```

#### Images Ingestion Service (Port 6304)
```bash
PORT=6304
DB_SCHEMA=image_service
API_KEY=admin-key
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_RAW=raw
IMAGE_MAX_SIZE_MB=50
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
ROUTING_KEY=image.created
```

#### Weight Associator Service (Port 6303)
```bash
PORT=6303
DB_SCHEMA=weight_service
WEIGHT_MATCH_WINDOW_MS=5000
WEIGHT_STRATEGY=nearest
IMAGE_CREATED_TOPIC=image.created
WEIGHT_ASSOCIATED_TOPIC=weight.associated
```

#### Edge Topic Bridge (Port 6305)
```bash
PORT=6305
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
MQTT_USER=edge_bridge
MQTT_PASSWORD=bridge123
TOPIC_PREFIX=edge
DEFAULT_TENANT=tenant01
DEFAULT_HOUSE=house01
ENABLE_KAFKA=false
KAFKA_BROKERS=localhost:9092
```

## Prisma Schema Configuration

Each service has its own Prisma schema with:
- Separate schema namespace
- Service-specific models
- Proper indexing for performance
- Foreign key relationships where needed

### Schema Files
- `sensor-service/prisma/schema.prisma` - Sensor readings, device health
- `images-ingestion-service/prisma/schema.prisma` - Media objects, mappings
- `weight-associator-service/prisma/schema.prisma` - Weight readings, lab readings
- `edge-orchestrator-service/prisma/schema.prisma` - Datasets, models
- `sync-service/prisma/schema.prisma` - Sync states, logs

## Database Setup

Run the shared schema setup:
```sql
-- Execute shared_schema.sql to create all schemas and tables
psql -h timescaledb -U postgres -d sensors_db -f shared_schema.sql
```

## Microservice Principles Applied

1. **Single Responsibility**: Each service handles one domain
2. **Database per Service**: Separate schemas in shared database
3. **Configuration Externalization**: All config via environment variables
4. **No Hardcoded Values**: All values configurable
5. **Service Discovery**: Services communicate via MQTT/HTTP
6. **Health Checks**: Each service exposes health endpoints
7. **API Documentation**: Swagger UI for each service

## Security Considerations

- Each service has its own MQTT credentials
- API keys for service-to-service communication
- Database schema isolation
- No shared secrets between services

## Monitoring and Logging

- Structured logging with configurable levels
- Health check endpoints on all services
- Sync status tracking in sync_service
- Error tracking and retry mechanisms
