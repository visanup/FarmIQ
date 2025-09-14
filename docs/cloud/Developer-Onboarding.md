# Developer Onboarding Guide

## เธขเธดเธเธ”เธตเธ•เนเธญเธเธฃเธฑเธเธชเธนเน FarmIQ Cloud Layer! ๐€

เธเธนเนเธกเธทเธญเธเธตเนเธเธฐเธเนเธงเธขเนเธซเนเธเธธเธ“เน€เธฃเธดเนเธกเธ•เนเธเธเธฒเธฃเธเธฑเธ’เธเธฒเธเธ FarmIQ Cloud Layer เนเธ”เนเธญเธขเนเธฒเธเธฃเธงเธ”เน€เธฃเนเธงเนเธฅเธฐเธกเธตเธเธฃเธฐเธชเธดเธ—เธเธดเธ เธฒเธ

## ๐“ Prerequisites

### Required Software
- **Node.js**: 18.18.0+ (LTS)
- **TypeScript**: 5.4.5+
- **Yarn**: 1.22+ (Package manager)
- **Python**: 3.11+ (เธชเธณเธซเธฃเธฑเธ Analytics services)
- **Docker**: 20.10+ เนเธฅเธฐ Docker Compose 2.0+
- **Git**: 2.40+ (Version control)
- **VS Code**: (เนเธเธฐเธเธณ) เธเธฃเนเธญเธก extensions:
  - TypeScript Importer
  - Prisma
  - Docker
  - REST Client
  - GitLens
  - Python
  - Pylint

### Database & Infrastructure
- **PostgreSQL**: 15+ (Primary database)
- **TimescaleDB**: 2.11+ (Time-series extension)
- **Redis**: 7.0+ (Caching)
- **Apache Kafka**: 3.5+ (Message broker)

### Optional but Recommended
- **Postman**: API testing
- **DBeaver**: Database management
- **RedisInsight**: Redis management
- **Kafka UI**: Kafka management
- **pgAdmin**: PostgreSQL administration

## ๐€ Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd FarmIQ
```

### 2. Environment Setup
```bash
# Copy environment template
cp cloud/.env.example cloud/.env

# Edit environment variables
nano cloud/.env
```

### 3. Start Infrastructure
```bash
# Start core infrastructure
docker-compose -f cloud/docker-compose.infra.yml up -d

# Wait for services to be ready
docker-compose -f cloud/docker-compose.infra.yml logs -f
```

### 4. Start Services
```bash
# Start all services
docker-compose -f cloud/docker-compose.yml up -d

# Or start specific service
docker-compose -f cloud/docker-compose.yml up -d auth-service
```

### 5. Verify Installation
```bash
# Check service health
curl http://localhost:7300/health  # Auth Service
curl http://localhost:7301/health  # Customer Service
curl http://localhost:7302/health  # Sensor Streamer

# Check API documentation
open http://localhost:7300/api-docs  # Auth Service API
open http://localhost:7301/api-docs  # Customer Service API
```

## ๐—๏ธ Development Workflow

### 1. Service Development

#### Create New Service
```bash
# Use service template
cp -r cloud/services/template cloud/services/my-new-service
cd cloud/services/my-new-service

# Update package.json
npm init -y
npm install express typescript @types/node ts-node-dev

# Start development
npm run dev
```

#### Modify Existing Service
```bash
# Navigate to service
cd cloud/services/auth-service

# Install dependencies
yarn install

# Start development mode
yarn dev

# Run tests
yarn test

# Build for production
yarn build
```

### 2. Database Development

#### Connect to Database
```bash
# Using psql
psql "postgresql://postgres:password@localhost:5432/farmiq_cloud"

# Using Docker
docker exec -it timescaledb psql -U postgres -d farmiq_cloud
```

#### Run Migrations
```bash
# For TypeORM services
yarn typeorm migration:run

# For Prisma services
yarn prisma migrate dev
```

#### Seed Data
```bash
# Run seed scripts
yarn seed

# Or manually
psql "postgresql://postgres:password@localhost:5432/farmiq_cloud" -f scripts/seed.sql
```

### 3. API Development

#### Test APIs
```bash
# Using curl
curl -X POST http://localhost:7300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Using REST Client (VS Code)
# Create .http files in your service directory
```

#### API Documentation
- **Swagger UI**: http://localhost:{port}/api-docs
- **OpenAPI JSON**: http://localhost:{port}/api-docs-json

### 4. Kafka Development

#### View Topics
```bash
# List all topics
docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Describe topic
docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic sensors.device.readings.v1
```

#### Produce Test Messages
```bash
# Using kafka-console-producer
docker exec -it kafka kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic sensors.device.readings.v1
```

#### Consume Messages
```bash
# Using kafka-console-consumer
docker exec -it kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic sensors.device.readings.v1 \
  --from-beginning
```

## ๐ ๏ธ Development Tools

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "humao.rest-client",
    "ms-vscode.vscode-docker",
    "prisma.prisma",
    "redhat.vscode-yaml"
  ]
}
```

### VS Code Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.env.*": "dotenv"
  }
}
```

### Git Hooks
```bash
# Install husky
yarn add -D husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "yarn lint && yarn typecheck"
```

## ๐“ Learning Resources

### Architecture Patterns
- [Microservices Patterns](https://microservices.io/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

### Technology Stack
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeORM Documentation](https://typeorm.io/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)

### Database
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Redis Documentation](https://redis.io/documentation)

## ๐”ง Common Development Tasks

### 1. Adding New API Endpoint

#### Step 1: Create Route
```typescript
// src/routes/my-route.ts
import { Router } from 'express';
import { MyController } from '../controllers/MyController';

const router = Router();
const controller = new MyController();

router.get('/my-endpoint', controller.getMyData);
router.post('/my-endpoint', controller.createMyData);

export default router;
```

#### Step 2: Create Controller
```typescript
// src/controllers/MyController.ts
import { Request, Response } from 'express';
import { MyService } from '../services/MyService';

export class MyController {
  private myService = new MyService();

  async getMyData(req: Request, res: Response) {
    try {
      const data = await this.myService.getMyData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

#### Step 3: Create Service
```typescript
// src/services/MyService.ts
import { MyRepository } from '../repositories/MyRepository';

export class MyService {
  private myRepository = new MyRepository();

  async getMyData() {
    return await this.myRepository.findAll();
  }
}
```

#### Step 4: Add Validation
```typescript
// src/schemas/my-schemas.ts
import { z } from 'zod';

export const MyDataSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export type MyData = z.infer<typeof MyDataSchema>;
```

### 2. Adding Database Entity

#### Step 1: Create Entity
```typescript
// src/entities/MyEntity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('my_entities')
export class MyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Step 2: Create Migration
```bash
yarn typeorm migration:generate -n CreateMyEntity
```

#### Step 3: Run Migration
```bash
yarn typeorm migration:run
```

### 3. Adding Kafka Consumer

#### Step 1: Create Consumer
```typescript
// src/consumers/MyConsumer.ts
import { Kafka, Consumer } from 'kafkajs';

export class MyConsumer {
  private consumer: Consumer;

  constructor(private kafka: Kafka) {
    this.consumer = this.kafka.consumer({ groupId: 'my-group' });
  }

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'my.topic', fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value?.toString() || '{}');
        await this.handleMessage(data);
      },
    });
  }

  private async handleMessage(data: any) {
    // Process message
    console.log('Processing message:', data);
  }
}
```

### 4. Adding Tests

#### Unit Test
```typescript
// src/tests/MyService.test.ts
import { MyService } from '../services/MyService';

describe('MyService', () => {
  let myService: MyService;

  beforeEach(() => {
    myService = new MyService();
  });

  it('should return data', async () => {
    const result = await myService.getMyData();
    expect(result).toBeDefined();
  });
});
```

#### Integration Test
```typescript
// src/tests/api.test.ts
import request from 'supertest';
import app from '../app';

describe('API Tests', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });
});
```

## ๐ Debugging

### Service Logs
```bash
# View service logs
docker-compose logs -f auth-service

# View specific service logs
docker-compose logs -f --tail=100 auth-service
```

### Database Debugging
```sql
-- Check connections
SELECT * FROM pg_stat_activity;

-- Check locks
SELECT * FROM pg_locks;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Kafka Debugging
```bash
# Check consumer groups
docker exec -it kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --list

# Check consumer lag
docker exec -it kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group my-group \
  --describe
```

## ๐“ Code Style Guidelines

### TypeScript
- เนเธเน strict mode
- เนเธเน interfaces เธชเธณเธซเธฃเธฑเธ object types
- เนเธเน enums เธชเธณเธซเธฃเธฑเธ constants
- เนเธเน type guards เธชเธณเธซเธฃเธฑเธ runtime checks

### Naming Conventions
- **Files**: kebab-case (my-service.ts)
- **Classes**: PascalCase (MyService)
- **Functions**: camelCase (getMyData)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Database**: snake_case (my_table)

### Error Handling
```typescript
// Use custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Use try-catch blocks
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  if (error instanceof AppError) {
    throw error;
  }
  throw new AppError(500, 'Internal server error');
}
```

## ๐€ Deployment

### Local Development
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d auth-service

# Scale service
docker-compose up -d --scale auth-service=3
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## ๐“ Getting Help

### Internal Resources
- **Slack**: #farmiq-dev
- **Wiki**: [Internal Wiki](https://wiki.farmiq.com)
- **Jira**: [Project Management](https://farmiq.atlassian.net)

### External Resources
- **Stack Overflow**: [farmiq tag](https://stackoverflow.com/questions/tagged/farmiq)
- **GitHub Issues**: [Repository Issues](https://github.com/farmiq/issues)

### Code Review Process
1. Create feature branch
2. Make changes
3. Write tests
4. Create pull request
5. Request review
6. Address feedback
7. Merge to main

---

*เน€เธญเธเธชเธฒเธฃเธเธตเนเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”: 2024-01-15*
