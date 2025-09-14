const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'test-client',
  brokers: ['localhost:9092'],
  connectionTimeout: 30000,
  requestTimeout: 30000,
});

async function testKafka() {
  try {
    console.log('Testing Kafka connection...');
    const producer = kafka.producer();
    await producer.connect();
    console.log('✅ Connected to Kafka successfully!');
    await producer.disconnect();
    console.log('✅ Disconnected from Kafka');
  } catch (error) {
    console.error('❌ Kafka connection failed:', error.message);
  }
}

testKafka();

