const axios = require('axios');
const { faker } = require('@faker-js/faker');

// Configuration - Reduced for faster generation
const API_BASE_URL = 'http://localhost:7302';
const API_KEY = 'admin-key';

const CUSTOMERS = 2; // Reduced from 5
const FARMS_PER_CUSTOMER = 2; // Reduced from 3
const HOUSES_PER_FARM = 2; // Reduced from 3
const SENSORS_PER_HOUSE = 12;
const DAYS = 1; // Reduced from 3
const INTERVAL_MINUTES = 30; // Increased from 10 minutes

// Sensor types and their configurations
const SENSOR_TYPES = [
  { type: 'temperature', unit: '°C', min: 15, max: 35, variance: 2 },
  { type: 'humidity', unit: '%', min: 40, max: 80, variance: 5 },
  { type: 'CO2', unit: 'ppm', min: 300, max: 2000, variance: 50 },
  { type: 'NH3', unit: 'ppm', min: 0, max: 50, variance: 2 },
  { type: 'pH', unit: 'pH', min: 6.0, max: 8.5, variance: 0.3 },
  { type: 'TDS', unit: 'ppm', min: 100, max: 2000, variance: 50 },
  { type: 'EC', unit: 'mS/cm', min: 0.5, max: 3.0, variance: 0.1 },
  { type: 'water_temp', unit: '°C', min: 18, max: 28, variance: 1 },
  { type: 'water_volume', unit: 'L', min: 0, max: 1000, variance: 20 },
  { type: 'illuminance', unit: 'lux', min: 0, max: 10000, variance: 200 },
  { type: 'photoperiod', unit: 'hours', min: 0, max: 24, variance: 0.5 },
  { type: 'VOCs', unit: 'ppb', min: 0, max: 500, variance: 10 }
];

// Lab test types
const LAB_TEST_TYPES = [
  { type: 'water_quality', unit: 'score', min: 0, max: 100 },
  { type: 'feed_analysis', unit: 'mg/kg', min: 0, max: 1000 },
  { type: 'pathogen_test', unit: 'CFU/g', min: 0, max: 10000 },
  { type: 'nutrient_analysis', unit: 'mg/L', min: 0, max: 500 },
  { type: 'pH_test', unit: 'pH', min: 6.0, max: 8.5 },
  { type: 'dissolved_oxygen', unit: 'mg/L', min: 0, max: 15 }
];

// Helper functions
function generateId(prefix) {
  return `${prefix}_${faker.string.alphanumeric(8)}`;
}

function generateLocation() {
  return {
    x: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    y: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    z: faker.number.float({ min: 0, max: 10, fractionDigits: 2 })
  };
}

function generateSensorValue(sensorConfig, baseValue = null) {
  const base = baseValue || faker.number.float({ 
    min: sensorConfig.min, 
    max: sensorConfig.max, 
    fractionDigits: 2 
  });
  
  const variance = faker.number.float({ 
    min: -sensorConfig.variance, 
    max: sensorConfig.variance, 
    fractionDigits: 2 
  });
  
  const value = base + variance;
  return Math.max(sensorConfig.min, Math.min(sensorConfig.max, value));
}

function generateTimestamp(startDate, minutesOffset) {
  const date = new Date(startDate);
  date.setMinutes(date.getMinutes() + minutesOffset);
  return date.toISOString();
}

// API call functions
async function postSensorReading(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sensor-readings`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting sensor reading:', error.response?.data || error.message);
    return null;
  }
}

async function postLabReading(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/lab-readings`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting lab reading:', error.response?.data || error.message);
    return null;
  }
}

async function postSweepReading(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sweep-readings`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting sweep reading:', error.response?.data || error.message);
    return null;
  }
}

async function postDeviceHealth(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/device-health`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting device health:', error.response?.data || error.message);
    return null;
  }
}

async function postDataIngestionLog(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/data-ingestion-logs`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting data ingestion log:', error.response?.data || error.message);
    return null;
  }
}

// Main data generation functions
async function generateCustomerFarmStructure() {
  const structure = [];
  
  for (let customerId = 1; customerId <= CUSTOMERS; customerId++) {
    const customer = {
      id: `customer_${customerId}`,
      name: faker.company.name(),
      farms: []
    };
    
    for (let farmId = 1; farmId <= FARMS_PER_CUSTOMER; farmId++) {
      const farm = {
        id: `farm_${customerId}_${farmId}`,
        name: `${customer.name} Farm ${farmId}`,
        houses: []
      };
      
      for (let houseId = 1; houseId <= HOUSES_PER_FARM; houseId++) {
        const house = {
          id: `house_${customerId}_${farmId}_${houseId}`,
          name: `House ${houseId}`,
          deviceId: `device_${customerId}_${farmId}_${houseId}`,
          sensors: SENSOR_TYPES.map(sensor => ({
            type: sensor.type,
            unit: sensor.unit,
            baseValue: faker.number.float({ 
              min: sensor.min, 
              max: sensor.max, 
              fractionDigits: 2 
            })
          }))
        };
        
        farm.houses.push(house);
      }
      
      customer.farms.push(farm);
    }
    
    structure.push(customer);
  }
  
  return structure;
}

async function generateSensorData(structure, startDate) {
  console.log('🔄 Generating sensor data...');
  
  const totalIntervals = (DAYS * 24 * 60) / INTERVAL_MINUTES;
  let totalReadings = 0;
  
  for (let interval = 0; interval < totalIntervals; interval++) {
    const timestamp = generateTimestamp(startDate, interval * INTERVAL_MINUTES);
    
    for (const customer of structure) {
      for (const farm of customer.farms) {
        for (const house of farm.houses) {
          for (const sensor of house.sensors) {
            const sensorConfig = SENSOR_TYPES.find(s => s.type === sensor.type);
            const value = generateSensorValue(sensorConfig, sensor.baseValue);
            
            const reading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              houseId: house.id,
              sensorType: sensor.type,
              value: value,
              unit: sensor.unit,
              location: generateLocation(),
              metadata: {
                customerId: customer.id,
                farmName: farm.name,
                houseName: house.name,
                sensorModel: faker.helpers.arrayElement(['SensorPro-100', 'AgriSense-200', 'FarmTech-300']),
                firmwareVersion: faker.system.semver()
              },
              timestamp: timestamp
            };
            
            await postSensorReading(reading);
            totalReadings++;
            
            // Update base value slightly for next reading
            sensor.baseValue = generateSensorValue(sensorConfig, sensor.baseValue);
          }
        }
      }
    }
    
    console.log(`📊 Generated ${totalReadings} sensor readings (${Math.round((interval / totalIntervals) * 100)}%)`);
  }
  
  console.log(`✅ Generated ${totalReadings} sensor readings total`);
  return totalReadings;
}

async function generateLabData(structure, startDate) {
  console.log('🔄 Generating lab data...');
  
  let totalLabReadings = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      // Generate 1-2 lab readings per farm per day
      const readingsPerDay = faker.number.int({ min: 1, max: 2 });
      
      for (let day = 0; day < DAYS; day++) {
        for (let reading = 0; reading < readingsPerDay; reading++) {
          const testType = faker.helpers.arrayElement(LAB_TEST_TYPES);
          const timestamp = generateTimestamp(startDate, (day * 24 * 60) + (reading * 60 * 2));
          
          const labReading = {
            sampleId: `sample_${customer.id}_${farm.id}_${day}_${reading}`,
            farmId: farm.id,
            testType: testType.type,
            value: faker.number.float({ 
              min: testType.min, 
              max: testType.max, 
              fractionDigits: 2 
            }),
            unit: testType.unit,
            result: faker.helpers.arrayElement(['PASS', 'FAIL', 'PENDING']),
            metadata: {
              customerId: customer.id,
              farmName: farm.name,
              sampleType: faker.helpers.arrayElement(['water', 'feed', 'soil', 'tissue']),
              labTechnician: faker.person.fullName(),
              testMethod: faker.helpers.arrayElement(['Standard', 'Rapid', 'PCR', 'ELISA'])
            },
            timestamp: timestamp
          };
          
          await postLabReading(labReading);
          totalLabReadings++;
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalLabReadings} lab readings`);
  return totalLabReadings;
}

async function generateSweepData(structure, startDate) {
  console.log('🔄 Generating sweep data...');
  
  let totalSweepReadings = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate 1 sweep reading per house per day
        const sweepsPerDay = 1;
        
        for (let day = 0; day < DAYS; day++) {
          for (let sweep = 0; sweep < sweepsPerDay; sweep++) {
            const timestamp = generateTimestamp(startDate, (day * 24 * 60) + (sweep * 60 * 8));
            
            const sweepReading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              sweepId: `sweep_${customer.id}_${farm.id}_${house.id}_${day}_${sweep}`,
              data: {
                sweepType: faker.helpers.arrayElement(['environmental', 'feed_quality', 'water_quality', 'health_check']),
                duration: faker.number.int({ min: 300, max: 1800 }), // 5-30 minutes
                readings: faker.number.int({ min: 50, max: 200 }),
                anomalies: faker.number.int({ min: 0, max: 5 }),
                qualityScore: faker.number.float({ min: 0, max: 100, fractionDigits: 1 })
              },
              metadata: {
                customerId: customer.id,
                farmName: farm.name,
                houseName: house.name,
                operator: faker.person.fullName(),
                equipment: faker.helpers.arrayElement(['SweepBot-100', 'AgriScan-200', 'FarmCheck-300']),
                notes: faker.lorem.sentence()
              },
              timestamp: timestamp
            };
            
            await postSweepReading(sweepReading);
            totalSweepReadings++;
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalSweepReadings} sweep readings`);
  return totalSweepReadings;
}

async function generateDeviceHealthData(structure) {
  console.log('🔄 Generating device health data...');
  
  let totalDeviceHealth = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        const status = faker.helpers.arrayElement(['ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE']);
        const lastSeen = faker.date.recent({ days: 1 });
        
        const deviceHealth = {
          deviceId: house.deviceId,
          status: status,
          lastSeen: lastSeen.toISOString(),
          batteryLevel: faker.number.int({ min: 20, max: 100 }),
          signalStrength: faker.number.int({ min: -100, max: -30 }),
          temperature: faker.number.float({ min: 15, max: 45, fractionDigits: 1 }),
          errors: status === 'ERROR' ? [faker.helpers.arrayElement(['SENSOR_FAILURE', 'COMM_ERROR', 'BATTERY_LOW'])] : [],
          warnings: faker.helpers.arrayElements(['MAINTENANCE_DUE', 'SIGNAL_WEAK', 'TEMPERATURE_HIGH'], { min: 0, max: 2 })
        };
        
        await postDeviceHealth(deviceHealth);
        totalDeviceHealth++;
      }
    }
  }
  
  console.log(`✅ Generated ${totalDeviceHealth} device health records`);
  return totalDeviceHealth;
}

async function generateDataIngestionLogs(sensorCount, labCount, sweepCount) {
  console.log('🔄 Generating data ingestion logs...');
  
  const sources = ['edge', 'api', 'mqtt', 'batch_import'];
  const dataTypes = ['sensor', 'lab', 'sweep', 'device_health'];
  const statuses = ['success', 'error', 'partial'];
  
  let totalLogs = 0;
  
  // Generate logs for sensor data
  const sensorLog = {
    source: faker.helpers.arrayElement(sources),
    dataType: 'sensor',
    recordCount: sensorCount,
    status: faker.helpers.arrayElement(statuses),
    errorMessage: faker.helpers.arrayElement(statuses) === 'error' ? faker.lorem.sentence() : undefined,
    metadata: {
      batchId: 'sensor_batch_1',
      processingTime: faker.number.int({ min: 100, max: 5000 }),
      memoryUsage: faker.number.int({ min: 50, max: 500 })
    },
    timestamp: new Date().toISOString()
  };
  
  await postDataIngestionLog(sensorLog);
  totalLogs++;
  
  // Generate logs for lab data
  const labLog = {
    source: faker.helpers.arrayElement(sources),
    dataType: 'lab',
    recordCount: labCount,
    status: faker.helpers.arrayElement(statuses),
    errorMessage: faker.helpers.arrayElement(statuses) === 'error' ? faker.lorem.sentence() : undefined,
    metadata: {
      batchId: 'lab_batch_1',
      processingTime: faker.number.int({ min: 200, max: 3000 }),
      memoryUsage: faker.number.int({ min: 30, max: 200 })
    },
    timestamp: new Date().toISOString()
  };
  
  await postDataIngestionLog(labLog);
  totalLogs++;
  
  // Generate logs for sweep data
  const sweepLog = {
    source: faker.helpers.arrayElement(sources),
    dataType: 'sweep',
    recordCount: sweepCount,
    status: faker.helpers.arrayElement(statuses),
    errorMessage: faker.helpers.arrayElement(statuses) === 'error' ? faker.lorem.sentence() : undefined,
    metadata: {
      batchId: 'sweep_batch_1',
      processingTime: faker.number.int({ min: 150, max: 2000 }),
      memoryUsage: faker.number.int({ min: 40, max: 150 })
    },
    timestamp: new Date().toISOString()
  };
  
  await postDataIngestionLog(sweepLog);
  totalLogs++;
  
  console.log(`✅ Generated ${totalLogs} data ingestion logs`);
  return totalLogs;
}

// Main execution function
async function main() {
  console.log('🚀 Starting quick mock data generation...');
  console.log(`📊 Structure: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms each, ${HOUSES_PER_FARM} houses each`);
  console.log(`📊 Sensors: ${SENSORS_PER_HOUSE} sensors per house, ${DAYS} days, every ${INTERVAL_MINUTES} minutes`);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS); // Start 1 day ago
  
  try {
    // Generate structure
    const structure = await generateCustomerFarmStructure();
    console.log(`✅ Generated structure: ${structure.length} customers`);
    
    // Generate all data types
    const sensorCount = await generateSensorData(structure, startDate);
    const labCount = await generateLabData(structure, startDate);
    const sweepCount = await generateSweepData(structure, startDate);
    const deviceHealthCount = await generateDeviceHealthData(structure);
    const logCount = await generateDataIngestionLogs(sensorCount, labCount, sweepCount);
    
    console.log('\n🎉 Mock data generation completed!');
    console.log('📊 Summary:');
    console.log(`  - Sensor readings: ${sensorCount}`);
    console.log(`  - Lab readings: ${labCount}`);
    console.log(`  - Sweep readings: ${sweepCount}`);
    console.log(`  - Device health: ${deviceHealthCount}`);
    console.log(`  - Data ingestion logs: ${logCount}`);
    console.log(`  - Total records: ${sensorCount + labCount + sweepCount + deviceHealthCount + logCount}`);
    
  } catch (error) {
    console.error('❌ Error generating mock data:', error);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateCustomerFarmStructure,
  generateSensorData,
  generateLabData,
  generateSweepData,
  generateDeviceHealthData,
  generateDataIngestionLogs
};
