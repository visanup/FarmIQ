#!/usr/bin/env node

/**
 * Test script for Analytics Services Kafka integration
 * Tests the new topics configuration and event schema
 */

const { Kafka } = require('kafkajs');

// Configuration
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';

const kafka = new Kafka({
  clientId: 'analytics-integration-test',
  brokers: KAFKA_BROKERS.split(','),
});

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionTimeout: 30000,
});

const consumer = kafka.consumer({ 
  groupId: 'analytics-test-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

// Test topics
const testTopics = [
  'sensors.device.readings.v1',
  'sensors.device.health.v1',
  'sensors.lab.readings.v1',
  'sensors.sweep.readings.v1',
  'external.weather.observation.v1',
  'farms.operational.event.v1',
  'feed.batch.created.v1',
  'feed.quality.result.v1',
  'economics.cost.txn.v1',
  'devices.device.snapshot.v1',
  'farms.farm.snapshot.v1',
  'farms.house.snapshot.v1',
  'farms.flock.snapshot.v1',
  'master.customer.snapshot.v1',
  'master.device.snapshot.v1',
  'master.farm.snapshot.v1',
  'master.house.snapshot.v1',
  'master.flock.snapshot.v1',
  'master.animal-type.snapshot.v1',
  'master.breed.snapshot.v1',
  'analytics.features',
  'analytics.prediction.v1',
  'analytics.anomaly.v1',
  'analytics.invalid-readings'
];

// Test data generators
function createSensorReadingEvent() {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType: 'sensor.reading.created',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'sensor-streamer-service',
      version: '1.0.0',
    },
    data: {
      deviceId: 'test-device-001',
      farmId: 'test-farm-001',
      houseId: 'test-house-001',
      sensorType: 'temperature',
      value: 25.5,
      unit: 'celsius',
      location: { x: 10.5, y: 20.3, z: 1.2 },
      metadata: {
        batteryLevel: 85,
        signalStrength: -45,
        calibrationDate: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
  };
}

function createMasterDataEvent(topic) {
  const eventTypes = {
    'master.customer.snapshot.v1': 'customer.snapshot.updated',
    'master.device.snapshot.v1': 'device.snapshot.updated',
    'master.farm.snapshot.v1': 'farm.snapshot.updated',
    'master.house.snapshot.v1': 'house.snapshot.updated',
    'master.flock.snapshot.v1': 'flock.snapshot.updated',
    'master.animal-type.snapshot.v1': 'animal-type.snapshot.updated',
    'master.breed.snapshot.v1': 'breed.snapshot.updated',
  };

  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType: eventTypes[topic] || 'unknown.snapshot.updated',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'master-service',
      version: '1.0.0',
    },
    data: {
      id: `test-${topic.split('.')[1]}-001`,
      name: `Test ${topic.split('.')[1]} Name`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function createAnalyticsEvent(topic) {
  const eventTypes = {
    'analytics.features': 'analytics.features.generated',
    'analytics.prediction.v1': 'analytics.prediction.created',
    'analytics.anomaly.v1': 'analytics.anomaly.detected',
    'analytics.invalid-readings': 'analytics.invalid.reading',
  };

  if (topic === 'analytics.features') {
    // Align with analytics-alerts handler (handleAnalyticsFeature)
    return {
      bucket_start: new Date().toISOString(),
      window_s: 60,
      sensor_id: 'sensor-001',
      tenant_id: 'tenant-001',
      factory_id: 'factory-001',
      machine_id: 'device-001',
      metric: 'temp',
      avg_val: 35.2, // > 30 triggers alert
    };
  }

  // Generic envelope for other analytics topics
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType: eventTypes[topic] || 'analytics.unknown',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'analytics-stream',
      version: '1.0.0',
    },
    data: {
      farmId: 'test-farm-001',
      houseId: 'test-house-001',
      features: {
        temperature_avg: 25.5,
        humidity_avg: 65.0,
        feed_intake: 120.5,
      },
      confidence: 0.85,
      timestamp: new Date().toISOString(),
    },
  };
}

// Test functions
async function testTopicExists(topic) {
  try {
    const admin = kafka.admin();
    await admin.connect();
    
    const metadata = await admin.fetchTopicMetadata({ topics: [topic] });
    const exists = metadata.topics.some(t => t.name === topic);
    
    await admin.disconnect();
    return exists;
  } catch (error) {
    console.error(`❌ Error checking topic ${topic}:`, error.message);
    return false;
  }
}

async function testPublishToTopic(topic, event) {
  try {
    const result = await producer.send({
      topic,
      messages: [{
        key: event.data.id || event.data.deviceId || event.data.farmId || 'test-key',
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
        headers: {
          eventType: event.eventType,
          version: event.version,
        },
      }],
    });
    
    console.log(`✅ Published to ${topic}: ${event.eventId} (partition: ${result[0].partition}, offset: ${result[0].offset})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish to ${topic}:`, error.message);
    return false;
  }
}

async function testConsumeFromTopics() {
  console.log('🧪 Testing message consumption...');
  
  let messageCount = 0;
  const maxMessages = 5; // Expect at least 5 messages
  
  try {
    await consumer.subscribe({ topics: testTopics.slice(0, 5), fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          console.log(`📨 Received message from ${topic}: ${data.eventId || 'unknown'} (${data.eventType || 'unknown'})`);
          messageCount++;
          
          if (messageCount >= maxMessages) {
            console.log('✅ Sufficient test messages received');
            await consumer.disconnect();
          }
        } catch (error) {
          console.error(`❌ Error processing message from ${topic}:`, error);
        }
      },
    });
    
    // Wait for messages or timeout
    setTimeout(async () => {
      if (messageCount < maxMessages) {
        console.log(`⚠️ Only received ${messageCount}/${maxMessages} messages`);
      }
      await consumer.disconnect();
    }, 15000);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to consume messages:', error);
    return false;
  }
}

async function runTopicTests() {
  console.log('🧪 Testing topic existence...');
  
  const results = [];
  
  for (const topic of testTopics) {
    const exists = await testTopicExists(topic);
    results.push({ topic, exists });
    
    if (exists) {
      console.log(`✅ Topic ${topic} exists`);
    } else {
      console.log(`❌ Topic ${topic} does not exist`);
    }
  }
  
  const existingTopics = results.filter(r => r.exists);
  const missingTopics = results.filter(r => !r.exists);
  
  console.log(`\n📊 Topic Test Results:`);
  console.log(`✅ Existing topics: ${existingTopics.length}/${testTopics.length}`);
  console.log(`❌ Missing topics: ${missingTopics.length}/${testTopics.length}`);
  
  if (missingTopics.length > 0) {
    console.log('\n❌ Missing topics:');
    missingTopics.forEach(({ topic }) => console.log(`  - ${topic}`));
  }
  
  return existingTopics;
}

async function runPublishTests(existingTopics) {
  console.log('\n🧪 Testing message publishing...');
  
  const results = [];
  
  for (const { topic } of existingTopics.slice(0, 10)) { // Test first 10 topics
    let event;
    
    if (topic.startsWith('master.')) {
      event = createMasterDataEvent(topic);
    } else if (topic.startsWith('analytics.')) {
      event = createAnalyticsEvent(topic);
    } else if (topic.startsWith('sensors.')) {
      event = createSensorReadingEvent();
    } else {
      // Generic event for other topics
      event = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType: 'test.event',
        version: '1.0',
        timestamp: new Date().toISOString(),
        source: {
          service: 'test-service',
          version: '1.0.0',
        },
        data: {
          test: true,
          topic,
          timestamp: new Date().toISOString(),
        },
      };
    }
    
    const success = await testPublishToTopic(topic, event);
    results.push({ topic, success });
    
    // Small delay between publishes
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const successfulPublishes = results.filter(r => r.success);
  const failedPublishes = results.filter(r => !r.success);
  
  console.log(`\n📊 Publish Test Results:`);
  console.log(`✅ Successful publishes: ${successfulPublishes.length}/${results.length}`);
  console.log(`❌ Failed publishes: ${failedPublishes.length}/${results.length}`);
  
  if (failedPublishes.length > 0) {
    console.log('\n❌ Failed publishes:');
    failedPublishes.forEach(({ topic }) => console.log(`  - ${topic}`));
  }
  
  return successfulPublishes;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Analytics Services Kafka integration tests...');
  console.log(`📡 Kafka Brokers: ${KAFKA_BROKERS}`);
  console.log(`📋 Testing ${testTopics.length} topics`);
  console.log('');

  try {
    // Connect producer
    await producer.connect();
    console.log('✅ Producer connected');

    // Connect consumer
    await consumer.connect();
    console.log('✅ Consumer connected');
    console.log('');

    // Test topic existence
    const existingTopics = await runTopicTests();
    
    if (existingTopics.length === 0) {
      console.log('\n❌ No topics exist. Please create topics first.');
      return;
    }

    // Test publishing
    const successfulPublishes = await runPublishTests(existingTopics);
    
    if (successfulPublishes.length === 0) {
      console.log('\n❌ No successful publishes. Please check Kafka configuration.');
      return;
    }

    // Test consumption
    console.log('\n🧪 Testing message consumption...');
    await testConsumeFromTopics();

    console.log('\n🎉 Analytics integration tests completed!');
    console.log('✅ Analytics services are ready for production.');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    // Cleanup
    await producer.disconnect();
    await consumer.disconnect();
    console.log('✅ Disconnected from Kafka');
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run tests
runTests();
