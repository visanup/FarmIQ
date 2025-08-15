```markdown
# customer-service

`customer-service` เป็น microservice สำหรับบริหารจัดการข้อมูลลูกค้า (customers) และการสมัครสมาชิก (subscriptions) ภายในระบบ โดยใช้ PostgreSQL schema `customers` และ Express + TypeScript

---

## 📦 โครงสร้างโปรเจกต์

```

    services/customer-service/

        ├── src/
        │   ├── configs/
        │   │   └── config.ts                  # โหลด .env และตั้งค่า DB, Port
        │   ├── models/
        │   │   ├── customer.model.ts          # Entity สำหรับ customers.customers
        │   │   └── subscription.model.ts      # Entity สำหรับ customers.subscriptions
        │   ├── routes/
        │   │   ├── index.ts                   # รวม router
        │   │   ├── customer.route.ts          # เส้นทาง /api/customers
        │   │   └── subscription.route.ts      # เส้นทาง /api/subscriptions
        │   ├── services/
        │   │   ├── customer.service.ts        # โลจิก CRUD customers
        │   │   └── subscriptions.service.ts   # โลจิก CRUD subscriptions
        │   ├── utils/
        │   │   └── dataSource.ts              # TypeORM DataSource config
        │   └── server.ts                      # สตาร์ท Express + DataSource
        ├── .env                                # ตั้งค่า environment variables
        ├── package.json
        └── tsconfig.json

````

---

## 🔧 Database Schema

ชื่อ schema: `customers`

### customers.customers

| Column        | Type            | Constraints               | Description                   |
| ------------- | --------------- | ------------------------- | ----------------------------- |
| `customer_id` | `SERIAL PK`     | PRIMARY KEY               | รหัสลูกค้า                   |
| `name`        | `VARCHAR(255)`  | NOT NULL                  | ชื่อลูกค้า                   |
| `email`       | `VARCHAR(255)`  |                           | อีเมล                        |
| `phone`       | `VARCHAR(50)`   |                           | เบอร์โทรศัพท์                |
| `address`     | `TEXT`          |                           | ที่อยู่                       |
| `billing_info`| `JSONB`         |                           | ข้อมูลการเรียกเก็บค่าใช้จ่าย  |
| `created_at`  | `TIMESTAMPTZ`   | DEFAULT NOW()             | วันที่สร้าง                  |
| `updated_at`  | `TIMESTAMPTZ`   | DEFAULT NOW() (trigger)   | วันที่แก้ไขล่าสุด             |

- มี index บน `email`
- Trigger `update_customers_updated_at` อัปเดต `updated_at` อัตโนมัติ

### customers.subscriptions

| Column           | Type            | Constraints                                             | Description                  |
| ---------------- | --------------- | ------------------------------------------------------- | ---------------------------- |
| `subscription_id`| `SERIAL PK`     | PRIMARY KEY                                             | รหัสการสมัคร                 |
| `customer_id`    | `INTEGER`       | REFERENCES customers.customers(customer_id) ON DELETE CASCADE | รหัสลูกค้า                |
| `plan_type`      | `VARCHAR(100)`  |                                                         | ประเภทแผน                   |
| `start_date`     | `DATE`          |                                                         | วันเริ่มต้น                |
| `end_date`       | `DATE`          |                                                         | วันสิ้นสุด (optional)       |
| `status`         | `VARCHAR(50)`   | DEFAULT 'active'                                        | สถานะ (active/inactive)     |
| `created_at`     | `TIMESTAMPTZ`   | DEFAULT NOW()                                           | วันที่สร้าง                 |
| `updated_at`     | `TIMESTAMPTZ`   | DEFAULT NOW() (trigger)                                 | วันที่แก้ไขล่าสุด            |

- มี index บน `customer_id`
- Trigger `update_subscriptions_updated_at` อัปเดต `updated_at` อัตโนมัติ

---

## 🚀 การติดตั้ง & รัน

1. **ติดตั้ง dependencies**
   ```bash
   yarn install
````

2. **ตั้งค่าไฟล์ `.env`**
   ตัวอย่าง:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=secret
   DB_NAME=customers_db
   CUSTOMER_SERVICE_PORT=4130
   ```
3. **รันในโหมดพัฒนา**

   ```bash
   yarn dev
   ```
4. **หรือ build + start**

   ```bash
   yarn build
   yarn start
   ```

---

## 🔗 API Endpoints

Base URL:

```
http://<host>:<port>/api
```

ทุก request ส่ง header:

```
Content-Type: application/json
```

### 1. Customers

| Method | URL              | Body Example                                                                                                                             | Description                |
| ------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| GET    | `/customers`     | —                                                                                                                                        | ดึงรายการลูกค้าทั้งหมด     |
| GET    | `/customers/:id` | —                                                                                                                                        | ดึงลูกค้าตาม `customer_id` |
| POST   | `/customers`     | `{ "name": "Acme Co.", "email": "info@acme.com", "phone": "0123456789", "address": "Bangkok", "billing_info": { "vat": "1234567890" } }` | สร้างลูกค้าใหม่            |
| PUT    | `/customers/:id` | `{ "email": "contact@acme.com", "address": "Nonthaburi" }`                                                                               | แก้ไขข้อมูลลูกค้า          |
| DELETE | `/customers/:id` | —                                                                                                                                        | ลบลูกค้า                   |

### 2. Subscriptions

| Method | URL                  | Body Example                                                                                                             | Description                      |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| GET    | `/subscriptions`     | —                                                                                                                        | ดึงรายการการสมัครสมาชิกทั้งหมด   |
| GET    | `/subscriptions/:id` | —                                                                                                                        | ดึงการสมัครตาม `subscription_id` |
| POST   | `/subscriptions`     | `{ "customer_id": 1, "plan_type": "Premium", "start_date": "2025-07-01", "end_date": "2026-06-30", "status": "active" }` | สร้างการสมัครสมาชิกใหม่          |
| PUT    | `/subscriptions/:id` | `{ "status": "inactive", "end_date": "2025-12-31" }`                                                                     | แก้ไขข้อมูลการสมัครสมาชิก        |
| DELETE | `/subscriptions/:id` | —                                                                                                                        | ลบการสมัครสมาชิก                 |

---

## 💡 Notes

* ฟิลด์วันที่ (`start_date`, `end_date`, `created_at`, `updated_at`) ใช้รูปแบบ ISO 8601 (e.g. `2025-07-01` หรือ `2025-07-01T00:00:00Z`)
* การลบลูกค้าจะ cascade ลบ record ในตาราง `subscriptions` อัตโนมัติ
* ควรตรวจสอบ validation (เช่น `name` ไม่เป็น null) ก่อนส่งเข้า service
* สามารถเพิ่ม pagination / filtering ได้ในอนาคต

---

หากมีคำถามเพิ่มเติมหรือขอตัวอย่าง Postman Collection สามารถแจ้งได้เลยครับ!
