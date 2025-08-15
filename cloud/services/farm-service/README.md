# farm-service

`farm-service` เป็น microservice สำหรับจัดการข้อมูลฟาร์ม บ้านเลี้ยง สัตว์ และข้อมูลต่าง ๆ ที่เกี่ยวข้องกับการเลี้ยงสัตว์ เช่น ปัจจัยทางสิ่งแวดล้อม คุณภาพอาหาร สถานะสุขภาพ ฯลฯ

---

## 🔧 Database Schema overview

ชื่อ schema: `farms`

| Table                    | Primary Key                  | Foreign Keys / Notes                                                         |
|--------------------------|------------------------------|-------------------------------------------------------------------------------|
| **farms.farms**          | `farm_id` (SERIAL PK)        | —                                                                             |
| **farms.houses**         | `house_id` (SERIAL PK)       | `farm_id → farms.farms(farm_id)`                                              |
| **farms.animals**        | `animal_id` (SERIAL PK)      | `farm_id → farms.farms(farm_id)`, `house_id → farms.houses(house_id)`          |
| **farms.genetic_factors**| `id` (SERIAL PK)             | `animal_id → farms.animals(animal_id)`                                        |
| **farms.feed_programs**  | `id` (SERIAL PK)             | `farm_id → farms.farms(farm_id)`                                              |
| **farms.feed_intake**    | `id` (SERIAL PK)             | `farm_id → farms.farms(farm_id)`, `animal_id → farms.animals(animal_id)`       |
| **farms.environmental_factors** | `id` (SERIAL PK)     | `farm_id → farms.farms(farm_id)`                                              |
| **farms.housing_conditions**    | `id` (SERIAL PK)     | `farm_id → farms.farms(farm_id)`                                              |
| **farms.water_quality**          | `id` (SERIAL PK)    | `farm_id → farms.farms(farm_id)`                                              |
| **farms.health_records**         | `id` (SERIAL PK)    | `animal_id → farms.animals(animal_id)`                                        |
| **farms.welfare_indicators**     | `id` (SERIAL PK)    | `animal_id → farms.animals(animal_id)`                                        |
| **farms.performance_metrics**    | `(id, recorded_date)` (BIGSERIAL, DATE) PK | `animal_id → farms.animals(animal_id)` partitioned by `recorded_date` |
| **farms.operational_records**    | `id` (SERIAL PK)    | `farm_id → farms.farms(farm_id)`                                              |

*ทุกตารางมี `created_at` และ `updated_at` อัปเดตอัตโนมัติด้วย trigger*

---

## 🚀 API Endpoints

ใช้ base URL:  


### 1. Farms

| Method | URL                    | Body Example                                                                                     | Description                  |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| GET    | `/farms`               | —                                                                                                | ดึงรายการฟาร์มทั้งหมด       |
| GET    | `/farms/:id`           | —                                                                                                | ดึงฟาร์มตาม `farm_id`       |
| POST   | `/farms`               | `{ "customer_id": 5, "name": "Farm A", "location": "Bangkok", "status": "active" }`               | สร้างฟาร์มใหม่              |
| PUT    | `/farms/:id`           | `{ "name": "Farm A (updated)", "status": "inactive" }`                                           | แก้ไขข้อมูลฟาร์ม             |
| DELETE | `/farms/:id`           | —                                                                                                | ลบฟาร์ม                     |

### 2. Houses

| Method | URL                     | Body Example                                             | Description               |
| ------ | ----------------------- | -------------------------------------------------------- | ------------------------- |
| GET    | `/houses`               | —                                                        | ดึงรายการบ้านทั้งหมด      |
| GET    | `/houses/:id`           | —                                                        | ดึงบ้านตาม `house_id`    |
| POST   | `/houses`               | `{ "farm_id": 1, "name": "House 1", "area": 120.5, "capacity": 100 }` | สร้างบ้านใหม่             |
| PUT    | `/houses/:id`           | `{ "capacity": 120 }`                                     | แก้ไขบ้าน                 |
| DELETE | `/houses/:id`           | —                                                        | ลบบ้าน                    |

### 3. Animals

| Method | URL                      | Body Example                                                         | Description                |
| ------ | ------------------------ | -------------------------------------------------------------------- | -------------------------- |
| GET    | `/animals`               | —                                                                    | ดึงรายการสัตว์ทั้งหมด      |
| GET    | `/animals/:id`           | —                                                                    | ดึงสัตว์ตาม `animal_id`   |
| POST   | `/animals`               | `{ "farm_id": 1, "house_id": 2, "species": "Chicken", "breed": "Layer", "birth_date": "2024-12-01" }` | สร้างสัตว์ใหม่             |
| PUT    | `/animals/:id`           | `{ "house_id": null }`                                               | แก้ไขข้อมูลสัตว์           |
| DELETE | `/animals/:id`           | —                                                                    | ลบสัตว์                    |

### 4. Genetic Factors

| Method | URL                         | Body Example                                                                | Description                    |
| ------ | --------------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| GET    | `/genetic-factors`          | —                                                                            | ดึงรายการการตรวจด้านพันธุกรรม |
| GET    | `/genetic-factors/:id`      | —                                                                            | ดึงผลตรวจตาม `id`              |
| POST   | `/genetic-factors`          | `{ "animal_id": 1, "test_type": "DNA", "result": "Positive", "test_date": "2025-06-01" }` | สร้างผลตรวจใหม่               |
| PUT    | `/genetic-factors/:id`      | `{ "result": "Negative" }`                                                   | แก้ไขผลตรวจ                   |
| DELETE | `/genetic-factors/:id`      | —                                                                            | ลบผลตรวจ                      |

### 5. Feed Programs

| Method | URL                      | Body Example                                                                                   | Description                |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------- |
| GET    | `/feed-programs`         | —                                                                                              | ดึงรายการโปรแกรมอาหาร      |
| GET    | `/feed-programs/:id`     | —                                                                                              | ดึงโปรแกรมตาม `id`         |
| POST   | `/feed-programs`         | `{ "farm_id": 1, "name": "Program A", "description": "...", "effective_start": "2025-06-01T00:00:00Z", "effective_end": "2025-12-31T00:00:00Z" }` | สร้างโปรแกรมใหม่           |
| PUT    | `/feed-programs/:id`     | `{ "description": "Updated desc" }`                                                            | แก้ไขโปรแกรม               |
| DELETE | `/feed-programs/:id`     | —                                                                                              | ลบโปรแกรม                  |

### 6. Feed Intake

| Method | URL                     | Body Example                                                                            | Description                   |
| ------ | ----------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| GET    | `/feed-intake`          | —                                                                                       | ดึงรายการการกินอาหาร          |
| GET    | `/feed-intake/:id`      | —                                                                                       | ดึงตาม `id`                   |
| POST   | `/feed-intake`          | `{ "farm_id": 1, "animal_id": 1, "feed_quantity": 50.0, "feed_batch_id": 2 }`            | บันทึกปริมาณอาหารที่สัตว์กิน   |
| PUT    | `/feed-intake/:id`      | `{ "feed_quantity": 55.0 }`                                                              | แก้ไขปริมาณอาหาร              |
| DELETE | `/feed-intake/:id`      | —                                                                                       | ลบบันทึก                       |

### 7. Environmental Factors

| Method | URL                              | Body Example                                                                                  | Description                    |
| ------ | -------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------ |
| GET    | `/environmental-factors`         | —                                                                                             | ดึงรายการปัจจัยสิ่งแวดล้อม     |
| GET    | `/environmental-factors/:id`     | —                                                                                             | ดึงตาม `id`                    |
| POST   | `/environmental-factors`         | `{ "farm_id": 1, "ventilation_rate": 5.2, "note": "OK", "measurement_date": "2025-06-10", "effective_start": "2025-06-10T00:00:00Z", "effective_end": "2025-07-10T00:00:00Z" }` | บันทึกปัจจัยใหม่             |
| PUT    | `/environmental-factors/:id`     | `{ "ventilation_rate": 6.0 }`                                                                  | แก้ไขปัจจัย                   |
| DELETE | `/environmental-factors/:id`     | —                                                                                             | ลบปัจจัย                       |

### 8. Housing Conditions

| Method | URL                         | Body Example                                                                                  | Description              |
| ------ | --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| GET    | `/housing-conditions`       | —                                                                                             | ดึงรายการสภาพที่พัก      |
| GET    | `/housing-conditions/:id`   | —                                                                                             | ดึงตาม `id`             |
| POST   | `/housing-conditions`       | `{ "farm_id": 1, "flooring_humidity": 45.0, "animal_density": 10, "area": 200.0, "effective_start": "2025-06-10T00:00:00Z", "effective_end": "2025-07-10T00:00:00Z" }` | บันทึกสภาพใหม่        |
| PUT    | `/housing-conditions/:id`   | `{ "animal_density": 12 }`                                                                     | แก้ไขสภาพ               |
| DELETE | `/housing-conditions/:id`   | —                                                                                             | ลบสภาพ                  |

### 9. Water Quality

| Method | URL                    | Body Example                                                                                             | Description           |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------- | --------------------- |
| GET    | `/water-quality`       | —                                                                                                        | ดึงรายการคุณภาพน้ำ   |
| GET    | `/water-quality/:id`   | —                                                                                                        | ดึงตาม `id`          |
| POST   | `/water-quality`       | `{ "farm_id": 1, "fe": 0.3, "pb": 0.02, "note": "Normal", "measurement_date": "2025-06-10" }`              | บันทึกคุณภาพน้ำใหม่   |
| PUT    | `/water-quality/:id`   | `{ "pb": 0.01 }`                                                                                         | แก้ไข                 |
| DELETE | `/water-quality/:id`   | —                                                                                                        | ลบ                    |

### 10. Health Records

| Method | URL                       | Body Example                                                                 | Description                         |
| ------ | ------------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| GET    | `/health-records`         | —                                                                            | ดึงบันทึกสุขภาพ                    |
| GET    | `/health-records/:id`     | —                                                                            | ดึงตาม `id`                         |
| POST   | `/health-records`         | `{ "animal_id": 1, "health_status": "Good", "disease": "None", "vaccine": "A", "recorded_date": "2025-06-10" }` | บันทึกสุขภาพใหม่               |
| PUT    | `/health-records/:id`     | `{ "disease": "Flu" }`                                                        | แก้ไขบันทึก                         |
| DELETE | `/health-records/:id`     | —                                                                            | ลบ                                  |

### 11. Welfare Indicators

| Method | URL                          | Body Example                                                                  | Description                   |
| ------ | ---------------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| GET    | `/welfare-indicators`        | —                                                                             | ดึงตัวชี้วัดสวัสดิภาพ         |
| GET    | `/welfare-indicators/:id`    | —                                                                             | ดึงตาม `id`                   |
| POST   | `/welfare-indicators`        | `{ "animal_id": 1, "footpad_lesion": false, "stress_hormone": 2.5, "recorded_date": "2025-06-10" }` | บันทึกใหม่                |
| PUT    | `/welfare-indicators/:id`    | `{ "stress_hormone": 3.0 }`                                                    | แก้ไข                         |
| DELETE | `/welfare-indicators/:id`    | —                                                                             | ลบ                            |

### 12. Performance Metrics

| Method | URL                            | Body Example                                                                                                                                                                                                                                   | Description                        |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| GET    | `/performance-metrics`         | —                                                                                                                                                                                                                                              | ดึงบันทึกประสิทธิภาพ (partition)  |
| GET    | `/performance-metrics/:id`     | —                                                                                                                                                                                                                                              | ดึงตาม `id`                        |
| POST   | `/performance-metrics`         | `{ "animal_id": 1, "adg": 0.5, "fcr": 1.8, "survival_rate": 98, "pi_score": 75, "mortality_rate": 2, "health_score": 80, "behavior_score": 70, "body_condition_score": 85, "stress_level": 2.2, "disease_incidence_rate": 5, "vaccination_status": "Up-to-date", "recorded_date": "2025-06-10" }` | บันทึกใหม่ (จัด partition ตามปี) |
| PUT    | `/performance-metrics/:id`     | `{ "fcr": 1.9 }`                                                                                                                                                                                                                               | แก้ไข                              |
| DELETE | `/performance-metrics/:id`     | —                                                                                                                                                                                                                                              | ลบ                                 |

### 13. Operational Records

| Method | URL                         | Body Example                                                                                              | Description           |
| ------ | --------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------- |
| GET    | `/operation-records`        | —                                                                                                         | ดึงบันทึกการดำเนินงาน |
| GET    | `/operation-records/:id`    | —                                                                                                         | ดึงตาม `id`          |
| POST   | `/operation-records`        | `{ "farm_id": 1, "type": "Maintenance", "description": "Cleaned house", "record_date": "2025-06-10" }`       | บันทึกใหม่            |
| PUT    | `/operation-records/:id`    | `{ "description": "Repaired feeder" }`                                                                      | แก้ไข                |
| DELETE | `/operation-records/:id`    | —                                                                                                         | ลบ                    |

---

## 📝 Notes

- **Dates & timestamps** ควรใช้ ISO 8601 format (e.g. `"2025-06-10T00:00:00Z"` หรือ `"2025-06-10"` ในกรณี DATE)
- บางตารางใช้ **composite primary key** (เช่น `performance_metrics`)
- ทุกตารางมี trigger อัปเดต `updated_at` อัตโนมัติ
- ควรตรวจสอบสิทธิ์ผู้ใช้ผ่าน JWT ก่อนเข้าถึงทุก endpoint  
- เพิ่ม index บน FK ตามคำแนะนำใน SQL เพื่อประสิทธิภาพในการ query

---

### การติดตั้ง & รันบริการ

```bash
# ติดตั้ง dependencies
yarn install

# รันในโหมดพัฒนา (ts-node-dev)
yarn dev

