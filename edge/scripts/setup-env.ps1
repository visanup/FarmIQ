# Setup Environment Variables for Edge Services
# PowerShell script to create .env files for each service

Write-Host "Setting up environment variables for edge services..." -ForegroundColor Green

# Function to create .env file for a service
function Create-EnvFile {
    param(
        [string]$ServiceName,
        [string]$Port,
        [string]$DbSchema,
        [string]$MqttUser,
        [string]$MqttPassword
    )
    
    $envPath = "services\$ServiceName\.env"
    $envContent = @"
NODE_ENV=development
LOG_LEVEL=info
PORT=$Port
HOST=0.0.0.0

# Database Configuration (Required)
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensors_db
DB_USER=postgres
DB_PASSWORD=password
DATABASE_URL=postgresql://postgres:password@timescaledb:5432/sensors_db
DB_SCHEMA=$DbSchema

# MQTT Configuration (Required)
MQTT_BROKER_URL=mqtt://edge-mqtt:1883
MQTT_USER=$MqttUser
MQTT_PASSWORD=$MqttPassword

# API Configuration
API_KEY=admin-key
"@
    
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Write-Host "Created .env file for $ServiceName" -ForegroundColor Yellow
}

# Create environment files for each service
Create-EnvFile "sensor-service" "6300" "sensor_service" "edge_sensor_svc" "sensor123"
Create-EnvFile "sync-service" "6302" "sync_service" "edge_sync_svc" "sync123"
Create-EnvFile "edge-orchestrator-service" "6301" "orchestrator_service" "edge_orchestrator_svc" "orchestrator123"
Create-EnvFile "images-ingestion-service" "6304" "image_service" "edge_image_svc" "image123"
Create-EnvFile "weight-associator-service" "6303" "weight_service" "edge_weight_svc" "weight123"
Create-EnvFile "edge-topic-bridge" "6305" "bridge_service" "edge_bridge" "bridge123"

# Add service-specific configurations
Write-Host "Adding service-specific configurations..." -ForegroundColor Green

# Sync Service specific
$syncEnvPath = "services\sync-service\.env"
$syncAdditional = @"

# Sync Service specific
CLOUD_API_URL=http://host.docker.internal:7302
CLOUD_API_KEY=admin-key
SYNC_INTERVAL_MINUTES=5
SYNC_MAX_RETRIES=3
SYNC_BACKOFF_MS=1000
"@
Add-Content -Path $syncEnvPath -Value $syncAdditional -Encoding UTF8

# Edge Orchestrator Service specific
$orchestratorEnvPath = "services\edge-orchestrator-service\.env"
$orchestratorAdditional = @"

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
"@
Add-Content -Path $orchestratorEnvPath -Value $orchestratorAdditional -Encoding UTF8

# Images Ingestion Service specific
$imageEnvPath = "services\images-ingestion-service\.env"
$imageAdditional = @"

# Images Ingestion Service specific
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_RAW=raw
IMAGE_MAX_SIZE_MB=50
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
ROUTING_KEY=image.created
"@
Add-Content -Path $imageEnvPath -Value $imageAdditional -Encoding UTF8

# Weight Associator Service specific
$weightEnvPath = "services\weight-associator-service\.env"
$weightAdditional = @"

# Weight Associator Service specific
WEIGHT_MATCH_WINDOW_MS=5000
WEIGHT_STRATEGY=nearest
IMAGE_CREATED_TOPIC=image.created
WEIGHT_ASSOCIATED_TOPIC=weight.associated
"@
Add-Content -Path $weightEnvPath -Value $weightAdditional -Encoding UTF8

# Edge Topic Bridge specific
$bridgeEnvPath = "services\edge-topic-bridge\.env"
$bridgeAdditional = @"

# Edge Topic Bridge specific
TOPIC_PREFIX=edge
DEFAULT_TENANT=tenant01
DEFAULT_HOUSE=house01
ENABLE_KAFKA=false
KAFKA_BROKERS=localhost:9092
"@
Add-Content -Path $bridgeEnvPath -Value $bridgeAdditional -Encoding UTF8

Write-Host "Environment files created successfully!" -ForegroundColor Green
Write-Host "You can now start the services with: docker compose -f docker-compose.apps.yml up -d" -ForegroundColor Cyan
