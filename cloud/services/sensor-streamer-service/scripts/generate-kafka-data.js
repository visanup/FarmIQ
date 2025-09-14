#!/usr/bin/env node

/**
 * Generate mock data and send to Kafka via API endpoints
 * This script uses the actual API endpoints which will send data to Kafka
 */

const axios = require('axios');
const { faker } = require('@faker-js/faker');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'test-api-key';

// Test configuration (reduced for testing)
const CUSTOMERS = 1;
const FARMS_PER_CUSTOMER = 1;
const HOUSES_PER_FARM = 1;
const DAYS = 7;
const SENSOR_TYPES = [
  { type: 'temperature', unit: '°C', min: 15, max: 35, variance: 2 },
  { type: 'humidity', unit: '%', min: 40, max: 80, variance: 5 },
  { type: 'CO2', unit: 'ppm', min: 300, max: 2000, variance: 50 },
  { type: 'pH', unit: 'pH', min: 6.0, max: 8.5, variance: 0.3 },
  { type: 'water_temp', unit: '°C', min: 18, max: 28, variance: 1 }
];

let globalTimestampCounter = 0;

function generateTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
}

function generateSensorValue(sensorConfig) {
  const base = faker.number.float({ 
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

async function postSensorReading(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sensor-readings`, data, {
      headers: { 'x-api-key': API_KEY },
      timeout: 5000
    });
    
    console.log('⏳ Waiting 1 second before next sensor record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('Unique constraint failed')) {
      console.warn('⚠️ Duplicate reading skipped:', data.sensorType, data.deviceId);
      return null;
    }
    console.error('Error posting sensor reading:', error.response?.data || error.message);
    return null;
  }
}

async function postLabReading(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/lab-readings`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    
    console.log('⏳ Waiting 1 second before next lab record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    
    console.log('⏳ Waiting 1 second before next sweep record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    
    console.log('⏳ Waiting 1 second before next device health record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    console.error('Error posting device health:', error.response?.data || error.message);
    return null;
  }
}

async function generateCustomerFarmStructure() {
  const structure = [];
  
  for (let customerId = 1; customerId <= CUSTOMERS; customerId++) {
    const customer = {
      id: `customer_${customerId}`,
      name: `Customer ${customerId}`,
      farms: []
    };
    
    for (let farmId = 1; farmId <= FARMS_PER_CUSTOMER; farmId++) {
      const farm = {
        id: `farm_${customerId}_${farmId}`,
        name: `Farm ${customerId}-${farmId}`,
        houses: []
      };
      
      for (let houseId = 1; houseId <= HOUSES_PER_FARM; houseId++) {
        const house = {
          id: `house_${customerId}_${farmId}_${houseId}`,
          name: `House ${customerId}-${farmId}-${houseId}`,
          deviceId: `device_${customerId}_${farmId}_${houseId}`
        };
        
        farm.houses.push(house);
      }
      
      customer.farms.push(farm);
    }
    
    structure.push(customer);
  }
  
  return structure;
}

async function generateSensorData() {
  console.log('🔄 Generating sensor data...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate sensor readings for each day
        for (let day = 0; day < DAYS; day++) {
          // Generate readings every hour (24 readings per day)
          for (let hour = 0; hour < 24; hour++) {
            for (const sensorType of SENSOR_TYPES) {
              const timestamp = generateTimestamp();
              const value = generateSensorValue(sensorType);
              
              const sensorReading = {
                deviceId: house.deviceId,
                sensorType: sensorType.type,
                timestamp: timestamp,
                value: value,
                unit: sensorType.unit,
                location: {
                  x: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                  y: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                  z: faker.number.float({ min: 0, max: 10, fractionDigits: 2 })
                },
                metadata: {
                  day: day,
                  hour: hour,
                  generatedAt: new Date().toISOString()
                }
              };
              
              const result = await postSensorReading(sensorReading);
              if (result) {
                totalRecords++;
              }
            }
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} sensor readings`);
  return totalRecords;
}

async function generateLabData() {
  console.log('🔄 Generating lab data...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      // Generate 1-2 lab readings per day per farm
      for (let day = 0; day < DAYS; day++) {
        const readingsPerDay = faker.number.int({ min: 1, max: 2 });
        
        for (let reading = 0; reading < readingsPerDay; reading++) {
          const timestamp = generateTimestamp();
          const testTypes = ['pH', 'TDS', 'EC', 'NH3', 'DO'];
          const testType = faker.helpers.arrayElement(testTypes);
          
          const labReading = {
            sampleId: `lab_${customer.id}_${farm.id}_${day}_${reading}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            farmId: farm.id,
            testType: testType,
            value: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
            unit: testType === 'pH' ? 'pH' : 'ppm',
            result: faker.helpers.arrayElement(['PASS', 'FAIL', 'PENDING']),
            metadata: {
              customerId: customer.id,
              day: day,
              reading: reading,
              generatedAt: new Date().toISOString()
            },
            timestamp: timestamp
          };
          
          const result = await postLabReading(labReading);
          if (result) {
            totalRecords++;
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} lab readings`);
  return totalRecords;
}

async function generateSweepData() {
  console.log('🔄 Generating sweep data...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate 1 sweep reading per day per house
        for (let day = 0; day < DAYS; day++) {
          const timestamp = generateTimestamp();
          
          const sweepReading = {
            deviceId: house.deviceId,
            farmId: farm.id,
            sweepId: `sweep_${customer.id}_${farm.id}_${house.id}_${day}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            data: {
              zones: faker.number.int({ min: 1, max: 5 }),
              animalsDetected: faker.number.int({ min: 0, max: 50 }),
              averageWeight: faker.number.float({ min: 0.5, max: 4.0, fractionDigits: 2 }),
              temperature: faker.number.float({ min: 15, max: 35, fractionDigits: 1 }),
              humidity: faker.number.float({ min: 40, max: 80, fractionDigits: 1 }),
              co2: faker.number.float({ min: 300, max: 2000, fractionDigits: 0 }),
              sweepDuration: faker.number.int({ min: 30, max: 300 }),
              success: faker.datatype.boolean()
            },
            metadata: {
              customerId: customer.id,
              houseId: house.id,
              day: day,
              generatedAt: new Date().toISOString()
            },
            timestamp: timestamp
          };
          
          const result = await postSweepReading(sweepReading);
          if (result) {
            totalRecords++;
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} sweep readings`);
  return totalRecords;
}

async function generateDeviceHealthData() {
  console.log('🔄 Generating device health data...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate 1 health record per day per device
        for (let day = 0; day < DAYS; day++) {
          const timestamp = generateTimestamp();
          
          const deviceHealth = {
            deviceId: house.deviceId,
            status: faker.helpers.arrayElement(['ONLINE', 'OFFLINE', 'MAINTENANCE']),
            lastSeen: timestamp,
            batteryLevel: faker.number.int({ min: 0, max: 100 }),
            signalStrength: faker.number.int({ min: -100, max: 0 }),
            temperature: faker.number.float({ min: -10, max: 60, fractionDigits: 1 }),
            metadata: {
              customerId: customer.id,
              farmId: farm.id,
              houseId: house.id,
              day: day,
              generatedAt: new Date().toISOString()
            }
          };
          
          const result = await postDeviceHealth(deviceHealth);
          if (result) {
            totalRecords++;
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} device health records`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Kafka Data Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Sensors: ${SENSOR_TYPES.length} types per house, ${DAYS} days, every hour`);
  console.log(`📊 Lab: 1-2 readings per farm per day`);
  console.log(`📊 Sweep: 1 reading per house per day`);
  console.log(`📊 Device Health: 1 reading per device per day`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Generate all types of data
    const sensorCount = await generateSensorData();
    const labCount = await generateLabData();
    const sweepCount = await generateSweepData();
    const healthCount = await generateDeviceHealthData();
    
    const totalRecords = sensorCount + labCount + sweepCount + healthCount;
    
    console.log('\n🎉 Kafka Data Generation Complete!');
    console.log(`📊 Total records generated: ${totalRecords}`);
    console.log(`   - Sensor readings: ${sensorCount}`);
    console.log(`   - Lab readings: ${labCount}`);
    console.log(`   - Sweep readings: ${sweepCount}`);
    console.log(`   - Device health: ${healthCount}`);
    console.log('\n✅ All data has been sent to Kafka topics via API endpoints!');
    
  } catch (error) {
    console.error('❌ Error during data generation:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
