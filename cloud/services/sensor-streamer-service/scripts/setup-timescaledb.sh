#!/bin/bash

# TimescaleDB Setup Script for FarmIQ Sensor Streamer Service
# This script sets up TimescaleDB with all necessary configurations

set -e

echo "🚀 Setting up TimescaleDB for FarmIQ Sensor Streamer Service..."

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-farmiq_cloud}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Test database connection
print_status "Testing database connection..."
export PGPASSWORD=$DB_PASSWORD
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    print_error "Cannot connect to database. Please check your connection parameters."
    exit 1
fi

# Create database if it doesn't exist
print_status "Creating database if it doesn't exist..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Database already exists"

# Run Prisma migrations first
print_status "Running Prisma migrations..."
cd "$(dirname "$0")/.."
yarn db:push

# Run TimescaleDB setup
print_status "Setting up TimescaleDB extensions and hypertables..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f prisma/migrations/001_timescale_setup.sql

# Run TimescaleDB functions
print_status "Creating TimescaleDB helper functions..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f prisma/migrations/002_timescale_functions.sql

# Verify TimescaleDB installation
print_status "Verifying TimescaleDB installation..."
TIMESCALE_VERSION=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';" | xargs)
if [ -n "$TIMESCALE_VERSION" ]; then
    print_status "TimescaleDB version $TIMESCALE_VERSION installed successfully"
else
    print_error "TimescaleDB installation failed"
    exit 1
fi

# Check hypertables
print_status "Checking hypertables..."
HYPERTABLES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM timescaledb_information.hypertables WHERE schema_name = 'sensors';" | xargs)
print_status "Found $HYPERTABLES hypertables in sensors schema"

# Check continuous aggregates
print_status "Checking continuous aggregates..."
AGGREGATES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM timescaledb_information.continuous_aggregates WHERE view_schema = 'sensors';" | xargs)
print_status "Found $AGGREGATES continuous aggregates"

print_status "🎉 TimescaleDB setup completed successfully!"
print_status "Database: $DB_NAME"
print_status "Schema: sensors"
print_status "Hypertables: $HYPERTABLES"
print_status "Continuous Aggregates: $AGGREGATES"

echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the correct DATABASE_URL"
echo "2. Run 'yarn start' to start the sensor streamer service"
echo "3. Test the API endpoints at http://localhost:7302/api-docs"
echo ""
echo "🔧 Useful TimescaleDB queries:"
echo "- View hypertables: SELECT * FROM timescaledb_information.hypertables;"
echo "- View continuous aggregates: SELECT * FROM timescaledb_information.continuous_aggregates;"
echo "- Get latest sensor reading: SELECT * FROM sensors.get_latest_sensor_reading('device_id');"

