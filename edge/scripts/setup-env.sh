#!/bin/bash

# Setup Environment Variables for Edge Services
# This script creates .env files for each service

echo "Setting up environment variables for edge services..."

# Create .env files for each service
create_env_file() {
    local service_name=$1
    local port=$2
    local db_schema=$3
    local mqtt_user=$4
    local mqtt_password=$5
    
    cat > "services/${service_name}/.env" << EOF
NODE_ENV=development
LOG_LEVEL=info
PORT=${port}
HOST=0.0.0.0

# Database Configuration (Required)
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensors_db
DB_USER=postgres
DB_PASSWORD=password
DATABASE_URL=postgresql://postgres:password@timescaledb:5432/sensors_db
DB_SCHEMA=${db_schema}

# MQTT Configuration (Required)
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
MQTT_USER=${mqtt_user}
MQTT_PASSWORD=${mqtt_password}

# API Configuration
API_KEY=admin-key
EOF
}

# Create environment files for each service
create_env_file "sensor-service" "6300" "sensor_service" "edge_sensor_svc" "sensor123"
create_env_file "sync-service" "6302" "sync_service" "edge_sync_svc" "sync123"
create_env_file "edge-orchestrator-service" "6301" "orchestrator_service" "edge_orchestrator_svc" "orchestrator123"
create_env_file "images-ingestion-service" "6304" "image_service" "edge_image_svc" "image123"
create_env_file "weight-associator-service" "6303" "weight_service" "edge_weight_svc" "weight123"
create_env_file "edge-topic-bridge" "6305" "bridge_service" "edge_bridge" "bridge123"

# Add service-specific configurations
echo "Adding service-specific configurations..."

# Sync Service specific
cat >> "services/sync-service/.env" << EOF

# Sync Service specific
CLOUD_API_URL=http://host.docker.internal:7302
CLOUD_API_KEY=admin-key
SYNC_INTERVAL_MINUTES=5
SYNC_MAX_RETRIES=3
SYNC_BACKOFF_MS=1000
EOF

# Edge Orchestrator Service specific
cat >> "services/edge-orchestrator-service/.env" << EOF

# Edge Orchestrator Service specific
ADMIN_API_KEY=admin-key
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_RAW=raw
MINIO_BUCKET_DATASETS=datasets
MINIO_BUCKET_MODELS=models
ROUTING_KEY=image.created
INFERENCE_BASE_URL=http://vision-inference-service:6314
EOF

# Images Ingestion Service specific
cat >> "services/images-ingestion-service/.env" << EOF

# Images Ingestion Service specific
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_RAW=raw
IMAGE_MAX_SIZE_MB=50
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
ROUTING_KEY=image.created
EOF

# Weight Associator Service specific
cat >> "services/weight-associator-service/.env" << EOF

# Weight Associator Service specific
WEIGHT_MATCH_WINDOW_MS=5000
WEIGHT_STRATEGY=nearest
IMAGE_CREATED_TOPIC=image.created
WEIGHT_ASSOCIATED_TOPIC=weight.associated
EOF

# Edge Topic Bridge specific
cat >> "services/edge-topic-bridge/.env" << EOF

# Edge Topic Bridge specific
TOPIC_PREFIX=edge
DEFAULT_TENANT=tenant01
DEFAULT_HOUSE=house01
ENABLE_KAFKA=false
KAFKA_BROKERS=localhost:9092
EOF

echo "Environment files created successfully!"
echo "You can now start the services with: docker compose -f docker-compose.apps.yml up -d"
