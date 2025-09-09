# Analytics Alerts Service

Analytics alerts service for FarmIQ - manages and processes alerts from analytics data with real-time notifications.

## 🏗️ Architecture

- **Framework**: Express + TypeORM + PostgreSQL
- **Database**: PostgreSQL with TimescaleDB (analytics schema)
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Port**: 7306

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL with TimescaleDB extension
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Database Setup

Create the analytics schema and alerts table in PostgreSQL:

```sql
-- Connect to your PostgreSQL database
\c farmiq_cloud

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create analytics_alerts table
CREATE TABLE analytics.analytics_alerts (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    tenant_id TEXT NOT NULL,
    factory_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    metric TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    alert_time TIMESTAMPTZ NOT NULL,
    severity TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    additional_info JSONB
);

-- Create indexes for performance
CREATE INDEX idx_analytics_alerts_tenant_factory_device 
ON analytics.analytics_alerts (tenant_id, factory_id, device_id);

CREATE INDEX idx_analytics_alerts_metric_time 
ON analytics.analytics_alerts (metric, alert_time);

CREATE INDEX idx_analytics_alerts_resolved 
ON analytics.analytics_alerts (is_resolved, created_at);

CREATE INDEX idx_analytics_alerts_severity 
ON analytics.analytics_alerts (severity, created_at);
```

### 2. Environment Setup

Create `.env` file:

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=farmiq_cloud
DB_USER=postgres
DB_PASSWORD=postgres1611
DB_SCHEMA=analytics

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-here-min-16-chars
ALGORITHM=HS256

# API
DATA_SERVICE_PORT=7306
ENV=dev

# Optional: Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
LINE_NOTIFY_TOKEN=your-line-notify-token
ALERT_BACKEND=slack

# Polling
POLL_INTERVAL_SECONDS=60
```

### 3. Installation & Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Start production
npm start
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f ../../../docker-compose.apps.yml up analytics-alerts --build

# Or run standalone
docker build -t analytics-alerts .
docker run -p 7306:7306 --env-file .env analytics-alerts
```

## 🧪 Testing

### Health Checks

```bash
# Health check
curl http://localhost:7306/health

# API documentation
# Open http://localhost:7306/api-docs
```

### API Testing

```bash
# Get JWT token first (implement auth endpoint)
TOKEN="your-jwt-token-here"

# Get all alerts
curl -H "Authorization: Bearer $TOKEN" http://localhost:7306/api/alerts

# Get alerts by tenant
curl -H "Authorization: Bearer $TOKEN" http://localhost:7306/api/alerts/tenant/tenant1

# Create new alert
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "temperature_anomaly",
    "message": "Temperature exceeded threshold",
    "metadata": {"threshold": 30, "current": 35},
    "tenant_id": "tenant1",
    "factory_id": "factory1",
    "device_id": "device1",
    "metric": "temperature",
    "value": 35.5,
    "alert_time": "2024-01-01T12:00:00Z",
    "severity": "high",
    "alert_type": "threshold_exceeded"
  }' \
  http://localhost:7306/api/alerts

# Resolve alert
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  http://localhost:7306/api/alerts/1/resolve
```

### Database Testing

```sql
-- Insert test alert
INSERT INTO analytics.analytics_alerts 
(type, message, metadata, tenant_id, factory_id, device_id, metric, value, alert_time, severity, alert_type)
VALUES 
('temperature_anomaly', 'Temperature exceeded threshold', '{"threshold": 30}', 
 'tenant1', 'factory1', 'device1', 'temperature', 35.5, NOW(), 'high', 'threshold_exceeded');

-- Query alerts
SELECT * FROM analytics.analytics_alerts 
WHERE tenant_id = 'tenant1' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📊 API Endpoints

### Authentication Required

All API endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Alert Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts |
| GET | `/api/alerts/:id` | Get alert by ID |
| GET | `/api/alerts/tenant/:tenantId` | Get alerts by tenant |
| GET | `/api/alerts/tenant/:tenantId/factory/:factoryId` | Get alerts by tenant and factory |
| GET | `/api/alerts/unresolved` | Get unresolved alerts |
| POST | `/api/alerts` | Create new alert |
| PUT | `/api/alerts/:id/resolve` | Resolve alert |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api-docs` | Swagger documentation |

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `timescaledb` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `sensor_cloud_db` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `password` | Database password |
| `DB_SCHEMA` | `analytics` | Database schema |
| `DATA_SERVICE_PORT` | `7306` | API port |
| `JWT_SECRET_KEY` | - | JWT secret key (required) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `POLL_INTERVAL_SECONDS` | `60` | Polling interval |
| `SLACK_WEBHOOK_URL` | - | Slack webhook URL (optional) |
| `LINE_NOTIFY_TOKEN` | - | Line Notify token (optional) |
| `ALERT_BACKEND` | - | Notification backend (optional) |

## 🔄 Alert Processing Flow

### 1. **Alert Creation**
- Alerts created via API or internal processes
- Stored in PostgreSQL with metadata
- Assigned severity levels (low, medium, high, critical)

### 2. **Alert Management**
- Query alerts by various filters
- Resolve alerts when issues are addressed
- Track alert history and resolution times

### 3. **Notifications** (Optional)
- Send alerts to Slack webhook
- Send alerts via Line Notify
- Custom notification backends

### 4. **Monitoring**
- Health check endpoint
- Swagger documentation
- Error logging and monitoring

## 📈 Alert Types

### Severity Levels
- **low**: Informational alerts
- **medium**: Warning alerts
- **high**: Critical alerts requiring attention
- **critical**: Emergency alerts requiring immediate action

### Alert Types
- **threshold_exceeded**: Value exceeded defined threshold
- **anomaly_detected**: Statistical anomaly detected
- **device_offline**: Device connectivity issues
- **data_quality**: Data quality issues
- **system_error**: System-level errors

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database connectivity
   docker exec -it farmiq-postgres psql -U postgres -d farmiq_cloud -c "SELECT 1;"
   ```

2. **JWT Authentication Failed**
   ```bash
   # Check JWT_SECRET_KEY is set
   echo $JWT_SECRET_KEY
   ```

3. **Missing Dependencies**
   ```bash
   # Install dependencies
   npm install
   ```

4. **Port Already in Use**
   ```bash
   # Check port usage
   netstat -tulpn | grep 7306
   ```

### Debug Mode

```bash
# Enable debug logging
ENV=dev npm run dev

# Check logs
docker logs farmiq-analytics-alerts -f
```

## 📁 Project Structure

```
src/
├── configs/
│   └── config.ts           # Configuration management
├── consumers/              # Kafka consumers (if needed)
├── middlewares/
│   ├── auth.ts            # JWT authentication
│   ├── errorHandler.ts    # Error handling
│   └── validation.ts      # Input validation
├── models/
│   └── alert.model.ts     # Alert entity
├── pipelines/             # Data processing pipelines
├── routes/
│   └── alert.routes.ts    # Alert API routes
├── schemas/               # Zod validation schemas
├── services/
│   ├── alert.service.ts   # Alert business logic
│   └── notification.service.ts # Notification service
├── stores/                # Data stores
├── types/                 # TypeScript types
├── utils/
│   ├── dataSource.ts      # TypeORM configuration
│   ├── logger.ts          # Logging utilities
│   └── swagger.ts         # Swagger configuration
├── index.ts               # Application entry point
└── server.ts              # Server setup
```

## 🔒 Security

### Authentication
- JWT-based authentication
- Token validation on all protected routes
- Configurable JWT algorithm and secret

### Input Validation
- Zod schema validation
- Request sanitization
- Type safety with TypeScript

### Error Handling
- Structured error responses
- No sensitive information leakage
- Comprehensive logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the FarmIQ platform.