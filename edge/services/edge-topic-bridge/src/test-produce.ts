import { initKafka, produce } from './kafka.js';

async function main() {
  const topic = process.env.KAFKA_TEST_TOPIC || 'sensors.device.health.v1';
  await initKafka();
  const payload = {
    eventType: 'device.health.test',
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: { deviceId: 'edge-test', status: 'online', note: 'test-produce' }
  };
  await produce(topic, 't1', payload);
  console.log('Produced test message to', topic);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

