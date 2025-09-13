#!/usr/bin/env node
// Helper to publish a sample feature message to `analytics.features`
// Usage examples:
//   KAFKA_BROKERS=localhost:9094 node scripts/publish-feature.js --tenant tenant-001 --factory factory-001 --machine device-001 --sensor sensor-001 --metric temp --avg 36.7 --window 60
//   docker exec -e KAFKA_BROKERS=kafka:9092 farmiq-analytics-alerts node /app/scripts/publish-feature.js --tenant tenant-001 --factory factory-001 --machine device-001 --sensor sensor-001 --metric temp --avg 36.7 --window 60

const { Kafka, Partitioners } = require('kafkajs');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tenant' || a === '-t') args.tenant = argv[++i];
    else if (a === '--factory' || a === '-f') args.factory = argv[++i];
    else if (a === '--machine' || a === '-m') args.machine = argv[++i];
    else if (a === '--sensor' || a === '-s') args.sensor = argv[++i];
    else if (a === '--metric') args.metric = argv[++i];
    else if (a === '--avg') args.avg = parseFloat(argv[++i]);
    else if (a === '--window') args.window = parseInt(argv[++i], 10);
    else if (a === '--bucket') args.bucket = argv[++i];
  }
  return args;
}

(async function main() {
  const {
    tenant = 'tenant-001',
    factory = 'factory-001',
    machine = 'device-001',
    sensor = 'sensor-001',
    metric = 'temp',
    avg = 36.7,
    window = 60,
    bucket,
  } = parseArgs(process.argv);

  const brokers = (process.env.KAFKA_BROKERS || 'localhost:9094')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
  const topic = process.env.TOPIC_ANALYTICS_FEATURES || 'analytics.features';

  const kafka = new Kafka({ clientId: 'publish-feature', brokers });
  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

  const payload = {
    bucket_start: bucket || new Date().toISOString(),
    window_s: window,
    sensor_id: sensor,
    tenant_id: tenant,
    factory_id: factory,
    machine_id: machine,
    metric,
    avg_val: avg,
  };

  try {
    await producer.connect();
    const res = await producer.send({
      topic,
      messages: [{ key: machine, value: JSON.stringify(payload) }],
    });
    console.log(`✅ Published to ${topic}`, res.map(r => ({ p: r.partition, o: r.baseOffset })));
  } catch (err) {
    console.error('❌ Failed to publish feature:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await producer.disconnect().catch(() => {});
  }
})();

