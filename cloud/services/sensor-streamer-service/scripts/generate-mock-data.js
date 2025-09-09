const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:7302/api';
const API_KEY = 'your-api-key-here'; // ใช้ API key ที่ตั้งค่าไว้

// Mock data structure
const customers = [
  { id: 'CUST001', name: 'FarmTech Solutions' },
  { id: 'CUST002', name: 'Green Valley Farms' },
  { id: 'CUST003', name: 'AquaCulture Ltd' },
  { id: 'CUST004', name: 'Smart Agriculture Co' },
  { id: 'CUST005', name: 'Precision Farming Inc' }
];

const farms = [
  { id: 'FARM001', name: 'North Farm', customerId: 'CUST001' },
  { id: 'FARM002', name: 'South Farm', customerId: 'CUST001' },
  { id: 'FARM003', name: 'East Farm', customerId: 'CUST001' },
  { id: 'FARM004', name: 'West Farm', customerId: 'CUST002' },
  { id: 'FARM005', name: 'Central Farm', customerId: 'CUST002' },
  { id: 'FARM006', name: 'Riverside Farm', customerId: 'CUST002' },
  { id: 'FARM007', name: 'Mountain Farm', customerId: 'CUST003' },
  { id: 'FARM008', name: 'Valley Farm', customerId: 'CUST003' },
  { id: 'FARM009', name: 'Coastal Farm', customerId: 'CUST003' },
  { id: 'FARM010', name: 'Urban Farm', customerId: 'CUST004' },
  { id: 'FARM011', name: 'Suburban Farm', customerId: 'CUST004' },
  { id: 'FARM012', name: 'Rural Farm', customerId: 'CUST004' },
  { id: 'FARM013', name: 'Highland Farm', customerId: 'CUST005' },
  { id: 'FARM014', name: 'Lowland Farm', customerId: 'CUST005' },
  { id: 'FARM015', name: 'Plateau Farm', customerId: 'CUST005' }
];

const houses = [
  { id: 'HOUSE001', name: 'House A', farmId: 'FARM001' },
  { id: 'HOUSE002', name: 'House B', farmId: 'FARM001' },
  { id: 'HOUSE003', name: 'House C', farmId: 'FARM001' },
  { id: 'HOUSE004', name: 'House A', farmId: 'FARM002' },
  { id: 'HOUSE005', name: 'House B', farmId: 'FARM002' },
  { id: 'HOUSE006', name: 'House C', farmId: 'FARM002' },
  { id: 'HOUSE007', name: 'House A', farmId: 'FARM003' },
  { id: 'HOUSE008', name: 'House B', farmId: 'FARM003' },
  { id: 'HOUSE009', name: 'House C', farmId: 'FARM003' },
  { id: 'HOUSE010', name: 'House A', farmId: 'FARM004' },
  { id: 'HOUSE011', name: 'House B', farmId: 'FARM004' },
  { id: 'HOUSE012', name: 'House C', farmId: 'FARM004' },
  { id: 'HOUSE013', name: 'House A', farmId: 'FARM005' },
  { id: 'HOUSE014', name: 'House B', farmId: 'FARM005' },
  { id: 'HOUSE015', name: 'House C', farmId: 'FARM005' },
  { id: 'HOUSE016', name: 'House A', farmId: 'FARM006' },
  { id: 'HOUSE017', name: 'House B', farmId: 'FARM006' },
  { id: 'HOUSE018', name: 'House C', farmId: 'FARM006' },
  { id: 'HOUSE019', name: 'House A', farmId: 'FARM007' },
  { id: 'HOUSE020', name: 'House B', farmId: 'FARM007' },
  { id: 'HOUSE021', name: 'House C', farmId: 'FARM007' },
  { id: 'HOUSE022', name: 'House A', farmId: 'FARM008' },
  { id: 'HOUSE023', name: 'House B', farmId: 'FARM008' },
  { id: 'HOUSE024', name: 'House C', farmId: 'FARM008' },
  { id: 'HOUSE025', name: 'House A', farmId: 'FARM009' },
  { id: 'HOUSE026', name: 'House B', farmId: 'FARM009' },
  { id: 'HOUSE027', name: 'House C', farmId: 'FARM009' },
  { id: 'HOUSE028', name: 'House A', farmId: 'FARM010' },
  { id: 'HOUSE029', name: 'House B', farmId: 'FARM010' },
  { id: 'HOUSE030', name: 'House C', farmId: 'FARM010' },
  { id: 'HOUSE031', name: 'House A', farmId: 'FARM011' },
  { id: 'HOUSE032', name: 'House B', farmId: 'FARM011' },
  { id: 'HOUSE033', name: 'House C', farmId: 'FARM011' },
  { id: 'HOUSE034', name: 'House A', farmId: 'FARM012' },
  { id: 'HOUSE035', name: 'House B', farmId: 'FARM012' },
  { id: 'HOUSE036', name: 'House C', farmId: 'FARM012' },
  { id: 'HOUSE037', name: 'House A', farmId: 'FARM013' },
  { id: 'HOUSE038', name: 'House B', farmId: 'FARM013' },
  { id: 'HOUSE039', name: 'House C', farmId: 'FARM013' },
  { id: 'HOUSE040', name: 'House A', farmId: 'FARM014' },
  { id: 'HOUSE041', name: 'House B', farmId: 'FARM014' },
  { id: 'HOUSE042', name: 'House C', farmId: 'FARM014' },
  { id: 'HOUSE043', name: 'House A', farmId: 'FARM015' },
  { id: 'HOUSE044', name: 'House B', farmId: 'FARM015' },
  { id: 'HOUSE045', name: 'House C', farmId: 'FARM015' }
];

// Sensor types
const sensorTypes = [
  'TEMPERATURE',
  'HUMIDITY', 
  'CO2',
  'NH3',
  'PH',
  'TDS',
  'EC',
  'WATER_TEMP',
  'WATER_VOLUME',
  'ILLUMINANCE',
  'PHOTOPERIOD',
  'VOCS'
];

// Device statuses
const deviceStatuses = ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'];

// Test types for lab readings
const testTypes = [
  'WATER_QUALITY',
  'SOIL_ANALYSIS',
  'NUTRIENT_LEVEL',
  'PH_TEST',
  'TDS_TEST',
  'EC_TEST',
  'TURBIDITY',
  'DISSOLVED_OXYGEN',
  'AMMONIA_LEVEL',
  'NITRATE_LEVEL',
  'PHOSPHATE_LEVEL'
];

// Sample types
const sampleTypes = [
  'WATER_SAMPLE',
  'SOIL_SAMPLE',
  'PLANT_SAMPLE',
  'FEED_SAMPLE',
  'WASTE_SAMPLE'
];

// Utility functions
function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTimestamp(baseDate, minutesOffset) {
  return new Date(baseDate.getTime() + minutesOffset * 60000);
}

function generateSensorValue(sensorType, timestamp) {
  const hour = timestamp.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  
  switch (sensorType) {
    case 'TEMPERATURE':
      return getRandomFloat(20, 35); // 20-35°C
    case 'HUMIDITY':
      return getRandomFloat(40, 90); // 40-90%
    case 'CO2':
      return getRandomFloat(300, 2000); // 300-2000 ppm
    case 'NH3':
      return getRandomFloat(0, 50); // 0-50 ppm
    case 'PH':
      return getRandomFloat(6.0, 8.5); // 6.0-8.5
    case 'TDS':
      return getRandomFloat(100, 2000); // 100-2000 ppm
    case 'EC':
      return getRandomFloat(0.1, 3.0); // 0.1-3.0 mS/cm
    case 'WATER_TEMP':
      return getRandomFloat(15, 30); // 15-30°C
    case 'WATER_VOLUME':
      return getRandomFloat(0, 1000); // 0-1000 L
    case 'ILLUMINANCE':
      return isDaytime ? getRandomFloat(1000, 10000) : getRandomFloat(0, 100); // lux
    case 'PHOTOPERIOD':
      return isDaytime ? getRandomFloat(8, 16) : 0; // hours
    case 'VOCS':
      return getRandomFloat(0, 100); // 0-100 ppb
    default:
      return getRandomFloat(0, 100);
  }
}

// Generate devices for each house
function generateDevices() {
  const devices = [];
  
  houses.forEach(house => {
    sensorTypes.forEach(sensorType => {
      devices.push({
        id: `DEVICE_${house.id}_${sensorType}`,
        deviceId: `DEVICE_${house.id}_${sensorType}`,
        customerId: customers.find(c => farms.find(f => f.id === house.farmId)?.customerId === c.id)?.id,
        farmId: house.farmId,
        houseId: house.id,
        sensorType: sensorType,
        status: getRandomElement(deviceStatuses),
        location: `House ${house.name}`,
        metadata: {
          model: `${sensorType}_Sensor_v2.1`,
          firmware: '1.2.3',
          calibrationDate: new Date().toISOString()
        }
      });
    });
  });
  
  return devices;
}

// Generate sensor readings
function generateSensorReadings(devices, startDate, days = 3) {
  const readings = [];
  const readingsPerDay = 144; // 10 minutes interval = 144 readings per day
  const totalReadings = readingsPerDay * days;
  
  devices.forEach(device => {
    for (let i = 0; i < totalReadings; i++) {
      const timestamp = generateTimestamp(startDate, i * 10);
      const value = generateSensorValue(device.sensorType, timestamp);
      
      readings.push({
        deviceId: device.deviceId,
        customerId: device.customerId,
        farmId: device.farmId,
        houseId: device.houseId,
        sensorType: device.sensorType,
        value: value,
        unit: getUnit(device.sensorType),
        timestamp: timestamp.toISOString(),
        metadata: {
          quality: getRandomFloat(0.8, 1.0),
          batteryLevel: getRandomFloat(20, 100),
          signalStrength: getRandomFloat(-80, -30)
        }
      });
    }
  });
  
  return readings;
}

// Generate lab readings
function generateLabReadings(devices, startDate, days = 3) {
  const readings = [];
  const readingsPerDay = 6; // 4 hours interval
  const totalReadings = readingsPerDay * days;
  
  devices.forEach(device => {
    for (let i = 0; i < totalReadings; i++) {
      const timestamp = generateTimestamp(startDate, i * 240); // 4 hours = 240 minutes
      const testType = getRandomElement(testTypes);
      const sampleType = getRandomElement(sampleTypes);
      
      readings.push({
        deviceId: device.deviceId,
        customerId: device.customerId,
        farmId: device.farmId,
        houseId: device.houseId,
        testType: testType,
        sampleType: sampleType,
        value: getRandomFloat(0, 100),
        unit: 'mg/L',
        timestamp: timestamp.toISOString(),
        status: getRandomElement(['PENDING', 'COMPLETED', 'FAILED']),
        metadata: {
          labTechnician: `Tech_${getRandomInt(1, 10)}`,
          sampleId: `SAMPLE_${Date.now()}_${i}`,
          notes: `Sample collected from ${device.location}`
        }
      });
    }
  });
  
  return readings;
}

// Generate sweep readings
function generateSweepReadings(devices, startDate, days = 3) {
  const readings = [];
  const readingsPerDay = 24; // 1 hour interval
  const totalReadings = readingsPerDay * days;
  
  devices.forEach(device => {
    for (let i = 0; i < totalReadings; i++) {
      const timestamp = generateTimestamp(startDate, i * 60); // 1 hour = 60 minutes
      const sweepId = `SWEEP_${device.houseId}_${Math.floor(i / 24)}_${i % 24}`;
      
      readings.push({
        deviceId: device.deviceId,
        customerId: device.customerId,
        farmId: device.farmId,
        houseId: device.houseId,
        sweepId: sweepId,
        sensorType: device.sensorType,
        value: generateSensorValue(device.sensorType, timestamp),
        unit: getUnit(device.sensorType),
        timestamp: timestamp.toISOString(),
        metadata: {
          sweepDuration: getRandomInt(5, 15), // minutes
          sweepPattern: getRandomElement(['GRID', 'RANDOM', 'SPIRAL']),
          operator: `OP_${getRandomInt(1, 5)}`
        }
      });
    }
  });
  
  return readings;
}

// Generate device health records
function generateDeviceHealth(devices, startDate, days = 3) {
  const healthRecords = [];
  const readingsPerDay = 24; // 1 hour interval
  const totalReadings = readingsPerDay * days;
  
  devices.forEach(device => {
    for (let i = 0; i < totalReadings; i++) {
      const timestamp = generateTimestamp(startDate, i * 60);
      const status = getRandomElement(deviceStatuses);
      
      healthRecords.push({
        deviceId: device.deviceId,
        customerId: device.customerId,
        farmId: device.farmId,
        houseId: device.houseId,
        status: status,
        batteryLevel: getRandomFloat(0, 100),
        signalStrength: getRandomFloat(-100, -30),
        temperature: getRandomFloat(15, 45),
        humidity: getRandomFloat(20, 90),
        timestamp: timestamp.toISOString(),
        errors: status === 'ERROR' ? [`Error_${getRandomInt(1, 10)}`] : [],
        metadata: {
          uptime: getRandomInt(0, 100), // percentage
          lastMaintenance: new Date(timestamp.getTime() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
          firmwareVersion: '1.2.3'
        }
      });
    }
  });
  
  return healthRecords;
}

// Generate data ingestion logs
function generateDataIngestionLogs(devices, startDate, days = 3) {
  const logs = [];
  const readingsPerDay = 144; // 10 minutes interval
  const totalReadings = readingsPerDay * days;
  
  devices.forEach(device => {
    for (let i = 0; i < totalReadings; i++) {
      const timestamp = generateTimestamp(startDate, i * 10);
      const status = getRandomElement(['SUCCESS', 'FAILED', 'PARTIAL']);
      
      logs.push({
        source: `sensor_${device.deviceId}`,
        dataType: 'SENSOR_READING',
        recordCount: getRandomInt(1, 10),
        status: status,
        timestamp: timestamp.toISOString(),
        metadata: {
          processingTime: getRandomFloat(0.1, 2.0), // seconds
          errors: status === 'FAILED' ? [`Processing_Error_${getRandomInt(1, 5)}`] : [],
          batchId: `BATCH_${Math.floor(i / 10)}`
        }
      });
    }
  });
  
  return logs;
}

function getUnit(sensorType) {
  const units = {
    'TEMPERATURE': '°C',
    'HUMIDITY': '%',
    'CO2': 'ppm',
    'NH3': 'ppm',
    'PH': 'pH',
    'TDS': 'ppm',
    'EC': 'mS/cm',
    'WATER_TEMP': '°C',
    'WATER_VOLUME': 'L',
    'ILLUMINANCE': 'lux',
    'PHOTOPERIOD': 'hours',
    'VOCS': 'ppb'
  };
  return units[sensorType] || 'unit';
}

// API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Send data to API
async function sendData(endpoint, data, batchSize = 100) {
  try {
    console.log(`📤 Sending ${data.length} records to ${endpoint}...`);
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const response = await apiClient.post(endpoint, { data: batch });
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} sent successfully`);
    }
    
    console.log(`🎉 All data sent to ${endpoint} successfully!`);
  } catch (error) {
    console.error(`❌ Error sending data to ${endpoint}:`, error.response?.data || error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting mock data generation...');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 3); // 3 days ago
  
  console.log('📊 Generating devices...');
  const devices = generateDevices();
  console.log(`✅ Generated ${devices.length} devices`);
  
  console.log('📈 Generating sensor readings...');
  const sensorReadings = generateSensorReadings(devices, startDate);
  console.log(`✅ Generated ${sensorReadings.length} sensor readings`);
  
  console.log('🧪 Generating lab readings...');
  const labReadings = generateLabReadings(devices, startDate);
  console.log(`✅ Generated ${labReadings.length} lab readings`);
  
  console.log('🔄 Generating sweep readings...');
  const sweepReadings = generateSweepReadings(devices, startDate);
  console.log(`✅ Generated ${sweepReadings.length} sweep readings`);
  
  console.log('💚 Generating device health records...');
  const deviceHealth = generateDeviceHealth(devices, startDate);
  console.log(`✅ Generated ${deviceHealth.length} device health records`);
  
  console.log('📝 Generating data ingestion logs...');
  const dataLogs = generateDataIngestionLogs(devices, startDate);
  console.log(`✅ Generated ${dataLogs.length} data ingestion logs`);
  
  // Send data to API
  console.log('\n🌐 Sending data to API...');
  
  await sendData('/sensors/batch', sensorReadings);
  await sendData('/lab-readings/batch', labReadings);
  await sendData('/sweep-readings/batch', sweepReadings);
  await sendData('/device-health/batch', deviceHealth);
  await sendData('/data-ingestion-logs/batch', dataLogs);
  
  console.log('\n🎉 Mock data generation completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Farms: ${farms.length}`);
  console.log(`   - Houses: ${houses.length}`);
  console.log(`   - Devices: ${devices.length}`);
  console.log(`   - Sensor Readings: ${sensorReadings.length}`);
  console.log(`   - Lab Readings: ${labReadings.length}`);
  console.log(`   - Sweep Readings: ${sweepReadings.length}`);
  console.log(`   - Device Health: ${deviceHealth.length}`);
  console.log(`   - Data Logs: ${dataLogs.length}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateDevices,
  generateSensorReadings,
  generateLabReadings,
  generateSweepReadings,
  generateDeviceHealth,
  generateDataIngestionLogs
};
