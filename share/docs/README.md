
# FarmIQ™

FarmIQ is an intelligent farm management platform that integrates IoT, AI, and microservices to deliver real-time data collection, edge processing, and cloud analytics. It provides both web and mobile interfaces for comprehensive monitoring and control.

---

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Project Structure](#project-structure)
5. [Database Design](#database-design)
6. [API Reference](#api-reference)
7. [Authentication & Security](#authentication--security)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)
10. [Testing](#testing)
11. [Documentation](#documentation)
12. [Contributing](#contributing)
13. [License](#license)
14. [Contact & Support](#contact--support)

---

## Overview

FarmIQ is designed to help farmers and agribusinesses monitor and manage operations through:

- **Real-time Data Collection** from distributed sensors via MQTT.
- **Edge & MES Processing**: preliminary aggregation, filtering, and alerts on devices like Raspberry Pi or Jetson Nano.
- **Cloud Synchronization**: secure transfer of time-series data for long‑term storage and batch analysis.
- **Web & Mobile Dashboards**: intuitive UI for KPIs, alerts, device management, and configuration.

The system’s modular microservice architecture ensures scalability, resilience, and ease of maintenance across edge and cloud environments.

---

## Key Features

- **Sensor Management**: automatic discovery, registration, and health checks.
- **Time-series Data**: optimized ingestion into TSDB (TimescaleDB / InfluxDB) with partitioning and indexing.
- **Alerts & Monitoring**: custom alert rules, notifications (email, SMS, LINE), and incident tracking.
- **Analytics & AI**: feature store, model inference results, anomaly detection, and forecasting.
- **Role-based Access**: multi-tenant support, subscription tiers, and granular permissions.
- **Edge-to-Cloud Sync**: robust data synchronization with retry and conflict resolution.
- **CI/CD & IaC**: Docker, Kubernetes, Terraform, GitHub Actions for automated builds and deployments.

---

## Architecture & Tech Stack

- **Microservices**: Node.js & FastAPI services in Docker containers.
- **Messaging**: MQTT for sensor-to-edge data flows.
- **Databases**:
  - **Time-series**: TimescaleDB / InfluxDB
  - **Relational**: PostgreSQL (farm, metadata)
- **AI & Analytics**: Python (scikit-learn, PyTorch), feature store.
- **Frontend**: React (Web dashboard), React Native (mobile).
- **Infra**: Kubernetes (EKS/GKE), Terraform, Helm, Docker Compose (dev).
- **CI/CD**: GitHub Actions, Docker Hub, Kubernetes manifests.

---

## Project Structure

```plaintext
FarmIQ/
├── backend/services/                   # Microservices (Dockerized)
│   ├── auth-service/                   # (Port:4100)Authentication & Authorization (JWT)
│   ├── sensor-service/                 # (Port:4101)MQTT ingestion → TSDB
│   ├── mqtt-client/                    # (PORT:4102)Edge MQTT publishers
│   ├── edge-server/                    # (PORT:4103)Node-RED flows & Edge APIs
│   ├── sync-service/                   # (PORT:4104)Edge-to-Cloud data sync
│   ├── dashboard-service/              # (PORT:4105)KPI summaries & widgets
│   ├── devices-service/                # (Port:4106)Device metadata & logs
│   ├── customer-service/               # (Port:4107)Customer & subscription management
│   ├── farm-service/                   # (Port:4108)Farm, houses, animals, feed intake
│   ├── farms-master-service/           # (Port:4115)Farm, houses, animals, feed intake
│   ├── farms-operational-service/      # (Port:4116)Farm, houses, animals, feed intake
│   ├── feed-service/                   # (Port:4109)Batches, quality, processing workflows
│   ├── formula-service/                # (Port:4110)Nutrition formulas & energy models
│   ├── economic-service/               # (Port:4111)Cost, pricing, labor analytics
│   ├── external-factor-service/        # (Port:4112)Weather, disease alerts, market data
│   ├── monitoring-service/             # (Port:4113)Alerts & alert rules engine
│   ├── analytics-service/              # (Port:4114)Feature store & model results
│   └── shared/                         # Common libraries & utilities
├── frontend/                           # Client Applications
│   ├── dashboard/                      # React web dashboard
│   ├── device-manage-app/              # (Port:4200)React Native / Web for device ops
│   ├── farm-manage-app/                # (Port:4201)React Native / Web for device ops
│   └── mobile-app/                     # Optional React Native mobile UI
├── infra/                              # Infrastructure as Code
│   ├── docker/                         # Dockerfiles & compose (dev)
│   ├── k8s/                            # Kubernetes manifests & Helm charts
│   └── terraform/                      # Terraform scripts (prod)
├── docs/                               # Documentation & Specs
│   ├── architecture.md                 # System & network diagrams
│   ├── api-spec.md                     # OpenAPI / Swagger definitions
│   ├── user-manual.md                  # End‑user guide & screenshots
│   ├── setup-guide.md                  # Installation & environment setup
│   └── README.md                       # Docs overview
├── db/                                 # Database schema & migrations
│   └── migrations/                     # SQL and migration scripts
├── tests/                              # Automated tests
│   ├── backend/                        # Unit & integration tests
│   ├── frontend/                       # Jest & React Testing Library
│   └── e2e/                            # Cypress end-to-end tests
├── .github/                            # CI/CD workflows
├── .gitignore                          # Ignore patterns
├── package.json / yarn.lock            # Monorepo dependencies
├── LICENSE                             # MIT / Apache-2.0
└── README.md                           # This file
````

---

## Database Design

PostgreSQL is organized into logical schemas:

* `smart_farming`: farms, houses, animals, sensor metadata, feed, health, metrics.
* `auth`: users, tokens, roles.
* `dashboard`: cached KPIs and widget configs.
* `monitoring`: alerts, alert rules.
* `analytics`: feature store, model outputs.

Key tables (examples):

| Schema          | Table                   | Purpose                           |
| --------------- | ----------------------- | --------------------------------- |
| `smart_farming` | `customers`             | Tenant information                |
| `smart_farming` | `farm`                  | Farm & location data              |
| `smart_farming` | `device_status_history` | Time‑series device state changes  |
| `analytics`     | `features`              | Engineered features for models    |
| `monitoring`    | `alerts`                | Active and resolved alert records |

Time-series tables are partitioned by date for performance.

---

## API Reference

### Auth Service

* `POST /auth/register`  - Register new user
* `POST /auth/login`     - Obtain JWT tokens
* `POST /auth/refresh`   - Refresh access token
* `POST /auth/logout`    - Revoke tokens

### Resource APIs (Bearer JWT)

| Service   | Method | Path              | Description          |
| --------- | ------ | ----------------- | -------------------- |
| Customers | `GET`  | `/customers`      | List all customers   |
|           | `POST` | `/customers`      | Create new customer  |
|           | `GET`  | `/customers/{id}` | Get customer details |
| Farms     | `GET`  | `/farms`          | List all farms       |
| …         | …      | …                 | …                    |

(Additional endpoints for `/houses`, `/animals`, `/devices`, etc.)

### Monitoring Service

* `GET /alerts`            - Retrieve alerts
* `POST /alerts`           - Create new alert
* `PUT /alerts/{id}/resolve` - Resolve an alert
* `GET /alert_rules`       - List alert rules
* `POST /alert_rules`      - Create rule
* `PUT /alert_rules/{id}`  - Update rule

### Analytics Service

* `GET /features`
* `POST /features`
* `GET /model_results`
* `POST /model_results`

### Sync Service

* `POST /sync/edge-to-cloud` - Trigger data synchronization

---

## Authentication & Security

* **JWT Bearer** for all protected endpoints (except `/register` and `/login`).
* Tokens sent in `Authorization: Bearer <token>` header.
* Role-based access control applied per service.
* All APIs served over HTTPS in production.

---

## Development Setup

1. **Clone the repo**:

   ```bash
   git clone https://github.com/yourorg/FarmIQ.git
   cd FarmIQ
   ```
2. **Environment variables**: copy `.env.example` to each service and configure.
3. **Start dependencies**:

   ```bash
   docker-compose -f infra/docker/docker-compose.yml up -d
   ```
4. **Run services**:

   ```bash
   # In each backend service folder
   npm install && npm run dev

   # Frontend
   cd frontend/dashboard && yarn install && yarn start
   ```

---

## Deployment

* **Container Registry**: push images to Docker Hub or AWS ECR.
* **Kubernetes**: apply manifests in `infra/k8s/` or Helm charts.
* **Terraform**: provision cloud infra under `infra/terraform/`.
* **CI/CD**: GitHub Actions workflows build, test, and deploy on merge to `main`.

---

## Testing

```bash
# Backend unit & integration
npm test --prefix backend/services/<service>

# Frontend
npm test --prefix frontend/dashboard

# End-to-end
npm run test:e2e
```

---

## Documentation

All project docs live in `/docs`:

* **architecture.md**: diagrams and flow descriptions.
* **api-spec.md**: OpenAPI definitions.
* **user-manual.md**: end‑user guides.
* **setup-guide.md**: installation and environment.

---

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/xyz`)
3. Commit changes (`git commit -m "Add xyz feature"`)
4. Push branch (`git push origin feature/xyz`)
5. Open a Pull Request

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guidelines](CONTRIBUTING.md).

---

## License

This project is licensed under the **Apache 2.0** License. See [LICENSE](LICENSE) for details.

---

## Contact & Support

For questions or support, email **[support@farmiq.com](mailto:support@farmiq.com)** or open an issue on GitHub: [https://github.com/yourorg/FarmIQ/issues](https://github.com/yourorg/FarmIQ/issues)
