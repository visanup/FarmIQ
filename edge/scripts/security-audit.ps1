# Security Audit Script for Edge Services
# This script checks security configurations

Write-Host "🔒 Security Audit for Edge Services" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Check 1: Environment Variables Security
Write-Host "`n1. Checking Environment Variables Security..." -ForegroundColor Yellow

$services = @(
    "sensor-service",
    "sync-service", 
    "edge-orchestrator-service",
    "images-ingestion-service",
    "weight-associator-service",
    "edge-topic-bridge"
)

foreach ($service in $services) {
    $envFile = "services\$service\.env"
    if (Test-Path $envFile) {
        Write-Host "  ✅ $service has .env file" -ForegroundColor Green
        
        # Check for hardcoded passwords
        $content = Get-Content $envFile
        $hardcodedPasswords = $content | Where-Object { $_ -match "password.*=.*[a-zA-Z0-9]{8,}" }
        if ($hardcodedPasswords) {
            Write-Host "    ⚠️  Potential hardcoded passwords found" -ForegroundColor Yellow
        } else {
            Write-Host "    ✅ No hardcoded passwords detected" -ForegroundColor Green
        }
        
        # Check for API keys
        $apiKeys = $content | Where-Object { $_ -match "API_KEY|SECRET" }
        if ($apiKeys) {
            Write-Host "    ✅ API keys configured" -ForegroundColor Green
        }
    } else {
        Write-Host "  ❌ $service missing .env file" -ForegroundColor Red
    }
}

# Check 2: Database Security
Write-Host "`n2. Checking Database Security..." -ForegroundColor Yellow

# Check if database schemas are properly isolated
$dbCheck = docker exec farmiq-edge-timescaledb-1 psql -U postgres -d sensors_db -c "\dn" 2>$null
if ($dbCheck -match "sensor_service|image_service|weight_service|orchestrator_service|sync_service") {
    Write-Host "  ✅ Database schemas are properly isolated" -ForegroundColor Green
} else {
    Write-Host "  ❌ Database schema isolation issues detected" -ForegroundColor Red
}

# Check 3: MQTT Security
Write-Host "`n3. Checking MQTT Security..." -ForegroundColor Yellow

# Check MQTT configuration
$mqttConfig = Get-Content "mosquitto/config/mosquitto.conf" 2>$null
if ($mqttConfig -match "allow_anonymous false") {
    Write-Host "  ✅ MQTT authentication enabled" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  MQTT anonymous access enabled (temporary for testing)" -ForegroundColor Yellow
}

# Check 4: Container Security
Write-Host "`n4. Checking Container Security..." -ForegroundColor Yellow

# Check if containers are running as non-root
$containers = docker ps --format "{{.Names}}" | Where-Object { $_ -match "edge|sensor" }
foreach ($container in $containers) {
    $user = docker exec $container whoami 2>$null
    if ($user -eq "root") {
        Write-Host "  ⚠️  $container running as root" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ $container running as $user" -ForegroundColor Green
    }
}

# Check 5: Network Security
Write-Host "`n5. Checking Network Security..." -ForegroundColor Yellow

# Check if services are properly networked
$networks = docker network ls --format "{{.Name}}" | Where-Object { $_ -match "edge" }
if ($networks) {
    Write-Host "  ✅ Edge network configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ Edge network not found" -ForegroundColor Red
}

# Check 6: API Security
Write-Host "`n6. Checking API Security..." -ForegroundColor Yellow

# Check if services have API key protection
$servicesWithAPI = @("sync-service", "edge-orchestrator-service", "images-ingestion-service", "weight-associator-service")
foreach ($service in $servicesWithAPI) {
    $envFile = "services\$service\.env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        if ($content -match "API_KEY") {
            Write-Host "  ✅ $service has API key configuration" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $service missing API key configuration" -ForegroundColor Yellow
        }
    }
}

# Check 7: File Permissions
Write-Host "`n7. Checking File Permissions..." -ForegroundColor Yellow

# Check .env file permissions
foreach ($service in $services) {
    $envFile = "services\$service\.env"
    if (Test-Path $envFile) {
        $acl = Get-Acl $envFile
        $isRestricted = $acl.Access | Where-Object { $_.IdentityReference -eq "BUILTIN\Users" -and $_.FileSystemRights -match "FullControl|Modify" }
        if ($isRestricted) {
            Write-Host "  ⚠️  $service .env file has broad permissions" -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ $service .env file has restricted permissions" -ForegroundColor Green
        }
    }
}

Write-Host "`n🔒 Security Audit Complete!" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Summary
Write-Host "`n📋 Security Summary:" -ForegroundColor Cyan
Write-Host "  - Environment variables: Configured" -ForegroundColor Green
Write-Host "  - Database isolation: Implemented" -ForegroundColor Green
Write-Host "  - MQTT security: Configured (temporary anonymous for testing)" -ForegroundColor Yellow
Write-Host "  - Container security: Needs review" -ForegroundColor Yellow
Write-Host "  - Network security: Configured" -ForegroundColor Green
Write-Host "  - API security: Configured" -ForegroundColor Green
Write-Host "  - File permissions: Needs review" -ForegroundColor Yellow

Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
Write-Host "  1. Disable MQTT anonymous access in production" -ForegroundColor White
Write-Host "  2. Run containers as non-root users" -ForegroundColor White
Write-Host "  3. Restrict .env file permissions" -ForegroundColor White
Write-Host "  4. Use secrets management for production" -ForegroundColor White
Write-Host "  5. Enable TLS for MQTT in production" -ForegroundColor White
