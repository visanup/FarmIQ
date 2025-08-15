# Specification Document

## 1. บทนำ (Introduction)

### ภาพรวมโครงการ FarmIQ™

FarmIQ™ คือแพลตฟอร์ม Smart Farming ที่รวม IoT, AI, และระบบอัตโนมัติ เพื่อนำข้อมูลมาแปลงเป็นการตัดสินใจแบบ Real-time โดยมุ่งเน้นลดต้นทุน เพิ่มประสิทธิภาพ และลดความผิดพลาดจากมนุษย์ สร้างฐานข้อมูลสำหรับการต่อยอดสู่ระบบอัจฉริยะที่รองรับการขยายตัวในอนาคต

### ระบุประโยชน์ที่ฟาร์มจะได้รับจากการใช้ระบบ Dashboard อย่างชัดเจน เช่น
* ลดต้นทุนแรงงานและความผิดพลาดของมนุษย์
* เพิ่มประสิทธิภาพในการจัดการข้อมูล และวางแผนฟาร์ม
* สนับสนุนการตัดสินใจที่รวดเร็วและแม่นยำด้วยข้อมูลที่เชื่อถือได้

### วัตถุประสงค์และเป้าหมายของ Dashboard

* แสดงข้อมูลและสถานะต่างๆ ของฟาร์มอย่างชัดเจนและ Real-time
* รองรับการแจ้งเตือนเมื่อมีเหตุการณ์ผิดปกติ
* ช่วยให้ผู้ใช้งานสามารถควบคุมอุปกรณ์ในฟาร์มผ่าน Dashboard
* สนับสนุนการสร้างรายงานอัตโนมัติ และการวิเคราะห์ข้อมูลเพื่อการตัดสินใจ
* การเพิ่มประสิทธิภาพการใช้ทรัพยากรในฟาร์ม (อาหาร น้ำ พลังงาน)
* การเพิ่มขีดความสามารถในการตอบสนองต่อเหตุการณ์ผิดปกติได้เร็วขึ้น
* การสร้างฐานข้อมูลที่เป็นมาตรฐานเพื่อต่อยอด AI/ML ในอนาคต

## 2. ขอบเขตงาน (Scope of Work)

### ประเภทของ Dashboard

* Real-time Monitoring Dashboard
* Batch Reporting Dashboard
* Alert & Notification Center

### ขอบเขตการพัฒนา

* Frontend: React.js + MUI
* Backend: RESTful APIs (Node.js/FastAPI) -- Optional
* Data Integration: MQTT, InfluxDB/Postgresql, AI Model APIs, External APIs (Weather, Market Data)
* การเชื่อมต่อระบบ Dashboard กับ AI/ML Engine เพื่อการวิเคราะห์และแสดงผลข้อมูลเชิงลึก
* การเชื่อมต่อกับฐานข้อมูล InfluxDB/Postgresql เพื่อการจัดเก็บข้อมูลแบบ Time-Series อย่างมีประสิทธิภาพ

## 3. ผู้ใช้งานและบทบาท (User Roles)

* **Admin**: สามารถตั้งค่าระบบ จัดการสิทธิ์ผู้ใช้งาน และดูแลระบบ Dashboard ได้ทั้งหมด
* **Operator / Farm Manager**: สามารถสั่งการอุปกรณ์และแก้ไขปัญหาเบื้องต้นผ่านระบบ Dashboard
* **Executive**: สามารถดูภาพรวมผลการดำเนินงานและวิเคราะห์ข้อมูลเชิงกลยุทธ์เพื่อการตัดสินใจระดับสูง

## 4. Functional Requirements

### Data Ingestion & Pipeline
* เชื่อมต่อและรับข้อมูลจาก IoT Gateway (MQTT), ERP, External API
* บันทึกข้อมูล Time-Series ลง InfluxDB พร้อมจัดการ Buffering, Retention, Downsampling
* ตรวจสอบคุณภาพข้อมูล (Data Validation, Outlier Detection) ก่อนเก็บ

### Data Processing & Analytics
* คำนวณค่า FCR, ADG, Daily Gain, Cpk/Ppk อัตโนมัติ
* รันโมเดล AI (Forecasting, Anomaly Detection, Predictive Maintenance) ผ่าน API
* จัดเก็บผลลัพธ์และ Log การคำนวณ

### API Layer
* RESTful/GraphQL API สำหรับดึงข้อมูล Raw และ Processed
* รองรับ Query แบบ Filter (Time Range, Farm, Sensor Type) และ Pagination
* Security: OAuth2, Token-based, Rate Limiting

### Data Visualization
* Charts: Time-Series Trends (Weight, Temp, Humidity, FCR/ADG) Real-time & Historical
* Comparative Analysis: เปรียบเทียบระหว่างโรงเรือนหรือฟาร์ม
* Status Table: สถานะ Sensor/Actuator (Online/Offline, Last Seen)
* Threshold & Alerts: ตั้งค่าเกณฑ์แจ้งเตือน, Highlight กราฟเมื่อเกิน Threshold
* Real-time Refresh: อัปเดตข้อมูลทุก 1-5 วินาที พร้อม Manual Refresh

### Control & Interaction
* Command Buttons: Feed, Light, Environment Control ผ่าน Dashboard
* Preset Management: บันทึก/เรียกใช้ Profile การตั้งค่าอุปกรณ์ (Preset)
* Search & Filter: ช่วงเวลา, ฟาร์ม, โรงเรือน, Sensor Type
* Activity Logs: บันทึกประวัติการสั่งงานและการเปลี่ยนแปลงค่า Setting
* User Preferences: บันทึกการตั้งค่ามุมมอง Dashboard แบบเฉพาะผู้ใช้ (Custom View)

### Reporting & Export
* Scheduled Reports: Daily/Weekly/Monthly พร้อมการแจ้งเตือนทาง Email/Slack
* Export: PDF, Excel, CSV โดยเลือก Fields และ Period ได้เอง
* Customizable Templates: กำหนด Layout และ Metrics ในรายงานได้
* On-demand Report Generation: ผู้ใช้สามารถสร้างรายงานตามต้องการ

### Notification & Alerting
* Multi-channel Alerts: ส่งผ่าน Email, SMS, Push Notification
* Alert Management: Acknowledge, Snooze, Escalation Rules
* Alert Dashboard: แสดงสถานะ Alert ทั้งหมดพร้อม Filters

### User Management & Security
* Authentication: SSO (SAML/OAuth2), 2FA Option
* Authorization: Role-Based Access Control (RBAC), Multi-Tenancy Support
* Audit Trail: บันทึกกิจกรรมสำคัญ (Login, Data Export, Setting Change)
* Password Policy & Session Management: Expiry, Idle Timeout

### Administration & Configuration
* System Settings: Configure Data Retention, Thresholds, Report Schedule
* Health Monitoring: System Status, Data Pipeline Health, API Uptime
* Maintenance Mode: ปิดการใช้งานชั่วคราวพร้อมแจ้งผู้ใช้งาน

## 5. Non-Functional Requirements

### UI/UX Guidelines

* ดีไซน์ทันสมัย สะอาดตา และเน้น Corporate Identity
* รองรับ Responsive Design (Desktop/Tablet/Mobile)
* การใช้งานแบบ Minimal Click (ลดจำนวนขั้นตอนหรือคลิกเพื่อเข้าถึงข้อมูลสำคัญ)

### Performance

* เวลาในการโหลดหน้า Dashboard ไม่เกิน 2 วินาที
* รองรับผู้ใช้งานพร้อมกันไม่น้อยกว่า 100 คน
* ทดสอบและแสดงผลการทดสอบการทำงานของระบบภายใต้สภาวะโหลดสูงสุด

### Scalability & Maintainability

* ออกแบบเพื่อรองรับการขยายฟีเจอร์ในอนาคต
* จัดทำเอกสารการติดตั้งและ Deployment อย่างละเอียด
* จัดทำคู่มือการบำรุงรักษา และคู่มือการแก้ไขปัญหาสำหรับทีม IT ขององค์กร

### Security & Compliance

* เข้ารหัสข้อมูลด้วย TLS
* ปฏิบัติตามมาตรฐาน PDPA
* มีระบบแจ้งเตือนอัตโนมัติกรณีระบบล่มหรือทำงานผิดปกติ (System Health Alert)

### Availability & Reliability

* ระบบต้องมี Uptime ไม่น้อยกว่า 99.5%
* มีระบบสำรอง (Backup/Failover)

## 6. การเชื่อมต่อและข้อมูล (Integration & Data Sources)

* เชื่อมต่อ IoT Gateway ผ่าน MQTT ไปยัง InfluxDB
* เรียกข้อมูลจาก AI/Analytics Layer ผ่าน API
* ดึงข้อมูลจาก External API เช่น Weather API, Market Data

## 7. Deliverables

* Mockups / Wireframes
* Source Code พร้อม README และคำอธิบายชัดเจน
* API Reference Document
* User Manual และ Training Guide

## 8. Timeline & Milestones

* Kickoff Meeting (สัปดาห์ที่ 1)
* Design Review (สัปดาห์ที่ 3)
* Development (สัปดาห์ที่ 4-12)
* User Acceptance Testing (สัปดาห์ที่ 13-14)
* Go-Live (สัปดาห์ที่ 15)

## 9. Acceptance Criteria

* ระบบทำงานถูกต้องตามฟังก์ชันที่ระบุ
* ระดับ Bug Tolerance ไม่เกิน 5% ในช่วง UAT
* ผ่าน Performance Benchmark (Response Time, Uptime)

## 10. ข้อกำหนดอื่น ๆ (Optional)

* สัญญา Support & Maintenance 12 เดือนหลังส่งมอบ
* Warranty Period 6 เดือนหลังจาก Go-Live
* การอบรมและถ่ายทอดความรู้ (Training & Knowledge Transfer)
    * การอบรมการใช้งานระบบให้กับผู้ใช้งาน (Admin, Operator)
    * การอบรมการดูแลรักษาและแก้ไขปัญหาเบื้องต้นให้ทีม IT หรือ Support ขององค์กร

## 10. เอกสารประกอบเพิ่มเติม (Documentation)
* Technical Documentation (System Architecture, Database Design)
* Troubleshooting Guide

## 11. การส่งมอบ Source Code และ Version Control
* ระบุการใช้งานระบบ Version Control (Git) และการจัดการ Repository

## 12. SLA (Service Level Agreement)
* ระยะเวลาในการตอบสนองเมื่อเกิดปัญหา (Response Time)
* ระยะเวลาในการแก้ไขปัญหา (Resolution Time)
* ข้อตกลงในการอัปเดตระบบและแก้ไข Bug หลัง Warranty Period หมดอายุ
* รูปแบบการคิดค่าใช้จ่ายในการ Support & Updates