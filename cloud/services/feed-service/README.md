# feed-service

`feed-service` เป็น microservice สำหรับจัดการวงจรข้อมูลการผลิตอาหารสัตว์ (Feed): ตั้งแต่สร้าง Feed Batch, เก็บข้อมูลคุณภาพวัตถุดิบทั้งทางกายภาพและเคมี, บันทึกสภาพการผลิต (Pellet Mill, Mixing, Grinding) จนถึงการมอบหมาย Feeding ให้กับสัตว์แต่ละตัว

---

## 📑 สรุปภาพรวม

- **Feed Batch**: สร้าง–อ่าน–อัปเดต–ลบ (CRUD) ข้อมูลชุดผลิตอาหาร  
- **Physical Quality**: เก็บ–อ่าน–อัปเดต–ลบ ค่าคุณลักษณะกายภาพ เช่น ความชื้น  
- **Chemical Quality**: เก็บ–อ่าน–อัปเดต–ลบ ข้อมูลสารอาหารเคมี เช่น โปรตีน  
- **Pellet Mill / Mixing / Grinding Conditions**: บันทึก–อ่าน–อัปเดต–ลบ พารามิเตอร์กระบวนการผลิต  
- **Feed Batch Assignment**: จัดตารางการให้อาหารสัตว์ (assign) พร้อมช่วงเวลาและจำนวนอาหาร  

---

## 🔧 การติดตั้ง

1. **Clone โปรเจกต์**
   ```bash
   git clone <repo-url>
   cd services/feed-service


2. **ติดตั้ง dependencies**

   ```bash
   yarn install
   ```
3. **สร้างไฟล์ `.env`** (อยู่ที่ root ของบริการ)

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=secret
   DB_NAME=feed_db
   FEED_SERVICE_PORT=4110
   JWT_SECRET_KEY=your_jwt_secret
   TOKEN_EXPIRATION_MINUTES=1440
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ALGORITHM=HS256
   ```
4. **รันในโหมดพัฒนา**

   ```bash
   yarn dev
   ```
5. **หรือ build + start**

   ```bash
   yarn build
   yarn start
   ```

---

## 🗄️ โครงสร้างฐานข้อมูลหลัก

Service นี้ใช้ PostgreSQL schema `feeds` (ปรับชื่อตารางตามโค้ดจริง):

* **feed\_batches**

  * `production_date` + `feed_batch_id` เป็น composite PK
  * ข้อมูลชุดผลิตอาหาร: โรงงาน, สูตร, สายการผลิต, เลขชุด, ประเภทอาหาร

* **physical\_quality**

  * FK → `feed_batches`
  * ชื่อคุณลักษณะกายภาพ (e.g. Moisture), ค่า, หน่วย

* **chemical\_quality**

  * FK → `feed_batches`
  * ชื่อสารอาหาร (e.g. Protein), ปริมาณ, หน่วย

* **pellet\_mill\_condition**, **mixing\_condition**, **grinding\_condition**

  * FK → `feed_batches`
  * บันทึกพารามิเตอร์กระบวนการ เช่น อุณหภูมิ, ความเร็ว, ความดัน

* **feed\_batch\_assignments**

  * FK → `feed_batches`, `farms`, `houses`, `animals`
  * กำหนดช่วงเวลา (`assignedStart`, `assignedEnd`), ปริมาณอาหาร, หมายเหตุ

*ทุกตารางมีฟิลด์ `created_at` และ `updated_at` อัปเดตอัตโนมัติด้วย trigger*

---

## 🚀 API Endpoints

**Base URL:** `http://<host>:<port>/api`

ทุก request ต้องมี header:

```
Authorization: Bearer <token>
Content-Type: application/json  // สำหรับ POST / PUT
```

### 1. Feed Batches

| Method | URL                                          | Body Example                                                                                                                                       | Description                      |
| ------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| GET    | `/feed-batches`                              | —                                                                                                                                                  | ดึงชุดผลิตทั้งหมด                |
| GET    | `/feed-batches/:productionDate/:feedBatchId` | —                                                                                                                                                  | ดึงชุดผลิตตามวันที่และรหัส batch |
| POST   | `/feed-batches`                              | `{ "productionDate":"2025-05-01T00:00:00Z", "farmId":1, "formulaId":2, "formulaNo":"F02", "lineNo":"LN01", "batchNo":"B123", "feedType":"TypeA" }` | สร้างชุดผลิตใหม่                 |
| PUT    | `/feed-batches/:productionDate/:feedBatchId` | `{ "farmId":10 }`                                                                                                                                  | แก้ไขฟิลด์บางส่วนในชุดผลิต       |
| DELETE | `/feed-batches/:productionDate/:feedBatchId` | —                                                                                                                                                  | ลบชุดผลิต                        |

### 2. Physical Quality

| Method | URL                     | Body Example                                                                                                            | Description                        |
| ------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| GET    | `/physical-quality`     | —                                                                                                                       | ดึงข้อมูล Physical Quality ทั้งหมด |
| GET    | `/physical-quality/:id` | —                                                                                                                       | ดึงตาม `id`                        |
| POST   | `/physical-quality`     | `{ "productionDate":"2025-05-01T00:00:00Z","feedBatchId":1,"propertyName":"Moisture","propertyValue":12.5,"unit":"%" }` | สร้างข้อมูล Physical Quality       |
| PUT    | `/physical-quality/:id` | `{ "propertyValue":13.0 }`                                                                                              | แก้ไขค่า                           |
| DELETE | `/physical-quality/:id` | —                                                                                                                       | ลบข้อมูล                           |

### 3. Chemical Quality

| Method | URL                     | Body Example                                                                                                    | Description                        |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| GET    | `/chemical-quality`     | —                                                                                                               | ดึงข้อมูล Chemical Quality ทั้งหมด |
| GET    | `/chemical-quality/:id` | —                                                                                                               | ดึงตาม `id`                        |
| POST   | `/chemical-quality`     | `{ "productionDate":"2025-05-01T00:00:00Z","feedBatchId":1,"nutrientName":"Protein","amount":20.5,"unit":"%" }` | สร้างข้อมูล Chemical Quality       |
| PUT    | `/chemical-quality/:id` | `{ "amount":21.0 }`                                                                                             | แก้ไขค่า                           |
| DELETE | `/chemical-quality/:id` | —                                                                                                               | ลบข้อมูล                           |

### 4. Production Conditions

#### Pellet Mill

| Method | URL                          | Body Example                                                                                                       | Description                  |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| GET    | `/pellet-mill-condition`     | —                                                                                                                  | ดึงข้อมูลทั้งหมด             |
| GET    | `/pellet-mill-condition/:id` | —                                                                                                                  | ดึงตาม `id`                  |
| POST   | `/pellet-mill-condition`     | `{ "productionDate":"2025-05-01T00:00:00Z","feedBatchId":1,"parameterName":"Temperature","parameterValue":"85C" }` | บันทึก Pellet Mill Condition |
| PUT    | `/pellet-mill-condition/:id` | `{ "parameterValue":"90C" }`                                                                                       | แก้ไข                        |
| DELETE | `/pellet-mill-condition/:id` | —                                                                                                                  | ลบ                           |

#### Mixing

| Method | URL                     | Body Example                                                                                                    | Description             |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------- |
| GET    | `/mixing-condition`     | —                                                                                                               | ดึงข้อมูลทั้งหมด        |
| GET    | `/mixing-condition/:id` | —                                                                                                               | ดึงตาม `id`             |
| POST   | `/mixing-condition`     | `{ "productionDate":"2025-05-01T00:00:00Z","feedBatchId":1,"parameterName":"Speed","parameterValue":"120rpm" }` | บันทึก Mixing Condition |
| PUT    | `/mixing-condition/:id` | `{ "parameterValue":"130rpm" }`                                                                                 | แก้ไข                   |
| DELETE | `/mixing-condition/:id` | —                                                                                                               | ลบ                      |

#### Grinding

| Method | URL                       | Body Example                                                                                                       | Description               |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| GET    | `/grinding-condition`     | —                                                                                                                  | ดึงข้อมูลทั้งหมด          |
| GET    | `/grinding-condition/:id` | —                                                                                                                  | ดึงตาม `id`               |
| POST   | `/grinding-condition`     | `{ "productionDate":"2025-05-01T00:00:00Z","feedBatchId":1,"parameterName":"Pressure","parameterValue":"150psi" }` | บันทึก Grinding Condition |
| PUT    | `/grinding-condition/:id` | `{ "parameterValue":"155psi" }`                                                                                    | แก้ไข                     |
| DELETE | `/grinding-condition/:id` | —                                                                                                                  | ลบ                        |

### 5. Feed Batch Assignments

| Method | URL                           | Body Example                                                                                                                                                                                                              | Description                |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| GET    | `/feed-batch-assignments`     | —                                                                                                                                                                                                                         | ดึงการมอบหมายทั้งหมด       |
| GET    | `/feed-batch-assignments/:id` | —                                                                                                                                                                                                                         | ดึงตาม `id`                |
| POST   | `/feed-batch-assignments`     | `{ "productionDate":"2025-05-01T00:00:00Z","feedBatchId":1,"farmId":1,"houseId":1,"animalId":1,"assignedStart":"2025-06-01T08:00:00Z","assignedEnd":"2025-06-10T18:00:00Z","feedQuantity":100,"note":"Assignment note" }` | สร้างการมอบหมาย Feed Batch |
| PUT    | `/feed-batch-assignments/:id` | `{ "feedQuantity":110 }`                                                                                                                                                                                                  | แก้ไข                      |
| DELETE | `/feed-batch-assignments/:id` | —                                                                                                                                                                                                                         | ลบ                         |

---

## 💡 ข้อแนะนำ

* **Authentication**: ทุก endpoint ควรล็อกอินด้วย JWT (`Authorization: Bearer <token>`)
* **Validation**: ตรวจสอบความครบถ้วนของฟิลด์สำคัญก่อนบันทึก เช่น `productionDate`, `feedBatchId`
* **Date format**: ใช้ ISO 8601 (e.g. `"2025-05-01T00:00:00Z"`)
* **Pagination & Filtering**: สามารถขยายด้วย query params เช่น `?page=1&limit=50` หรือ `?farmId=1` เป็นต้น
* **Error handling**: ส่ง HTTP status code และข้อความที่ชัดเจนกลับไปยัง client

---

หากต้องการตัวอย่าง Postman Collection หรือรายละเอียดเพิ่มเติม แจ้งได้เลยครับ!
