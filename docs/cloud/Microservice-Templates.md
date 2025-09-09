# Microservice Templates

## Node.js + TypeScript Service Template

### Project Structure
```
service-name/
├── src/
│   ├── configs/
│   │   └── config.ts
│   ├── models/
│   │   └── entity.model.ts
│   ├── routes/
│   │   └── api.route.ts
│   ├── services/
│   │   └── business.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── validate.middleware.ts
│   ├── schemas/
│   │   └── validation.schemas.ts
│   ├── types/
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── dataSource.ts
│   │   ├── kafka.ts
│   │   ├── logger.ts
│   │   └── openapi.ts
│   └── server.ts
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

### package.json Template
```json
{
  "name": "@farmiq/service-name",
  "version": "1.0.0",
  "private": true,
  "description": "Service description",
  "scripts": {
    "dev": "ts-node-dev --transpile-only --respawn src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts || echo \"skip\""
  },
  "dependencies": {
    "@asteasolutions/zod-to-openapi": "^6.2.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "kafkajs": "^2.2.4",
    "morgan": "^1.10.0",
    "pg": "^8.11.5",
    "reflect-metadata": "^0.1.14",
    "swagger-ui-express": "^5.0.1",
    "typeorm": "^0.3.20",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan": "^1.9.4",
    "@types/node": "^20.12.7",
    "@types/swagger-ui-express": "^4.1.8",
    "@typescript-eslint/eslint-plugin": "^7.8.0",
    "@typescript-eslint/parser": "^7.8.0",
    "eslint": "^8.57.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.5"
  },
  "engines": {
    "node": ">=18.18.0"
  }
}
```

### server.ts Template
```typescript
import 'reflect-metadata';
import express, { Application, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { PORT } from './configs/config';
import { AppDataSource } from './utils/dataSource';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { openApiDoc } from './utils/openapi';

async function start() {
  await AppDataSource.initialize();
  console.log('✅ DataSource initialized');

  const app: Application = express();
  app.set('trust proxy', true);

  // Security middleware
  app.use(helmet());
  app.use(cors({ 
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || true, 
    credentials: true, 
    exposedHeaders: ['X-Request-Id'] 
  }));

  // Performance middleware
  const compressionMw: RequestHandler = compression() as unknown as RequestHandler;
  app.use(compressionMw);
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined'));

  // Health checks
  app.get('/health', (_req: Request, res: Response) => res.sendStatus(200));
  app.get('/ready', (_req: Request, res: Response) =>
    AppDataSource.isInitialized ? res.sendStatus(200) : res.sendStatus(503)
  );

  // API Documentation
  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
  const doc = { ...openApiDoc, servers: [{ url: baseUrl }] };
  const serveHandlers = swaggerUi.serve as unknown as RequestHandler[];
  const setupHandler = swaggerUi.setup(doc, { explorer: true }) as unknown as RequestHandler;
  app.use('/api-docs', ...serveHandlers, setupHandler);

  // API Routes
  app.use('/api', apiRouter);

  // Error handling
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`🚀 service-name listening on ${baseUrl}`);
    console.log(`📖 OpenAPI docs: ${baseUrl}/api-docs`);
  });

  // Graceful shutdown
  const shutdown = (sig: string) => {
    console.log(`⚡ Shutting down on ${sig}...`);
    server.close(async () => {
      try {
        await AppDataSource.destroy();
        console.log('✅ DataSource destroyed');
      } finally {
        process.exit(0);
      }
    });
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('❌ Server bootstrap failed:', err);
  process.exit(1);
});
```

### config.ts Template
```typescript
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.string().transform(Number).default('7300'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  DB_SCHEMA: z.string().default('public'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_SSL: z.string().transform(val => val === 'true').default(false),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(1),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const config = configSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  DB_SCHEMA,
  KAFKA_BROKERS,
  KAFKA_SSL,
  REDIS_URL,
  JWT_SECRET,
  CORS_ALLOWED_ORIGINS,
  LOG_LEVEL,
} = config;
```

### dataSource.ts Template
```typescript
import { DataSource } from 'typeorm';
import { DATABASE_URL, DB_SCHEMA } from '../configs/config';
import { Entity1, Entity2 } from '../models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  schema: DB_SCHEMA,
  entities: [Entity1, Entity2],
  synchronize: false, // Use migrations instead
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
```

### Dockerfile Template
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Remove dev dependencies
RUN yarn install --production && yarn cache clean

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 7300

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http=require('http');http.get('http://localhost:7300/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the application
CMD ["node", "dist/server.js"]
```

## Python + FastAPI Service Template

### Project Structure
```
service-name/
├── src/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── entity.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── api.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── business.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── validation.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── database.py
│   │       └── kafka.py
│   └── tests/
│       ├── __init__.py
│       └── test_api.py
├── Dockerfile
├── requirements.txt
├── pyproject.toml
└── README.md
```

### requirements.txt Template
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
alembic==1.13.0
psycopg2-binary==2.9.9
kafka-python==2.0.2
redis==5.0.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
```

### main.py Template
```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import api
from app.utils.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Service Name API",
    description="Service description",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "service-name"}

# Include routers
app.include_router(api.router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 7300)),
        reload=os.getenv("ENV", "development") == "development"
    )
```

### config.py Template
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Server
    PORT: int = 7300
    ENV: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # Kafka
    KAFKA_BROKERS: str = "localhost:9092"
    KAFKA_SSL: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## React + TypeScript Frontend Template

### Project Structure
```
app-name/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── features/
│   │       └── FeatureName/
│   │           ├── FeatureName.tsx
│   │           ├── FeatureNameList.tsx
│   │           └── FeatureNameForm.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   └── dataService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useWebSocket.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validation.ts
│   ├── theme.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### package.json Template
```json
{
  "name": "app-name",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^7.2.0",
    "@mui/material": "^7.2.0",
    "@mui/x-charts": "^8.5.3",
    "@mui/x-data-grid": "^8.5.3",
    "@mui/x-date-pickers": "^8.5.3",
    "axios": "^1.10.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.3",
    "socket.io-client": "^4.8.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.29.0",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@types/react-router-dom": "^5.3.3",
    "@vitejs/plugin-react": "^4.5.2",
    "eslint": "^9.29.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.2.0",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.34.1",
    "vite": "^7.0.0"
  }
}
```

### vite.config.ts Template
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7300',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

## Docker Compose Service Template

```yaml
service-name:
  build:
    context: ./services/service-name
    dockerfile: Dockerfile
  container_name: service-name
  restart: unless-stopped
  ports:
    - "${SERVICE_PORT:-7300}:7300"
  env_file:
    - .env
  environment:
    DATABASE_URL: "postgresql://${DB_USER}:${DB_PASSWORD}@timescaledb:5432/${DB_NAME}"
    KAFKA_BROKERS: "kafka:9092"
    REDIS_URL: "redis://redis:6379"
    NODE_ENV: "production"
  networks: [farm_cloud]
  depends_on:
    timescaledb:
      condition: service_healthy
    kafka:
      condition: service_started
    redis:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "node", "-e", "http=require('http');http.get('http://localhost:7300/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]
    interval: 10s
    timeout: 10s
    retries: 5
    start_period: 10s
```

## Environment Variables Template

```bash
# Service Configuration
SERVICE_PORT=7300
NODE_ENV=development
LOG_LEVEL=info

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

# Security
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE_MINUTES=30

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOW_CREDENTIALS=true

# External APIs
EXTERNAL_API_BASE_URL=https://api.example.com
EXTERNAL_API_KEY=your_api_key
```

These templates provide a solid foundation for creating new microservices and frontend applications that follow the established patterns in the FarmIQ Cloud-Layer architecture.

