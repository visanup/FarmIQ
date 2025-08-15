# formula-service

บริการ `formula-service` เป็นบริการหนึ่งในระบบที่จัดการข้อมูลสูตรอาหารและข้อมูลที่เกี่ยวข้อง เช่น ส่วนประกอบสูตร ข้อมูลพลังงาน โภชนาการ และข้อมูลเพิ่มเติม (เช่น วิตามิน แร่ธาตุ)

บริการนี้ใช้ Node.js + TypeScript + TypeORM เชื่อมต่อฐานข้อมูล PostgreSQL ภายใต้ schema `formulas` โดยมี API RESTful สำหรับ CRUD (สร้าง อ่าน แก้ไข ลบ) ข้อมูลในแต่ละตาราง

---

## โครงสร้างหลักของบริการ

| หมวดหมู่           | รายละเอียดหลัก                                                                                  |
|--------------------|-----------------------------------------------------------------------------------------------|
| **สูตรอาหาร (formula)** | ข้อมูลสูตรอาหารหลัก เช่น รหัสสูตร (`formulaNo`), ชื่อสูตร (`name`), คำอธิบาย (`description`)          |
| **ส่วนประกอบ (formula-compositions)** | ส่วนประกอบของสูตรอาหาร เช่น วัตถุดิบ (`ingredient`), สัดส่วน (`percentage`)                               |
| **ข้อมูลพลังงาน (formula-energies)**   | ข้อมูลพลังงานของสูตรอาหาร เช่น ประเภทพลังงาน (`energyType`), ค่า (`value`)                                    |
| **ข้อมูลโภชนาการ (formula-nutritions)** | ข้อมูลโภชนาการ เช่น ชนิดสารอาหาร (`nutrient`), ปริมาณ (`amount`)                                             |
| **ข้อมูลเพิ่มเติม (formula-additionals)** | ข้อมูลเสริม เช่น วิตามิน หรือแร่ธาตุ พร้อมรายละเอียดเพิ่มเติม                                               |

---

## รายละเอียด API Endpoint

### 1. สูตรอาหาร (`formula`)

| API Endpoint             | HTTP Method | คำอธิบาย                    | Headers                    | Body (JSON) ตัวอย่าง                                      | ผลลัพธ์ที่คาดหวัง                   | หมายเหตุ                         |
|--------------------------|-------------|-----------------------------|----------------------------|-----------------------------------------------------------|-------------------------------------|---------------------------------|
| `/api/formulas`           | GET         | ดึงสูตรอาหารทั้งหมด          | Authorization: Bearer `<token>` | -                                                         | รายการสูตรอาหารพร้อมข้อมูลเชื่อมโยง | ทดสอบการเชื่อมต่อ DB และ Token |
| `/api/formulas/:id`       | GET         | ดึงสูตรอาหารตามรหัสสูตร      | Authorization: Bearer `<token>` | -                                                         | สูตรอาหารตัวนั้น หรือ 404 หากไม่พบ | ทดสอบกรณีมี/ไม่มีข้อมูล         |
| `/api/formulas`           | POST        | สร้างสูตรอาหารใหม่           | Authorization: Bearer `<token>` | `{ "formulaNo": "F001", "name": "สูตร A", "description": "รายละเอียด" }` | สูตรอาหารที่ถูกสร้างพร้อม ID       | ทดสอบการเพิ่มข้อมูล             |
| `/api/formulas/:id`       | PUT         | แก้ไขสูตรอาหารตามรหัสสูตร    | Authorization: Bearer `<token>` | `{ "name": "สูตร A ปรับปรุง", "description": "อัปเดตข้อมูล" }`         | สูตรอาหารที่อัปเดตแล้ว             | ทดสอบการแก้ไขข้อมูล             |
| `/api/formulas/:id`       | DELETE      | ลบสูตรอาหารตามรหัสสูตร      | Authorization: Bearer `<token>` | -                                                         | 204 No Content (ลบสำเร็จ)           | ทดสอบการลบข้อมูล               |

---

### 2. ส่วนประกอบสูตรอาหาร (`formula-compositions`)

| API Endpoint                    | HTTP Method | คำอธิบาย                   | Headers                    | Body (JSON) ตัวอย่าง                                   | ผลลัพธ์ที่คาดหวัง               | หมายเหตุ                 |
|--------------------------------|-------------|----------------------------|----------------------------|--------------------------------------------------------|---------------------------------|---------------------------|
| `/api/formula-compositions`     | GET         | ดึงส่วนประกอบทั้งหมด       | Authorization: Bearer `<token>` | -                                                      | รายการส่วนประกอบพร้อม relation สูตรอาหาร | ทดสอบการดึงข้อมูลส่วนประกอบทั้งหมด |
| `/api/formula-compositions/:id` | GET         | ดึงส่วนประกอบตามรหัส       | Authorization: Bearer `<token>` | -                                                      | ส่วนประกอบตัวนั้น หรือ 404 หากไม่พบ | ทดสอบกรณีมี/ไม่มีข้อมูล |
| `/api/formula-compositions`     | POST        | สร้างส่วนประกอบใหม่        | Authorization: Bearer `<token>` | `{ "formulaId": 1, "ingredient": "แป้ง", "percentage": 50 }` | ส่วนประกอบที่ถูกสร้าง           | ทดสอบการเพิ่มข้อมูล       |
| `/api/formula-compositions/:id` | PUT         | แก้ไขส่วนประกอบตามรหัส    | Authorization: Bearer `<token>` | `{ "percentage": 55 }`                                  | ส่วนประกอบที่อัปเดตแล้ว        | ทดสอบการแก้ไขข้อมูล       |
| `/api/formula-compositions/:id` | DELETE      | ลบส่วนประกอบตามรหัส       | Authorization: Bearer `<token>` | -                                                      | 204 No Content                  | ทดสอบการลบข้อมูล         |

---

### 3. ข้อมูลพลังงาน (`formula-energies`)

| API Endpoint             | HTTP Method | คำอธิบาย                | Headers                    | Body (JSON) ตัวอย่าง                                   | ผลลัพธ์ที่คาดหวัง             | หมายเหตุ               |
|--------------------------|-------------|-------------------------|----------------------------|--------------------------------------------------------|-------------------------------|-------------------------|
| `/api/formula-energies`  | GET         | ดึงข้อมูลพลังงานทั้งหมด  | Authorization: Bearer `<token>` | -                                                      | รายการข้อมูลพลังงานพร้อม relation สูตรอาหาร |                         |
| `/api/formula-energies/:id` | GET      | ดึงข้อมูลพลังงานตามรหัส | Authorization: Bearer `<token>` | -                                                      | ข้อมูลพลังงานตัวนั้น หรือ 404 |                         |
| `/api/formula-energies`  | POST        | สร้างข้อมูลพลังงานใหม่   | Authorization: Bearer `<token>` | `{ "formulaId": 1, "energyType": "แคลอรี่", "value": 300 }` | ข้อมูลพลังงานที่ถูกสร้าง       |                         |
| `/api/formula-energies/:id` | PUT      | แก้ไขข้อมูลพลังงานตามรหัส | Authorization: Bearer `<token>` | `{ "value": 320 }`                                     | ข้อมูลพลังงานที่อัปเดตแล้ว     |                         |
| `/api/formula-energies/:id` | DELETE   | ลบข้อมูลพลังงานตามรหัส  | Authorization: Bearer `<token>` | -                                                      | 204 No Content                |                         |

---

### 4. ข้อมูลโภชนาการ (`formula-nutritions`)

| API Endpoint               | HTTP Method | คำอธิบาย                | Headers                    | Body (JSON) ตัวอย่าง                                  | ผลลัพธ์ที่คาดหวัง             | หมายเหตุ               |
|----------------------------|-------------|-------------------------|----------------------------|-------------------------------------------------------|-------------------------------|-------------------------|
| `/api/formula-nutritions`  | GET         | ดึงข้อมูลโภชนาการทั้งหมด | Authorization: Bearer `<token>` | -                                                     | รายการข้อมูลโภชนาการพร้อม relation สูตรอาหาร |                         |
| `/api/formula-nutritions/:id` | GET      | ดึงข้อมูลโภชนาการตามรหัส | Authorization: Bearer `<token>` | -                                                     | ข้อมูลโภชนาการตัวนั้น หรือ 404 |                         |
| `/api/formula-nutritions`  | POST        | สร้างข้อมูลโภชนาการใหม่  | Authorization: Bearer `<token>` | `{ "formulaId": 1, "nutrient": "โปรตีน", "amount": 25 }` | ข้อมูลโภชนาการที่ถูกสร้าง      |                         |
| `/api/formula-nutritions/:id` | PUT      | แก้ไขข้อมูลโภชนาการตามรหัส | Authorization: Bearer `<token>` | `{ "amount": 30 }`                                    | ข้อมูลโภชนาการที่อัปเดตแล้ว    |                         |
| `/api/formula-nutritions/:id` | DELETE   | ลบข้อมูลโภชนาการตามรหัส | Authorization: Bearer `<token>` | -                                                     | 204 No Content                |                         |

---

### 5. ข้อมูลเพิ่มเติม (`formula-additionals`)

| API Endpoint                 | HTTP Method | คำอธิบาย                | Headers                    | Body (JSON) ตัวอย่าง                                    | ผลลัพธ์ที่คาดหวัง           | หมายเหตุ               |
|------------------------------|-------------|-------------------------|----------------------------|---------------------------------------------------------|-----------------------------|-------------------------|
| `/api/formula-additionals`    | GET         | ดึงข้อมูลเพิ่มเติมทั้งหมด | Authorization: Bearer `<token>` | -                                                       | รายการข้อมูลเพิ่มเติมพร้อม relation สูตรอาหาร |                         |
| `/api/formula-additionals/:id` | GET        | ดึงข้อมูลเพิ่มเติมตามรหัส | Authorization: Bearer `<token>` | -                                                       | ข้อมูลเพิ่มเติมตัวนั้น หรือ 404 |                         |
| `/api/formula-additionals`    | POST        | สร้างข้อมูลเพิ่มเติมใหม่  | Authorization: Bearer `<token>` | `{ "formulaId": 1, "item": "วิตามินซี", "details": "ช่วยเพิ่มภูมิคุ้มกัน" }` | ข้อมูลเพิ่มเติมที่ถูกสร้าง  |                         |
| `/api/formula-additionals/:id` | PUT        | แก้ไขข้อมูลเพิ่มเติมตามรหัส | Authorization: Bearer `<token>` | `{ "details": "อัปเดตรายละเอียด" }`                     | ข้อมูลเพิ่มเติมที่อัปเดตแล้ว  |                         |
| `/api/formula-additionals/:id` | DELETE     | ลบข้อมูลเพิ่มเติมตามรหัส | Authorization: Bearer `<token>` | -                                                       | 204 No Content              |                         |

---

## วิธีใช้งานเบื้องต้น

1. ทุก API ต้องส่ง Header `Authorization: Bearer <token>` เพื่อยืนยันตัวตน (ถ้ามีระบบ Authentication)
2. สำหรับ `POST` และ `PUT` ต้องกำหนด Content-Type เป็น `application/json`
3. กรอกข้อมูลใน Body ตามตัวอย่าง JSON ที่ระบุในแต่ละ API
4. ตรวจสอบ HTTP Status Code และ Response Body เพื่อยืนยันผลลัพธ์

---

## สรุป

`formula-service` นี้ช่วยจัดการสูตรอาหารและข้อมูลที่เกี่ยวข้องครบถ้วน  
รองรับการเพิ่ม, แก้ไข, ดึงข้อมูล และลบข้อมูลทุกหมวดหมู่  
เหมาะสำหรับนำไปใช้ในระบบบริหารจัดการอาหารสัตว์ หรือระบบที่เกี่ยวข้องกับการบริหารสูตรอาหารในระดับองค์กร

---
