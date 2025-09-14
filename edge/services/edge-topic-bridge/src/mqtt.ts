import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import { MQTT_PASSWORD, MQTT_URL, MQTT_USER } from './config.js';

let client: MqttClient | null = null;

export function initMqtt(): MqttClient {
  if (client) return client;
  const opts: IClientOptions = {};
  if (MQTT_USER) opts.username = MQTT_USER;
  if (MQTT_PASSWORD) opts.password = MQTT_PASSWORD;
  opts.reconnectPeriod = 2000;
  opts.connectTimeout = 10000;
  client = mqtt.connect(MQTT_URL, opts);
  client.on('connect', () => console.log('MQTT connected', MQTT_URL));
  client.on('reconnect', () => console.log('MQTT reconnecting...'));
  client.on('error', (e) => console.error('MQTT error', e.message));
  return client;
}

export function publish(topic: string, payload: any, qos: 0|1|2 = 1, retain = false) {
  if (!client) return;
  client.publish(topic, JSON.stringify(payload), { qos, retain });
}

export function subscribe(topics: string | string[], cb: (topic: string, msg: any) => void) {
  if (!client) throw new Error('MQTT not initialized');
  client.subscribe(topics, { qos: 1 }, (err) => { if (err) console.error('MQTT subscribe error', err); });
  client.on('message', (topic, buf) => {
    try { const obj = JSON.parse(buf.toString()); cb(topic, obj); }
    catch (e) { console.error('Invalid JSON on', topic, e); }
  });
}

