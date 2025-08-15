# devices-service

`devices-service` เป็น microservice สำหรับจัดการข้อมูลอุปกรณ์ (devices) ภายในระบบ smart farm ซึ่งประกอบด้วยกลุ่มอุปกรณ์ (device groups), ประเภทอุปกรณ์ (device types), ตัวอุปกรณ์เอง, บันทึกเหตุการณ์ (audit logs) และประวัติสถานะอุปกรณ์ (status history)

---

## 📦 โครงสร้างโปรเจกต์

```

    services/devices-service/
    ├── src/
    │   ├── configs/
    │   │   └── config.ts              # โหลด .env และตั้งค่า DB, Port
    │   ├── models/
    │   │   ├── deviceGroup.model.ts
    │   │   ├── deviceType.model.ts
    │   │   ├── device.model.ts
    │   │   ├── deviceLog.model.ts
    │   │   └── deviceStatusHistory.model.ts
    │   ├── routes/
    │   │   ├── index.ts
    │   │   ├── deviceGroup.route.ts
    │   │   ├── deviceType.route.ts
    │   │   ├── device.route.ts
    │   │   ├── deviceLogs.route.ts
    │   │   └── deviceStatusHistory.route.ts
    │   ├── services/
    │   │   ├── deviceGroup.service.ts
    │   │   ├── deviceType.service.ts
    │   │   ├── device.service.ts
    │   │   ├── deviceLogs.service.ts
    │   │   └── deviceStatusHistory.service.ts
    │   ├── utils/
    │   │   └── dataSource.ts          # TypeORM DataSource config
    │   └── server.ts                  # สตาร์ท Express + DataSource
    ├── .env                            # ตั้งค่า environment variables
    ├── package.json
    └── tsconfig.json

```

---

## 🔧 Database Schema

ชื่อ schema: `devices`

### 1. `device_groups`
กลุ่มอุปกรณ์ สามารถซ้อนลำดับชั้นได้ (parent_id)

| Column      | Type             | Notes                                        |
| ----------- | ---------------- | -------------------------------------------- |
| `group_id`  | `SERIAL PK`      | Primary key                                  |
| `name`      | `VARCHAR(100)`   | ชื่อกลุ่ม                                   |
| `note`      | `TEXT`           | คำอธิบาย                                   |
| `category`  | `VARCHAR(50)`    | หมวดหมู่                                   |
| `parent_id` | `INTEGER`        | FK → `device_groups.group_id` ON DELETE CASCADE |
| `created_at`| `TIMESTAMPTZ`    |                                         |
| `updated_at`| `TIMESTAMPTZ`    | Trigger auto-update                       |

### 2. `device_types`
ประเภทอุปกรณ์


| Column             | Type             | Notes                                   |
| ------------------ | ---------------- | --------------------------------------- |
| `type_id`          | `SERIAL PK`      | Primary key                             |
| `name`             | `VARCHAR(100)`   | ชื่อประเภท (unique)                     |
| `icon_css_class`   | `VARCHAR(50)`    | ไอคอน CSS                              |
| `default_image_url`| `TEXT`           | URL รูปภาพปริยาย                       |
| `created_at`       | `TIMESTAMPTZ`    |                                         |
| `updated_at`       | `TIMESTAMPTZ`    | Trigger auto-update                   |


### 3. `devices`
บันทึกข้อมูลอุปกรณ์

| Column                | Type           | Notes                                                              |
| --------------------- | -------------- | ------------------------------------------------------------------ |
| `device_id`           | `SERIAL PK`    | Primary key                                                        |
| `house_id`            | `INTEGER`      | FK → farms.houses(house_id) (optional)                             |
| `type_id`             | `INTEGER`      | FK → device_types(type_id) ON DELETE SET NULL                      |
| `group_id`            | `INTEGER`      | FK → device_groups(group_id) ON DELETE SET NULL                    |
| `model`, `serial_number` | `VARCHAR`   | Model & serial number                                              |
| `install_date`, ...   | `DATE/TIMESTAMPTZ` | หลายฟิลด์ (install, calibration, last_maintenance, build_date, last_seen) |
| `location_detail`     | `TEXT`         | รายละเอียดตำแหน่ง                                                 |
| `manufacturer`, ...   | `VARCHAR/JSONB`| สเปก (specs), config, credentials, tags[]                          |
| `status`              | `VARCHAR(50)`  | Default `active`                                                   |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | Trigger auto-update                                             |

### 4. `device_logs`
บันทึก audit logs ของอุปกรณ์

| Column         | Type         | Notes                                  |
| -------------- | ------------ | -------------------------------------- |
| `log_id`       | `SERIAL PK`  | Primary key                            |
| `device_id`    | `INTEGER`    | FK → devices(device_id) ON DELETE CASCADE |
| `event_type`   | `VARCHAR(50)`| ประเภทเหตุการณ์ (e.g. config_update) |
| `event_data`   | `JSONB`      | รายละเอียดเพิ่มเติม                    |
| `performed_by` | `VARCHAR(100)`| ผู้ทำรายการ                           |
| `created_at`   | `TIMESTAMPTZ`| Timestamp                              |

### 5. `device_status_history`
ประวัติสถานะอุปกรณ์

| Column        | Type         | Notes                                  |
| ------------- | ------------ | -------------------------------------- |
| `id`          | `SERIAL PK`  | Primary key                            |
| `device_id`   | `INTEGER`    | FK → devices(device_id) ON DELETE CASCADE |
| `performed_by`| `VARCHAR(100)`| ผู้ทำรายการ                           |
| `status`      | `VARCHAR(50)`| สถานะใหม่                             |
| `changed_at`  | `TIMESTAMPTZ`| Timestamp (default NOW)                |
| `note`        | `TEXT`       | หมายเหตุ                              |

---

## 🚀 API Endpoints

Base URL:  
```

http\://<host>:<port>/api/devices/…

```

ทุก request ต้องส่ง header:
```

Authorization: Bearer <token>
Content-Type: application/json   // สำหรับ POST/PUT

````

### 1. Device Groups (`/devices/device-groups`)

| Method | URL                      | Body Example                                      | Description                       |
| ------ | ------------------------ | ------------------------------------------------- | --------------------------------- |
| GET    | `/`                      | —                                                 | ดึงรายการกลุ่มอุปกรณ์ทั้งหมด      |
| GET    | `/:id`                   | —                                                 | ดึงกลุ่มตาม `group_id`           |
| POST   | `/`                      | `{ "name": "Sensors", "category":"IoT", "note":"" }` | สร้างกลุ่มอุปกรณ์ใหม่            |
| PUT    | `/:id`                   | `{ "note": "Updated note" }`                      | แก้ไขกลุ่มอุปกรณ์                 |
| DELETE | `/:id`                   | —                                                 | ลบกลุ่มอุปกรณ์                    |

### 2. Device Types (`/devices/device-types`)

| Method | URL                      | Body Example                                        | Description                      |
| ------ | ------------------------ | --------------------------------------------------- | -------------------------------- |
| GET    | `/`                      | —                                                   | ดึงประเภทอุปกรณ์ทั้งหมด           |
| GET    | `/:id`                   | —                                                   | ดึงประเภทตาม `type_id`           |
| POST   | `/`                      | `{ "name":"Thermometer", "icon_css_class":"fa-temp" }` | สร้างประเภทอุปกรณ์ใหม่           |
| PUT    | `/:id`                   | `{ "default_image_url":"http://..." }`              | แก้ไขประเภทอุปกรณ์                |
| DELETE | `/:id`                   | —                                                   | ลบประเภทอุปกรณ์                   |

### 3. Devices (`/devices`)

| Method | URL                      | Body Example                                                                                             | Description                 |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------- |
| GET    | `/`                      | —                                                                                                        | ดึงรายการอุปกรณ์ทั้งหมด     |
| GET    | `/:id`                   | —                                                                                                        | ดึงอุปกรณ์ตาม `device_id`  |
| POST   | `/`                      | `{ "house_id":1, "type_id":2, "group_id":3, "model":"X100", "serial_number":"SN123", "status":"active" }` | สร้างอุปกรณ์ใหม่            |
| PUT    | `/:id`                   | `{ "status":"maintenance", "last_maintenance":"2025-06-15" }`                                            | แก้ไขอุปกรณ์                |
| DELETE | `/:id`                   | —                                                                                                        | ลบอุปกรณ์                   |

### 4. Device Logs (`/devices/device-logs`)

| Method | URL                      | Body Example                                                      | Description                         |
| ------ | ------------------------ | ----------------------------------------------------------------- | ----------------------------------- |
| GET    | `/`                      | `?device_id=1` (optional)                                         | ดึงบันทึกทั้งหมด หรือกรองตาม `device_id` |
| GET    | `/:id`                   | —                                                                 | ดึงบันทึกตาม `log_id`              |
| POST   | `/`                      | `{ "device_id":1, "event_type":"reboot", "event_data":{}, "performed_by":"admin" }` | สร้างบันทึกเหตุการณ์                |
| PUT    | `/:id`                   | `{ "event_data": { "foo": "bar" } }`                              | แก้ไขบันทึก                        |
| DELETE | `/:id`                   | —                                                                 | ลบบันทึก                           |

### 5. Device Status History (`/devices/device-status-history`)

| Method | URL                      | Body Example                                                      | Description                              |
| ------ | ------------------------ | ----------------------------------------------------------------- | ---------------------------------------- |
| GET    | `/`                      | `?device_id=1` (optional)                                         | ดึงประวัติสถานะทั้งหมด หรือกรองตาม `device_id` |
| GET    | `/:id`                   | —                                                                 | ดึงตาม `id`                             |
| POST   | `/`                      | `{ "device_id":1, "status":"offline", "performed_by":"technician" }` | สร้างประวัติสถานะใหม่                  |
| PUT    | `/:id`                   | `{ "status":"active" }`                                           | แก้ไขประวัติสถานะ                       |
| DELETE | `/:id`                   | —                                                                 | ลบประวัติสถานะ                          |

---

## 🛠️ การติดตั้ง & รัน

1. ติดตั้ง dependencies  
   ```bash
   yarn install
````

2. สร้างไฟล์ `.env` และตั้งค่า:

   ```
   DB_HOST=...
   DB_PORT=5432
   DB_USER=...
   DB_PASSWORD=...
   DB_NAME=devices_db
   DEVICES_SERVICE_PORT=4140
   JWT_SECRET_KEY=...
   ```
3. รันในโหมดพัฒนา

   ```bash
   yarn dev
   ```
4. หรือ build + start

   ```bash
   yarn build
   yarn start
   ```

---

## 💡 หมายเหตุ

* ฟิลด์วันที่ควรใช้ ISO 8601 (e.g. `2025-06-15` หรือ `2025-06-15T00:00:00Z`)
* ทุกตารางมี trigger อัปเดต `updated_at` อัตโนมัติ
* สามารถขยายด้วย pagination, filtering, และ validation เพิ่มเติมได้ตามต้องการ

---

หากต้องการตัวอย่าง Postman Collection หรือข้อมูลเสริม แจ้งได้เลยครับ!
