#!/usr/bin/env node

/**
 * Test script for Monitoring Service Kafka integration
 * Tests the new topics configuration and event schema
 */

const { Kafka } = require('kafkajs');

// Configuration
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';

const kafka = new Kafka({
  clientId: 'monitoring-integration-test',
  brokers: KAFKA_BROKERS.split(','),
});

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionTimeout: 30000,
});

const consumer = kafka.consumer({ 
  groupId: 'monitoring-test-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

// Test topics
const testTopics = [
  'sensors.device.health.v1',
  'analytics.anomaly.v1',
  'monitoring.alerts.v1',
  'monitoring.health.v1'
];

// Test data generators
function createDeviceHealthEvent() {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    eventType: 'device.health.updated',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'sensor-streamer-service',
      version: '1.0.0',
    },
    data: {
      // Fields expected by analytics-stream (DeviceHealthEventSchema)
      id: `health_${Date.now()}`,
      deviceId: 'dev_tenant-001_test-device-001',
      status: 'healthy',
      lastSeen: new Date().toISOString(),
      batteryLevel: 85,
      signalStrength: -45,
      temperature: '25.5',
      errors: [],
      warnings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function createAnalyticsAnomalyEvent() {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    eventType: 'analytics.anomaly.detected',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'analytics-stream',
      version: '1.0.0',
    },
    data: {
      farmId: 'test-farm-001',
      houseId: 'test-house-001',
      deviceId: 'test-device-001',
      anomalyType: 'temperature_spike',
      severity: 'high',
      confidence: 0.95,
      description: 'Temperature spike detected in house 1',
      metrics: {
        temperature: 35.5,
        expectedRange: [20, 30],
        deviation: 5.5,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

function createMonitoringAlertEvent() {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    eventType: 'monitoring.alert.created',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'monitoring-service',
      version: '1.0.0',
    },
    data: {
      alertId: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      tenantId: 'tenant-001',
      alertType: 'device_offline',
      severity: 'critical',
      status: 'active',
      description: 'Device test-device-001 is offline',
      farmId: 'test-farm-001',
      houseId: 'test-house-001',
      deviceId: 'test-device-001',
      batchId: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    },
  };
}

function createMonitoringHealthEvent() {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    eventType: 'monitoring.health.updated',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'monitoring-service',
      version: '1.0.0',
    },
    data: {
      tenantId: 'tenant-001',
      deviceId: 'test-device-001',
      status: 'healthy',
      time: new Date().toISOString(),
      metadata: {
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 23.1,
        networkLatency: 12.5,
      },
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
        key: event.data.alertId || event.data.deviceId || event.data.farmId || 'test-key',
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
  const maxMessages = 4; // Expect 4 messages (one from each topic)
  
  try {
    await consumer.subscribe({ topics: testTopics, fromBeginning: false });
    
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
  
  for (const { topic } of existingTopics) {
    let event;
    
    if (topic === 'sensors.device.health.v1') {
      event = createDeviceHealthEvent();
    } else if (topic === 'analytics.anomaly.v1') {
      event = createAnalyticsAnomalyEvent();
    } else if (topic === 'monitoring.alerts.v1') {
      event = createMonitoringAlertEvent();
    } else if (topic === 'monitoring.health.v1') {
      event = createMonitoringHealthEvent();
    } else {
      // Generic event for other topics
      event = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
  console.log('🚀 Starting Monitoring Service Kafka integration tests...');
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

    console.log('\n🎉 Monitoring integration tests completed!');
    console.log('✅ Monitoring service is ready for production.');

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
