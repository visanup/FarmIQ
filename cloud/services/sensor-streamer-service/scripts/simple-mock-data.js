const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:7302/api';
const API_KEY = 'your-api-key-here'; // ใช้ API key ที่ตั้งค่าไว้

// Simple mock data for testing
const mockSensorReadings = [
  {
    deviceId: 'DEVICE_HOUSE001_TEMPERATURE',
    customerId: 'CUST001',
    farmId: 'FARM001',
    houseId: 'HOUSE001',
    sensorType: 'TEMPERATURE',
    value: 25.5,
    unit: '°C',
    timestamp: new Date().toISOString(),
    metadata: {
      quality: 0.95,
      batteryLevel: 85,
      signalStrength: -45
    }
  },
  {
    deviceId: 'DEVICE_HOUSE001_HUMIDITY',
    customerId: 'CUST001',
    farmId: 'FARM001',
    houseId: 'HOUSE001',
    sensorType: 'HUMIDITY',
    value: 65.2,
    unit: '%',
    timestamp: new Date().toISOString(),
    metadata: {
      quality: 0.92,
      batteryLevel: 78,
      signalStrength: -52
    }
  }
];

const mockLabReadings = [
  {
    deviceId: 'DEVICE_HOUSE001_PH',
    customerId: 'CUST001',
    farmId: 'FARM001',
    houseId: 'HOUSE001',
    testType: 'PH_TEST',
    sampleType: 'WATER_SAMPLE',
    value: 7.2,
    unit: 'pH',
    timestamp: new Date().toISOString(),
    status: 'COMPLETED',
    metadata: {
      labTechnician: 'Tech_001',
      sampleId: 'SAMPLE_001',
      notes: 'Sample collected from House A'
    }
  }
];

const mockSweepReadings = [
  {
    deviceId: 'DEVICE_HOUSE001_TEMPERATURE',
    customerId: 'CUST001',
    farmId: 'FARM001',
    houseId: 'HOUSE001',
    sweepId: 'SWEEP_HOUSE001_001',
    sensorType: 'TEMPERATURE',
    value: 24.8,
    unit: '°C',
    timestamp: new Date().toISOString(),
    metadata: {
      sweepDuration: 10,
      sweepPattern: 'GRID',
      operator: 'OP_001'
    }
  }
];

const mockDeviceHealth = [
  {
    deviceId: 'DEVICE_HOUSE001_TEMPERATURE',
    customerId: 'CUST001',
    farmId: 'FARM001',
    houseId: 'HOUSE001',
    status: 'ONLINE',
    batteryLevel: 85,
    signalStrength: -45,
    temperature: 25.5,
    humidity: 65.2,
    timestamp: new Date().toISOString(),
    errors: [],
    metadata: {
      uptime: 95,
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      firmwareVersion: '1.2.3'
    }
  }
];

const mockDataIngestionLogs = [
  {
    source: 'sensor_DEVICE_HOUSE001_TEMPERATURE',
    dataType: 'SENSOR_READING',
    recordCount: 1,
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    metadata: {
      processingTime: 0.5,
      errors: [],
      batchId: 'BATCH_001'
    }
  }
];

// API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Send data to API
async function sendData(endpoint, data) {
  try {
    console.log(`📤 Sending ${data.length} records to ${endpoint}...`);
    const response = await apiClient.post(endpoint, { data });
    console.log(`✅ Data sent successfully to ${endpoint}`);
    console.log(`Response:`, response.data);
  } catch (error) {
    console.error(`❌ Error sending data to ${endpoint}:`, error.response?.data || error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting simple mock data generation...');
  
  // Test API connectivity first
  try {
    const healthResponse = await apiClient.get('/health');
    console.log('✅ API is healthy:', healthResponse.data);
  } catch (error) {
    console.error('❌ API health check failed:', error.message);
    return;
  }
  
  // Send mock data
  await sendData('/sensors/batch', mockSensorReadings);
  await sendData('/lab-readings/batch', mockLabReadings);
  await sendData('/sweep-readings/batch', mockSweepReadings);
  await sendData('/device-health/batch', mockDeviceHealth);
  await sendData('/data-ingestion-logs/batch', mockDataIngestionLogs);
  
  console.log('🎉 Simple mock data generation completed!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  mockSensorReadings,
  mockLabReadings,
  mockSweepReadings,
  mockDeviceHealth,
  mockDataIngestionLogs
};
