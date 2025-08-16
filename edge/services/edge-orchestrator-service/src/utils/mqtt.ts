// src/utils/mqtt.ts
import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import { MQTT_PASSWORD, MQTT_URL, MQTT_USERNAME } from '../configs/config';

let client: MqttClient | null = null;

export function initMqtt(): MqttClient {
  if (client) return client;
  const opts: IClientOptions = {};
  if (MQTT_USERNAME) opts.username = MQTT_USERNAME;
  if (MQTT_PASSWORD) opts.password = MQTT_PASSWORD;

  client = mqtt.connect(MQTT_URL, opts);
  client.on('connect', () => console.log('📡 MQTT connected:', MQTT_URL));
  client.on('reconnect', () => console.log('… MQTT reconnecting'));
  client.on('error', (e) => console.error('❌ MQTT error:', e.message));
  return client;
}

export function publish(topic: string, payload: any, qos: 0|1|2 = 1) {
  if (!client || !client.connected) return;
  client.publish(topic, JSON.stringify(payload), { qos });
}


