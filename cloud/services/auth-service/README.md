# Auth Service

Authentication & Token Management สำหรับระบบ multi-tenant (Node.js + Express + TypeORM + PostgreSQL/TimescaleDB)

* **AuthN**: username/password → JWT access token
* **Refresh**: เก็บ refresh token ใน DB (ตาราง `auth.user_tokens`) + **rotate** ทุกครั้งที่ `/refresh`
* **Multi-tenant**: ผูก `user.customer_id`; สมัครสมาชิกจะยิงไปสร้าง customer ผ่าน `CUSTOMER_SERVICE_URL`
* **Validation**: ใช้ **Zod** ครอบ input
* **Docs**: Swagger UI ที่ `/api-docs` (แนะนำใช้ `zod-to-openapi` สร้างสเปกจาก Zod)

---

## Table of Contents

* [Stack](#stack)
* [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
* [Prerequisites](#prerequisites)
* [วิธีเริ่มต้นแบบเร็ว](#วิธีเริ่มต้นแบบเร็ว)
* [Environment Variables](#environment-variables)
* [Database Schema](#database-schema)
* [Run (Dev/Prod)](#run-devprod)
* [API](#api)
* [Swagger / OpenAPI](#swagger--openapi)
* [Security Notes](#security-notes)
* [Troubleshooting](#troubleshooting)
* [Contributing](#contributing)
* [License](#license)

---

## Stack

* **Runtime**: Node.js 20
* **Web**: Express
* **DB Layer**: TypeORM (synchronize: `false`)
* **DB**: PostgreSQL / TimescaleDB
* **Auth**: JSON Web Token (JWT, HS256 by default)
* **Validation**: Zod
* **Docs**: Swagger UI (แนะนำ generate จาก Zod ด้วย `@asteasolutions/zod-to-openapi`)

---

## โครงสร้างโปรเจกต์

```
services/auth-service/
├─ src/
│  ├─ configs/
│  │  └─ config.ts               # โหลด .env / สังเคราะห์ DATABASE_URL / CORS / JWT
│  ├─ middleware/
│  │  ├─ auth.middleware.ts      # verify Bearer token
│  │  └─ validate.ts             # validate(req.body|query|params) ด้วย Zod
│  ├─ models/
│  │  ├─ user.model.ts           # entity auth.users
│  │  └─ refreshToken.model.ts   # entity auth.user_tokens
│  ├─ routes/
│  │  └─ auth.route.ts           # /signup /login /refresh /me
│  ├─ schemas/
│  │  └─ auth.schemas.ts         # Zod schemas
│  ├─ utils/
│  │  ├─ hash.ts                 # bcrypt
│  │  ├─ openapi.ts              # (ถ้าใช้ Zod → OpenAPI)
│  │  └─ zod.ts                  # extendZodWithOpenApi()
│  └─ server.ts                  # bootstrap, Swagger UI, healthcheck
├─ Dockerfile
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## Prerequisites

* Node.js ≥ 20 (ถ้าจะรันนอก Docker)
* Docker & Docker Compose (ถ้าจะรันด้วยคอนเทนเนอร์)
* PostgreSQL/TimescaleDB พร้อมสิทธิ์สร้าง schema/tables

---

## วิธีเริ่มต้นแบบเร็ว

### 1) ใช้ Docker Compose (แนะนำ)

เพิ่ม service ลงใน `docker-compose.yml` (ตัวอย่าง):

```yaml
networks:
  farm_cloud:
    driver: bridge

volumes:
  timescale-cloud-data:

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    container_name: timescaledb
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: sensor_cloud_db
    ports:
      - "25432:5432"        # ต่อจาก host ใช้ 25432
    networks: [farm_cloud]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d sensor_cloud_db || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10

  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile
    container_name: auth-service
    depends_on:
      timescaledb:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:password@timescaledb:5432/sensor_cloud_db
      AUTH_PORT: 7300
      JWT_SECRET_KEY: super-long-secret-here
      TOKEN_EXPIRATION_MINUTES: "1440"
      REFRESH_TOKEN_EXPIRE_DAYS: "7"
      ALGORITHM: HS256
      CORS_ALLOWED_ORIGINS: "*"
      CORS_ALLOW_METHODS: "*"
      CORS_ALLOW_HEADERS: "*"
      CORS_ALLOW_CREDENTIALS: "true"
      # CUSTOMER_SERVICE_URL: http://customer-service:4107/api/customers
    ports:
      - "7300:7300"
    networks: [farm_cloud]
```

รัน:

```bash
docker-compose up --build auth-service
# Swagger UI: http://localhost:7300/api-docs
```

> **หมายเหตุพอร์ต:** คอนเทนเนอร์-คุย-กับ-คอนเทนเนอร์ ใช้พอร์ต **5432** เสมอ (`timescaledb:5432`)
> ต่อจากเครื่อง host → ใช้ 25432 ตามการแมป `25432:5432`

### 2) รัน Local (ไม่ใช้ Docker)

1. สร้าง DB + schema (ดูหัวข้อ [Database Schema](#database-schema))
2. ตั้งค่า `.env` (ตัวอย่างด้านล่าง)
3. สั่งรัน:

```bash
yarn install
yarn build
yarn start     # หรือ yarn dev
```

---

## Environment Variables

ตัวสำคัญ:

| Name                        | ค่าเริ่มต้น/ตัวอย่าง                                            | อธิบาย                                   |
| --------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`              | `postgres://postgres:password@timescaledb:5432/sensor_cloud_db` | **แนะนำตั้งอันนี้อันเดียว** ชัดเจนสุด    |
| `AUTH_PORT`                 | `7300`                                                          | พอร์ตของ auth-service                    |
| `JWT_SECRET_KEY`            | *(จำเป็น)*                                                      | ควรยาวและสุ่มดี ๆ                        |
| `ALGORITHM`                 | `HS256`                                                         | `HS256`/`HS384`/`HS512`                  |
| `TOKEN_EXPIRATION_MINUTES`  | `1440`                                                          | อายุ access token (นาที)                 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7`                                                             | อายุ refresh token (วัน)                 |
| `CUSTOMER_SERVICE_URL`      | *(เช่น)* `http://localhost:4107/api/customers`                  | endpoint สำหรับสร้าง customer ตอน signup |
| `CORS_ALLOWED_ORIGINS`      | `*`                                                             | รายการ origin คั่นด้วย comma             |
| `CORS_ALLOW_METHODS`        | `*`                                                             | รายการ method หรือ `*`                   |
| `CORS_ALLOW_HEADERS`        | `*`                                                             | รายการ header หรือ `*`                   |
| `CORS_ALLOW_CREDENTIALS`    | `true`                                                          | `true/false`                             |

> โค้ดจะ **สังเคราะห์ `DATABASE_URL`** ให้อัตโนมัติจาก `CLOUD_DB_*` หรือ `DB_*` **ถ้า** ไม่ตั้ง `DATABASE_URL` มา แต่เพื่อความชัดเจนให้ตั้ง `DATABASE_URL` ไปเลยดีที่สุด

ตัวอย่าง `.env` สำหรับรันนอก Docker:

```env
DATABASE_URL=postgres://postgres:password@localhost:25432/sensor_cloud_db
AUTH_PORT=7300
JWT_SECRET_KEY=super-long-secret-here
ALGORITHM=HS256
TOKEN_EXPIRATION_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ALLOWED_ORIGINS=*
CORS_ALLOW_METHODS=*
CORS_ALLOW_HEADERS=*
CORS_ALLOW_CREDENTIALS=true

# CUSTOMER_SERVICE_URL=http://localhost:4107/api/customers
```

---

## Database Schema

ใช้ไฟล์ `02_auth_db.sql` (ย่อส่วนสำคัญ):

```sql
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
  user_id SERIAL PRIMARY KEY,
  customer_id INTEGER,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON auth.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON auth.users
FOR EACH ROW EXECUTE PROCEDURE auth.update_updated_at_column();

CREATE TABLE auth.user_tokens (
  token_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES auth.users(user_id) ON DELETE CASCADE,
  refresh_token TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE,
  device_info TEXT
);

CREATE INDEX idx_users_customer_id ON auth.users(customer_id);
CREATE INDEX idx_user_tokens_user_id ON auth.user_tokens(user_id);
CREATE INDEX idx_user_tokens_refresh_token ON auth.user_tokens(refresh_token);
```

**วิธี apply:**

```bash
# ผ่าน psql
psql "postgres://postgres:password@localhost:25432/sensor_cloud_db" -f 02_auth_db.sql
```

> TypeORM ตั้ง `synchronize: false` — โครงสร้างตารางต้องมาจาก SQL/การ migrate ภายนอก

---

## Run (Dev/Prod)

```bash
# ติดตั้ง deps
yarn install

# Dev (watch)
yarn dev

# Build + Run Prod
yarn build
yarn start
```

Healthcheck: `GET /health` → `{ ok: true, service: 'auth-service', time: ... }`

---

## API

Base URL: `http://localhost:7300`

### POST `/api/auth/signup`

สมัครผู้ใช้ใหม่ + call customer service เพื่อสร้าง tenant

**Body**

```json
{
  "email": "alice@example.com",
  "username": "alice",
  "password": "Passw0rd!",
  "customer": { "name": "Tenant A", "email": "ops@tenant-a.com" }
}
```

**Response 201**

```json
{ "message": "User created" }
```

**Errors**: `400` (validation fail / สร้าง customer ไม่สำเร็จ)

---

### POST `/api/auth/login`

รับ JWT access token + refresh token

**Body**

```json
{ "username": "alice", "password": "Passw0rd!" }
```

**Response 200**

```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>",
  "tokenType": "bearer",
  "userId": 1
}
```

**Errors**: `401` (invalid username/password)

---

### POST `/api/auth/refresh`

แลก refresh token → ได้ **access tokenใหม่** + **refresh tokenใหม่ (rotate)**

**Body**

```json
{ "refreshToken": "<old-refresh-token>" }
```

**Response 200**

```json
{
  "accessToken": "<new-access>",
  "refreshToken": "<new-refresh>",
  "tokenType": "bearer"
}
```

**Errors**: `401` (invalid/expired refresh token)

---

### GET `/api/auth/me`

ต้องส่ง `Authorization: Bearer <accessToken>`

**Response 200**

```json
{
  "userId": 1,
  "username": "alice",
  "email": "alice@example.com",
  "role": "user",
  "createdAt": "2025-08-18T07:10:45.000Z"
}
```

**Errors**: `401`, `404`

---

### cURL Cheatsheet

```bash
# Signup
curl -X POST http://localhost:7300/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","username":"alice","password":"Passw0rd!","customer":{"name":"Tenant A"}}'

# Login
curl -X POST http://localhost:7300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"Passw0rd!"}'

# Me
curl http://localhost:7300/api/auth/me \
  -H "Authorization: Bearer <ACCESS>"

# Refresh
curl -X POST http://localhost:7300/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH>"}'
```

---

## Swagger / OpenAPI

* เปิด UI: `http://localhost:7300/api-docs`

มี 2 โหมดที่รองรับ:

1. **Zod → OpenAPI** (แนะนำ)

   * ใช้ไฟล์ `src/utils/openapi.ts` (`buildOpenApiDoc`) เพื่อ generate spec จาก Zod
   * ต้องใช้ **Zod v3** และ `@asteasolutions/zod-to-openapi@7.x`
   * ถ้าเห็น error คล้าย `Cannot read properties of undefined (reading 'parent')` แสดงว่าใช้ Zod v4 → **downgrade** เป็น `zod@3.23.8`

2. **JSDoc → swagger-jsdoc** (โหมด fallback)

   * ใส่คอมเมนต์ `@swagger` ในไฟล์ route แล้วให้ `swagger-jsdoc` สแกนไฟล์ `dist/**/*.js`
   * ต้องตั้ง `tsconfig.json` → `"removeComments": false` หากต้องการสแกนจาก `src/*.ts` หลัง build

---

## Security Notes

* ใช้ **HS256** ตามค่าเริ่มต้น (configurable ผ่าน `ALGORITHM`)
* เก็บ **refresh token** ใน DB และ **rotate** ทุกครั้งที่ `/refresh` (revoke ตัวเก่า)
* ตั้ง `JWT_SECRET_KEY` ให้ยาว/สุ่ม (อย่าคอมมิตลง repo)
* พิจารณาเพิ่ม:

  * Device binding (`device_info`)
  * Revoke refresh tokens ทั้งหมดเมื่อ user reset password
  * Key rotation (`kid` + JWKs) หากจะย้ายไป RS256/ES256

---

## Troubleshooting

**Swagger UI ว่าง (“No operations defined in spec!”)**

* ถ้าใช้ Zod → OpenAPI: ตรวจ `zod` ต้องเป็น v3 (`3.23.8`) + ใช้ `buildOpenApiDoc` ใน `server.ts`
* ถ้าใช้ swagger-jsdoc: ตรวจ glob ให้สแกน `dist/routes/**/*.js` และเปิด `"removeComments": false`

**`getaddrinfo ENOTFOUND timescaledb`**

* สองคอนเทนเนอร์อยู่คนละ network → ใส่ `networks: [farm_cloud]` ทั้งคู่
* อย่าตั้ง `DATABASE_URL` ไป host ชื่ออื่น (เช่น `cloud-timescale`) หากไม่มี DNS ชื่อนั้น
* ใช้ `timescaledb:5432` ระหว่างคอนเทนเนอร์

**Zod v4 ทำให้ openapi พัง**

* ติดตั้ง `zod@3.23.8` + `@asteasolutions/zod-to-openapi@7.1.0`

**CORS ถูกบล็อก**

* ตั้ง `CORS_ALLOWED_ORIGINS` เป็น comma-separated หรือ `*` (dev เท่านั้น)

**401 Invalid or expired token**

* ตรวจ `Authorization: Bearer <token>`
* ตรวจ `TOKEN_EXPIRATION_MINUTES` และเวลาของเครื่อง (clock drift)

---

## Contributing

* ใช้ TypeScript strict mode
* โค้ดสไตล์: จัด format ด้วย Prettier (ถ้ามี)
* เพิ่มสคีมา Zod ก่อนแตะ business logic
* ถ้าสร้าง endpoint ใหม่:

  1. เพิ่ม Zod schema
  2. ครอบด้วย `validate(schema)`
  3. อัปเดต `openapi.ts` ให้ docs ตามจริง

---

## License

ภายในองค์กร (ยังไม่ระบุสัญญาอนุญาต)


