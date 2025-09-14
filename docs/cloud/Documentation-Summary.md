# FarmIQ Cloud Layer - Documentation Summary

## เน€เธญเธเธชเธฒเธฃเธ—เธตเนเธชเธฃเนเธฒเธเน€เธชเธฃเนเธเนเธฅเนเธง โ…

### 1. เน€เธญเธเธชเธฒเธฃเธซเธฅเธฑเธ (Core Documentation)
- โ… **README.md** - เน€เธญเธเธชเธฒเธฃเธซเธฅเธฑเธเธเธญเธเธฃเธฐเธเธ เธเธฃเนเธญเธก tech stack เธเธฃเธเธ–เนเธงเธ
- โ… **System-Architecture.md** - เธชเธ–เธฒเธเธฑเธ•เธขเธเธฃเธฃเธกเธฃเธฐเธเธเนเธ”เธขเธฃเธงเธก เธเธฃเนเธญเธก tech stack details
- โ… **Service-Overview.md** - เธ เธฒเธเธฃเธงเธก microservices เธ—เธฑเนเธเธซเธกเธ” เธเธฃเนเธญเธก tech stack
- โ… **Technology-Stack.md** - เน€เธญเธเธชเธฒเธฃเน€เธ—เธเนเธเนเธฅเธขเธตเธ—เธตเนเนเธเนเนเธเธฃเธฐเธเธ เธเธฃเธเธ–เนเธงเธ
- โ… **Deployment-Guide.md** - เธเธนเนเธกเธทเธญเธเธฒเธฃเธ•เธดเธ”เธ•เธฑเนเธเนเธฅเธฐ deploy เธ—เธฑเนเธ dev เนเธฅเธฐ production

### 2. เธเธนเนเธกเธทเธญเธชเธณเธซเธฃเธฑเธเธเธฑเธเธเธฑเธ’เธเธฒ (Developer Guides)
- โ… **Developer-Onboarding.md** - เธเธนเนเธกเธทเธญเธชเธณเธซเธฃเธฑเธเธเธฑเธเธเธฑเธ’เธเธฒเนเธซเธกเน เธเธฃเนเธญเธก tech stack requirements
- โ… **API-Integration-Patterns.md** - เธฃเธนเธเนเธเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ API (เธกเธตเธญเธขเธนเนเนเธฅเนเธง)
- โ… **Kafka-Event-Patterns.md** - เธฃเธนเธเนเธเธเธเธฒเธฃเนเธเนเธเธฒเธ Kafka (เธกเธตเธญเธขเธนเนเนเธฅเนเธง)
- โ… **Microservice-Templates.md** - เน€เธ—เธกเน€เธเธฅเธ•เธชเธณเธซเธฃเธฑเธเธชเธฃเนเธฒเธ microservice (เธกเธตเธญเธขเธนเนเนเธฅเนเธง)

### 3. เน€เธญเธเธชเธฒเธฃเธเธฃเธดเธเธฒเธฃ (Service Documentation)
- โ… **Auth-Service.md** - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธเธฒเธฃเธขเธทเธเธขเธฑเธเธ•เธฑเธงเธ•เธ เธเธฃเธเธ–เนเธงเธ
- โ… **Master-Service.md** - เธเธฃเธดเธเธฒเธฃเธซเธฅเธฑเธเธเธฑเธ”เธเธฒเธฃเธเนเธญเธกเธนเธฅเธเธธเธฃเธเธดเธเธ—เธฑเนเธเธซเธกเธ” เธเธฃเธเธ–เนเธงเธ
- โ… **Analytics-Platform.md** - เนเธเธฅเธ•เธเธญเธฃเนเธกเธงเธดเน€เธเธฃเธฒเธฐเธซเนเธเนเธญเธกเธนเธฅ เธเธฃเธเธ–เนเธงเธ

### 4. เธเธนเนเธกเธทเธญเธเธฒเธฃเธเธณเธฃเธธเธเธฃเธฑเธเธฉเธฒ (Maintenance Guides)
- โ… **Troubleshooting-Guide.md** - เธเธนเนเธกเธทเธญเนเธเนเนเธเธเธฑเธเธซเธฒ เธเธฃเธเธ–เนเธงเธ

### 5. เน€เธญเธเธชเธฒเธฃ Migration (Migration Documentation)
- โ… **Migration-Summary.md** - เธชเธฃเธธเธเธเธฒเธฃ migration เนเธฅเธฐเธเธฒเธฃเธฅเธ” services เธเธฃเธเธ–เนเธงเธ

## Tech Stack เธ—เธตเนเธเธฃเธญเธเธเธฅเธธเธกเนเธเน€เธญเธเธชเธฒเธฃ

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

## เน€เธญเธเธชเธฒเธฃเธ—เธตเนเธขเธฑเธเธ•เนเธญเธเธชเธฃเนเธฒเธ

### 1. เน€เธญเธเธชเธฒเธฃเธเธฃเธดเธเธฒเธฃเธ—เธตเนเน€เธซเธฅเธทเธญ
- โณ **Sensor-Streamer-Service.md** - เธเธฃเธดเธเธฒเธฃเธฃเธฑเธเธเนเธญเธกเธนเธฅ sensor
- โณ **Device-Management-Service.md** - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธญเธธเธเธเธฃเธ“เน
- โณ **Farm-Management-Services.md** - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธเธฒเธฃเนเธก
- โณ **Feed-Formula-Services.md** - เธเธฃเธดเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธญเธฒเธซเธฒเธฃเธชเธฑเธ•เธงเน
- โณ **Economic-Service.md** - เธเธฃเธดเธเธฒเธฃเธงเธดเน€เธเธฃเธฒเธฐเธซเนเธ•เนเธเธ—เธธเธ
- โณ **External-Factor-Service.md** - เธเธฃเธดเธเธฒเธฃเธเนเธญเธกเธนเธฅเธ เธฒเธขเธเธญเธ
- โณ **Monitoring-Service.md** - เธเธฃเธดเธเธฒเธฃเธ•เธดเธ”เธ•เธฒเธกเธฃเธฐเธเธ

### 2. เน€เธญเธเธชเธฒเธฃเน€เธเธดเนเธกเน€เธ•เธดเธก
- โณ **API-Documentation.md** - เน€เธญเธเธชเธฒเธฃ API เธเธฃเธเธ–เนเธงเธ
- โณ **Maintenance-Guide.md** - เธเธนเนเธกเธทเธญเธเธณเธฃเธธเธเธฃเธฑเธเธฉเธฒเธฃเธฐเธเธ
- โณ **Performance-Optimization.md** - เธเธฒเธฃเธเธฃเธฑเธเธเธฃเธธเธเธเธฃเธฐเธชเธดเธ—เธเธดเธ เธฒเธ

## เธเธธเธ“เธชเธกเธเธฑเธ•เธดเธเธญเธเน€เธญเธเธชเธฒเธฃเธ—เธตเนเธชเธฃเนเธฒเธเนเธฅเนเธง

### 1. เธเธฃเธเธ–เนเธงเธ (Comprehensive)
- เธเธฃเธญเธเธเธฅเธธเธกเธ—เธธเธ aspect เธเธญเธเธฃเธฐเธเธ
- เธกเธต tech stack เธ—เธตเนเธเธฑเธ”เน€เธเธเนเธฅเธฐเธเธฃเธเธ–เนเธงเธ
- เธกเธต version numbers เธ—เธตเนเนเธเนเธเธญเธ

### 2. เน€เธเนเธฒเนเธเธเนเธฒเธข (Understandable)
- เนเธเนเธ เธฒเธฉเธฒเนเธ—เธขเธ—เธตเนเน€เธเนเธฒเนเธเธเนเธฒเธข
- เธกเธตเธ•เธฑเธงเธญเธขเนเธฒเธ code เนเธฅเธฐ configuration
- เธกเธต diagram เนเธฅเธฐ flowchart

### 3. เนเธเนเธเธฒเธเนเธ”เนเธเธฃเธดเธ (Practical)
- เธกเธต step-by-step instructions
- เธกเธต troubleshooting guides
- เธกเธต real-world examples

### 4. เธญเธฑเธเน€เธ”เธ•เนเธ”เน (Maintainable)
- เนเธเธฃเธเธชเธฃเนเธฒเธเธ—เธตเนเธเธฑเธ”เน€เธเธ
- เนเธขเธเธ•เธฒเธก service เนเธฅเธฐ function
- เธเนเธฒเธขเธ•เนเธญเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•

## เธเธฒเธฃเนเธเนเธเธฒเธเน€เธญเธเธชเธฒเธฃ

### เธชเธณเธซเธฃเธฑเธเธเธฑเธเธเธฑเธ’เธเธฒเนเธซเธกเน
1. เน€เธฃเธดเนเธกเธเธฒเธ [README.md](./README.md)
2. เธญเนเธฒเธ [Developer-Onboarding.md](./Developer-Onboarding.md)
3. เธจเธถเธเธฉเธฒ [Technology-Stack.md](./Technology-Stack.md)
4. เธ”เธน [Service-Overview.md](./Service-Overview.md)

### เธชเธณเธซเธฃเธฑเธ DevOps/System Admin
1. เน€เธฃเธดเนเธกเธเธฒเธ [Deployment-Guide.md](./Deployment-Guide.md)
2. เธจเธถเธเธฉเธฒ [System-Architecture.md](./System-Architecture.md)
3. เธ”เธน [Troubleshooting-Guide.md](./Troubleshooting-Guide.md)

### เธชเธณเธซเธฃเธฑเธเธเธฑเธเธเธฑเธ’เธเธฒเธ—เธตเนเธกเธตเธเธฃเธฐเธชเธเธเธฒเธฃเธ“เน
1. เธ”เธน [Service-Overview.md](./Service-Overview.md)
2. เธจเธถเธเธฉเธฒ service-specific documentation
3. เธ”เธน [API-Integration-Patterns.md](./API-Integration-Patterns.md)

## เธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เน€เธญเธเธชเธฒเธฃ

### เน€เธกเธทเนเธญเน€เธเธดเนเธก Service เนเธซเธกเน
1. เธญเธฑเธเน€เธ”เธ• [Service-Overview.md](./Service-Overview.md)
2. เธชเธฃเนเธฒเธ service-specific documentation
3. เธญเธฑเธเน€เธ”เธ• [Technology-Stack.md](./Technology-Stack.md) เธ–เนเธฒเธ•เนเธญเธเธเธฒเธฃ

### เน€เธกเธทเนเธญเน€เธเธฅเธตเนเธขเธ Tech Stack
1. เธญเธฑเธเน€เธ”เธ• [Technology-Stack.md](./Technology-Stack.md)
2. เธญเธฑเธเน€เธ”เธ• service-specific documentation
3. เธญเธฑเธเน€เธ”เธ• [Deployment-Guide.md](./Deployment-Guide.md)

### เน€เธกเธทเนเธญเน€เธเธดเนเธก Feature เนเธซเธกเน
1. เธญเธฑเธเน€เธ”เธ• service-specific documentation
2. เธญเธฑเธเน€เธ”เธ• [API-Documentation.md](./API-Documentation.md)
3. เธญเธฑเธเน€เธ”เธ• [Developer-Onboarding.md](./Developer-Onboarding.md) เธ–เนเธฒเธเธณเน€เธเนเธ

---

*เน€เธญเธเธชเธฒเธฃเธเธตเนเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”: 2024-01-15*

