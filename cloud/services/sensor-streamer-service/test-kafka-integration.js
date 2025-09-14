#!/usr/bin/env node

/**
 * Test script for sensor-streamer-service Kafka integration
 * Tests the new event schema and topics configuration
 */

const { Kafka } = require('kafkajs');

// Configuration
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';
const TOPIC_SENSOR_READINGS = process.env.TOPIC_SENSOR_READINGS || 'sensors.device.readings.v1';
const TOPIC_DEVICE_HEALTH = process.env.TOPIC_DEVICE_HEALTH || 'sensors.device.health.v1';
const TOPIC_LAB_READINGS = process.env.TOPIC_LAB_READINGS || 'sensors.lab.readings.v1';
const TOPIC_SWEEP_READINGS = process.env.TOPIC_SWEEP_READINGS || 'sensors.sweep.readings.v1';

const kafka = new Kafka({
  clientId: 'sensor-streamer-test',
  brokers: KAFKA_BROKERS.split(','),
});

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionTimeout: 30000,
});

const consumer = kafka.consumer({ 
  groupId: 'sensor-streamer-test-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

// Test data
const testSensorReading = {
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
};

const testDeviceHealth = {
  deviceId: 'test-device-001',
  status: 'online',
  lastSeen: new Date().toISOString(),
  batteryLevel: 85,
  signalStrength: -45,
  temperature: 35.2,
  errors: [],
  warnings: ['low_battery'],
};

const testLabReading = {
  sampleId: 'test-sample-001',
  farmId: 'test-farm-001',
  testType: 'ph_level',
  value: 6.8,
  unit: 'ph',
  result: 'normal',
  metadata: {
    labTechnician: 'tech-001',
    testMethod: 'digital_ph_meter',
  },
  timestamp: new Date().toISOString(),
};

const testSweepReading = {
  deviceId: 'test-device-001',
  farmId: 'test-farm-001',
  sweepId: 'sweep-001',
  data: {
    readings: [
      { x: 0, y: 0, value: 25.1 },
      { x: 1, y: 0, value: 25.3 },
      { x: 0, y: 1, value: 25.0 },
    ],
  },
  metadata: {
    sweepDuration: 30,
    sweepPattern: 'grid',
  },
  timestamp: new Date().toISOString(),
};

// Event schemas
function createSensorReadingEvent(data) {
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
      deviceId: data.deviceId,
      farmId: data.farmId,
      houseId: data.houseId,
      sensorType: data.sensorType,
      value: data.value,
      unit: data.unit,
      location: data.location,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date().toISOString(),
    },
  };
}

function createDeviceHealthEvent(data) {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType: 'device.health.updated',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'sensor-streamer-service',
      version: '1.0.0',
    },
    data: {
      deviceId: data.deviceId,
      status: data.status,
      lastSeen: data.lastSeen,
      batteryLevel: data.batteryLevel,
      signalStrength: data.signalStrength,
      temperature: data.temperature,
      errors: data.errors || [],
      warnings: data.warnings || [],
    },
  };
}

function createLabReadingEvent(data) {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType: 'lab.reading.created',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'sensor-streamer-service',
      version: '1.0.0',
    },
    data: {
      sampleId: data.sampleId,
      farmId: data.farmId,
      testType: data.testType,
      value: data.value,
      unit: data.unit,
      result: data.result,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date().toISOString(),
    },
  };
}

function createSweepReadingEvent(data) {
  return {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType: 'sweep.reading.created',
    version: '1.0',
    timestamp: new Date().toISOString(),
    source: {
      service: 'sensor-streamer-service',
      version: '1.0.0',
    },
    data: {
      deviceId: data.deviceId,
      farmId: data.farmId,
      sweepId: data.sweepId,
      data: data.data,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date().toISOString(),
    },
  };
}

// Test functions
async function testPublishSensorReading() {
  console.log('🧪 Testing sensor reading publication...');
  
  const event = createSensorReadingEvent(testSensorReading);
  
  try {
    const result = await producer.send({
      topic: TOPIC_SENSOR_READINGS,
      messages: [{
        key: testSensorReading.deviceId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
        headers: {
          eventType: 'sensor.reading.created',
          version: '1.0',
        },
      }],
    });
    
    console.log(`✅ Published sensor reading: ${event.eventId} (partition: ${result[0].partition}, offset: ${result[0].offset})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish sensor reading:', error);
    return false;
  }
}

async function testPublishDeviceHealth() {
  console.log('🧪 Testing device health publication...');
  
  const event = createDeviceHealthEvent(testDeviceHealth);
  
  try {
    const result = await producer.send({
      topic: TOPIC_DEVICE_HEALTH,
      messages: [{
        key: testDeviceHealth.deviceId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
        headers: {
          eventType: 'device.health.updated',
          version: '1.0',
        },
      }],
    });
    
    console.log(`✅ Published device health: ${event.eventId} (partition: ${result[0].partition}, offset: ${result[0].offset})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish device health:', error);
    return false;
  }
}

async function testPublishLabReading() {
  console.log('🧪 Testing lab reading publication...');
  
  const event = createLabReadingEvent(testLabReading);
  
  try {
    const result = await producer.send({
      topic: TOPIC_LAB_READINGS,
      messages: [{
        key: testLabReading.sampleId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
        headers: {
          eventType: 'lab.reading.created',
          version: '1.0',
        },
      }],
    });
    
    console.log(`✅ Published lab reading: ${event.eventId} (partition: ${result[0].partition}, offset: ${result[0].offset})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish lab reading:', error);
    return false;
  }
}

async function testPublishSweepReading() {
  console.log('🧪 Testing sweep reading publication...');
  
  const event = createSweepReadingEvent(testSweepReading);
  
  try {
    const result = await producer.send({
      topic: TOPIC_SWEEP_READINGS,
      messages: [{
        key: testSweepReading.deviceId,
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
        headers: {
          eventType: 'sweep.reading.created',
          version: '1.0',
        },
      }],
    });
    
    console.log(`✅ Published sweep reading: ${event.eventId} (partition: ${result[0].partition}, offset: ${result[0].offset})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish sweep reading:', error);
    return false;
  }
}

async function testConsumeMessages() {
  console.log('🧪 Testing message consumption...');
  
  const topics = [TOPIC_SENSOR_READINGS, TOPIC_DEVICE_HEALTH, TOPIC_LAB_READINGS, TOPIC_SWEEP_READINGS];
  let messageCount = 0;
  const maxMessages = 4;
  
  try {
    await consumer.subscribe({ topics, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          console.log(`📨 Received message from ${topic}: ${data.eventId || 'unknown'} (${data.eventType || 'unknown'})`);
          messageCount++;
          
          if (messageCount >= maxMessages) {
            console.log('✅ All test messages received successfully');
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
    }, 10000);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to consume messages:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting sensor-streamer-service Kafka integration tests...');
  console.log(`📡 Kafka Brokers: ${KAFKA_BROKERS}`);
  console.log(`📋 Topics: ${[TOPIC_SENSOR_READINGS, TOPIC_DEVICE_HEALTH, TOPIC_LAB_READINGS, TOPIC_SWEEP_READINGS].join(', ')}`);
  console.log('');

  try {
    // Connect producer
    await producer.connect();
    console.log('✅ Producer connected');

    // Connect consumer
    await consumer.connect();
    console.log('✅ Consumer connected');
    console.log('');

    // Run tests
    const results = await Promise.all([
      testPublishSensorReading(),
      testPublishDeviceHealth(),
      testPublishLabReading(),
      testPublishSweepReading(),
    ]);

    const successCount = results.filter(Boolean).length;
    console.log('');
    console.log(`📊 Test Results: ${successCount}/${results.length} tests passed`);

    if (successCount === results.length) {
      console.log('🎉 All tests passed! sensor-streamer-service is ready for production.');
    } else {
      console.log('⚠️ Some tests failed. Please check the configuration and try again.');
    }

    // Test consumption
    console.log('');
    await testConsumeMessages();

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
