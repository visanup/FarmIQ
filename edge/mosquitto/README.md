# เตรียมไฟล์บนโฮสต์

โครงสร้าง:
``` bash
    edge/mosquitto/config/
    ├─ mosquitto.conf      # (ของคุณมีแล้ว)
    ├─ aclfile             # <– สร้างใหม่
    └─ init-users.sh       # สคริปต์สร้างผู้ใช้ (รันครั้งแรก)
```

สร้างไฟล์ว่าง:
``` bash 
    # Linux/macOS
    touch edge/mosquitto/config/aclfile edge/mosquitto/config/passwd
    # Windows PowerShell
    ni farm-ecosystem/edge/mosquitto/config/aclfile -ItemType File
    ni farm-ecosystem/edge/mosquitto/config/passwd  -ItemType File
```

ใส่ข้อมูล aclfile:
``` bash 
    ############################################
    # ACL for FarmIQ Edge Mosquitto
    # Policy: deny-by-default, least privilege
    ############################################

    # ===== Admin =====
    user edge_admin
    topic readwrite #

    # ===== Service accounts =====
    # sensor-service
    user edge_sensor_svc
    topic read  sensor.raw/#
    topic write sensor.clean/#
    topic write sensor.anomaly/#
    topic write sensor.dlq/#
    topic read  cmd/#

    # edge-agent
    user edge_agent
    topic read  ota/#
    topic write ota/+/+/progress
    topic read  dm/+/+/shadow/update
    topic write dm/+/+/shadow/accepted
    topic write dm/+/+/shadow/reported
    topic write dm/+/+/health
    topic write dm/+/+/lwt

    # ===== Device rules (username = tenant, clientid = deviceId) =====
    # Shadow / Health / LWT
    pattern write dm/%u/%c/shadow/reported
    pattern read  dm/%u/%c/shadow/update
    pattern write dm/%u/%c/shadow/accepted
    pattern write dm/%u/%c/health
    pattern write dm/%u/%c/lwt

    # OTA
    pattern read  ota/%u/%c/offer
    pattern write ota/%u/%c/progress

    # Telemetry
    pattern write sensor.raw/%u/+/%c
    pattern write sensor.clean/%u/+/%c

    # Command/Actuation
    pattern read  cmd/%u/%c/request
    pattern write cmd/%u/%c/ack
```

สร้าง passwd:

``` powershell 
    # ชี้โฟลเดอร์ config ของคุณ
    $CONF = 'D:/FarmIQ/edge/mosquitto/config'

    # ครั้งแรก: สร้างไฟล์ passwd พร้อมผู้ใช้ edge_admin (จะถามรหัส)
    docker run --rm -it -v "${CONF}:/mosquitto/config" eclipse-mosquitto:2.0 `
    mosquitto_passwd -c /mosquitto/config/passwd edge_admin

    # เพิ่ม users อื่นๆ (ห้ามใส่ -c)
    docker run --rm -it -v "${CONF}:/mosquitto/config" eclipse-mosquitto:2.0 `
    mosquitto_passwd /mosquitto/config/passwd edge_sensor_svc

    docker run --rm -it -v "${CONF}:/mosquitto/config" eclipse-mosquitto:2.0 `
    mosquitto_passwd /mosquitto/config/passwd edge_agent

    docker run --rm -it -v "${CONF}:/mosquitto/config" eclipse-mosquitto:2.0 `
    mosquitto_passwd /mosquitto/config/passwd farm-001

    docker run --rm -it -v "${CONF}:/mosquitto/config" eclipse-mosquitto:2.0 `
    mosquitto_passwd /mosquitto/config/passwd edge_scheduler

    docker run --rm -it -v "${CONF}:/mosquitto/config" eclipse-mosquitto:2.0 `
    mosquitto_passwd /mosquitto/config/passwd edge_sync_svc

    docker run --rm -it -v "${CONF}:/mosquitto/config" eclipse-mosquitto:2.0 `
    mosquitto_passwd /mosquitto/config/passwd edge_image_ingest
```

