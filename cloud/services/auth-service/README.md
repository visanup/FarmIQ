````markdown
# auth-service

`auth-service` เป็น microservice สำหรับจัดการ Authentication และ Authorization ด้วย JWT และ Refresh Token ผ่าน PostgreSQL schema `auth`

---

## 🔧 Database Schema

ชื่อ database/schema: `auth`

### ตาราง `auth.users`
| Column         | Type               | Constraints                     | Description                   |
| -------------- | ------------------ | ------------------------------- | ----------------------------- |
| `user_id`      | `SERIAL`           | `PRIMARY KEY`                   | รหัสผู้ใช้งาน                  |
| `customer_id`  | `INTEGER`          |                                 | รหัสลูกค้า (ถ้ามี)             |
| `username`     | `VARCHAR(100)`     | `UNIQUE NOT NULL`               | ชื่อผู้ใช้งาน                  |
| `password_hash`| `TEXT`             | `NOT NULL`                      | รหัสผ่านที่เข้ารหัสไว้          |
| `role`         | `VARCHAR(50)`      | `DEFAULT 'user'`                | สิทธิ์การใช้งาน (e.g. user/admin) |
| `email`        | `VARCHAR(255)`     |                                 | อีเมล                         |
| `created_at`   | `TIMESTAMPTZ`      | `DEFAULT NOW()`                 | วันที่สร้างบัญชี               |
| `updated_at`   | `TIMESTAMPTZ`      | `DEFAULT NOW()`                 | วันที่แก้ไขล่าสุด (trigger)     |

- มี Index บน `customer_id`
- Trigger อัปเดต `updated_at` อัตโนมัติก่อนทุก UPDATE

### ตาราง `auth.user_tokens`
| Column         | Type               | Constraints                     | Description                   |
| -------------- | ------------------ | ------------------------------- | ----------------------------- |
| `token_id`     | `SERIAL`           | `PRIMARY KEY`                   | รหัสบันทึก Refresh Token     |
| `user_id`      | `INTEGER`          | `REFERENCES auth.users(user_id)` ON DELETE CASCADE | ผู้ใช้งาน               |
| `refresh_token`| `TEXT`             | `UNIQUE NOT NULL`               | Refresh Token string         |
| `issued_at`    | `TIMESTAMPTZ`      | `DEFAULT NOW()`                 | วัน-เวลาที่ออก Token         |
| `expires_at`   | `TIMESTAMPTZ`      |                                 | วัน-เวลาที่หมดอายุ           |
| `revoked`      | `BOOLEAN`          | `DEFAULT FALSE`                 | สถานะถูกเพิกถอนหรือไม่        |
| `device_info`  | `TEXT`             |                                 | ข้อมูลอุปกรณ์ (optional)     |

- มี Index บน `user_id` และ `refresh_token`

---

## 🚀 การติดตั้ง

1. Clone โปรเจกต์
   ```bash
   git clone <repo-url>
   cd services/auth-service
````

2. ติดตั้ง dependencies

   ```bash
   yarn install
   ```
3. สร้างไฟล์ `.env` (ที่โฟลเดอร์ root) และตั้งค่าตามนี้

   ```dotenv
   DB_HOST=<your-db-host>
   DB_PORT=<your-db-port>
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   DB_NAME=<your-db-name>        # ควรเป็น database ที่มี schema auth
   AUTH_SERVICE_PORT=4120        # หรือพอร์ตที่ต้องการ
   JWT_SECRET_KEY=<your-secret>
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ALGORITHM=HS256
   ```
4. รันบริการในโหมดพัฒนา

   ```bash
   yarn dev
   ```

   หรือ build แล้วรัน

   ```bash
   yarn build
   yarn start
   ```

---

## 📡 API Endpoints

Base URL:

```
http://<host>:<port>/api/auth
```

ทุุก endpoint ส่ง `Content-Type: application/json`

| # | Purpose                  | Method | URL        | Body Example                                                                   | Success Response Example                                                                                                                  | Notes                                                |
| - | ------------------------ | ------ | ---------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1 | สมัครสมาชิก (Sign Up)    | POST   | `/signup`  | `{ "email": "user@example.com", "username": "user1", "password": "P@ssw0rd" }` | `201 Created`<br>`{ "userId": 5, "username": "user1", "email": "user@example.com", "role": "user", "createdAt": "2025-06-12T08:00:00Z" }` | จะเข้ารหัส password และบันทึกลง DB                   |
| 2 | เข้าสู่ระบบ (Log In)     | POST   | `/login`   | `{ "username": "user1", "password": "P@ssw0rd" }`                              | `200 OK`<br>`{ "accessToken": "...", "expiresIn": 3600, "refreshToken": "..." }`                                                          | คืนทั้ง AccessToken และ RefreshToken                 |
| 3 | ต่ออายุ Access Token     | POST   | `/refresh` | `{ "refreshToken": "..." }`                                                    | `200 OK`<br>`{ "accessToken": "...", "expiresIn": 3600 }`                                                                                 | ตรวจสอบว่า token ยังไม่ถูกเพิกถอน                    |
| 4 | โปรไฟล์ผู้ใช้งานปัจจุบัน | GET    | `/me`      | —                                                                              | `200 OK`<br>`{ "userId": 5, "username": "user1", "email": "user@example.com", "role": "user", "createdAt": "2025-06-12T08:00:00Z" }`      | ต้องแนบ header `Authorization: Bearer <accessToken>` |

---

## 🔐 Authentication Flow

1. **Sign Up**: ผู้ใช้ส่งข้อมูลสมัคร → บริการเข้ารหัส password (`bcrypt`) → สร้าง record ใน `auth.users`
2. **Log In**: ตรวจสอบ username/password → ถ้าถูกต้อง → สร้าง Access Token (JWT) และ Refresh Token → บันทึก Refresh Token ใน `auth.user_tokens`
3. **Refresh**: ผู้ใช้ส่ง Refresh Token → ตรวจสอบสถานะใน DB (ไม่ expired, ไม่ revoked) → สร้าง Access Token ใหม่
4. **Get Profile**: ผู้ใช้ส่ง Access Token → ตรวจสอบ JWT → คืนข้อมูลผู้ใช้จากตาราง `auth.users`

---

## 📂 โครงสร้างโฟลเดอร์

```
services/auth-service/
├── src/
│   ├── configs/
│   │   └── config.ts           # โหลด .env และตั้งค่า JWT, DB URL
│   ├── models/
│   │   ├── user.model.ts       # Entity สำหรับ users
│   │   └── refreshToken.model.ts # Entity สำหรับ user_tokens
│   ├── routes/
│   │   ├── index.ts            # รวม router
│   │   └── authRoutes.ts       # เส้นทาง signup, login, refresh, me
│   ├── services/
│   │   └── authService.ts      # โลจิกการสมัคร, เข้าสู่ระบบ, ต่ออายุ
│   ├── utils/
│   │   └── dataSource.ts       # TypeORM DataSource config
│   └── server.ts               # สตาร์ท Express + DataSource
├── .env                        # ไฟล์ config (ไม่เก็บใน Git)
├── package.json
└── tsconfig.json
```

---

## 🛠️ ข้อแนะนำเพิ่มเติม

* ใช้ **bcrypt** สำหรับ hashing รหัสผ่าน
* ใช้ **class-validator** กับ DTO ถ้าต้องการ validation ที่เข้มงวดขึ้น
* ทำ **database migrations** ด้วย TypeORM CLI เมื่อ schema มีการเปลี่ยนแปลง
* จัดการ **error handling** ให้ครอบคลุมใน service และ controller
* เพิ่ม **rate limit** หรือ **brute-force protection** สำหรับ endpoint `/login`

---

หากมีข้อสงสัยหรือต้องการตัวอย่างโค้ดเพิ่มเติม กรุณาแจ้งได้เลยครับ!
