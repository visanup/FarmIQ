param(
  [switch]$Rebuild,
  [int]$SensorDays = 1,
  [int]$IntervalMinutes = 15,
  [int]$Customers = 1,
  [int]$FarmsPerCustomer = 1,
  [int]$HousesPerFarm = 1,
  [int]$SensorsPerHouse = 5,
  [int]$SleepMs = 0
)

$ErrorActionPreference = 'Stop'
function Log($m){ Write-Host ("[" + (Get-Date).ToString('HH:mm:ss') + "] " + $m) }

# 1) Infra up
Log "Bringing infra up..."
$infra = 'D:\FarmIQ\cloud\docker-compose.infra.yml'
docker compose -f $infra up -d | Out-Null

# Wait for Kafka healthy
Log "Waiting for Kafka to be healthy..."
for($i=0;$i -lt 30;$i++){
  $hc = (docker inspect -f '{{json .State.Health.Status}}' farmiq-kafka 2>$null)
  if($hc -and $hc -match 'healthy'){ break }
  Start-Sleep -Seconds 2
}

# 2) Apps up
Log "Bringing apps up..."
$apps = 'D:\FarmIQ\cloud\docker-compose.apps.yml'
if ($Rebuild.IsPresent) { $buildArg = '--build' } else { $buildArg = '' }
docker compose -f $apps up -d $buildArg analytics-stream analytics-api analytics-worker sensor-streamer | Out-Null

# 3) Health checks
function WaitHealth($url,$name){
  for($i=0;$i -lt 30;$i++){
    try{ $res = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3; if($res.StatusCode -eq 200){ Log "$name healthy"; return } }catch{}
    Start-Sleep -Seconds 2
  }
  throw "$name health timeout"
}
WaitHealth 'http://localhost:7303/health'  'analytics-stream'
WaitHealth 'http://127.0.0.1:7304/v1/health' 'analytics-api'
WaitHealth 'http://127.0.0.1:7305/v1/health' 'analytics-worker'
for($i=0;$i -lt 30;$i++){
  try { docker exec farmiq-sensor-streamer sh -lc "wget -qO- http://localhost:7302/health >/dev/null 2>&1 || curl -fs http://localhost:7302/health >/dev/null 2>&1" | Out-Null; Log "sensor-streamer healthy (in-container)"; break }
  catch { Start-Sleep -Seconds 2 }
}

# 4) Baseline counts
Log "Query baseline minute_features count..."
$before = (docker exec -i farmiq-postgres psql -U postgres -d farmiq_cloud -At -c "SELECT count(*) FROM analytics.minute_features;").Trim()
Log "minute_features before: $before"


# 5.1) Optional: run master-service mockup (snapshots)
if (Test-Path "D:\\FarmIQ\\cloud\\services\\master-service\\scripts\\generate-complete-mockup-v2.js") {
  Log "Running master-service mockup to publish snapshot topics..."
  docker compose -f D:\\FarmIQ\\cloud\\docker-compose.apps.yml up -d master-service | Out-Null
  docker exec -i farmiq-master-service node scripts/generate-complete-mockup-v2.js
} else { Log "Master mockup script not found, skipping." }

# 5) Run sensor generator
Log "Running sensor generator (Days=$SensorDays, Interval=$IntervalMinutes, SleepMs=$SleepMs)..."
docker exec -e CUSTOMERS=$Customers -e FARMS_PER_CUSTOMER=$FarmsPerCustomer -e HOUSES_PER_FARM=$HousesPerFarm -e SENSORS_PER_HOUSE=$SensorsPerHouse -e DAYS=$SensorDays -e INTERVAL_MINUTES=$IntervalMinutes -e SLEEP_MS=$SleepMs -i farmiq-sensor-streamer node scripts/generate-sensor-readings.js

# 6) Verify consumer group + DB
Log "Describe consumer group analytic-service.v2..."
docker exec farmiq-kafka /opt/bitnami/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group analytic-service.v2 | Select-String 'sensors.device.readings.v1' | ForEach-Object { $_.Line } | Write-Host

Log "Query minute_features count..."
$after = (docker exec -i farmiq-postgres psql -U postgres -d farmiq_cloud -At -c "SELECT count(*) FROM analytics.minute_features;").Trim()
Log "minute_features after:  $after"

$delta = [int]([int]$after) - [int]([int]$before)
Log "minute_features delta:  $delta"

# 7) Print analytics-stream recent state
Log "Last analytics-stream subscription lines:"
docker logs --since 2m farmiq-analytics-stream | Select-String -Pattern 'subscribed|consumers-running|DLQ|invalid' | ForEach-Object { $_.Line } | Write-Host


# 8) Extra verification: top metrics/devices last hour
Log "Top metrics in last 1h (by rows):"
docker exec -i farmiq-postgres psql -U postgres -d farmiq_cloud -t -c "SELECT metric, count(*) rows FROM analytics.minute_features WHERE bucket > now() - interval '1 hour' GROUP BY 1 ORDER BY 2 DESC LIMIT 5;" | Write-Host

Log "Top devices in last 1h (by rows):"
docker exec -i farmiq-postgres psql -U postgres -d farmiq_cloud -t -c "SELECT device_id, count(*) rows FROM analytics.minute_features WHERE bucket > now() - interval '1 hour' GROUP BY 1 ORDER BY 2 DESC LIMIT 5;" | Write-Host

Log "Done."
