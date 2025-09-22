#!/usr/bin/env node

/**
 * Run Edge Sensor Mockup
 * 
 * Script สำหรับรัน edge sensor mockup ที่ส่งข้อมูลผ่าน MQTT
 */

import { config } from './config.js';
import { createMqttClient } from './mqttClient.js';

const { client, logger } = createMqttClient();

// Wait for MQTT connection
client.on('connect', () => {
  logger.info('🔌 MQTT connected, starting edge sensor mockup...');
  
  // Import and start the edge sensor simulation
  import('./edgeSensorMockup.js').then(() => {
    logger.info('✅ Edge sensor mockup started successfully');
  }).catch((error) => {
    logger.error('❌ Failed to start edge sensor mockup:', error);
    process.exit(1);
  });
});

client.on('error', (error) => {
  logger.error('❌ MQTT connection error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down edge sensor mockup...');
  client.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Shutting down edge sensor mockup...');
  client.end();
  process.exit(0);
});
