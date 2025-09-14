# FarmIQ Sensor Streamer Service

A high-performance sensor data streaming service built with Fastify, Prisma, and TimescaleDB for time-series data processing.

## ๐€ Features

- **Time-series Database**: Built on TimescaleDB for optimal sensor data storage
- **Fastify Framework**: High-performance web framework with built-in validation
- **Prisma ORM**: Type-safe database operations with excellent TypeScript support
- **Batch Ingestion**: Efficient bulk data processing for high-volume sensor data
- **Real-time APIs**: RESTful APIs for sensor data management
- **Swagger Documentation**: Interactive API documentation
- **Data Compression**: Automatic compression for older data
- **Retention Policies**: Configurable data retention and cleanup
- **Continuous Aggregates**: Pre-computed time-series aggregations

## ๐“ Prerequisites

- Node.js 18.18.0 or higher
- Yarn package manager
- PostgreSQL 13+ with TimescaleDB extension
- Docker (optional, for containerized PostgreSQL)

## ๐ ๏ธ Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd sensor-streamer-service

# Install dependencies
yarn install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with TimescaleDB
docker run -d \
  --name farmiq-postgres \
  -e POSTGRES_DB=farmiq_cloud \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  timescale/timescaledb:latest-pg15

# Wait for database to be ready
sleep 10
```

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL 13+ with TimescaleDB extension
2. Create database and user:

```sql
CREATE DATABASE farmiq_cloud;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE farmiq_cloud TO postgres;
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmiq_cloud?schema=sensors"

# Server
PORT=7302
NODE_ENV=development
HOST=0.0.0.0

# API Keys
ADMIN_API_KEY=admin-key

# Kafka (Optional)
KAFKA_BROKERS=localhost:9092
KAFKA_SSL=false
KAFKA_CLIENT_ID=sensor-streamer-service

# CORS
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOWED_ORIGINS=*
CORS_ALLOW_METHODS=*
CORS_ALLOW_HEADERS=*

# Logging
LOG_LEVEL=info

# Prometheus (Optional)
ENABLE_PROMETHEUS=false

# Streamer
STREAMER_INTERVAL_MS=5000
BATCH_SIZE=100
```

### 4. Database Migration and TimescaleDB Setup

#### Quick Setup (Automated)

```bash
# For Linux/macOS
chmod +x scripts/setup-timescaledb.sh
./scripts/setup-timescaledb.sh

# For Windows
scripts\setup-timescaledb.bat
```

#### Manual Setup

```bash
# 1. Generate Prisma client
yarn db:generate

# 2. Push schema to database
yarn db:push

# 3. Run TimescaleDB setup
psql -h localhost -U postgres -d farmiq_cloud -f prisma/migrations/001_timescale_setup.sql

# 4. Create helper functions
psql -h localhost -U postgres -d farmiq_cloud -f prisma/migrations/002_timescale_functions.sql
```

### 5. Start the Service

```bash
# Development mode
yarn dev

# Production mode
yarn build
yarn start
```

## ๐“ API Documentation

Once the service is running, visit:
- **Swagger UI**: http://localhost:7302/api-docs
- **Health Check**: http://localhost:7302/health

## ๐”ง Available Scripts

```bash
# Development
yarn dev              # Start in development mode with hot reload
yarn build            # Build the application
yarn start            # Start the production server

# Database
yarn db:generate      # Generate Prisma client
yarn db:push          # Push schema changes to database
yarn db:migrate       # Run database migrations
yarn db:studio        # Open Prisma Studio

# Utilities
yarn typecheck        # Run TypeScript type checking
yarn lint             # Run ESLint
```

## ๐“ Database Schema

### Tables

- **sensor_readings**: Time-series sensor data
- **sweep_readings**: Sweep operation data
- **lab_readings**: Laboratory test results
- **device_health**: Device status and health information
- **data_ingestion_logs**: Data ingestion tracking

### Hypertables

All time-series tables are converted to TimescaleDB hypertables for optimal performance:

```sql
-- View hypertables
SELECT * FROM timescaledb_information.hypertables WHERE schema_name = 'sensors';
```

### Continuous Aggregates

Pre-computed aggregations for common queries:

- **sensor_readings_hourly**: Hourly sensor data aggregations
- **sensor_readings_daily**: Daily sensor data aggregations

## ๐” Time-series Queries

### Using Prisma + Raw SQL

```typescript
// Get latest sensor reading
const latestReading = await prisma.$queryRaw`
  SELECT * FROM sensors.get_latest_sensor_reading('device_001');
`;

// Get aggregated data
const aggregatedData = await prisma.$queryRaw`
  SELECT * FROM sensors.get_aggregated_sensor_data(
    'device_001',
    'temperature',
    '1 hour'::INTERVAL,
    NOW() - INTERVAL '24 hours',
    NOW()
  );
`;

// Time-bucket queries
const hourlyData = await prisma.$queryRaw`
  SELECT 
    time_bucket('1 hour', timestamp) as bucket,
    AVG(value) as avg_value,
    MAX(value) as max_value,
    MIN(value) as min_value
  FROM sensors.sensor_readings
  WHERE device_id = 'device_001'
    AND timestamp >= NOW() - INTERVAL '24 hours'
  GROUP BY bucket
  ORDER BY bucket;
`;
```

## ๐“ Performance Optimization

### Indexes

The service automatically creates optimized indexes:

- `idx_sensor_readings_device_timestamp`: Device + timestamp queries
- `idx_sensor_readings_sensor_type_timestamp`: Sensor type + timestamp queries
- `idx_sweep_readings_device_timestamp`: Sweep data queries
- `idx_lab_readings_sample_timestamp`: Lab data queries

### Data Compression

Older data is automatically compressed:

```sql
-- Check compression status
SELECT * FROM timescaledb_information.compression_settings;
```

### Retention Policies

Data retention is automatically managed:

- **Sensor data**: 1 year retention
- **Sweep data**: 1 year retention
- **Lab data**: 1 year retention

## ๐” API Authentication

The service uses API key authentication for sensitive endpoints:

```bash
# Include API key in requests
curl -H "x-api-key: admin-key" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:7302/api/sensor-readings/batch \
     -d '[{"deviceId":"device_001","sensorType":"temperature","value":25.5,"unit":"celsius"}]'
```

## ๐“ Batch Data Ingestion

### Sensor Readings

```bash
curl -X POST http://localhost:7302/api/sensor-readings/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-key" \
  -d '[
    {
      "deviceId": "device_001",
      "sensorType": "temperature",
      "value": 25.5,
      "unit": "celsius",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]'
```

### Sweep Readings

```bash
curl -X POST http://localhost:7302/api/sweep-readings/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-key" \
  -d '[
    {
      "deviceId": "device_001",
      "sweepId": "sweep_001",
      "data": {"x": 10, "y": 20, "z": 30},
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]'
```

### Lab Readings

```bash
curl -X POST http://localhost:7302/api/lab-readings/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-key" \
  -d '[
    {
      "sampleId": "sample_001",
      "testType": "ph",
      "value": 7.2,
      "unit": "ph",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]'
```

### Device Health

```bash
curl -X POST http://localhost:7302/api/device-health/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-key" \
  -d '[
    {
      "deviceId": "device_001",
      "status": "ONLINE",
      "lastSeen": "2024-01-01T00:00:00Z",
      "batteryLevel": 85,
      "signalStrength": -45
    }
  ]'
```

## ๐”ง Maintenance

### Data Cleanup

```sql
-- Manual cleanup (keep last 365 days)
SELECT sensors.cleanup_old_data(365);

-- Check data retention policies
SELECT * FROM timescaledb_information.data_retention_policies;
```

### Monitoring

```sql
-- Check hypertable sizes
SELECT 
    hypertable_name,
    pg_size_pretty(hypertable_size) as size
FROM timescaledb_information.hypertables;

-- Check compression ratio
SELECT 
    hypertable_name,
    compression_ratio
FROM timescaledb_information.compression_settings;
```

## ๐ณ Docker Support

### Dockerfile

The service includes a Dockerfile for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 7302
CMD ["yarn", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: farmiq_cloud
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  sensor-streamer:
    build: .
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/farmiq_cloud?schema=sensors
      PORT: 7302
    ports:
      - "7302:7302"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## ๐จ Troubleshooting

### Common Issues

1. **TimescaleDB Extension Not Found**
   ```bash
   # Install TimescaleDB extension
   psql -d farmiq_cloud -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
   ```

2. **Hypertable Creation Failed**
   ```bash
   # Check if tables exist
   psql -d farmiq_cloud -c "SELECT * FROM sensors.sensor_readings LIMIT 1;"
   ```

3. **Permission Denied**
   ```bash
   # Grant necessary permissions
   psql -d farmiq_cloud -c "GRANT ALL PRIVILEGES ON SCHEMA sensors TO postgres;"
   ```

### Logs

```bash
# View service logs
yarn dev 2>&1 | tee logs/sensor-streamer.log

# View database logs (Docker)
docker logs farmiq-postgres
```

## ๐“ License

This project is licensed under the MIT License - see the LICENSE file for details.

## ๐ค Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## ๐“ Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation at http://localhost:7302/api-docs