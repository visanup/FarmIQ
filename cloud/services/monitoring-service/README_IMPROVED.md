# Monitoring Service

This microservice handles monitoring operations for the FarmIQ platform, including alert management, alert rules, and device health logging.

## Project Structure
```
monitoring-service/
├── src/
│   ├── config/
│   │   └── config.ts
│   ├── middlewares/
│   │   └── auth.ts
│   ├── models/
│   ├── routes/
│   │   ├── alerts.route.ts
│   │   ├── alertRules.route.ts
│   │   ├── deviceHealthLogs.route.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── alert.service.ts
│   │   ├── alertRule.service.ts
│   │   └── deviceHealthLog.service.ts
│   ├── utils/
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   └── swagger.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
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

Generate Prisma client:
```bash
yarn prisma generate
```

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

## API Design

Base URL: `http://localhost:4112/api`

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

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Service Details

- **Server**: Fastify with TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL with monitoring schema
- **Authentication**: JWT middleware
- **Error Handling**: Centralized error handler in `server.ts`
- **Logging**: Built-in Fastify logger
- **Security**: Helmet and CORS enabled

## Known Issues

1. **Node.js Version Compatibility**: The project dependencies may not be compatible with Node.js version 22+. Consider using Node.js 18 or 20.
2. **Development Dependencies**: Make sure to install development dependencies with `yarn install --dev` to use development mode.

## Troubleshooting

If you encounter issues with dependencies:
1. Ensure you're using a compatible Node.js version (18 or 20 recommended)
2. Run `yarn install --dev` to install all dependencies
3. Check the `IMPROVEMENTS_SUMMARY.md` file for detailed information about recent changes