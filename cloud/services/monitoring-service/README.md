# Monitoring Service

This microservice handles monitoring operations for the FarmIQ platform, including alert management, alert rules, and device health logging.

## Project Structure
```
monitoring-service/
à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ src/
à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ config/
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€â€à¹‚â€â‚¬à¹‚â€â‚¬ config.ts
à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ models/
à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ routes/
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ alerts.route.ts
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ alertRules.route.ts
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ deviceHealthLogs.route.ts
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€â€à¹‚â€â‚¬à¹‚â€â‚¬ index.ts
à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ services/
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ alert.service.ts
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ alertRule.service.ts
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€â€à¹‚â€â‚¬à¹‚â€â‚¬ deviceHealthLog.service.ts
à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ utils/
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ prisma.ts
à¹‚â€Â‚   à¹‚â€Â‚   à¹‚â€â€à¹‚â€â‚¬à¹‚â€â‚¬ jwt.ts
à¹‚â€Â‚   à¹‚â€â€à¹‚â€â‚¬à¹‚â€â‚¬ server.ts
à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ prisma/
à¹‚â€Â‚   à¹‚â€â€à¹‚â€â‚¬à¹‚â€â‚¬ schema.prisma
à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ .env
à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ package.json
à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ tsconfig.json
à¹‚â€Âœà¹‚â€â‚¬à¹‚â€â‚¬ Dockerfile
à¹‚â€â€à¹‚â€â‚¬à¹‚â€â‚¬ README.md
```

## Environment Variables
Create a `.env` file at the project root with:

```
# Database configuration
DATABASE_URL=postgresql://postgres:postgres1611@localhost:25432/farmiq_cloud?schema=monitoring

# Server configuration
PORT=4112
HOST=localhost

# JWT configuration
JWT_SECRET=monitoring-service-secret
JWT_EXPIRES_IN=1d
```

## Installation

```bash
yarn install
```

## Database Setup

Migrations (recommended for teams/CI):
```bash
# Create a new migration in dev (interactive)
npx prisma migrate dev --name <migration_name>

# Apply existing migrations in non‑interactive env (CI/Prod)
npx prisma migrate deploy

# Quick start (no migration files) — not for Prod
npx prisma db push

# Generate Prisma client
npx prisma generate
```

Notes:
- Baseline migration exists at `prisma/migrations/0001_init/` to match current schema.
- For Docker container, run inside the service to deploy migrations:
  - `docker exec -it farmiq-monitoring-service npx prisma migrate deploy`

## Running the Service

Development mode:
```bash
yarn dev
```

Production mode:
```bash
yarn build
yarn start
```

## Auth Testing (JWT)

- The API routes under `/api` require a JWT signed with HS256 using `JWT_SECRET` (default: `monitoring-service-secret`).
- Generate a sample token via helper script:

```bash
# From project root of monitoring-service
node scripts/generate-jwt.js --tenant tenant-001 --scope alerts:read,alerts:write --exp 1d

# Use with curl (example: list alerts for tenant-001)
curl -H "Authorization: Bearer <PASTE_TOKEN>" http://localhost:4112/api/alerts/tenant-001
```

## Kafka Testing Notes

- From host machine, use the external listener: `KAFKA_BROKERS=localhost:9094`
- From inside Docker network/containers, use the internal DNS: `KAFKA_BROKERS=kafka:9092`
- Example (host):
  - `KAFKA_BROKERS=localhost:9094 node test-monitoring-integration.js`
- Example (container):
  - `docker exec -e KAFKA_BROKERS=kafka:9092 farmiq-monitoring-service node test-monitoring-integration.js`

## API Design

Base URL: `http://localhost:4112/api` (health: `/health`, ready: `/ready`)

### Alerts
| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/alerts/:tenantId`  | Retrieve all alerts      |
| GET    | `/alerts/:tenantId/:alertId` | Retrieve specific alert |
| POST   | `/alerts`            | Create new alert         |
| PUT    | `/alerts/:tenantId/:alertId` | Update alert |
| DELETE | `/alerts/:tenantId/:alertId` | Delete alert |

### Alert Rules
| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/alert-rules/:tenantId`  | Retrieve all alert rules |
| GET    | `/alert-rules/:tenantId/:ruleId` | Retrieve specific rule |
| POST   | `/alert-rules`            | Create new rule          |
| PUT    | `/alert-rules/:tenantId/:ruleId` | Update rule |
| DELETE | `/alert-rules/:tenantId/:ruleId` | Delete rule |

### Device Health Logs
| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/device-health-logs/:tenantId`   | Retrieve all health logs |
| GET    | `/device-health-logs/:tenantId/:id` | Retrieve specific log |
| POST   | `/device-health-logs`             | Create new health log    |
| DELETE | `/device-health-logs/:tenantId/:id` | Delete health log |

## Documentation

Swagger UI is available at: `http://localhost:4112/docs`

## Service Details

- **Server**: Fastify with TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL with monitoring schema
- **Authentication**: JWT middleware
- **Error Handling**: Centralized error handler in `server.ts`
- **Logging**: Built-in Fastify logger
- **Security**: Helmet and CORS enabled
