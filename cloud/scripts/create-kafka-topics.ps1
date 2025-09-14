# Kafka Topics Creation Script for FarmIQ Cloud (PowerShell)
# ใช้สำหรับสร้าง Kafka topics ทั้งหมดตาม kafka-topics.yml

param(
    [string]$KafkaBroker = "kafka:9092",
    [string]$TopicsConfigFile = "../kafka-topics.yml",
    [int]$WaitTime = 30,
    [string]$Command = "create"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Check if kafka-topics.sh is available
function Test-KafkaTools {
    try {
        $null = Get-Command kafka-topics.sh -ErrorAction Stop
        return $true
    }
    catch {
        Write-Error "kafka-topics.sh not found. Please ensure Kafka tools are in PATH."
        return $false
    }
}

# Wait for Kafka to be ready
function Wait-ForKafka {
    param([string]$Broker)
    
    Write-Info "Waiting for Kafka to be ready at $Broker..."
    
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            $null = & kafka-topics.sh --bootstrap-server $Broker --list 2>$null
            Write-Success "Kafka is ready!"
            return $true
        }
        catch {
            Write-Info "Attempt $attempt/$maxAttempts : Kafka not ready yet, waiting..."
            Start-Sleep -Seconds 2
            $attempt++
        }
    }
    
    Write-Error "Kafka is not ready after $maxAttempts attempts"
    return $false
}

# Create a single topic
function New-KafkaTopic {
    param(
        [string]$TopicName,
        [int]$Partitions,
        [int]$ReplicationFactor,
        [string]$ConfigOptions = ""
    )
    
    Write-Info "Creating topic: $TopicName"
    
    $createCmd = "kafka-topics.sh --bootstrap-server $KafkaBroker --create --topic $TopicName --partitions $Partitions --replication-factor $ReplicationFactor"
    
    # Add config options if provided
    if ($ConfigOptions) {
        $createCmd += " $ConfigOptions"
    }
    
    # Add --if-not-exists to avoid errors if topic already exists
    $createCmd += " --if-not-exists"
    
    try {
        Invoke-Expression $createCmd | Out-Null
        Write-Success "Topic '$TopicName' created successfully"
    }
    catch {
        Write-Warning "Failed to create topic '$TopicName' (may already exist)"
    }
}

# Create topics from configuration
function New-KafkaTopicsFromConfig {
    Write-Info "Creating topics from configuration file: $TopicsConfigFile"
    
    # Master Service Topics
    New-KafkaTopic "master.customer.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.farm.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.house.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.device.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.flock.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.animal-type.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.breed.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.economic-data.snapshot.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.external-data-source.snapshot.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.feed-type.snapshot.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "master.formula.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Sensor Data Topics
    New-KafkaTopic "sensors.device.readings.v1" 6 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    New-KafkaTopic "sensors.device.health.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    New-KafkaTopic "sensors.lab.readings.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "sensors.sweep.readings.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    New-KafkaTopic "sensors.alerts.v1" 1 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    New-KafkaTopic "sensors.data-quality.v1" 1 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    New-KafkaTopic "sensors.stream-state.v1" 1 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    
    # Farm Operational Topics
    New-KafkaTopic "farms.operational.event.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "farms.farm.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "farms.house.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "farms.flock.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Feed Management Topics
    New-KafkaTopic "feed.batch.created.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "feed.quality.result.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    
    # Economics Topics
    New-KafkaTopic "economics.cost.txn.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=31536000000 --config segment.ms=3600000"
    
    # External Data Topics
    New-KafkaTopic "external.weather.observation.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    
    # Analytics Topics
    New-KafkaTopic "analytics.features" 6 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.features.materialized.v1" 6 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.prediction.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.anomaly.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.invalid-readings" 3 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.fcr.calculation.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.health.metrics.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.production.metrics.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.environmental.metrics.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    New-KafkaTopic "analytics.size.distribution.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    
    # Device Management Topics
    New-KafkaTopic "devices.device.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    New-KafkaTopic "devices.configuration.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Formula Management Topics
    New-KafkaTopic "formula.recipe.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Auth Topics
    New-KafkaTopic "auth.user" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
}

# List all topics
function Get-KafkaTopics {
    Write-Info "Listing all topics:"
    try {
        $topics = & kafka-topics.sh --bootstrap-server $KafkaBroker --list
        $topics | Sort-Object | ForEach-Object { Write-Host $_ }
    }
    catch {
        Write-Error "Failed to list topics: $_"
    }
}

# Describe a topic
function Get-KafkaTopicDescription {
    param([string]$TopicName)
    
    Write-Info "Describing topic: $TopicName"
    try {
        & kafka-topics.sh --bootstrap-server $KafkaBroker --describe --topic $TopicName
    }
    catch {
        Write-Error "Failed to describe topic '$TopicName': $_"
    }
}

# Delete a topic (use with caution)
function Remove-KafkaTopic {
    param([string]$TopicName)
    
    Write-Warning "Deleting topic: $TopicName"
    $confirmation = Read-Host "Are you sure you want to delete topic '$TopicName'? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        try {
            & kafka-topics.sh --bootstrap-server $KafkaBroker --delete --topic $TopicName
            Write-Success "Topic '$TopicName' deleted"
        }
        catch {
            Write-Error "Failed to delete topic '$TopicName': $_"
        }
    }
    else {
        Write-Info "Topic deletion cancelled"
    }
}

# Main function
function Start-Main {
    Write-Info "Starting Kafka topics creation for FarmIQ Cloud"
    
    # Check if Kafka tools are available
    if (-not (Test-KafkaTools)) {
        exit 1
    }
    
    # Wait for Kafka to be ready
    if (-not (Wait-ForKafka -Broker $KafkaBroker)) {
        exit 1
    }
    
    # Create topics
    New-KafkaTopicsFromConfig
    
    # List all topics
    Write-Host ""
    Get-KafkaTopics
    
    Write-Success "Kafka topics creation completed!"
}

# Handle command line arguments
switch ($Command.ToLower()) {
    "list" {
        if (-not (Test-KafkaTools)) { exit 1 }
        if (-not (Wait-ForKafka -Broker $KafkaBroker)) { exit 1 }
        Get-KafkaTopics
    }
    "describe" {
        if ($args.Count -eq 0) {
            Write-Error "Please provide topic name: .\create-kafka-topics.ps1 -Command describe -TopicName <topic_name>"
            exit 1
        }
        if (-not (Test-KafkaTools)) { exit 1 }
        if (-not (Wait-ForKafka -Broker $KafkaBroker)) { exit 1 }
        Get-KafkaTopicDescription -TopicName $args[0]
    }
    "delete" {
        if ($args.Count -eq 0) {
            Write-Error "Please provide topic name: .\create-kafka-topics.ps1 -Command delete -TopicName <topic_name>"
            exit 1
        }
        if (-not (Test-KafkaTools)) { exit 1 }
        if (-not (Wait-ForKafka -Broker $KafkaBroker)) { exit 1 }
        Remove-KafkaTopic -TopicName $args[0]
    }
    "help" {
        Write-Host "Usage: .\create-kafka-topics.ps1 [parameters]"
        Write-Host ""
        Write-Host "Parameters:"
        Write-Host "  -Command <command>     Command to execute (create, list, describe, delete, help)"
        Write-Host "  -KafkaBroker <broker>  Kafka broker address (default: kafka:9092)"
        Write-Host "  -TopicsConfigFile <file> Topics configuration file (default: ../kafka-topics.yml)"
        Write-Host "  -WaitTime <seconds>    Wait time for Kafka readiness (default: 30)"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  create                 Create all topics from configuration (default)"
        Write-Host "  list                   List all topics"
        Write-Host "  describe <topic>       Describe a specific topic"
        Write-Host "  delete <topic>         Delete a specific topic (with confirmation)"
        Write-Host "  help                   Show this help message"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\create-kafka-topics.ps1"
        Write-Host "  .\create-kafka-topics.ps1 -Command list"
        Write-Host "  .\create-kafka-topics.ps1 -Command describe -TopicName sensors.device.readings.v1"
        Write-Host "  .\create-kafka-topics.ps1 -Command delete -TopicName test-topic"
    }
    "create" {
        Start-Main
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host "Use '.\create-kafka-topics.ps1 -Command help' for usage information"
        exit 1
    }
}
