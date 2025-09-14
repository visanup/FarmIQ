import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { HTTP_PORT } from './config.js';
import { initMqtt, subscribe } from './mqtt.js';
import { mapDeviceHealth, mapImageCreated, mapSensorAnomaly, mapSensorClean, mapWeightAssociated } from './bridge.js';

async function start() {
  // init
  const mqtt = initMqtt();

  // subscriptions
  subscribe([
    'sensor.clean/#',
    'sensor.anomaly/#',
    'dm/+/+/health',
    'dm/+/+/lwt',
    'image/created',
    'weight/associated'
  ], async (topic, msg) => {
    try {
      if (topic.startsWith('sensor.clean/')) {
        await mapSensorClean(topic.split('/'), msg);
        return;
      }
      if (topic.startsWith('sensor.anomaly/')) {
        await mapSensorAnomaly(topic.split('/'), msg);
        return;
      }
      if (topic.endsWith('/health')) {
        await mapDeviceHealth('health', topic.split('/'), msg);
        return;
      }
      if (topic.endsWith('/lwt')) {
        await mapDeviceHealth('lwt', topic.split('/'), msg);
        return;
      }
      if (topic === 'image/created') {
        await mapImageCreated(msg);
        return;
      }
      if (topic === 'weight/associated') {
        await mapWeightAssociated(msg);
        return;
      }
    } catch (e: any) {
      console.error('bridge handler error', e?.message || e);
    }
  });

  // health server
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  app.get('/health', async () => 'OK');
  await app.listen({ port: HTTP_PORT, host: '0.0.0.0' });
  console.log(`edge-topic-bridge :${HTTP_PORT}`);
}

start().catch((e) => { console.error(e); process.exit(1); });

