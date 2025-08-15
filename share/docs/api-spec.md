# API Specification

This document summarizes the API endpoints and contracts for all microservices in the Smart Farming AIoT system. Detailed OpenAPI definitions are provided in the `openapi/` directory as separate YAML files.

---

## 1. Auth-Service (`openapi/auth-service.yaml`)

### Endpoints

| Method | Path                  | Description                     | Auth         |
| ------ | --------------------- | ------------------------------- | ------------ |
| POST   | `/auth/register`      | Register new user               | None         |
| POST   | `/auth/login`         | User login                      | None         |
| POST   | `/auth/refresh-token` | Refresh access token            | None         |
| POST   | `/auth/logout`        | Logout and revoke refresh token | Bearer Token |

### Key Schemas

* **User**: `{ user_id, username, email, role, created_at }`
* **TokenResponse**: `{ access_token, refresh_token }`

---

## 2. Cloud-API Service (`openapi/cloud-api.yaml`)

### Endpoints (Core CRUD)

| Resource      | Method | Path              | Description                              |
| ------------- | ------ | ----------------- | ---------------------------------------- |
| **Customers** | GET    | `/customers`      | List all customers (supports pagination) |
|               | POST   | `/customers`      | Create new customer                      |
|               | GET    | `/customers/{id}` | Retrieve customer by ID                  |
|               | PUT    | `/customers/{id}` | Update customer                          |
|               | DELETE | `/customers/{id}` | Delete customer                          |
| **Farms**     | GET    | `/farms`          | List farms (filter by customer)          |
|               | POST   | `/farms`          | Create new farm                          |
|               | GET    | `/farms/{id}`     | Retrieve farm by ID                      |
|               | PUT    | `/farms/{id}`     | Update farm                              |
|               | DELETE | `/farms/{id}`     | Delete farm                              |
| **Houses**    | GET    | `/houses`         | List houses (filter by farm)             |
|               | POST   | `/houses`         | Create new house                         |
|               | GET    | `/houses/{id}`    | Retrieve house by ID                     |
|               | PUT    | `/houses/{id}`    | Update house                             |
|               | DELETE | `/houses/{id}`    | Delete house                             |
| **Animals**   | GET    | `/animals`        | List animals (filter by farm/house)      |
|               | POST   | `/animals`        | Create new animal                        |
|               | GET    | `/animals/{id}`   | Retrieve animal by ID                    |
|               | PUT    | `/animals/{id}`   | Update animal                            |
|               | DELETE | `/animals/{id}`   | Delete animal                            |
| **Devices**   | GET    | `/devices`        | List devices (filter by house)           |
|               | POST   | `/devices`        | Create new device                        |
|               | GET    | `/devices/{id}`   | Retrieve device by ID                    |
|               | PUT    | `/devices/{id}`   | Update device                            |
|               | DELETE | `/devices/{id}`   | Delete device                            |

### Pagination & Filtering

* **QueryParams**: `?page={int}&limit={int}` for all list endpoints
* Filter by foreign key via `?customer_id=`, `?farm_id=`, `?house_id=`, `?animal_id=` as applicable

---

## 3. Dashboard-Service (`openapi/dashboard-service.yaml`)

| Method | Path                           | Description                                          |
| ------ | ------------------------------ | ---------------------------------------------------- |
| GET    | `/dashboard/{user_id}/config`  | Retrieve dashboard configuration for a user          |
| POST   | `/dashboard/{user_id}/config`  | Update dashboard configuration for a user            |
| GET    | `/dashboard/{farm_id}/metrics` | Retrieve KPI metrics summary for a farm (date range) |

### Parameters

* `date_range_start`, `date_range_end` in `YYYY-MM-DD` format to filter metrics

---

## 4. Monitoring-Service (`openapi/monitoring-service.yaml`)

| Method | Path                         | Description                                 |
| ------ | ---------------------------- | ------------------------------------------- |
| GET    | `/alerts`                    | List alerts (filter by `farm_id`, `status`) |
| POST   | `/alerts`                    | Create a new alert                          |
| PUT    | `/alerts/{alert_id}/resolve` | Mark an alert as resolved                   |
| GET    | `/alert_rules`               | List alert rules                            |
| POST   | `/alert_rules`               | Create a new alert rule                     |
| PUT    | `/alert_rules/{rule_id}`     | Update an alert rule                        |

---

## 5. Analytics-Service (`openapi/analytics-service.yaml`)

| Method | Path             | Description                                                        |
| ------ | ---------------- | ------------------------------------------------------------------ |
| GET    | `/features`      | List features (filter by animal\_id, feature\_name, date range)    |
| POST   | `/features`      | Create a new feature                                               |
| GET    | `/model_results` | List model results (filter by animal\_id, model\_name, date range) |
| POST   | `/model_results` | Create a new model result                                          |

---

## 6. Sync-Service (`openapi/sync-service.yaml`)

| Method | Path             | Description                                      |
| ------ | ---------------- | ------------------------------------------------ |
| POST   | `/edge-to-cloud` | Receive batch data from edge for synchronization |

---

## Authentication & Security

* **Auth**: JWT Bearer for all services (except open auth endpoints)
* **Header**: `Authorization: Bearer <token>`

---

**Note:** Detailed request/response schemas and examples are available in the respective YAML files under `docs/openapi/`.
