`แก้ไขไฟล์`
1. mosquitto\config\aclfile `เพิ่มสิทธิ์ในไฟล์ aclfile`
+ topic write  sensor.raw/#
+ topic read  dm/+/+/health
+ topic read  dm/+/+/lwt

2. docker-compose.apps.yml
sensor-service: 
`--แก้ไข expose`
    จาก - "6300" เป็น - "6309"  *บรรทัดที่ 31*

3. .env
+ WRITE_DB=true  `เพิ่ม env ให้เขียน database ได้`

4. แก้ไข edge\services\sensor-service\src\services\sensor.service.ts
`แก้ไข cast ของ prisma ให้ตรงกับ DB Function`
  await prisma.$executeRawUnsafe(
    `SELECT sensors.fn_ingest_device_reading(
       $1::text,
       $2::text,
       $3::timestamptz,
       $4::text,
       $5::text,
       $6::double precision,
       $7::sensors.quality_enum,
       $8::jsonb
    )`,

5. แก้ไข mosquitto\config\mosquitto.conf
# AuthN/AuthZ
allow_anonymous false
password_file /mosquitto/config/passwd
acl_file      /mosquitto/config/aclfile
# TCP listener
listener 1883 0.0.0.0
เปิด  port - "9002:9002" ใน docker-compose

# WebSocket listener (optional)
listener 9002 0.0.0.0
protocol websockets

6. กรณีเครื่อง Edge เป็น windows ต้องเปิด firewall
รันใน CMD (Admin)
netsh advfirewall firewall add rule name="MQTT 1883" dir=in action=allow protocol=TCP localport=1883 profile=domain,private
netsh advfirewall firewall add rule name="MQTT WS 9002" dir=in action=allow protocol=TCP localport=9002 profile=domain,private
--------------------

## เงื่อนไขที่ subscribe (QoS 1 ทั้งหมด)
sensor.raw/+/+/+ → ฟอร์แมตหัวข้อ: sensor.raw/{tenant}/{metric}/{deviceId}
dm/+/+/health → ฟอร์แมต: dm/{tenant}/{deviceId}/health
dm/+/+/lwt → ฟอร์แมต: dm/{tenant}/{deviceId}/lwt
ทั้งสามอันสามารถเปลี่ยนได้ผ่าน env:
SENSOR_RAW_SUB (ดีฟอลต์ sensor.raw/+/+/+)
DM_HEALTH_SUB (ดีฟอลต์ dm/+/+/health)
DM_LWT_SUB (ดีฟอลต์ dm/+/+/lwt)
------------------------------------------------------

## สร้าง user tenat_id
docker run --rm -it -v "D:\Betagro\FarmIQ\edge\mosquitto\config:/mosquitto/config" eclipse-mosquitto:2.0 mosquitto_passwd /mosquitto/config/passwd tenant1
***แล้วมันจะถาม password ของ edge_sensor_svc → พิมพ์สองรอบ***
***อย่าลืม  docker compose restart edge-mqtt ***

-------------------------------------------

### subscribe
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_sub -h edge-mqtt -p 1883 -u edge_admin -P admin1234 -t "#" -v
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_sub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -t "sensor.raw/#" -v

### Publish

1) ใช้ mqtt-client service (หรือ mosquitto_pub) ยิง payload ตัวอย่าง

## ยิง telemetry pose
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_admin -P admin1234 -t "edge/farm1/r001/pose"     -m '{"tenant":"farm1","robot":"r001","run":12345,"ts":"2025-09-18T09:00:00Z","x":12.3,"y":4.5,"heading":90.0,"speed_mps":0.8,"battery_v":25.2,"meta":{"src":"mock"}}\

## ยิง reading (sensor) ผ่าน
`TEMP`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/TEMP/controller01" -m "{\"value\":25.123456789012345,\"ts\":\"2025-09-18T10:01:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"
`HUMI`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/HUMI/controller02" -m "{\"value\":65.123456789012345,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

`CO2`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/CO2/controller02" -m "{\"value\":999.999999999999999,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

`NH3`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/NH3/controller02" -m "{\"value\":323.987654321,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

`Intensity`
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_sensor_svc -P admin1234 -q 1 -t "sensor.raw/farm1/INSENSITY/controller02" -m "{\"value\":111.1111122222,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}"

## ยิง health (heartbeat)
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_admin -P admin1234 -t "edge/farm1/r001/health" -m "{\"tenant\":\"farm1\",\"device\":\"r001\",\"ts\":\"2025-09-18T09:02:00Z\",\"online\":true,\"source\":\"mock\",\"uptime_s\":99}"


### สำหรับส่งข้ามเครื่อง
docker run --rm alpine:3 sh -c "apk add --no-cache mosquitto-clients && mosquitto_pub -h 192.168.1.121 -p 1883 -u edge_sensor_svc -P 'admin1234' -t 'sensor.raw/farm1/HUMI/controller02' -m '{\"value\":65.123456789012345,\"ts\":\"2025-09-18T16:02:00Z\",\"sensor_id\":\"env01\",\"payload\":{\"unit\":\"\\u00B0C\"}}'"

2) ทดสอบ Vision pipeline

## ยิง metadata frame (แทน capture จริง)
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_admin -P admin1234 -t "edge/farm1/st01/camera/cam01/frame" -m "{\"tenant\":\"farm1\",\"scope\":{\"station\":\"st01\"},\"cam_id\":\"cam01\",\"ts\":\"2025-09-18T09:03:00Z\",\"path\":\"/share/media/mock/cam01.png\",\"sha256\":\"dummysha\",\"w\":640,\"h\":480,\"meta\":{\"depth\":false}}"


3) ทดสอบ orchestrator/command flow
## ยิง command → ให้ robot-orchestrator / robot-bridge ฟัง
docker run --rm --network farmiq-edge_farm_edge eclipse-mosquitto:2.0 mosquitto_pub -h edge-mqtt -p 1883 -u edge_admin -P admin1234 -t "edge/cmd/r001/start_sweep" -m "{}"

4) เช็คว่ามีข้อมูลเข้า database หรือไม่
docker exec -it farmiq-edge-timescaledb-1 psql -U postgres -d sensors_db -c "SELECT time, tenant_id, device_id, sensor_id, metric, value, quality FROM sensors.device_readings WHERE tenant_id = 'farm1' ORDER BY time DESC LIMIT 5;"


4) ตรวจสอบผลใน DB

    -- Pose
    SELECT * FROM sensors.robot_pose ORDER BY ts DESC LIMIT 5;

    -- Readings
    SELECT * FROM sensors.sweep_readings ORDER BY ts DESC LIMIT 5;

    -- Health
    SELECT * FROM sensors.device_health ORDER BY ts DESC LIMIT 5;

    -- Media
    SELECT * FROM sensors.media_objects ORDER BY time DESC LIMIT 5;

5) Automate ด้วย Script/Container

    import time, json
    import paho.mqtt.client as mqtt

    c = mqtt.Client()
    c.username_pw_set("admin","admin1234")
    c.connect("mosquitto",1883,60)

    while True:
        payload = {
            "tenant":"farm1","robot":"r001","run":12345,
            "sensor":"env01","metric":"TEMP",
            "ts":time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "value":25.0,"quality":"clean"
        }
        c.publish("edge/farm1/r001/reading/env01/TEMP", json.dumps(payload))
        time.sleep(5)

6) Monitoring/Debugging
    docker compose logs -f sensor-service



