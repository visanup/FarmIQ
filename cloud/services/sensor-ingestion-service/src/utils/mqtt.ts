// src/utils/mqtt.ts
import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import { MQTT_PASSWORD, MQTT_BROKER_URL, MQTT_USER } from '../configs/config';

let client: MqttClient | null = null;

export function initMqtt(): MqttClient {
  if (client) return client;
  const opts: IClientOptions = {};
  if (MQTT_USER) opts.username = MQTT_USER;
  if (MQTT_PASSWORD) opts.password = MQTT_PASSWORD;

  client = mqtt.connect(MQTT_BROKER_URL, opts);
  client.on('connect', () => console.log('📡 MQTT connected:', MQTT_BROKER_URL));
  client.on('reconnect', () => console.log('… MQTT reconnecting'));
  client.on('error', (e) => console.error('❌ MQTT error:', e.message));
  return client;
}

export function publish(topic: string, payload: any, qos: 0|1|2 = 1) {
  if (!client || !client.connected) return;
  client.publish(topic, JSON.stringify(payload), { qos });
}


