#!/usr/bin/env bash
set -euo pipefail

CONF_DIR="$(cd "$(dirname "$0")" && pwd)"

# ใช้คอนเทนเนอร์ mosquitto สร้าง/อัปเดตรหัสให้ไฟล์ passwd ในโฟลเดอร์นี้
run_passwd() {
  local create_flag="$1" user="$2"
  docker run --rm -i -v "${CONF_DIR}:/mosquitto/config" eclipse-mosquitto:2.0 \
    mosquitto_passwd ${create_flag} /mosquitto/config/passwd "${user}"
}

echo ">> Creating/Updating mosquitto passwd at ${CONF_DIR}/passwd"

# ครั้งแรกใช้ -c สร้างไฟล์ จากนั้นห้ามใช้ -c อีก
run_passwd -c edge_admin
run_passwd ""  edge_sensor_svc
run_passwd ""  edge_agent

# tenant (username=tenant) — เพิ่มตามต้องการ
run_passwd ""  farm-001

echo ">> Done. Start broker with:  cd ../../ && docker compose up -d edge-mqtt"
