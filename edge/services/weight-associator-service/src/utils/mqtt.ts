// src/utils/mqtt.ts

import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import { MQTT_BROKER_URL, MQTT_USER, MQTT_PASSWORD } from '../configs/config';

let client: MqttClient | null = null;

function toTopic(rk: string) { return rk.replace(/\./g, '/'); }

export function initMqtt(): MqttClient {
  const opts: IClientOptions = {
    username: MQTT_USER || undefined,
    password: MQTT_PASSWORD || undefined,
    reconnectPeriod: 2000,
    connectTimeout: 10_000,
  };
  client = mqtt.connect(MQTT_BROKER_URL, opts);
  client.on('connect', () => console.log('📡 MQTT connected'));
  client.on('reconnect', () => console.log('📡 MQTT reconnecting...'));
  client.on('error', (e) => console.error('MQTT error', e));
  return client;
}

export function subscribe(rk: string, handler: (msg: any) => Promise<void> | void) {
  if (!client) throw new Error('MQTT not initialized');
  const topic = toTopic(rk);
  client.subscribe(topic, { qos: 1 }, (err) => {
    if (err) console.error('MQTT subscribe error', err);
  });
  client.on('message', (t, p) => {
    if (t !== topic) return;
    try { const obj = JSON.parse(p.toString()); Promise.resolve(handler(obj)).catch(console.error); }
    catch (e) { console.error('Invalid JSON payload for', rk, e); }
  });
}

export function publish(rk: string, payload: unknown) {
  if (!client) throw new Error('MQTT not initialized');
  client.publish(toTopic(rk), JSON.stringify(payload), { qos: 1, retain: false });
}

