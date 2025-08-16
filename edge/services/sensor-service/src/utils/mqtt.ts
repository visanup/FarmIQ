// src/utils/mqtt.ts

import { connect, MqttClient } from "mqtt";
import { MQTT_BROKER_URL, MQTT_USER, MQTT_PASSWORD } from "../configs/config";

console.log(`🔌 MQTT connecting to ${MQTT_BROKER_URL} as ${MQTT_USER ?? "(no user)"}`);

export const mqttClient: MqttClient = connect(MQTT_BROKER_URL, {
  username: MQTT_USER,
  password: MQTT_PASSWORD,
  reconnectPeriod: 2000,
  keepalive: 30,
  clean: true,
});

mqttClient.on("connect", () => console.log(`📡 MQTT connected: ${MQTT_BROKER_URL}`));
mqttClient.on("reconnect", () => console.log("🔁 MQTT reconnecting..."));
mqttClient.on("error", (err) => console.error("❌ MQTT error:", err));

export function pubJSON(topic: string, payload: any, qos: 0 | 1 | 2 = 1, retain = false) {
  mqttClient.publish(topic, JSON.stringify(payload), { qos, retain }, (err) => {
    if (err) console.error("❌ MQTT publish error:", err, topic);
  });
}

