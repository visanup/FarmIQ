@echo off
echo ========================================
echo   FarmIQ Service Layer Mockup Script
echo ========================================
echo.

cd /d "D:\FarmIQ\cloud\services\master-service"

echo Setting environment variables...
set DATABASE_URL=postgresql://postgres:postgres1611@localhost:25432/farmiq_cloud?schema=master
set KAFKA_BROKERS=localhost:9094
set KAFKA_SSL=false
set KAFKA_CLIENT_ID=master-service-mockup
set NODE_ENV=development
set KAFKAJS_NO_PARTITIONER_WARNING=1

echo.
echo Environment variables set:
echo   DATABASE_URL=%DATABASE_URL%
echo   KAFKA_BROKERS=%KAFKA_BROKERS%
echo   NODE_ENV=%NODE_ENV%
echo.

echo Starting service layer mockup generation...
echo This will send data through master-service APIs to Kafka
echo.

node scripts/generate-service-layer-mockup.js

echo.
echo ========================================
echo   Script execution completed
echo ========================================
pause
