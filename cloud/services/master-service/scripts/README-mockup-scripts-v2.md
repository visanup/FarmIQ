# 📊 Master Service Scripts

## ภาพรวม

Scripts สำหรับจัดการข้อมูล Master Service ใช้ Prisma Client โดยตรงเพื่อสร้างและจัดการข้อมูล Mockup สำหรับทุกตารางใน Prisma Schema

## 🚀 Scripts ที่มี

### 1. `generate-complete-mockup-v2.js`
**สร้างข้อมูลครบถ้วนสำหรับทุกตาราง**

```bash
# สร้างข้อมูลทุกตาราง
node scripts/generate-complete-mockup-v2.js
```

**คุณสมบัติ:**
- ใช้ Prisma Client โดยตรง (ไม่ต้องเรียก API)
- สร้างข้อมูลครบถ้วนสำหรับทุกตาราง
- ข้อมูลสมจริงและเชื่อมโยงกัน
- รองรับ Foreign Key relationships
- แสดงผลสรุปการสร้างข้อมูล

### 2. `cleanup-all-data.js`
**ลบข้อมูลทั้งหมดจากทุกตาราง**

```bash
# ลบข้อมูลทั้งหมด
node scripts/cleanup-all-data.js
```

### 3. `cleanup-master-data.js`
**ลบข้อมูลเฉพาะตารางหลัก**

```bash
# ลบข้อมูลตารางหลัก
node scripts/cleanup-master-data.js
```

### 4. `check-data-status.js`
**ตรวจสอบสถานะข้อมูลในทุกตาราง**

```bash
# ตรวจสอบสถานะข้อมูล
node scripts/check-data-status.js
```

**คุณสมบัติ:**
- ลบข้อมูลตามลำดับ Foreign Key constraints
- แสดงจำนวนข้อมูลที่ลบในแต่ละตาราง
- ปลอดภัยและไม่ทำลายโครงสร้างตาราง

> หมายเหตุ: สคริปต์ API/ทดสอบที่ไม่จำเป็นถูกลบออกแล้ว เหลือเฉพาะสคริปต์ที่ใช้งานได้จริงผ่าน Prisma ได้แก่ `generate-complete-mockup-v2.js`, `cleanup-all-data.js`, และ `check-data-status.js`

## 📋 ข้อมูลที่สร้าง

### Core Data (ข้อมูลหลัก)
- **Customers**: 5 รายการ
  - ชื่อบริษัท/สหกรณ์ต่างๆ
  - ข้อมูลติดต่อ, ที่อยู่
  - Meta data: ประเภทธุรกิจ, การรับรอง, รายได้

- **Farms**: 2 ฟาร์มต่อ Customer
  - ข้อมูลฟาร์ม, ที่ตั้ง
  - ประเภทฟาร์ม, พื้นที่
  - Meta data: โครงสร้างพื้นฐาน, สภาพแวดล้อม

- **Houses**: 2 โรงเรือนต่อฟาร์ม
  - ข้อมูลโรงเรือน, ขนาด, ความจุ
  - ระบบระบายอากาศ, เครื่องทำความร้อน
  - Meta data: อุปกรณ์, การบำรุงรักษา

- **Devices**: 12 อุปกรณ์ต่อโรงเรือน
  - เซ็นเซอร์ต่างๆ: อุณหภูมิ, ความชื้น, CO2, NH3, pH, TDS, EC, ฯลฯ
  - ข้อมูลตำแหน่ง, สถานะ, Meta data

### Animal Management (การจัดการสัตว์)
- **Animal Types**: 6 ประเภท
  - Chicken, Pig, Cattle, Duck, Goat, Sheep
  - ข้อมูลพื้นฐาน, คุณสมบัติ, Meta data

- **Breeds**: 12 สายพันธุ์
  - สายพันธุ์ไก่: Ross 308, Cobb 500, Hubbard, Lohmann Brown
  - สายพันธุ์หมู: Large White, Landrace, Duroc
  - สายพันธุ์วัว: Holstein Friesian, Angus, Brahman
  - สายพันธุ์เป็ด: Pekin, Khaki Campbell

- **Flocks**: 1 ฝูงต่อโรงเรือน
  - ข้อมูลฝูงสัตว์, จำนวน, สถานะสุขภาพ
  - ประวัติการฉีดวัคซีน, การรักษา
  - Meta data: ประสิทธิภาพ, สภาพแวดล้อม

### Reference Data (ข้อมูลอ้างอิง)
- **Device Types**: 9 ประเภท
  - Temperature Sensor, Humidity Sensor, CO2 Sensor, Weight Scale, Camera, Feeder Controller, Water Controller, Fan Controller, Gateway

- **Sensor Types**: 10 ประเภท
  - Temperature, Humidity, CO2, NH3, Weight, pH, TDS, EC, Illuminance, Motion

- **Feed Types**: 4 ประเภท
  - Starter Feed, Grower Feed, Finisher Feed, Layer Feed

- **Formulas**: 4 สูตร
  - Premium Broiler Formula, Organic Layer Formula, Pig Starter Formula, Cattle Growing Formula

- **Economic Data**: 288 จุดข้อมูล
  - ข้อมูลเศรษฐกิจ 6 ประเภท × 4 ภูมิภาค × 12 เดือน

- **External Data Sources**: 4 แหล่ง
  - กรมอุตุนิยมวิทยา, MarketPriceAPI, กรมปศุสัตว์, IoT Sensor Network

### Extended Features (คุณสมบัติเพิ่มเติม)
- **Zones**: 20 โซนต่อโรงเรือน
  - โซนให้อาหาร, พักผ่อน, ให้น้ำ, ออกกำลังกาย
  - ข้อมูลตำแหน่ง, ความจุ, สภาพแวดล้อม

- **Stations**: 5 สถานีต่อโรงเรือน
  - Lab, FeedingStation, WaterStation, ControlRoom, Storage
  - ข้อมูลตำแหน่ง, สถานะ, อุปกรณ์

- **Device Health**: 1 รายการต่ออุปกรณ์
  - สถานะอุปกรณ์, ระดับแบตเตอรี่, ความแรงสัญญาณ
  - ข้อมูลประสิทธิภาพ, ข้อผิดพลาด, คำเตือน

- **Master Events**: เหตุการณ์ในระบบ
  - เหตุการณ์การสร้าง Customer, Farm
  - ข้อมูล Metadata, Timestamp

## 🔧 การใช้งาน

### 1. ติดตั้ง Dependencies
```bash
cd cloud/services/master-service
yarn install
```

### 2. ตั้งค่า Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma db push
```

### 3. สร้าง/ตรวจสอบ/ลบข้อมูล Mockup
```bash
# สร้างข้อมูลครบถ้วน (ผ่าน Prisma โดยตรง)
node scripts/generate-complete-mockup-v2.js

# ลบข้อมูลทั้งหมด
node scripts/cleanup-all-data.js

# ตรวจสอบสถานะข้อมูลในทุกตาราง
node scripts/check-data-status.js
```

## 📊 ตัวอย่างผลลัพธ์

```
🚀 Starting complete master data mockup generation for all tables...
🧹 Clearing all tables...
✅ Cleared MasterEvent: 0 records deleted
✅ Cleared DeviceHealth: 0 records deleted
...
👥 Generating customers...
✅ Created customer: สหกรณ์การเกษตรตัวอย่าง
✅ Created customer: บริษัท ฟาร์มไก่เนื้อ จำกัด
...
🏡 Generating farms...
✅ Created farm: สหกรณ์การเกษตรตัวอย่าง สาขา 1
✅ Created farm: สหกรณ์การเกษตรตัวอย่าง สาขา 2
...
🎉 Complete mockup generation completed!
📊 Summary:
   👥 Customers: 5
   🏡 Farms: 10
   🏠 Houses: 20
   📱 Devices: 240
   🐔 Animal Types: 6
   🧬 Breeds: 12
   🐓 Flocks: 20
   📚 Reference Data: 315
   🔧 Extended Features: 280
```

## ⚠️ ข้อควรระวัง

### 1. Database Connection
- ต้องตั้งค่า `DATABASE_URL` ใน `.env` ให้ถูกต้อง
- ต้องมี Prisma schema ที่อัปเดตแล้ว

### 2. Foreign Key Constraints
- Scripts จะสร้างข้อมูลตามลำดับที่ถูกต้อง
- ถ้ามีข้อมูลอยู่แล้ว อาจจะเกิด error ได้

### 3. Performance
- การสร้างข้อมูลจำนวนมากอาจใช้เวลานาน
- แนะนำให้รันในสภาพแวดล้อม development

## 🎯 เป้าหมาย

สร้างข้อมูล Mockup ที่สมจริงและครอบคลุมทุกตารางใน Prisma Schema เพื่อใช้ในการทดสอบและพัฒนา FarmIQ Master Service โดยไม่ต้องพึ่งพา API endpoints

---

*เอกสารนี้ได้รับการอัปเดตล่าสุด: 2024-01-15*

