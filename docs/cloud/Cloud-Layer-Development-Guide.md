# FarmIQ Cloud-Layer Development Guide

## เธ เธฒเธเธฃเธงเธก (Overview)

Cloud-Layer เธเธญเธ FarmIQ เน€เธเนเธเธฃเธฐเธเธ microservices เธ—เธตเนเธญเธญเธเนเธเธเธ•เธฒเธก Event-Driven Architecture เนเธ”เธขเนเธเน Apache Kafka เน€เธเนเธ message broker เธซเธฅเธฑเธ เนเธฅเธฐ TimescaleDB เน€เธเนเธ time-series database เธชเธณเธซเธฃเธฑเธเน€เธเนเธเธเนเธญเธกเธนเธฅ sensor เนเธฅเธฐ analytics

## เธชเธ–เธฒเธเธฑเธ•เธขเธเธฃเธฃเธกเธฃเธฐเธเธ (System Architecture)

### Core Infrastructure
- **Message Broker**: Apache Kafka (KRaft mode)
- **Time-Series Database**: TimescaleDB (PostgreSQL extension)
- **Caching**: Redis
- **Container Orchestration**: Docker Compose
- **API Documentation**: OpenAPI/Swagger (generated from Zod schemas)

### Network Architecture
```
โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
โ”   Edge Layer    โ”โ”€โ”€โ”€โ–ถโ”   Cloud Layer   โ”โ”€โ”€โ”€โ–ถโ” Application Layerโ”
โ”                 โ”    โ”                 โ”    โ”                 โ”
โ” โ€ข MQTT Broker   โ”    โ” โ€ข Kafka         โ”    โ” โ€ข React Apps    โ”
โ” โ€ข Edge Services โ”    โ” โ€ข Microservices โ”    โ” โ€ข Dashboards    โ”
โ” โ€ข Local Storage โ”    โ” โ€ข TimescaleDB   โ”    โ” โ€ข Management UI โ”
โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
```

## Microservices Architecture

### 1. Core Services

#### Authentication Service (`auth-service`)
- **Port**: 7300
- **Technology**: Node.js + TypeScript + Express + TypeORM
- **Database**: PostgreSQL (auth schema)
- **Purpose**: JWT token management, user authentication
- **Key Features**:
  - JWT token generation and validation
  - Refresh token management
  - User registration and login
  - Role-based access control

#### Master Service (`master-service`) - NEW
- **Port**: 7301
- **Technology**: Node.js + TypeScript + Fastify + Prisma
- **Database**: PostgreSQL (master schema)
- **Purpose**: Centralized business data management
- **Key Features**:
  - Customer management and profiles
  - Farm and house management
  - Device and sensor management
  - Feed and formula management
  - Economic data tracking
  - External factor integration
  - Multi-tenant data isolation

#### Sensor Streamer Service (`sensor-streamer-service`)
- **Port**: 7302
- **Technology**: Node.js + TypeScript + Express + TypeORM
- **Database**: TimescaleDB (sensors schema)
- **Purpose**: Real-time sensor data ingestion and streaming
- **Key Features**:
  - HTTP REST API for sensor data ingestion
  - Kafka producer for real-time streaming
  - Time-series data storage
  - Data validation and transformation

### 2. Analytics Services

#### Monitoring Service (`monitoring-service`)
- **Port**: 7303
- **Technology**: Node.js + TypeScript + Express
- **Purpose**: System monitoring and health checks
- **Key Features**:
  - Service health monitoring
  - Performance metrics
  - Alert management
  - System status dashboard
  - Log aggregation

#### Analytics Stream (`analytics-stream`)
- **Port**: 7304
- **Technology**: Node.js + TypeScript + Express + KafkaJS
- **Purpose**: Real-time analytics data streaming
- **Key Features**:
  - Kafka consumer for sensor data
  - Real-time data processing
  - Redis caching for performance
  - WebSocket connections for real-time updates

#### Analytics Worker (`analytics-worker`)
- **Port**: 7305
- **Technology**: Python + FastAPI + APScheduler
- **Purpose**: Background analytics processing
- **Key Features**:
  - Kafka consumer for batch processing
  - ML model inference
  - Scheduled analytics jobs
  - Feature engineering

#### Analytics API (`analytics-api`)
- **Port**: 7306
- **Technology**: Python + FastAPI
- **Purpose**: Analytics data API
- **Key Features**:
  - REST API for analytics data
  - Data aggregation endpoints
  - Report generation
  - Dashboard data feeds

#### Analytics Alerts (`analytics-alerts`)
- **Port**: 7307
- **Technology**: Node.js + TypeScript + Express
- **Purpose**: Alert management and notifications
- **Key Features**:
  - Alert rule management
  - Real-time alert processing
  - Notification delivery
  - Alert history tracking

### 3. Business Services

**Note**: All business services have been consolidated into the Master Service for better performance and maintainability.

#### Master Service (`master-service`)
- **Purpose**: Centralized business data management
- **Key Features**:
  - Customer management and profiles
  - Farm and house management
  - Device and sensor management
  - Feed and formula management
  - Economic data tracking
  - External factor integration
  - Multi-tenant data isolation

## Development Patterns

### 1. Service Structure Pattern

เธ—เธธเธ microservice เธเธงเธฃเธกเธตเนเธเธฃเธเธชเธฃเนเธฒเธเธ”เธฑเธเธเธตเน:

```
service-name/
โ”โ”€โ”€ src/
โ”   โ”โ”€โ”€ configs/           # Configuration files
โ”   โ”โ”€โ”€ models/            # Database models (TypeORM entities)
โ”   โ”โ”€โ”€ routes/            # API routes
โ”   โ”โ”€โ”€ services/          # Business logic
โ”   โ”โ”€โ”€ middlewares/       # Express middlewares
โ”   โ”โ”€โ”€ schemas/           # Zod validation schemas
โ”   โ”โ”€โ”€ types/             # TypeScript type definitions
โ”   โ”โ”€โ”€ utils/             # Utility functions
โ”   โ””โ”€โ”€ server.ts          # Main server file
โ”โ”€โ”€ Dockerfile
โ”โ”€โ”€ package.json
โ”โ”€โ”€ tsconfig.json
โ””โ”€โ”€ README.md
```

### 2. Database Patterns

#### Schema Organization
- **auth**: Authentication and user management
- **master**: All business data (Customer, Farm, Device, Feed, Formula, Economic, External Factor)
- **sensors**: Time-series sensor data
- **analytics**: Analytics and ML features

#### TypeORM Configuration
```typescript
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: 'schema_name',
  entities: [Entity1, Entity2],
  synchronize: false, // เนเธเน migration เนเธ—เธ
  logging: process.env.NODE_ENV === 'development'
});
```

### 3. API Patterns

#### OpenAPI Documentation
เนเธเน Zod schemas เน€เธเธทเนเธญ generate OpenAPI documentation:

```typescript
import { z } from 'zod';
import { createDocument } from 'zod-to-openapi';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1)
});

const openApiDoc = createDocument({
  openapi: '3.0.0',
  info: {
    title: 'Service API',
    version: '1.0.0'
  },
  paths: {
    '/users': {
      get: {
        responses: {
          200: {
            description: 'List users',
            content: {
              'application/json': {
                schema: UserSchema
              }
            }
          }
        }
      }
    }
  }
});
```

#### Error Handling
```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }
  
  // Log error and return generic message
  console.error(err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
  });
};
```

### 4. Kafka Integration Patterns

#### Producer Pattern
```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'service-name',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
});

const producer = kafka.producer();

export const publishEvent = async (topic: string, message: any) => {
  await producer.send({
    topic,
    messages: [{
      key: message.id,
      value: JSON.stringify(message),
      timestamp: Date.now().toString()
    }]
  });
};
```

#### Consumer Pattern
```typescript
const consumer = kafka.consumer({ groupId: 'service-group' });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'topic-name' });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value?.toString() || '{}');
      // Process message
    }
  });
};
```

### 5. Frontend Integration Patterns

#### API Client Pattern
```typescript
// services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### Service Layer Pattern
```typescript
// services/userService.ts
import apiClient from './apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  }
};
```

## Kafka Topics Structure

### Sensor Data Topics
- `sensors.device.readings.v1`: Device sensor readings
- `sensors.device.health.v1`: Device health status
- `sensors.lab.readings.v1`: Laboratory sensor data
- `sensors.sweep.readings.v1`: Sweep sensor data

### Master Data Topics (Compact)
- `devices.device.snapshot.v1`: Device master data
- `farms.farm.snapshot.v1`: Farm master data
- `farms.house.snapshot.v1`: House master data
- `farms.flock.snapshot.v1`: Flock master data
- `formula.recipe.snapshot.v1`: Recipe master data

### Operational Data Topics
- `farms.operational.event.v1`: Farm operational events
- `feed.batch.created.v1`: Feed batch events
- `feed.quality.result.v1`: Feed quality results
- `economics.cost.txn.v1`: Cost transactions
- `external.weather.observation.v1`: Weather data

### Analytics Topics
- `analytics.features.materialized.v1`: ML features
- `analytics.prediction.v1`: ML predictions
- `analytics.anomaly.v1`: Anomaly detection results

## Development Workflow

### 1. Service Development
1. **Create service structure** following the standard pattern
2. **Define database models** using TypeORM entities
3. **Create Zod schemas** for validation and OpenAPI generation
4. **Implement business logic** in service classes
5. **Create API routes** with proper error handling
6. **Add Kafka integration** for event publishing/consuming
7. **Write tests** for critical functionality
8. **Update Docker configuration**

### 2. Frontend Development
1. **Create React application** using Vite
2. **Set up Material-UI** for consistent UI components
3. **Implement API client** with proper error handling
4. **Create service layers** for API integration
5. **Add routing** with React Router
6. **Implement state management** (Context API or Redux)
7. **Add real-time features** using WebSocket or Server-Sent Events

### 3. Integration Testing
1. **Test service-to-service communication** via Kafka
2. **Test API endpoints** with proper authentication
3. **Test frontend-backend integration**
4. **Test real-time data flow** from sensors to dashboards

## Environment Configuration

### Required Environment Variables
```bash
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=farmiq_cloud
DATABASE_URL=postgresql://postgres:password@timescaledb:5432/farmiq_cloud

# Kafka
KAFKA_BROKERS=kafka:9092
KAFKA_SSL=false

# Redis
REDIS_URL=redis://redis:6379

# Service Ports
AUTH_PORT=7300
CUSTOMER_SERVICE_PORT=7301
SENSOR_STREAMER_PORT=7302
# ... other service ports

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOW_CREDENTIALS=true
```

## Deployment

### Docker Compose
เนเธเน `docker-compose.yml` เธซเธฅเธฑเธเธชเธณเธซเธฃเธฑเธ development เนเธฅเธฐ production:

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d auth-service

# View logs
docker-compose logs -f service-name

# Scale service
docker-compose up -d --scale analytics-worker=3
```

### Health Checks
เธ—เธธเธ service เธ•เนเธญเธเธกเธต health check endpoint:

```typescript
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'service-name', 
    time: new Date().toISOString() 
  });
});
```

## Monitoring and Observability

### Logging
เนเธเน structured logging เธ”เนเธงเธข Pino:

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

logger.info({ userId: '123', action: 'login' }, 'User logged in');
```

### Metrics
เนเธเน Prometheus client เธชเธณเธซเธฃเธฑเธ metrics:

```typescript
import { register, Counter, Histogram } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
});
```

## Best Practices

### 1. Service Design
- **Single Responsibility**: เนเธ•เนเธฅเธฐ service เธเธงเธฃเธกเธตเธซเธเนเธฒเธ—เธตเนเน€เธ”เธตเธขเธงเธ—เธตเนเธเธฑเธ”เน€เธเธ
- **Loose Coupling**: เนเธเน events เธชเธณเธซเธฃเธฑเธ service-to-service communication
- **High Cohesion**: เธเนเธญเธกเธนเธฅเธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธเธเธฑเธเธเธงเธฃเธญเธขเธนเนเนเธ service เน€เธ”เธตเธขเธงเธเธฑเธ

### 2. Data Management
- **Event Sourcing**: เนเธเน events เน€เธเนเธ source of truth
- **CQRS**: เนเธขเธ command เนเธฅเธฐ query operations
- **Saga Pattern**: เธเธฑเธ”เธเธฒเธฃ distributed transactions

### 3. Security
- **Authentication**: เนเธเน JWT tokens
- **Authorization**: Role-based access control
- **Input Validation**: เนเธเน Zod schemas
- **Rate Limiting**: เธเนเธญเธเธเธฑเธ API abuse

### 4. Performance
- **Caching**: เนเธเน Redis เธชเธณเธซเธฃเธฑเธ caching
- **Connection Pooling**: เนเธเน connection pool เธชเธณเธซเธฃเธฑเธ database
- **Async Processing**: เนเธเน Kafka เธชเธณเธซเธฃเธฑเธ heavy operations

### 5. Error Handling
- **Circuit Breaker**: เธเนเธญเธเธเธฑเธ cascade failures
- **Retry Logic**: Retry เธชเธณเธซเธฃเธฑเธ transient failures
- **Dead Letter Queue**: เน€เธเนเธ messages เธ—เธตเน process เนเธกเนเนเธ”เน

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - เธ•เธฃเธงเธเธชเธญเธ DATABASE_URL
   - เธ•เธฃเธงเธเธชเธญเธ network connectivity
   - เธ•เธฃเธงเธเธชเธญเธ database schema

2. **Kafka Connection Issues**
   - เธ•เธฃเธงเธเธชเธญเธ KAFKA_BROKERS
   - เธ•เธฃเธงเธเธชเธญเธ topic existence
   - เธ•เธฃเธงเธเธชเธญเธ consumer group

3. **Service Communication Issues**
   - เธ•เธฃเธงเธเธชเธญเธ service discovery
   - เธ•เธฃเธงเธเธชเธญเธ network policies
   - เธ•เธฃเธงเธเธชเธญเธ authentication

### Debug Commands

```bash
# Check service health
curl http://localhost:7300/health

# Check Kafka topics
docker-compose exec kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check database connection
docker-compose exec timescaledb psql -U postgres -d farmiq_cloud

# View service logs
docker-compose logs -f --tail=100 service-name
```

## Conclusion

Cloud-Layer เธเธญเธ FarmIQ เธ–เธนเธเธญเธญเธเนเธเธเนเธซเนเน€เธเนเธเธฃเธฐเธเธ microservices เธ—เธตเน scalable, maintainable เนเธฅเธฐ resilient เนเธ”เธขเนเธเน modern technologies เนเธฅเธฐ best practices เธเธฒเธฃเธเธฑเธ’เธเธฒเธ•เธฒเธก guide เธเธตเนเธเธฐเธเนเธงเธขเนเธซเนเธ—เธตเธกเธชเธฒเธกเธฒเธฃเธ–เธชเธฃเนเธฒเธเนเธฅเธฐ maintain services เนเธ”เนเธญเธขเนเธฒเธเธกเธตเธเธฃเธฐเธชเธดเธ—เธเธดเธ เธฒเธ

