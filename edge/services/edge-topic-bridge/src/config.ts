import * as dotenv from 'dotenv';

dotenv.config();

const bool = (v: any, d = false) => (v === undefined ? d : String(v).trim().toLowerCase() === 'true');

export const MQTT_URL = process.env.MQTT_BROKER_URL || 'mqtt://edge-mqtt:1883';
export const MQTT_USER = process.env.MQTT_USER || process.env.MQTT_BRIDGE_USER || '';
export const MQTT_PASSWORD = process.env.MQTT_PASSWORD || process.env.MQTT_BRIDGE_PASSWORD || '';

export const TOPIC_PREFIX = process.env.TOPIC_PREFIX || 'edge';

export const ENABLE_KAFKA = bool(process.env.ENABLE_KAFKA, false);
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || '').split(',').map(s => s.trim()).filter(Boolean);
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'edge-topic-bridge';

// Defaults to help fill missing context during translation
export const DEFAULT_TENANT = process.env.DEFAULT_TENANT || 't1';
export const DEFAULT_HOUSE  = process.env.DEFAULT_HOUSE  || 'h01';

export const HTTP_PORT = Number(process.env.BRIDGE_PORT || 6305);

