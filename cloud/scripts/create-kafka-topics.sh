#!/bin/bash

# Kafka Topics Creation Script for FarmIQ Cloud
# ใช้สำหรับสร้าง Kafka topics ทั้งหมดตาม kafka-topics.yml

set -e

# Configuration
KAFKA_BROKER=${KAFKA_BROKER:-"kafka:9092"}
TOPICS_CONFIG_FILE=${TOPICS_CONFIG_FILE:-"../kafka-topics.yml"}
WAIT_TIME=${WAIT_TIME:-30}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kafka-topics.sh is available
check_kafka_tools() {
    if ! command -v kafka-topics.sh &> /dev/null; then
        log_error "kafka-topics.sh not found. Please ensure Kafka tools are in PATH."
        exit 1
    fi
}

# Wait for Kafka to be ready
wait_for_kafka() {
    log_info "Waiting for Kafka to be ready at $KAFKA_BROKER..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if kafka-topics.sh --bootstrap-server $KAFKA_BROKER --list &> /dev/null; then
            log_success "Kafka is ready!"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Kafka not ready yet, waiting..."
        sleep 2
        ((attempt++))
    done
    
    log_error "Kafka is not ready after $max_attempts attempts"
    exit 1
}

# Create a single topic
create_topic() {
    local topic_name=$1
    local partitions=$2
    local replication_factor=$3
    local config_options=$4
    
    log_info "Creating topic: $topic_name"
    
    local create_cmd="kafka-topics.sh --bootstrap-server $KAFKA_BROKER --create --topic $topic_name --partitions $partitions --replication-factor $replication_factor"
    
    # Add config options if provided
    if [ -n "$config_options" ]; then
        create_cmd="$create_cmd $config_options"
    fi
    
    # Add --if-not-exists to avoid errors if topic already exists
    create_cmd="$create_cmd --if-not-exists"
    
    if eval $create_cmd; then
        log_success "Topic '$topic_name' created successfully"
    else
        log_warning "Failed to create topic '$topic_name' (may already exist)"
    fi
}

# Create topics from YAML config (simplified parsing)
create_topics_from_config() {
    log_info "Creating topics from configuration file: $TOPICS_CONFIG_FILE"
    
    # Master Service Topics
    create_topic "master.customer.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.farm.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.house.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.device.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.flock.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.animal-type.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.breed.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.economic-data.snapshot.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.external-data-source.snapshot.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.feed-type.snapshot.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "master.formula.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Sensor Data Topics
    create_topic "sensors.device.readings.v1" 6 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    create_topic "sensors.device.health.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    create_topic "sensors.lab.readings.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "sensors.sweep.readings.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    create_topic "sensors.alerts.v1" 1 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    create_topic "sensors.data-quality.v1" 1 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    create_topic "sensors.stream-state.v1" 1 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    
    # Farm Operational Topics
    create_topic "farms.operational.event.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "farms.farm.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "farms.house.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "farms.flock.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Feed Management Topics
    create_topic "feed.batch.created.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "feed.quality.result.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    
    # Economics Topics
    create_topic "economics.cost.txn.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=31536000000 --config segment.ms=3600000"
    
    # External Data Topics
    create_topic "external.weather.observation.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    
    # Analytics Topics
    create_topic "analytics.features" 6 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    create_topic "analytics.features.materialized.v1" 6 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "analytics.prediction.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    create_topic "analytics.anomaly.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=2592000000 --config segment.ms=3600000"
    create_topic "analytics.invalid-readings" 3 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    create_topic "analytics.fcr.calculation.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "analytics.health.metrics.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "analytics.production.metrics.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "analytics.environmental.metrics.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    create_topic "analytics.size.distribution.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=7776000000 --config segment.ms=3600000"
    
    # Device Management Topics
    create_topic "devices.device.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    create_topic "devices.configuration.v1" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Formula Management Topics
    create_topic "formula.recipe.snapshot.v1" 3 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Auth Topics
    create_topic "auth.user" 1 1 "--config cleanup.policy=compact --config retention.ms=604800000 --config segment.ms=86400000"
    
    # Monitoring Topics
    create_topic "monitoring.alerts.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
    create_topic "monitoring.health.v1" 3 1 "--config cleanup.policy=delete --config retention.ms=604800000 --config segment.ms=3600000"
}

# List all topics
list_topics() {
    log_info "Listing all topics:"
    kafka-topics.sh --bootstrap-server $KAFKA_BROKER --list | sort
}

# Describe a topic
describe_topic() {
    local topic_name=$1
    log_info "Describing topic: $topic_name"
    kafka-topics.sh --bootstrap-server $KAFKA_BROKER --describe --topic $topic_name
}

# Delete a topic (use with caution)
delete_topic() {
    local topic_name=$1
    log_warning "Deleting topic: $topic_name"
    read -p "Are you sure you want to delete topic '$topic_name'? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kafka-topics.sh --bootstrap-server $KAFKA_BROKER --delete --topic $topic_name
        log_success "Topic '$topic_name' deleted"
    else
        log_info "Topic deletion cancelled"
    fi
}

# Main function
main() {
    log_info "Starting Kafka topics creation for FarmIQ Cloud"
    
    # Check if Kafka tools are available
    check_kafka_tools
    
    # Wait for Kafka to be ready
    wait_for_kafka
    
    # Create topics
    create_topics_from_config
    
    # List all topics
    echo
    list_topics
    
    log_success "Kafka topics creation completed!"
}

# Handle command line arguments
case "${1:-}" in
    "list")
        check_kafka_tools
        wait_for_kafka
        list_topics
        ;;
    "describe")
        if [ -z "${2:-}" ]; then
            log_error "Please provide topic name: $0 describe <topic_name>"
            exit 1
        fi
        check_kafka_tools
        wait_for_kafka
        describe_topic "$2"
        ;;
    "delete")
        if [ -z "${2:-}" ]; then
            log_error "Please provide topic name: $0 delete <topic_name>"
            exit 1
        fi
        check_kafka_tools
        wait_for_kafka
        delete_topic "$2"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no command)  Create all topics from configuration"
        echo "  list          List all topics"
        echo "  describe      Describe a specific topic"
        echo "  delete        Delete a specific topic (with confirmation)"
        echo "  help          Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  KAFKA_BROKER          Kafka broker address (default: kafka:9092)"
        echo "  TOPICS_CONFIG_FILE    Topics configuration file (default: ../kafka-topics.yml)"
        echo "  WAIT_TIME             Wait time for Kafka readiness (default: 30)"
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
