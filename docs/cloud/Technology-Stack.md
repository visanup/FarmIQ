# FarmIQ Cloud Layer - Technology Stack

## เธ เธฒเธเธฃเธงเธกเน€เธ—เธเนเธเนเธฅเธขเธต

FarmIQ Cloud Layer เนเธเนเน€เธ—เธเนเธเนเธฅเธขเธตเธ—เธตเนเธ—เธฑเธเธชเธกเธฑเธขเนเธฅเธฐเน€เธซเธกเธฒเธฐเธชเธกเธชเธณเธซเธฃเธฑเธเธเธฒเธฃเธชเธฃเนเธฒเธเธฃเธฐเธเธ microservices เธ—เธตเน scalable เนเธฅเธฐ maintainable

## Backend Technologies

### Core Runtime & Language
- **Node.js**: 18.18.0+ (LTS)
- **TypeScript**: 5.4.5+ (Strict mode)
- **Python**: 3.11+ (เธชเธณเธซเธฃเธฑเธ Analytics services)
- **Yarn**: 1.22+ (Package manager)

### Web Frameworks

#### Node.js Services
- **Express.js**: 4.19.2+ (Web framework)
- **Fastify**: 4.24.3+ (High-performance framework เธชเธณเธซเธฃเธฑเธ Sensor Streamer)
- **Helmet**: 7.0.0+ (Security middleware)
- **CORS**: 2.8.5+ (Cross-origin resource sharing)
- **Morgan**: 1.10.0+ (HTTP request logger)
- **Compression**: 1.7.4+ (Response compression)

#### Python Services
- **FastAPI**: 0.104.1+ (Modern web framework)
- **Uvicorn**: 0.24.0+ (ASGI server)
- **Pydantic**: 2.5.0+ (Data validation)

### Database & ORM

#### Database
- **PostgreSQL**: 15+ (Primary database)
- **TimescaleDB**: 2.11+ (Time-series extension)
- **Redis**: 7.0+ (Caching & session storage)

#### ORM & Database Tools
- **TypeORM**: 0.3.20+ (Node.js ORM)
- **Prisma**: 5.7.0+ (Modern database toolkit เธชเธณเธซเธฃเธฑเธ Sensor Streamer)
- **SQLAlchemy**: 2.0.23+ (Python ORM)
- **Alembic**: 1.13.0+ (Database migration tool)

### Message Queue & Streaming
- **Apache Kafka**: 3.5+ (Message broker)
- **KafkaJS**: 2.2.4+ (Node.js Kafka client)
- **confluent-kafka**: 2.0.2+ (Python Kafka client)

### Authentication & Security
- **JSON Web Tokens (JWT)**: 9.0.2+ (Authentication)
- **bcrypt**: 5.1.1+ (Password hashing)
- **passlib**: 1.7.4+ (Python password hashing)
- **python-jose**: 3.3.0+ (Python JWT handling)

### Data Validation & Serialization
- **Zod**: 3.23.8+ (TypeScript schema validation)
- **@asteasolutions/zod-to-openapi**: 6.2.0+ (OpenAPI generation)
- **Pydantic**: 2.5.0+ (Python data validation)

### API Documentation
- **Swagger UI**: 5.0.1+ (API documentation)
- **swagger-jsdoc**: 6.2.8+ (JSDoc to Swagger)
- **@asteasolutions/zod-to-openapi**: 6.2.0+ (Zod to OpenAPI)

### Monitoring & Observability
- **Prometheus**: 2.45+ (Metrics collection)
- **Grafana**: 10.0+ (Visualization)
- **Pino**: 8.16.0+ (Structured logging)
- **prom-client**: 15.0.0+ (Prometheus metrics)

### Development Tools
- **ts-node-dev**: 2.0.0+ (Development server)
- **ESLint**: 8.57.0+ (Code linting)
- **Prettier**: 3.0.0+ (Code formatting)
- **TypeScript**: 5.4.5+ (Type checking)

## Frontend Technologies

### Core Framework
- **React**: 19.1.0+ (UI library)
- **TypeScript**: 5.8.3+ (Type safety)
- **Vite**: 7.0.0+ (Build tool)

### UI Components
- **Material-UI (MUI)**: 7.2.0+ (Component library)
- **@mui/icons-material**: 7.2.0+ (Icons)
- **@mui/x-charts**: 8.5.3+ (Charts)
- **@mui/x-data-grid**: 8.5.3+ (Data tables)
- **@mui/x-date-pickers**: 8.5.3+ (Date pickers)

### State Management & Data Fetching
- **React Router**: 7.6.3+ (Routing)
- **Axios**: 1.10.0+ (HTTP client)
- **Socket.io-client**: 4.8.2+ (WebSocket client)
- **@tanstack/react-query**: 5.0.0+ (Data fetching & caching)

### Styling
- **@emotion/react**: 11.14.0+ (CSS-in-JS)
- **@emotion/styled**: 11.14.1+ (Styled components)

## Infrastructure & DevOps

### Containerization
- **Docker**: 20.10+ (Containerization)
- **Docker Compose**: 2.0+ (Multi-container orchestration)

### Reverse Proxy & Load Balancing
- **Nginx**: 1.24+ (Reverse proxy)
- **nginx.conf**: Custom configuration

### Database Management
- **pgAdmin**: 7.0+ (PostgreSQL administration)
- **RedisInsight**: 2.0+ (Redis management)
- **Kafka UI**: 0.4+ (Kafka management)

### CI/CD & Version Control
- **Git**: 2.40+ (Version control)
- **GitHub Actions**: (CI/CD pipeline)
- **Docker Hub**: (Container registry)

## Service-Specific Technology Stack

### Authentication Service
```json
{
  "runtime": "Node.js 18.18.0",
  "framework": "Express.js 4.19.2",
  "orm": "TypeORM 0.3.20",
  "database": "PostgreSQL 15",
  "validation": "Zod 3.23.8",
  "auth": "JWT 9.0.2 + bcrypt 5.1.1",
  "docs": "Swagger UI 5.0.1"
}
```

### Customer Service
```json
{
  "runtime": "Node.js 18.18.0",
  "framework": "Express.js 4.19.2",
  "orm": "TypeORM 0.3.20",
  "database": "PostgreSQL 15",
  "validation": "Zod 3.23.8",
  "auth": "JWT middleware",
  "docs": "OpenAPI 3.0"
}
```

### Sensor Streamer Service
```json
{
  "runtime": "Node.js 18.18.0",
  "framework": "Fastify 4.24.3",
  "orm": "Prisma 5.7.0",
  "database": "TimescaleDB 2.11",
  "validation": "Fastify schemas",
  "streaming": "KafkaJS 2.2.4",
  "docs": "Swagger UI 5.0.1"
}
```

### Analytics Platform
```json
{
  "analytics-stream": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "streaming": "KafkaJS 2.2.4",
    "cache": "Redis 7.0",
    "websocket": "Socket.io 4.8.2"
  },
  "analytics-worker": {
    "runtime": "Python 3.11",
    "framework": "FastAPI 0.104.1",
    "orm": "SQLAlchemy 2.0.23",
    "database": "TimescaleDB 2.11",
    "streaming": "confluent-kafka 2.0.2",
    "scheduler": "APScheduler 3.10.4"
  },
  "analytics-api": {
    "runtime": "Python 3.11",
    "framework": "FastAPI 0.104.1",
    "orm": "SQLAlchemy 2.0.23",
    "database": "TimescaleDB 2.11",
    "validation": "Pydantic 2.5.0"
  },
  "analytics-alerts": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "database": "PostgreSQL 15",
    "notifications": "Slack API, Email SMTP"
  }
}
```

### Device Management Service
```json
{
  "runtime": "Node.js 18.18.0",
  "framework": "Express.js 4.19.2",
  "orm": "TypeORM 0.3.20",
  "database": "PostgreSQL 15",
  "validation": "Zod 3.23.8",
  "streaming": "KafkaJS 2.2.4"
}
```

### Farm Management Services
```json
{
  "farms-master": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "orm": "TypeORM 0.3.20",
    "database": "PostgreSQL 15",
    "streaming": "KafkaJS 2.2.4"
  },
  "farms-operational": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "orm": "TypeORM 0.3.20",
    "database": "PostgreSQL 15",
    "streaming": "KafkaJS 2.2.4"
  },
  "farm-service": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "orm": "TypeORM 0.3.20",
    "database": "PostgreSQL 15"
  }
}
```

### Feed & Formula Services
```json
{
  "feed-service": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "orm": "TypeORM 0.3.20",
    "database": "PostgreSQL 15",
    "streaming": "KafkaJS 2.2.4"
  },
  "formula-service": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "orm": "TypeORM 0.3.20",
    "database": "PostgreSQL 15",
    "streaming": "KafkaJS 2.2.4"
  }
}
```

### Economic & External Factor Services
```json
{
  "economic-service": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "orm": "TypeORM 0.3.20",
    "database": "PostgreSQL 15",
    "streaming": "KafkaJS 2.2.4"
  },
  "external-factor-service": {
    "runtime": "Node.js 18.18.0",
    "framework": "Express.js 4.19.2",
    "orm": "TypeORM 0.3.20",
    "database": "PostgreSQL 15",
    "streaming": "KafkaJS 2.2.4"
  }
}
```

### Monitoring Service
```json
{
  "runtime": "Node.js 18.18.0",
  "framework": "Express.js 4.19.2",
  "monitoring": "Prometheus 2.45+",
  "logging": "Pino 8.16.0+",
  "metrics": "prom-client 15.0.0+"
}
```

## Frontend Applications

### Analytics Dashboard
```json
{
  "framework": "React 19.1.0 + TypeScript 5.8.3",
  "build-tool": "Vite 7.0.0",
  "ui-library": "Material-UI 7.2.0",
  "charts": "@mui/x-charts 8.5.3",
  "data-grid": "@mui/x-data-grid 8.5.3",
  "http-client": "Axios 1.10.0",
  "routing": "React Router 7.6.3",
  "state": "Context API + React Query"
}
```

### Device Management App
```json
{
  "framework": "React 19.1.0 + TypeScript 5.8.3",
  "build-tool": "Vite 7.0.0",
  "ui-library": "Material-UI 7.2.0",
  "http-client": "Axios 1.10.0",
  "routing": "React Router 7.6.3"
}
```

### Farm Management App
```json
{
  "framework": "React 19.1.0 + TypeScript 5.8.3",
  "build-tool": "Vite 7.0.0",
  "ui-library": "Material-UI 7.2.0",
  "http-client": "Axios 1.10.0",
  "routing": "React Router 7.6.3"
}
```

## Package Management

### Node.js Services
```json
{
  "package-manager": "Yarn 1.22+",
  "lock-file": "yarn.lock",
  "scripts": {
    "dev": "ts-node-dev --transpile-only --respawn src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint . --ext .ts"
  }
}
```

### Python Services
```json
{
  "package-manager": "pip",
  "requirements": "requirements.txt",
  "virtual-env": "venv",
  "scripts": {
    "dev": "uvicorn app.main:app --reload --host 0.0.0.0 --port 7304",
    "start": "uvicorn app.main:app --host 0.0.0.0 --port 7304",
    "test": "pytest",
    "lint": "flake8"
  }
}
```

### Frontend Applications
```json
{
  "package-manager": "Yarn 1.22+",
  "lock-file": "yarn.lock",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

## Development Environment

### Required Software
```bash
# Node.js & Yarn
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g yarn

# Python
sudo apt-get install python3.11 python3.11-venv python3-pip

# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo apt-get install git
```

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
    "redhat.vscode-yaml",
    "ms-python.python",
    "ms-python.pylint"
  ]
}
```

## Performance Considerations

### Node.js Services
- **Memory**: 512MB - 2GB per service
- **CPU**: 1-2 cores per service
- **Connection Pool**: 20 max connections
- **Timeout**: 30 seconds

### Python Services
- **Memory**: 1GB - 4GB per service
- **CPU**: 2-4 cores per service
- **Workers**: 4-8 uvicorn workers
- **Timeout**: 60 seconds

### Database
- **PostgreSQL**: 4GB - 16GB RAM
- **TimescaleDB**: 8GB - 32GB RAM
- **Redis**: 1GB - 4GB RAM
- **Kafka**: 4GB - 8GB RAM

## Security Stack

### Authentication & Authorization
- **JWT**: HS256 algorithm
- **bcrypt**: 12 salt rounds
- **CORS**: Configured origins
- **Helmet**: Security headers
- **Rate Limiting**: Per IP and per user

### Data Protection
- **TLS/SSL**: All communications encrypted
- **Database Encryption**: At rest encryption
- **API Keys**: Secure storage and rotation
- **Input Validation**: Zod schemas
- **SQL Injection**: ORM protection

### Monitoring & Logging
- **Structured Logging**: Pino (Node.js), Python logging
- **Metrics**: Prometheus + Grafana
- **Audit Logs**: All operations logged
- **Error Tracking**: Centralized error handling

---

*เน€เธญเธเธชเธฒเธฃเธเธตเนเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”: 2024-01-15*

