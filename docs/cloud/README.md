# FarmIQ Cloud Layer Documentation

## เธ เธฒเธเธฃเธงเธกเธฃเธฐเธเธ (System Overview)

FarmIQ Cloud Layer เน€เธเนเธเธฃเธฐเธเธ microservices เธ—เธตเนเธญเธญเธเนเธเธเธ•เธฒเธก Event-Driven Architecture เธชเธณเธซเธฃเธฑเธเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธเนเธญเธกเธนเธฅเธเธฒเธฃเนเธกเนเธฅเธฐเนเธฃเธเธเธฒเธเธญเธธเธ•เธชเธฒเธซเธเธฃเธฃเธก เนเธ”เธขเนเธเน Apache Kafka เน€เธเนเธ message broker เธซเธฅเธฑเธ เนเธฅเธฐ TimescaleDB เน€เธเนเธ time-series database เธซเธฅเธฑเธเธเธฒเธ migration เนเธฅเนเธง เธฃเธฐเธเธเนเธ”เนเธ–เธนเธเธเธฃเธฑเธเธเธฃเธธเธเนเธซเนเนเธเน master-service เน€เธเนเธเธจเธนเธเธขเนเธเธฅเธฒเธเธซเธฅเธฑเธเธชเธณเธซเธฃเธฑเธเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธเนเธญเธกเธนเธฅเธเธธเธฃเธเธดเธเธ—เธฑเนเธเธซเธกเธ”

### เธชเธ–เธฒเธเธฑเธ•เธขเธเธฃเธฃเธกเธซเธฅเธฑเธ

```
โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ”โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
โ”   Edge Layer    โ”โ”€โ”€โ”€โ–ถโ”   Cloud Layer   โ”โ”€โ”€โ”€โ–ถโ” Application Layerโ”
โ”                 โ”    โ”                 โ”    โ”                 โ”
โ” โ€ข MQTT Broker   โ”    โ” โ€ข Kafka         โ”    โ” โ€ข React Apps    โ”
โ” โ€ข Edge Services โ”    โ” โ€ข Microservices โ”    โ” โ€ข Dashboards    โ”
โ” โ€ข Local Storage โ”    โ” โ€ข TimescaleDB   โ”    โ” โ€ข Management UI โ”
โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”    โ””โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”
```

## เนเธเธฃเธเธชเธฃเนเธฒเธเน€เธญเธเธชเธฒเธฃ

### ๐“ เน€เธญเธเธชเธฒเธฃเธซเธฅเธฑเธ
- [System Architecture](./System-Architecture.md) - เธชเธ–เธฒเธเธฑเธ•เธขเธเธฃเธฃเธกเธฃเธฐเธเธเนเธ”เธขเธฃเธงเธก
- [Service Overview](./Service-Overview.md) - เธ เธฒเธเธฃเธงเธกเธเธญเธ microservices เธ—เธฑเนเธเธซเธกเธ”
- [Technology Stack](./Technology-Stack.md) - เน€เธ—เธเนเธเนเธฅเธขเธตเธ—เธตเนเนเธเนเนเธเธฃเธฐเธเธ
- [Deployment Guide](./Deployment-Guide.md) - เธเธนเนเธกเธทเธญเธเธฒเธฃเธ•เธดเธ”เธ•เธฑเนเธเนเธฅเธฐ deploy
- [API Documentation](./API-Documentation.md) - เน€เธญเธเธชเธฒเธฃ API เธเธฃเธเธ–เนเธงเธ

### ๐”ง เธเธนเนเธกเธทเธญเธชเธณเธซเธฃเธฑเธเธเธฑเธเธเธฑเธ’เธเธฒ
- [Developer Onboarding](./Developer-Onboarding.md) - เธเธนเนเธกเธทเธญเธชเธณเธซเธฃเธฑเธเธเธฑเธเธเธฑเธ’เธเธฒเนเธซเธกเน
- [Development Patterns](./Development-Patterns.md) - เธฃเธนเธเนเธเธเธเธฒเธฃเธเธฑเธ’เธเธฒเธ—เธตเนเนเธเนเนเธเธฃเธฐเธเธ
- [API Integration Patterns](./API-Integration-Patterns.md) - เธฃเธนเธเนเธเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ API
- [Kafka Event Patterns](./Kafka-Event-Patterns.md) - เธฃเธนเธเนเธเธเธเธฒเธฃเนเธเนเธเธฒเธ Kafka
- [Microservice Templates](./Microservice-Templates.md) - เน€เธ—เธกเน€เธเธฅเธ•เธชเธณเธซเธฃเธฑเธเธชเธฃเนเธฒเธ microservice

### ๐—๏ธ เน€เธญเธเธชเธฒเธฃเธเธฃเธดเธเธฒเธฃ (Services)
- [Authentication Service](./services/Auth-Service.md) - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธเธฒเธฃเธขเธทเธเธขเธฑเธเธ•เธฑเธงเธ•เธ
- [Customer Service](./services/Customer-Service.md) - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธฅเธนเธเธเนเธฒ
- [Sensor Streamer Service](./services/Sensor-Streamer-Service.md) - เธเธฃเธดเธเธฒเธฃเธฃเธฑเธเธเนเธญเธกเธนเธฅ sensor
- [Analytics Platform](./services/Analytics-Platform.md) - เนเธเธฅเธ•เธเธญเธฃเนเธกเธงเธดเน€เธเธฃเธฒเธฐเธซเนเธเนเธญเธกเธนเธฅ
- [Device Management Service](./services/Device-Management-Service.md) - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธญเธธเธเธเธฃเธ“เน
- [Farm Management Services](./services/Farm-Management-Services.md) - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธเธฒเธฃเนเธก
- [Feed & Formula Services](./services/Feed-Formula-Services.md) - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธญเธฒเธซเธฒเธฃเธชเธฑเธ•เธงเน
- [Economic Service](./services/Economic-Service.md) - เธเธฃเธดเธเธฒเธฃเธงเธดเน€เธเธฃเธฒเธฐเธซเนเธ•เนเธเธ—เธธเธ
- [External Factor Service](./services/External-Factor-Service.md) - เธเธฃเธดเธเธฒเธฃเธเนเธญเธกเธนเธฅเธ เธฒเธขเธเธญเธ
- [Monitoring Service](./services/Monitoring-Service.md) - เธเธฃเธดเธเธฒเธฃเธ•เธดเธ”เธ•เธฒเธกเธฃเธฐเธเธ

### ๐ ๏ธ เธเธนเนเธกเธทเธญเธเธฒเธฃเธเธณเธฃเธธเธเธฃเธฑเธเธฉเธฒ
- [Troubleshooting Guide](./Troubleshooting-Guide.md) - เธเธนเนเธกเธทเธญเนเธเนเนเธเธเธฑเธเธซเธฒ
- [Maintenance Guide](./Maintenance-Guide.md) - เธเธนเนเธกเธทเธญเธเธณเธฃเธธเธเธฃเธฑเธเธฉเธฒเธฃเธฐเธเธ
- [Performance Optimization](./Performance-Optimization.md) - เธเธฒเธฃเธเธฃเธฑเธเธเธฃเธธเธเธเธฃเธฐเธชเธดเธ—เธเธดเธ เธฒเธ

## เน€เธ—เธเนเธเนเธฅเธขเธตเธซเธฅเธฑเธ

### Backend Technologies
- **Node.js 18.18.0+** - Runtime เธซเธฅเธฑเธ
- **TypeScript 5.4.5+** - Type safety
- **Express.js 4.19.2+** - Web framework (เธชเนเธงเธเนเธซเธเน)
- **Fastify 4.24.3+** - High-performance framework (Sensor Streamer)
- **Python 3.11+** - Analytics services
- **FastAPI 0.104.1+** - Modern Python web framework
- **Yarn 1.22+** - Package manager

### Database & ORM
- **PostgreSQL 15+** - เธเธฒเธเธเนเธญเธกเธนเธฅเธซเธฅเธฑเธ
- **TimescaleDB 2.11+** - Time-series extension
- **Redis 7.0+** - Caching & session storage
- **TypeORM 0.3.20+** - Node.js ORM
- **Prisma 5.7.0+** - Modern database toolkit (Sensor Streamer)
- **SQLAlchemy 2.0.23+** - Python ORM

### Message Queue & Streaming
- **Apache Kafka 3.5+** - Message broker
- **KafkaJS 2.2.4+** - Node.js Kafka client
- **confluent-kafka 2.0.2+** - Python Kafka client

### Authentication & Security
- **JWT 9.0.2+** - Authentication
- **bcrypt 5.1.1+** - Password hashing
- **Zod 3.23.8+** - Schema validation
- **Helmet 7.0.0+** - Security middleware

### Frontend Technologies
- **React 19.1.0+** - UI library
- **TypeScript 5.8.3+** - Type safety
- **Material-UI 7.2.0+** - Component library
- **Vite 7.0.0+** - Build tool
- **Axios 1.10.0+** - HTTP client
- **React Router 7.6.3+** - Routing

### Infrastructure & DevOps
- **Docker 20.10+** - Containerization
- **Docker Compose 2.0+** - Multi-container orchestration
- **Nginx 1.24+** - Reverse proxy
- **Prometheus 2.45+** - Metrics collection
- **Grafana 10.0+** - Visualization

### API Documentation
- **Swagger UI 5.0.1+** - API documentation
- **OpenAPI 3.0** - API specification
- **@asteasolutions/zod-to-openapi 6.2.0+** - Schema to OpenAPI

### Monitoring & Logging
- **Pino 8.16.0+** - Structured logging
- **prom-client 15.0.0+** - Prometheus metrics
- **Python logging** - Python services logging

> ๐“– **เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธเธ–เนเธงเธ**: [Technology Stack Documentation](./Technology-Stack.md)

## เธเธฒเธฃเน€เธฃเธดเนเธกเธ•เนเธเนเธเนเธเธฒเธ

### Prerequisites
- Node.js 18.18.0+
- Docker & Docker Compose
- PostgreSQL 13+ with TimescaleDB
- Git

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd FarmIQ

# Start infrastructure
docker-compose -f cloud/docker-compose.infra.yml up -d

# Start services
docker-compose -f cloud/docker-compose.yml up -d

# Check health
curl http://localhost:7300/health  # Auth Service
curl http://localhost:7301/health  # Customer Service
curl http://localhost:7302/health  # Sensor Streamer
```

## เธเธฒเธฃเน€เธเนเธฒเธ–เธถเธเธเธฃเธดเธเธฒเธฃ

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Auth Service | 7300 | http://localhost:7300 | เธเธฒเธฃเธขเธทเธเธขเธฑเธเธ•เธฑเธงเธ•เธ |
| Customer Service | 7301 | http://localhost:7301 | เธเธฑเธ”เธเธฒเธฃเธฅเธนเธเธเนเธฒ |
| Sensor Streamer | 7302 | http://localhost:7302 | เธฃเธฑเธเธเนเธญเธกเธนเธฅ sensor |
| Analytics Stream | 7303 | http://localhost:7303 | เธชเธ•เธฃเธตเธกเธเนเธญเธกเธนเธฅ analytics |
| Analytics Worker | 7304 | http://localhost:7304 | เธเธฃเธฐเธกเธงเธฅเธเธฅ analytics |
| Analytics API | 7305 | http://localhost:7305 | API เธเนเธญเธกเธนเธฅ analytics |
| Analytics Alerts | 7306 | http://localhost:7306 | เนเธเนเธเน€เธ•เธทเธญเธ |
| Device Service | 7307 | http://localhost:7307 | เธเธฑเธ”เธเธฒเธฃเธญเธธเธเธเธฃเธ“เน |
| Farm Service | 7308 | http://localhost:7308 | เธเธฑเธ”เธเธฒเธฃเธเธฒเธฃเนเธก |
| Feed Service | 7309 | http://localhost:7309 | เธเธฑเธ”เธเธฒเธฃเธญเธฒเธซเธฒเธฃเธชเธฑเธ•เธงเน |
| Formula Service | 7310 | http://localhost:7310 | เธเธฑเธ”เธเธฒเธฃเธชเธนเธ•เธฃเธญเธฒเธซเธฒเธฃ |
| Economic Service | 7311 | http://localhost:7311 | เธงเธดเน€เธเธฃเธฒเธฐเธซเนเธ•เนเธเธ—เธธเธ |
| External Factor Service | 7312 | http://localhost:7312 | เธเนเธญเธกเธนเธฅเธ เธฒเธขเธเธญเธ |
| Monitoring Service | 7313 | http://localhost:7313 | เธ•เธดเธ”เธ•เธฒเธกเธฃเธฐเธเธ |

## เธเธฒเธฃเธกเธตเธชเนเธงเธเธฃเนเธงเธก

### เธเธฒเธฃเธฃเธฒเธขเธเธฒเธเธเธฑเธเธซเธฒ
- เนเธเน GitHub Issues เธชเธณเธซเธฃเธฑเธเธฃเธฒเธขเธเธฒเธ bug
- เธฃเธฐเธเธธ service เธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธ
- เนเธเธ log เนเธฅเธฐเธเนเธญเธกเธนเธฅเธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธ

### เธเธฒเธฃเธเธฑเธ’เธเธฒเธเธตเน€เธเธญเธฃเนเนเธซเธกเน
- เธชเธฃเนเธฒเธ branch เนเธซเธกเนเธเธฒเธ `main`
- เนเธเน naming convention: `feature/description`
- เน€เธเธตเธขเธ test cases
- เธญเธฑเธเน€เธ”เธ•เน€เธญเธเธชเธฒเธฃเธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธ

### Code Style
- เนเธเน TypeScript strict mode
- เนเธเน Prettier เธชเธณเธซเธฃเธฑเธ formatting
- เน€เธเธตเธขเธ comment เน€เธเนเธเธ เธฒเธฉเธฒเธญเธฑเธเธเธคเธฉ
- เนเธเน ESLint เธชเธณเธซเธฃเธฑเธ linting

## เธเธฒเธฃเธชเธเธฑเธเธชเธเธธเธ

เธชเธณเธซเธฃเธฑเธเธเธณเธ–เธฒเธกเนเธฅเธฐเธเธฒเธฃเธชเธเธฑเธเธชเธเธธเธ:
- ๐“ง Email: dev-team@farmiq.com
- ๐’ฌ Slack: #farmiq-dev
- ๐“– Wiki: [Internal Wiki](https://wiki.farmiq.com)
- ๐ Issues: [GitHub Issues](https://github.com/farmiq/issues)

## License

ยฉ 2024 FarmIQ. All rights reserved.

---

*เน€เธญเธเธชเธฒเธฃเธเธตเนเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”: 2024-01-15*
