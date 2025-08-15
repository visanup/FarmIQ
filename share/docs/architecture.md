นี่คือเวอร์ชันที่ปรับให้กระชับขึ้น อ่านง่ายขึ้น และสอดคล้องกับส่วนอื่นของเอกสาร:

````markdown
# System Architecture: FarmIQ

**End-to-end architecture and data flow of the FarmIQ AIoT platform, from sensor edge to cloud microservices.**

---

## 1. Overview

FarmIQ แบ่งเป็น 3 ชั้นหลัก:

1. **Edge Devices**  
   - **Sensors & Actuators**: วัดอุณหภูมิ, ความชื้น, CO₂, NH₃, แสง ฯลฯ  
   - **Camera & Scales**: เก็บภาพ, น้ำหนักสัตว์  
   - **เชื่อมต่อ**: ส่งข้อมูลผ่าน MQTT ไปยัง Edge Broker  

2. **Edge Server**  
   - **MQTT Broker**: รับข้อความจากอุปกรณ์  
   - **Node-RED**: ประมวลผล แปลงรูปแบบ และส่งต่อ  
   - **Local DB**: SQLite หรือ TimescaleDB (Buffer)  
   - **Sync-Service**: รวบรวมข้อมูลเป็นชุด (batch) แล้วส่งขึ้น Cloud ทุก 1–5 นาที  

3. **Cloud Layer**  
   - **API Gateway**: รวม Authentication, Rate-limit, Routing  
   - **Microservices** (บน Kubernetes/EKS/GKE หรือ Docker Compose):
     | Service                | หน้าที่หลัก                                           | Schema            |
     | ---------------------- | ----------------------------------------------------- | ----------------- |
     | Auth-Service           | ลงทะเบียน, เข้าสู่ระบบ, ออกโทเค็น, JWT validation   | `auth`            |
     | Cloud-API              | CRUD: customers, farms, houses, animals, devices      | `smart_farming`   |
     | Dashboard-Service      | สรุป KPI, บริหาร widget configuration                 | `dashboard`       |
     | Monitoring-Service     | ประเมิน Alert Rules, ส่งแจ้งเตือน                    | `monitoring`      |
     | Analytics-Service      | จัดเก็บ features, Model training & inference          | `analytics`       |
     | Sync-Service (Cloud)   | รับข้อมูลจาก Edge, เรียก Cloud-API เพื่อบันทึกข้อมูล | (ใช้ Cloud-API DB)|
   - **Cloud DB**: PostgreSQL cluster แยก schema ตามหน้าที่  

---

## 2. Component Diagram

```plaintext
[Sensors/Scales] 
     └─ MQTT → [Jetson/RPi: Edge Server]
          ├─ MQTT Broker
          ├─ Node-RED
          ├─ Local Timeseries DB
          └─ Sync-Service ── HTTPS ──┐
                                    ▼
                              [API Gateway]
                                    │
        ┌───────────────┬───────────┼───────────────┐
        │               │           │               │
   [Auth]        [Cloud-API] [Dashboard] [Monitoring] [Analytics]
                                       └───┬───┘
                                           ▼
                                 [PostgreSQL Cluster]
````

---

## 3. Data Flow Sequence

1. **Publish**: Sensor → `mqtt://edge-broker/topic`
2. **Transform**: Node-RED subscribes → Filter/Enrich → push to Local DB
3. **Buffer**: ข้อมูลถูกจัดเก็บใน SQLite/TimescaleDB
4. **Sync**: Sync-Service ดึง batch → `POST /sync/edge-to-cloud`
5. **Persist**: Cloud-API ตรวจสอบ → เขียนลงตาราง production (Partition by date)
6. **Process**:

   * Monitoring-Service: ตรวจ Alert Rules → แจ้งเตือน
   * Analytics-Service: สร้าง features/รันโมเดล → เก็บผลลัพธ์
7. **Serve**: Dashboard-Service ดึงค่าประมวลผล → ส่งต่อให้ Frontend

---

## 4. Microservice Interaction

| Caller              | Callee              | Endpoint                                   | Protocol |
| ------------------- | ------------------- | ------------------------------------------ | -------- |
| Edge Sync-Service   | Cloud-API           | `POST /sync/edge-to-cloud`                 | HTTPS    |
| Web/Mobile Frontend | Dashboard-Service   | `GET /dashboard/{farm}/metrics`            | HTTP     |
| Any Client          | Auth-Service        | `POST /auth/login` / `POST /auth/register` | HTTP     |
| Services ↔ DB       | PostgreSQL Cluster  | Direct TCP                                 | TCP      |
| Monitoring-Service  | Notification System | Email/SMS/Webhook                          | HTTP     |

---

## 5. Deployment Strategy

* **Edge**: รัน `mqtt-client` + `edge-server` บน Docker ใน Jetson/RPi
* **Cloud**:

  * Kubernetes + Helm charts บน EKS/GKE/AKS
  * Docker Compose สำหรับงาน dev หรือ PoC
* **IaC**: Terraform สร้าง VPC, Subnets, RDS, EKS Cluster, Managed MQTT Broker

---

## 6. Security Best Practices

* **JWT Auth**: ตรวจสอบทุก API ยกเว้น `/auth/register` & `/auth/login`
* **Network Segmentation**:

  * Edge Network แยกจาก Public Internet
  * Edge Server สื่อสารออกได้เฉพาะกับ Cloud API
* **TLS/SSL**:

  * MQTT over TLS
  * HTTPS สำหรับ API
  * SSL สำหรับ DB connections
* **Least Privilege**:

  * DB users แยกสิทธิ์ตาม schema
  * Container run as non-root user

---

*Review Date: 2025-06-15*
*Maintainer: Platform Architecture Team*

```
```
