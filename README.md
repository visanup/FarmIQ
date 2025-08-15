# FarmIQ™

FarmIQ™ is an end-to-end intelligent farm management platform that integrates IoT edge devices, microservices architecture, and AI-driven analytics to provide real-time monitoring, automated alerts, and actionable insights. This README provides a holistic overview of the project, its components, and how to get started.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Components](#key-components)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Monorepo Structure](#monorepo-structure)
5. [Database Design](#database-design)
6. [API Reference](#api-reference)
7. [Authentication & Security](#authentication--security)
8. [Development Workflow](#development-workflow)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & CI/CD](#deployment--cicd)
11. [Operational Considerations](#operational-considerations)
12. [Contributing](#contributing)
13. [License](#license)
14. [Contact & Support](#contact--support)

---

## Overview

FarmIQ™ enables farm operators to collect sensor data, run AI models at the edge, synchronize with cloud microservices, and present dashboards for farmers, agronomists, and business stakeholders. Features include:

* **Real-time IoT Ingestion**: MQTT-based data from sensors and edge gateways.
* **Edge Processing**: Data filtering, anomaly detection, and alerts on Raspberry Pi/Jetson.
* **Microservices Back End**: Scalable Node.js and Python services handling auth, telemetry, analytics, and more.
* **AI & Analytics**: Model inference (e.g., anomaly detection, forecasting) with results stored and visualized.
* **User Interfaces**: Web dashboard (React + Material UI) and optional mobile app (React Native).

---

## Key Components

* **sensor-service**: MQTT subscribers → TimescaleDB ingestion.
* **auth-service**: User registration, JWT-based authentication, and RBAC.
* **sync-service**: Edge-to-cloud data synchronization with retry and conflict handling.
* **dashboard-service**: Aggregates KPIs and renders dashboard widgets.
* **devices-service**: Device metadata, logs, and status history.
* **farm-service**: CRUD for farms, houses, animals, and feed intake.
* **farms-master-service**: CRUD for master data farms, houses, animals, and feed intake.
* **farms-operational-service**: CRUD for farms operational data
* **feed-service** & **formula-service**: Manage feed batches, specifications, and nutrition formulas.
* **economic-service** & **external-factor-service**: Capture cost data, market prices, weather, and disease alerts.
* **monitoring-service**: Alert rules engine and notifications (email, SMS, LINE).
* **analytics-service**: Feature store, model outputs, and data science APIs--> Data-Ingestion/Feature-Pipeline Service
* **cloud-api**: Gateway aggregating all microservice endpoints under a unified API.
* **frontend/dashboard**: React web app for visualization.

---

## Architecture & Tech Stack

* **Microservices**: Node.js (Express) & Python (FastAPI), containerized via Docker.
* **Messaging**: MQTT broker (e.g., Mosquitto) for sensor-to-edge communication.
* **Databases**:

  * **Time-series**: TimescaleDB (PostgreSQL extension) for high-volume sensor data.
  * **Relational**: PostgreSQL for metadata, configuration, and transactional data.
* **AI & ML**: Python with PyTorch/TensorFlow, scikit-learn for models; Edge inference via ONNX/TensorRT.
* **Frontend**: React + Material UI; React Native for mobile.
* **Infrastructure**: Docker Compose (dev), Kubernetes + Helm (prod), Terraform for cloud provisioning.
* **CI/CD**: GitHub Actions for linting, testing, building images, and deployment.
* **Monitoring**: Prometheus + Grafana for metrics; ELK stack for logging.

---

## Monorepo Structure

```plaintext
farm-ecosystem/
├── services/
│   ├── auth-service/
│   ├── sensor-service/
│   ├── mqtt-client/
│   ├── edge-server/
│   ├── sync-service/
│   ├── dashboard-service/
│   ├── devices-service/
│   ├── customer-service/
│   ├── farm-service/
│   ├── farms-master-service/
│   ├── farms-operational-service/
│   ├── feed-service/
│   ├── formula-service/
│   ├── economic-service/
│   ├── external-factor-service/
│   ├── monitoring-service/
│   ├── analytics-service/
│   └── cloud-api/
├── frontend/
│   ├── dashboard/
│   └── mobile-app/
├── infra/
│   ├── docker/
│   ├── k8s/
│   └── terraform/
├── db/
│   └── migrations/
├── docs/
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Database Design

Schemas in PostgreSQL:

* **smart\_farming**: farms, houses, animals, sensor metadata, feed intake.
* **auth**: users, tokens.
* **monitoring**: alerts, alert\_rules.
* **analytics**: features, model\_results.
* **economics**: economic\_data.
* **external\_factors**: external\_factors.

Time-series tables in **sensor\_data** & **device\_status\_history** are hypertables with daily chunks.

---

## API Reference

All endpoints under `/api` and protected by JWT except `/auth/*`.

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/refresh`

### Core Services

| Service             | Method | Path                | Description           |
| ------------------- | ------ | ------------------- | --------------------- |
| sensor-service      | GET    | `/sensor/data`      | Query sensor readings |
| farm-service        | GET    | `/farm`             | List farms            |
|                     | POST   | `/farm`             | Create farm           |
| feed-service        | GET    | `/feed/batches`     | List feed batches     |
| economic-service    | GET    | `/economic-data`    | Get economic records  |
| external-factor-svc | GET    | `/external-factors` | Get external factors  |
| monitoring-service  | GET    | `/alerts`           | List active alerts    |

(See each service's README for full details and Postman collections.)

---

## Authentication & Security

* **JWT**: `Authorization: Bearer <token>` header.
* **RBAC**: Roles enforced in middleware.
* **HTTPS**: Required in production.
* **CORS**: Configurable per service.

---

## Development Workflow

1. **Clone & install**:

   ```bash
   ```

git clone [https://github.com/yourorg/farm-ecosystem.git](https://github.com/yourorg/farm-ecosystem.git)
cd farm-ecosystem
docker-compose up -d  # start PostgreSQL, TimescaleDB, MQTT broker

````
2. **Configure**: Copy `.env.example` → `.env` in each service and fill values.
3. **Run services**:
   ```bash
# In each service folder
yarn install
yarn dev
````

4. **Frontend**:

   ```bash
   ```

cd frontend/dashboard
yarn install
yarn start

```

---

## Testing Strategy
- **Unit Tests**: Jest (Node) & pytest (Python).
- **Integration Tests**: Spin up real DB & broker via Docker.
- **E2E Tests**: Cypress against local dev stack.

---

## Deployment & CI/CD
- **CI**: Lint, test, build Docker images on PR.
- **CD**: Deploy to staging/production via GitHub Actions → Kubernetes.
- **Infra**: Managed by Terraform & Helm.

---

## Operational Considerations
- **Monitoring**: Prometheus metrics, Grafana dashboards.
- **Logging**: Centralized ELK / Loki stack.
- **Scaling**: Horizontal pod autoscaling on CPU/memory.
- **Backups**: Automated backups for Postgres & TSDB.

---

## Contributing
1. Fork repository and create a feature branch.
2. Adhere to coding standards and add tests.
3. Submit a Pull Request and ensure CI passes.

See [CONTRIBUTING.md](/docs/contributing.md) for details.

---

## License
Licensed under Apache 2.0. See [LICENSE](LICENSE) for details.

---

## Contact & Support
- **Email**: [support@farmiq.com](mailto:support@farmiq.com)
- **GitHub**: https://github.com/yourorg/farm-ecosystem
- **Docs**: https://docs.farmiq.com

*Last updated: 2025-06-27*

```


## swagger

   yarn add swagger-ui-express swagger-jsdoc @types/swagger-jsdoc --dev
   <!-- yarn add @types/swagger-jsdoc --dev -->

### tsconfig.json
{
  "compilerOptions": {
    // ... คอนฟิกเดิม ...
    "typeRoots": ["node_modules/@types", "src/types"]
  },
  "include": ["src", "src/types/**/*.d.ts"]
}