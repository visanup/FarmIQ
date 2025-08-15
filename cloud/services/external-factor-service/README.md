# External Factor Service

This microservice manages external factors for farms, such as weather, disease alerts, market prices, and other contextual data.

## Project Structure

```plaintext
external-factor-service/
├── src/
│   ├── configs/
│   │   └── config.ts             # Environment and JWT config
│   ├── models/
│   │   ├── externalFactors.model.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── externalFactors.service.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── externalFactors.route.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── dataSource.ts
│   ├── middlewares/
│   │   └── auth.ts               # JWT authentication middleware
│   ├── middlewares/
│   │   └── errorHandler.ts       # Central error handling
│   └── server.ts                 # Entrypoint
├── .env                          # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables
Create a `.env` file in the project root with:

```dotenv
DB_HOST=<your_db_host>
DB_PORT=5432
DB_NAME=<your_db_name>
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
JWT_SECRET_KEY=<your_jwt_secret>
TOKEN_EXPIRATION_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7
EXTERNAL_FACTOR_SERVICE_PORT=4112
```

## Installation & Running

Install dependencies:

```bash
yarn install
```

Build and start the service:

```bash
yarn build
yarn start
```

Service will run on `http://localhost:4112` by default.

## API Design

Base URL: `http://localhost:4112/api`

| Method | Endpoint                    | Body (JSON)                                                                                                      | Description                                 |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| GET    | `/external-factors`         | —                                                                                                                 | Retrieve all external factor records        |
| GET    | `/external-factors/:id`     | —                                                                                                                 | Retrieve a single record by ID              |
| POST   | `/external-factors`         | `{ farmId?: number, weather?: object, diseaseAlert?: object, marketPrice?: object, feedSupply?: object, weatherForecast?: object, diseaseRiskScore?: number, regulatoryChanges?: string, recordDate: string }` | Create a new record                         |
| PUT    | `/external-factors/:id`     | Partial of the same JSON schema                                                                                  | Update an existing record                   |
| DELETE | `/external-factors/:id`     | —                                                                                                                 | Delete a record by ID                       |

### Field Descriptions

- `farmId` (number): Identifier for the farm.
- `weather` (JSON): Current weather data.
- `diseaseAlert` (JSON): Alerts about disease outbreaks.
- `marketPrice` (JSON): Current market price information.
- `feedSupply` (JSON): Feed availability data.
- `weatherForecast` (JSON): Forecasted weather data.
- `diseaseRiskScore` (number): Calculated risk score for diseases.
- `regulatoryChanges` (string): Notes on regulation updates.
- `recordDate` (string, YYYY-MM-DD): Date of the record.
- `created_at`, `updated_at` (timestamps): Automatic timestamps.

## Postman Collection

Import this snippet into Postman:

```json
{
  "info": {
    "name": "External Factor Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All",
      "request": {
        "method": "GET",
        "url": "http://localhost:4112/api/external-factors"
      }
    },
    {
      "name": "Get One",
      "request": {
        "method": "GET",
        "url": "http://localhost:4112/api/external-factors/1"
      }
    },
    {
      "name": "Create",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"farmId\": 1,\n  \"weather\": { \"temp\": 28 },\n  \"recordDate\": \"2025-06-27\"\n}"
        },
        "url": "http://localhost:4112/api/external-factors"
      }
    },
    {
      "name": "Update",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"diseaseRiskScore\": 0.2\n}"
        },
        "url": "http://localhost:4112/api/external-factors/1"
      }
    },
    {
      "name": "Delete",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:4112/api/external-factors/1"
      }
    }
  ]
}

```

## Service Details

- **Framework**: Express.js + TypeScript
- **ORM**: TypeORM with PostgreSQL
- **Authentication**: JWT via `authenticateToken` middleware
- **Error Handling**: Global `errorHandler` middleware
- **Schema**: `external_factors.external_factors` with trigger to auto-update `updated_at`
- **Security**: `helmet`, `cors` enabled
- **Logging**: `morgan` for HTTP logs

```