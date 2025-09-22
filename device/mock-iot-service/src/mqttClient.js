import mqtt from 'mqtt';
import pino from 'pino';
import { config } from './config.js';

const logger = pino({ level: 'info' });
export const mqttLogger = logger;

export const createMqttClient = () => {
  const { url, username, password } = config.mqtt;
  const client = mqtt.connect(url, {
    username,
    password,
    reconnectPeriod: 3000,
    connectTimeout: 10_000,
  });

  client.on('connect', () => logger.info({ msg: 'Connected to MQTT broker', url }));
  client.on('reconnect', () => logger.warn({ msg: 'Reconnecting to MQTT broker', url }));
  client.on('error', (err) => logger.error({ msg: 'MQTT error', err: err.message }));

  return { client, logger };
};

export const publishSensor = (client, { tenantId, metric, deviceId, payload }) => {
  const topic = `sensor.raw/${tenantId}/${metric}/${deviceId}`;
  const body = JSON.stringify(payload);
  client.publish(topic, body, { qos: 1 }, (err) => {
    if (err) {
      logger.error({ msg: 'Publish error', topic, err: err.message });
    } else {
      logger.debug({ msg: 'Published sensor payload', topic });
    }
  });
};
