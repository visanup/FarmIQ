// edge\services\images-ingestion-service\src\utils\mqtt.ts
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { MQTT_BROKER_URL, MQTT_USER, MQTT_PASSWORD, ROUTING_KEY } from '../configs/config';

let client: MqttClient | null = null;

export function initMqtt(): MqttClient {
  const opts: IClientOptions = {
    username: MQTT_USER,
    password: MQTT_PASSWORD,
    reconnectPeriod: 2000,
    connectTimeout: 10_000,
  };
  client = mqtt.connect(MQTT_BROKER_URL, opts);

  client.on('connect', () => console.log('📡 MQTT connected'));
  client.on('reconnect', () => console.log('📡 MQTT reconnecting...'));
  client.on('error', (err) => console.error('MQTT error', err));

  return client;
}

function toTopic(rk: string) {
  // แปลง routing key style (raw.created) → MQTT topic (raw/created)
  return rk.replace(/\./g, '/');
}

/** publish ไปยัง topic เดียวจาก ROUTING_KEY (.env) */
export function publishIngest(payload: unknown) {
  if (!client) throw new Error('MQTT not initialized');
  const topic = toTopic(ROUTING_KEY);
  client.publish(topic, JSON.stringify(payload), { qos: 1, retain: false });
}

/** เผื่ออนาคตอยาก override เป็น edge/{tenant}/image/raw/created */
export function publishIngestTo(topic: string, payload: unknown) {
  if (!client) throw new Error('MQTT not initialized');
  client.publish(topic, JSON.stringify(payload), { qos: 1, retain: false });
}

