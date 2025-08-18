# Customer Service — README

บริการจัดการลูกค้า/สมาชิกและการสมัครใช้งาน (multi-tenant) สำหรับสแตก FarmIQ
เขียนด้วย **Node.js + TypeScript + Express + TypeORM + PostgreSQL/TimescaleDB** พร้อม **Zod + OpenAPI** และ **JWT auth** (ทำงานร่วมกับ `auth-service`)

---

## ไฮไลท์

* ✅ Multi-tenant: ทุกคำขอถูกผูกด้วย `tenant_id` จาก JWT
* ✅ RBAC เบื้องต้น: `owner|admin|member|viewer` (ตรวจจาก JWT + ตาราง member)
* ✅ CRUD ครบ: `customers`, `contacts`, `customer_users`, `plan_catalog`, `subscriptions`
* ✅ Zod Schemas → Generate **OpenAPI JSON** + **Swagger UI** อัตโนมัติ
* ✅ TypeORM + Postgres (schema: `customers`) รองรับ soft-delete (`deleted_at`)
* ✅ Middleware ครบ: JWT verify, Helmet, CORS, Compression, Morgan, Error handler
* ✅ Health & graceful shutdown

---

## โครงสร้างโปรเจกต์ (ย่อ)

```
services/customer-service/
├─ src/
│  ├─ configs/            # โหลด .env, JWT, ports
│  ├─ middlewares/        # auth.ts, errorHandler.ts
│  ├─ models/             # Customer, Contact, CustomerUser, PlanCatalog, Subscription
│  ├─ routes/             # *.route.ts (customers, contacts, users, plans, subs, me, index)
│  ├─ schemas/            # Zod schemas (แปลงเป็น OpenAPI)
│  ├─ services/           # business logic (CustomerService, SubscriptionService, ...)
│  ├─ utils/
│  │  ├─ dataSource.ts    # TypeORM DataSource
│  │  └─ openapi.ts       # OpenApiRegistry + OpenApiGeneratorV3
│  └─ server.ts
├─ db/
│  └─ 01_schema.sql       # DDL (ตาราง, index, trigger) — schema "customers"
├─ package.json
└─ Dockerfile
```

---

## ใช้ร่วมกับบริการอื่น

* ต้องมี `auth-service` ออก **JWT (HS256)** ที่มีอย่างน้อย:

  ```json
  {
    "sub": "user-uuid",
    "tenant_id": "org-xxx",
    "role": "admin" // owner|admin|member|viewer
  }
  ```
* บริการนี้จะอ่าน JWT จาก Header: `Authorization: Bearer <token>`
  แล้วใช้ `tenant_id` เพื่อจำกัดขอบเขตข้อมูล (row-level by query)

---

## การติดตั้ง & รัน

### 1) เตรียมสิ่งแวดล้อม

* Node.js >= 18, Yarn
* PostgreSQL/TimescaleDB พร้อมสิทธิ์สร้าง schema
* ค่าแวดล้อมในไฟล์ `.env` (ตัวอย่างด้านล่าง)

### 2) .env ตัวอย่าง

```env
# Service
CUSTOMER_SERVICE_PORT=7301
NODE_ENV=development

# JWT (ต้องตรงกับ auth-service)
JWT_SECRET_KEY=supersecret
ALGORITHM=HS256

# Database (เลือกอย่างใดอย่างหนึ่ง)
DATABASE_URL=postgres://postgres:password@timescaledb:5432/sensor_cloud_db
# หรือแบบแยกค่า
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=sensor_cloud_db
DB_USER=postgres
DB_PASSWORD=password

# (ถ้า run ใน container แล้ว .env ไม่อยู่ที่ root)
ENV_PATH=/app/.env
```

> โค้ดจะพยายาม **สังเคราะห์** `DATABASE_URL` ให้อัตโนมัติจาก `DB_*` ถ้ายังไม่มีตัวแปรนี้

### 3) เตรียมฐานข้อมูล (DDL)

รันสคริปต์ `db/01_schema.sql` ใน Postgres/TimescaleDB หนึ่งครั้ง:

```bash
psql "$DATABASE_URL" -f db/01_schema.sql
```

ตาราง/อินเด็กซ์/ทริกเกอร์ที่สำคัญ:

* `customers.customers` (มี soft delete: `deleted_at`)
* `customers.contacts`
* `customers.customer_users`
* `customers.plan_catalog`
* `customers.subscriptions`
* ฟังก์ชัน `customers.touch_updated_at()` อัปเดต `updated_at` อัตโนมัติ

> แนะนำใส่ seed ของ `plan_catalog` ด้วย (ตัวอย่างในท้าย README)

### 4) ติดตั้ง & รัน (local)

```bash
yarn install
yarn dev         # ts-node-dev (hot reload)
# หรือ production
yarn build
yarn start
```

### 5) Docker (รันเฉพาะ service)

ตัวอย่าง docker-compose (ย่อ):

```yaml
services:
  timescaledb:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: sensor_cloud_db
    volumes: [ timescale-cloud-data:/var/lib/postgresql/data ]

  customer-service:
    build:
      context: ./services/customer-service
    depends_on:
      timescaledb:
        condition: service_healthy
    environment:
      CUSTOMER_SERVICE_PORT: "7301"
      DATABASE_URL: "postgres://postgres:password@timescaledb:5432/sensor_cloud_db"
      JWT_SECRET_KEY: "supersecret"
      ALGORITHM: "HS256"
    ports:
      - "7301:7301"
volumes:
  timescale-cloud-data:
```

---

## Endpoints

### สาธารณะ

* `GET /health` — 200 OK

### เอกสาร API

* Swagger UI: `GET /api-docs`
* OpenAPI JSON: `GET /api-docs-json` (ถ้ามี mapping ใน `server.ts`)

  > เอกสารถูก generate จาก Zod ผ่าน `OpenApiGeneratorV3`

### ต้องใช้ JWT (ส่วนใหญ่ขึ้นต้น `/api/...`)

#### Customers

* `GET    /api/customers` — รายชื่อลูกค้า (ของ tenant ปัจจุบัน)
* `POST   /api/customers` — สร้างลูกค้าใหม่
* `GET    /api/customers/:id`
* `PUT    /api/customers/:id`
* `DELETE /api/customers/:id` — soft-delete (ตั้ง `deleted_at`)

#### Contacts

* `GET    /api/customers/:id/contacts`
* `POST   /api/customers/:id/contacts`
* `PUT    /api/contacts/:contactId`
* `DELETE /api/contacts/:contactId`

#### Customer Users (สมาชิกของลูกค้า)

* `GET    /api/customers/:id/users`
* `POST   /api/customers/:id/users`  (body: `{ user_id, role }`)
* `DELETE /api/customers/:id/users/:customer_user_id`

#### Plan Catalog

* `GET    /api/plans`
* `POST   /api/plans` (admin only)
* `PUT    /api/plans/:plan_code` (admin only)
* `DELETE /api/plans/:plan_code` (admin only)

#### Subscriptions

* `GET    /api/customers/:id/subscriptions`
* `POST   /api/customers/:id/subscriptions`  (body: `{ plan_code, start_date, ... }`)
* `GET    /api/subscriptions/:subscription_id`
* `PUT    /api/subscriptions/:subscription_id`
* `DELETE /api/subscriptions/:subscription_id`

#### Me (บริบทผู้ใช้)

* `GET /api/me` — คืนข้อมูล tenant, roles, ลูกค้าที่สังกัด (สำหรับ front-end)

> เส้นทางจริงขึ้นอยู่กับไฟล์ใน `src/routes/` — README นี้สรุปโครงหลักที่โปรเจกต์ใช้อยู่

---

## ตัวอย่าง cURL

### 1) สร้างลูกค้า

```bash
curl -X POST http://localhost:7301/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Co.",
    "email": "ops@acme.co",
    "billing_info": {"vat_id":"THxxxx"},
    "status": "active"
  }'
```

### 2) เพิ่มสมาชิกให้ลูกค้า

```bash
curl -X POST http://localhost:7301/api/customers/123/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-uuid-123","role":"admin"}'
```

### 3) สร้าง Subscription

```bash
curl -X POST http://localhost:7301/api/customers/123/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_code":"PRO","start_date":"2025-01-01"}'
```

---

## การยืนยันตัวตน & Multi-Tenant

* Middleware `authenticateToken` จะตรวจ `Authorization: Bearer <jwt>`
* Payload ที่ใช้:

  * `sub` (string) — user id จาก auth-service
  * `tenant_id` (string) — องค์กร/ผู้เช่า
  * `role` (string) — owner|admin|member|viewer
* ทุกคำสั่งอ่าน/เขียนในบริการจะกรองด้วย `tenant_id`
* บางเส้นทางตรวจ role เพิ่มเติม (เช่น จัดการ `plan_catalog` เฉพาะ admin)

หาก token หมดอายุ → 401 `Token has expired`
token ไม่ถูกต้อง → 403 `Invalid token`

---

## การตรวจสอบข้อมูลเข้า (Zod) + OpenAPI

* Schemas อยู่ที่ `src/schemas/*.ts` (เช่น `CustomerCreate`, `CustomerUpdate`, `SubscriptionCreate` ฯลฯ)
* เราใช้ `@asteasolutions/zod-to-openapi`:

  * ลงทะเบียน `securitySchemes` ผ่าน `registry.registerComponent('securitySchemes', 'bearerAuth', {...})`
  * ลงทะเบียน `paths` ให้ตรงกับ routes
  * ใช้ `OpenApiGeneratorV3` สร้างเอกสาร แล้วเสิร์ฟผ่าน `/api-docs` (Swagger UI)

> ถ้าอยาก export JSON ไฟล์: เพิ่มสคริปต์ใน `package.json` ให้รันตัวสร้างเอกสารไปเขียนไฟล์ `openapi.json`

---

## สถานะตอบกลับ & รูปแบบ error

* 200/201: สำเร็จ
* 204: ลบสำเร็จ (ไม่มี body)
* 400: ข้อมูลเข้าไม่ผ่าน Zod
* 401/403: ปัญหา JWT
* 404: ไม่พบทรัพยากรใน tenant นี้
* 409: unique conflict (เช่น `(tenant_id, name)` ซ้ำ)
* 500: ความผิดพลาดภายใน

รูปแบบ error:

```json
{ "error": "message" }
```

---

## หมายเหตุด้านฐานข้อมูล

* Unique: `(tenant_id, name)` ของ `customers` (เฉพาะแถวที่ `deleted_at IS NULL`)
* Soft delete: การลบลูกค้าจะตั้ง `deleted_at` แทนการลบจริง
* Trigger: `updated_at` ถูกอัปเดตโดยอัตโนมัติทุกครั้งที่ UPDATE
* Index ที่สำคัญ:

  * `uq_customers_tenant_name (tenant_id, name) WHERE deleted_at IS NULL`
  * `idx_customers_email`
  * foreign keys & indexes บน contacts / subscriptions

### Seed `plan_catalog` (ตัวอย่าง)

```sql
INSERT INTO customers.plan_catalog(plan_code, name, description, entitlements)
VALUES
 ('FREE','Free','For trial use', '{"max_devices":5, "alerting": false}'::jsonb),
 ('PRO','Pro','For SME',        '{"max_devices":50, "alerting": true}'::jsonb),
 ('ENT','Enterprise','For large org', '{"max_devices":1000, "alerting": true, "sso": true}'::jsonb)
ON CONFLICT (plan_code) DO NOTHING;
```

---

## การปรับแต่ง

* **CORS**: ปรับต้นทางที่อนุญาตได้ใน `server.ts`
* **Logging**: ใช้ `morgan('combined')` (production-friendly)
* **Compression**: ใช้ `compression()` — ปิด/เปิดได้ที่ `server.ts`
* **Swagger servers**: เปลี่ยน URL ที่โชว์ใน Swagger UI ให้ตรงพอร์ตจริง

---

## คำสั่งที่ใช้บ่อย

```bash
yarn dev            # รันโหมดพัฒนา (hot reload)
yarn build          # คอมไพล์ TypeScript → dist
yarn start          # รันจาก dist
yarn lint           # ถ้ามี eslint
```

---

## Troubleshooting

* **`ECONNREFUSED timescaledb:5432`**
  ตรวจ `DATABASE_URL` ให้ชี้ service `timescaledb` ใน compose เดียวกัน และ `depends_on` ถูกต้อง
* **`JWT_SECRET_KEY missing`**
  ตั้งค่าใน `.env` ให้ตรงกับ `auth-service`
* **Swagger ขึ้นแต่ไม่มี endpoints**
  ตรวจ `src/utils/openapi.ts` ว่าลงทะเบียน `registerPath` ครบตรงกับไฟล์ route
* **Unique violation (409)**
  ชื่อลูกค้า (`name`) ซ้ำใน tenant เดียวกัน ให้เปลี่ยนชื่อหรือ restore จาก soft-delete ก่อน

---

## License

ภายในองค์กร

