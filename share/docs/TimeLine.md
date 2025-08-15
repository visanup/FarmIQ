Project : FarmIQ™

---

# FarmIQ™ Project: งานย่อยแยกตาม Sub-team

---

## Pre-MVP: Project Proposal & Approval (2025-07-01 → 2025-07-31)

### Summary task: วางแผนโครงการและขออนุมัติจากผู้บริหาร

| Type | Subject                                                      | Start      | End        |
| ---- | ------------------------------------------------------------ | ---------- | ---------- |
| Task | เก็บความต้องการจากผู้มีส่วนได้ส่วนเสีย (Stakeholders)                 | 2025-07-01 | 2025-07-07 |
| Task | วิเคราะห์ความเป็นไปได้ทางเทคนิคและธุรกิจ (Feasibility Study)        | 2025-07-08 | 2025-07-14 |
| Task | จัดทำเอกสาร Project Proposal พร้อม Budget & Timeline           | 2025-07-15 | 2025-07-21 |
| Task | นำเสนอ Proposal ต่อผู้บริหารเพื่อขออนุมัติ                           | 2025-07-22 | 2025-07-25 |
| Task | ปรับแก้ Proposal ตาม Feedback                                 | 2025-07-26 | 2025-07-31 |

### Summary task: Elicit domain knowledge
| Type | Subject                                                       | Start      | End        |
| ---- | ------------------------------------------------------------- | ---------- | ---------- |
| Task | Empathy Expert 1 ทำความเข้าใจภาพรวมธุรกิจ, ความต้องการ, ตัวแปรสำคัญ | 2025-07-01 | 2025-07-07 |
| Task | Empathy Expert 2 ทำความเข้าใจภาพรวมธุรกิจ, ความต้องการ, ตัวแปรสำคัญ | 2025-07-01 | 2025-07-07 |
| Task | Empathy Expert 3 ทำความเข้าใจภาพรวมธุรกิจ, ความต้องการ, ตัวแปรสำคัญ | 2025-07-01 | 2025-07-07 |
| Task | Empathy Expert 4 ทำความเข้าใจภาพรวมธุรกิจ, ความต้องการ, ตัวแปรสำคัญ | 2025-07-01 | 2025-07-07 |
| Task | Empathy Expert 5 ทำความเข้าใจภาพรวมธุรกิจ, ความต้องการ, ตัวแปรสำคัญ | 2025-07-01 | 2025-07-07 |

### Summary task: Create Project plan
| Type | Subject                                                      | Start      | End        |
| ---- | ------------------------------------------------------------ | ---------- | ---------- |
| Task | Project plan                                                 | 2025-07-01 | 2025-07-07 |


### Milestone

| Type      | Subject                                      | Start | End        |
| --------- | -------------------------------------------- | ----- | ---------- |
| Milestone | ✅ เสร็จ Pre-MVP: Project Proposal & Approval |       | 2025-07-31 |

---

## MVP 0: Core Data Ingestion (2025-08-01 → 2025-09-18)

### Apply knowledge & validate data

| Type | Subject                                                         | Start      | End        |
| ---- | --------------------------------------------------------------- | ---------- | ---------- |
| Task | ออกแบบเก็บข้อมูลตามความรู้, ทดลองเก็บข้อมูล, ตรวจสอบความถูกต้อง | 2025-08-26 | 2025-09-05 |

### AIoT & Edge Device Team

| Type | Subject                       | Start      | End        |
| ---- | ----------------------------- | ---------- | ---------- |
| Task | Procurement ฮาร์ดแวร์         | 2025-08-01 | 2025-08-10 |
| Task | Setup Edge device             | 2025-08-11 | 2025-08-15 |
| Task | ติดตั้ง & Calibrate เซ็นเซอร์ | 2025-08-16 | 2025-08-25 |


### Edge Server & Data Pipeline Team

| Type | Subject                               | Start      | End        |
| ---- | ------------------------------------- | ---------- | ---------- |
| Task | พัฒนา Data pipeline (MQTT → InfluxDB) | 2025-08-26 | 2025-09-05 |
| Task | Integration & QA Data ingestion       | 2025-09-06 | 2025-09-13 |


### Milestone

| Type      | Subject                           | Start | End        |
| --------- | --------------------------------- | ----- | ---------- |
| Milestone | ✅ เสร็จ MVP0: Core Data Ingestion |       | 2025-09-18 |

---

## MVP 1: Dashboard & Monitoring (2025-09-19 → 2025-10-16)

### Frontend Team

| Type | Subject                           | Start      | End        |
| ---- | --------------------------------- | ---------- | ---------- |
| Task | ออกแบบ UI/UX wireframe Dashboard  | 2025-09-19 | 2025-09-23 |
| Task | สร้างโครงหน้า React + MUI         | 2025-09-24 | 2025-09-26 |
| Task | พัฒนากราฟ Weight, Temp, Humidity  | 2025-09-27 | 2025-10-03 |
| Task | แสดงสถานะเซ็นเซอร์ Online/Offline | 2025-10-04 | 2025-10-07 |

### Backend Team

| Type | Subject                         | Start      | End        |
| ---- | ------------------------------- | ---------- | ---------- |
| Task | พัฒนาระบบ Alert Threshold-based | 2025-10-08 | 2025-10-12 |
| Task | Integration test & Bug fixing   | 2025-10-13 | 2025-10-16 |

### Milestone

| Type      | Subject                              | Start | End        |
| --------- | ------------------------------------ | ----- | ---------- |
| Milestone | ✅ เสร็จ MVP1: Dashboard & Monitoring |       | 2025-10-16 |

---

## MVP 2: Initial AI Analytics (2025-10-17 → 2025-12-11)

### Deep expert review for feature design

| Type | Subject                                               | Start      | End        |
| ---- | ----------------------------------------------------- | ---------- | ---------- |
| Task | วิเคราะห์ข้อมูลจริงกับ Expert, หา Feature สำหรับโมเดล | 2025-10-17 | 2025-10-23 |


### AI Research & Modeling Team

| Type | Subject                                    | Start      | End        |
| ---- | ------------------------------------------ | ---------- | ---------- |
| Task | Research & เลือก Weight Prediction model   | 2025-10-17 | 2025-10-23 |
| Task | Develop & Convert model เป็น ONNX/TensorRT | 2025-10-24 | 2025-11-06 |
| Task | พัฒนา Anomaly Detection                    | 2025-11-07 | 2025-11-20 |


### Edge AI Integration Team

| Type | Subject                               | Start      | End        |
| ---- | ------------------------------------- | ---------- | ---------- |
| Task | Integrate inference pipeline บน Edge  | 2025-11-21 | 2025-11-30 |
| Task | Prototype Forecast (Feed Efficiency)  | 2025-12-01 | 2025-12-05 |
| Task | Test performance & optimize inference | 2025-12-06 | 2025-12-09 |
| Task | Documentation & deploy โมเดลบน Edge   | 2025-12-10 | 2025-12-11 |

### Milestone

| Type      | Subject                            | Start | End        |
| --------- | ---------------------------------- | ----- | ---------- |
| Milestone | ✅ เสร็จ MVP2: Initial AI Analytics |       | 2025-12-11 |

---

## MVP 3: Basic Automation (2025-12-12 → 2026-01-08)

### Hardware & Actuator Procurement Team

| Type | Subject                             | Start      | End        |
| ---- | ----------------------------------- | ---------- | ---------- |
| Task | Procurement Actuators               | 2025-12-12 | 2025-12-16 |
| Task | ติดตั้งไดรเวอร์ควบคุมบน Edge Device | 2025-12-17 | 2025-12-21 |

### Control Logic & Integration Team

| Type | Subject                             | Start      | End        |
| ---- | ----------------------------------- | ---------- | ---------- |
| Task | พัฒนา Control logic & Set-point     | 2025-12-22 | 2026-01-02 |
| Task | เชื่อม Control logic กับ AI outputs | 2026-01-03 | 2026-01-06 |
| Task | End-to-end testing & Safety checks  | 2026-01-07 | 2026-01-08 |

### Milestone

| Type      | Subject                        | Start | End        |
| --------- | ------------------------------ | ----- | ---------- |
| Milestone | ✅ เสร็จ MVP3: Basic Automation |       | 2026-01-08 |

---

## MVP 4: ML Ops & Retraining (2026-01-09 → 2026-03-06)

### ML Ops Team

| Type | Subject                            | Start      | End        |
| ---- | ---------------------------------- | ---------- | ---------- |
| Task | ออกแบบสถาปัตยกรรม ML Ops           | 2026-01-09 | 2026-01-15 |
| Task | Implement Kubeflow pipeline        | 2026-01-16 | 2026-02-04 |
| Task | Integrate MLflow สำหรับ Versioning | 2026-02-05 | 2026-02-12 |

### Monitoring & Testing Team

| Type | Subject                                  | Start      | End        |
| ---- | ---------------------------------------- | ---------- | ---------- |
| Task | Setup Monitoring (Prometheus + Grafana)  | 2026-02-13 | 2026-02-20 |
| Task | Testing workflow Retraining & Monitoring | 2026-02-21 | 2026-03-06 |

### Milestone

| Type      | Subject                           | Start | End        |
| --------- | --------------------------------- | ----- | ---------- |
| Milestone | ✅ เสร็จ MVP4: ML Ops & Retraining |       | 2026-03-06 |

---

## MVP 5: Feedback & Scale-Out (2026-03-07 → 2026-06-12)

### Product Management & UX Team

| Type | Subject                                | Start      | End        |
| ---- | -------------------------------------- | ---------- | ---------- |
| Task | วางแผน & เตรียม Workshop/Survey        | 2026-03-07 | 2026-03-13 |
| Task | จัด Workshop / เก็บ Survey             | 2026-03-14 | 2026-03-27 |
| Task | วิเคราะห์ Feedback & จัดลำดับความสำคัญ | 2026-03-28 | 2026-04-03 |
| Task | ปรับปรุง UX/UI ตาม Feedback            | 2026-04-04 | 2026-04-17 |

### Feature Development Teams

| Type | Subject                                             | Start      | End        |
| ---- | --------------------------------------------------- | ---------- | ---------- |
| Task | พัฒนา Nutrition & Feed Intake Module                | 2026-04-18 | 2026-05-01 |
| Task | พัฒนา Health Management & Welfare Indicators Module | 2026-05-02 | 2026-05-15 |
| Task | พัฒนา Economic & Market Data Integration            | 2026-05-16 | 2026-05-29 |

### QA & Final Review Team

| Type | Subject                | Start      | End        |
| ---- | ---------------------- | ---------- | ---------- |
| Task | Final review & wrap-up | 2026-05-30 | 2026-06-12 |

### Milestone

| Type      | Subject                            | Start | End        |
| --------- | ---------------------------------- | ----- | ---------- |
| Milestone | ✅ เสร็จ MVP5: Feedback & Scale-Out |       | 2026-06-12 |

---

ถ้าต้องการ ผมสามารถทำเป็นไฟล์ Excel หรือ CSV ให้ พร้อมแบ่งสีตามทีมด้วยก็ได้นะครับ แจ้งได้เลย!



