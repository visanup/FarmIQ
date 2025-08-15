# Economic Service

This microservice handles CRUD operations for farm economic data, including costs and prices.

## Project Structure
```
economic-service/
├── src/
│   ├── models/
│   │   ├── economicData.model.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── economicData.service.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── economicData.route.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── dataSource.ts
│   ├── configs/
│   │   └── config.ts
│   └── server.ts
├── .env                # environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables
Create a `.env` file at the project root with:

```
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET_KEY=your_jwt_secret
TOKEN_EXPIRATION_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7
ECONOMIC_SERVICE_PORT=4111
```

## Installation

```bash
yarn install
```

## Running the Service

```bash
yarn build
yarn start
```

## API Design

Base URL: `http://localhost:${PORT}/api`

| Method | Endpoint                  | Body                             | Description                    |
| ------ | ------------------------- | -------------------------------- | ------------------------------ |
| GET    | `/economic-data`          | —                                | Retrieve all economic records  |
| GET    | `/economic-data/:id`      | —                                | Retrieve a specific record     |
| POST   | `/economic-data`          | JSON of EconomicData             | Create a new record            |
| PUT    | `/economic-data/:id`      | JSON of fields to update         | Update an existing record      |
| DELETE | `/economic-data/:id`      | —                                | Delete a specific record       |

## Postman Collection

Import the following JSON into Postman to test the endpoints:

```json
{
  "info": {
    "name": "Economic Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All",
      "request": {
        "method": "GET",
        "url": "http://localhost:4111/api/economic-data"
      }
    },
    {
      "name": "Get One",
      "request": {
        "method": "GET",
        "url": "http://localhost:4111/api/economic-data/1"
      }
    },
    {
      "name": "Create",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{
  \"farmId\": 1,
  \"costType\": \"feed\",
  \"amount\": 200.5,
  \"recordDate\": \"2025-06-27\"
}"
        },
        "url": "http://localhost:4111/api/economic-data"
      }
    },
    {
      "name": "Update",
      "request": {
        "method": "PUT",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{ \"amount\": 250 }"
        },
        "url": "http://localhost:4111/api/economic-data/1"
      }
    },
    {
      "name": "Delete",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:4111/api/economic-data/1"
      }
    }
  ]
}
```

## Service Details

- **Server**: Express.js with TypeScript
- **ORM**: TypeORM connecting to PostgreSQL
- **Authentication**: JWT middleware (optional; can be enabled by mounting auth routes before protected routes)
- **Error Handling**: Centralized error handler in `server.ts`
- **Schema**: `economics.economic_data` with trigger to auto-update `updated_at`
- **Logging**: `morgan` for HTTP logs
- **Security**: `helmet` and `cors` enabled