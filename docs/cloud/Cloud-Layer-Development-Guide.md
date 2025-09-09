# FarmIQ Cloud-Layer Development Guide

## ภาพรวม (Overview)

Cloud-Layer ของ FarmIQ เป็นระบบ microservices ที่ออกแบบตาม Event-Driven Architecture โดยใช้ Apache Kafka เป็น message broker หลัก และ TimescaleDB เป็น time-series database สำหรับเก็บข้อมูล sensor และ analytics

## สถาปัตยกรรมระบบ (System Architecture)

### Core Infrastructure
- **Message Broker**: Apache Kafka (KRaft mode)
- **Time-Series Database**: TimescaleDB (PostgreSQL extension)
- **Caching**: Redis
- **Container Orchestration**: Docker Compose
- **API Documentation**: OpenAPI/Swagger (generated from Zod schemas)

### Network Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Edge Layer    │───▶│   Cloud Layer   │───▶│ Application Layer│
│                 │    │                 │    │                 │
│ • MQTT Broker   │    │ • Kafka         │    │ • React Apps    │
│ • Edge Services │    │ • Microservices │    │ • Dashboards    │
│ • Local Storage │    │ • TimescaleDB   │    │ • Management UI │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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

#### Customer Service (`customer-service`)
- **Port**: 7301
- **Technology**: Node.js + TypeScript + Express + TypeORM
- **Database**: PostgreSQL (customer schema)
- **Purpose**: Customer management and billing
- **Key Features**:
  - Customer registration and profiles
  - Subscription management
  - Billing integration
  - Plan catalog management

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

#### Analytics Stream (`analytics-stream`)
- **Port**: 7303
- **Technology**: Node.js + TypeScript + Express + KafkaJS
- **Purpose**: Real-time analytics data streaming
- **Key Features**:
  - Kafka consumer for sensor data
  - Real-time data processing
  - Redis caching for performance
  - WebSocket connections for real-time updates

#### Analytics Worker (`analytics-worker`)
- **Port**: 7304
- **Technology**: Python + FastAPI + APScheduler
- **Purpose**: Background analytics processing
- **Key Features**:
  - Kafka consumer for batch processing
  - ML model inference
  - Scheduled analytics jobs
  - Feature engineering

#### Analytics API (`analytics-api`)
- **Port**: 7305
- **Technology**: Python + FastAPI
- **Purpose**: Analytics data API
- **Key Features**:
  - REST API for analytics data
  - Data aggregation endpoints
  - Report generation
  - Dashboard data feeds

#### Analytics Alerts (`analytics-alerts`)
- **Port**: 7306
- **Technology**: Node.js + TypeScript + Express
- **Purpose**: Alert management and notifications
- **Key Features**:
  - Alert rule management
  - Real-time alert processing
  - Notification delivery
  - Alert history tracking

### 3. Business Services

#### Device Management Service (`devices-service`)
- **Purpose**: IoT device management
- **Key Features**:
  - Device registration and provisioning
  - Device health monitoring
  - Configuration management
  - Device lifecycle management

#### Farm Management Services
- **Farms Master Service** (`farms-master-service`): Farm, house, and flock management
- **Farms Operational Service** (`farms-operational-service`): Daily operations and events
- **Farm Service** (`farm-service`): General farm operations

#### Feed & Formula Services
- **Feed Service** (`feed-service`): Feed batch and quality management
- **Formula Service** (`formula-service`): Feed composition and recipes

#### Economic Service (`economic-service`)
- **Purpose**: Cost tracking and economic analysis
- **Key Features**:
  - Cost transaction recording
  - Economic metrics calculation
  - ROI analysis
  - Financial reporting

#### External Factor Service (`external-factor-service`)
- **Purpose**: External data integration
- **Key Features**:
  - Weather data integration
  - Market data integration
  - External API management
  - Data synchronization

#### Monitoring Service (`monitoring-service`)
- **Purpose**: System monitoring and health checks
- **Key Features**:
  - Service health monitoring
  - Performance metrics
  - Alert management
  - System status dashboard

## Development Patterns

### 1. Service Structure Pattern

ทุก microservice ควรมีโครงสร้างดังนี้:

```
service-name/
├── src/
│   ├── configs/           # Configuration files
│   ├── models/            # Database models (TypeORM entities)
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middlewares/       # Express middlewares
│   ├── schemas/           # Zod validation schemas
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── server.ts          # Main server file
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Database Patterns

#### Schema Organization
- **auth**: Authentication and user management
- **customer**: Customer and billing data
- **sensors**: Time-series sensor data
- **analytics**: Analytics and ML features
- **business**: Business domain data

#### TypeORM Configuration
```typescript
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: 'schema_name',
  entities: [Entity1, Entity2],
  synchronize: false, // ใช้ migration แทน
  logging: process.env.NODE_ENV === 'development'
});
```

### 3. API Patterns

#### OpenAPI Documentation
ใช้ Zod schemas เพื่อ generate OpenAPI documentation:

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
ใช้ `docker-compose.yml` หลักสำหรับ development และ production:

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
ทุก service ต้องมี health check endpoint:

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
ใช้ structured logging ด้วย Pino:

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
ใช้ Prometheus client สำหรับ metrics:

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
- **Single Responsibility**: แต่ละ service ควรมีหน้าที่เดียวที่ชัดเจน
- **Loose Coupling**: ใช้ events สำหรับ service-to-service communication
- **High Cohesion**: ข้อมูลที่เกี่ยวข้องกันควรอยู่ใน service เดียวกัน

### 2. Data Management
- **Event Sourcing**: ใช้ events เป็น source of truth
- **CQRS**: แยก command และ query operations
- **Saga Pattern**: จัดการ distributed transactions

### 3. Security
- **Authentication**: ใช้ JWT tokens
- **Authorization**: Role-based access control
- **Input Validation**: ใช้ Zod schemas
- **Rate Limiting**: ป้องกัน API abuse

### 4. Performance
- **Caching**: ใช้ Redis สำหรับ caching
- **Connection Pooling**: ใช้ connection pool สำหรับ database
- **Async Processing**: ใช้ Kafka สำหรับ heavy operations

### 5. Error Handling
- **Circuit Breaker**: ป้องกัน cascade failures
- **Retry Logic**: Retry สำหรับ transient failures
- **Dead Letter Queue**: เก็บ messages ที่ process ไม่ได้

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - ตรวจสอบ DATABASE_URL
   - ตรวจสอบ network connectivity
   - ตรวจสอบ database schema

2. **Kafka Connection Issues**
   - ตรวจสอบ KAFKA_BROKERS
   - ตรวจสอบ topic existence
   - ตรวจสอบ consumer group

3. **Service Communication Issues**
   - ตรวจสอบ service discovery
   - ตรวจสอบ network policies
   - ตรวจสอบ authentication

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

Cloud-Layer ของ FarmIQ ถูกออกแบบให้เป็นระบบ microservices ที่ scalable, maintainable และ resilient โดยใช้ modern technologies และ best practices การพัฒนาตาม guide นี้จะช่วยให้ทีมสามารถสร้างและ maintain services ได้อย่างมีประสิทธิภาพ

