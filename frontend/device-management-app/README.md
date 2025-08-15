# Device Management
## Device Group
รองรับโครงสร้างแบบลำดับชั้น (hierarchical)
1. name – ชื่อกลุ่ม
2. note – หมายเหตุ (ไม่จำเป็น)
3. category – ประเภทกลุ่ม (ตัวอย่างเช่น sensor-environment, actuator-feeder ฯลฯ)
    - farm
    - house
    - sensor-environment
    - actuator-feeder
4. parent_id – ถ้าต้องการใส่เป็น subgroup ให้ใส่ ID ของกลุ่มแม่ (ถ้าเป็น root group ให้เว้นค่านี้หรือใส่ null)

## Device type
1. name: ชื่อประเภทอุปกรณ์
2. icon_css_class: ชื่อ class ของไอคอน (เช่นของ FontAwesome)
3. default_image_url: URL รูปภาพไอคอนหรือภาพประกอบ
4. type_id: ถ้าใน schema คุณมีฟิลด์นี้ (เช่น รหัสประเภทย่อย) ให้ใส่ด้วย