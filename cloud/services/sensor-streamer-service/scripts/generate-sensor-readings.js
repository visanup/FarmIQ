#!/usr/bin/env node

/**
 * Generate Sensor Readings Data
 * 
 * This script generates sensor readings data for all devices
 */

const axios = require('axios');
const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');

const API_BASE_URL = 'http://localhost:7302';
const API_KEY = 'admin-key';
const prisma = new PrismaClient();

// Configuration - Reduced for testing
const CUSTOMERS = Number(process.env.CUSTOMERS || 1);
const FARMS_PER_CUSTOMER = Number(process.env.FARMS_PER_CUSTOMER || 1);
const HOUSES_PER_FARM = Number(process.env.HOUSES_PER_FARM || 1);
const SENSORS_PER_HOUSE = Number(process.env.SENSORS_PER_HOUSE || 5);
// Defaults tuned for frequent local testing
const DAYS = Number(process.env.DAYS || 1);
const INTERVAL_MINUTES = Number(process.env.INTERVAL_MINUTES || 15);

let globalTimestampCounter = 0;

// Sensor types and their configurations - Reduced for testing
const SENSOR_TYPES = [
  { type: 'temperature', unit: '°C', min: 30, max: 40, variance: 2 },
  { type: 'humidity', unit: '%', min: 40, max: 80, variance: 5 },
  { type: 'CO2', unit: 'ppm', min: 300, max: 2000, variance: 50 },
  { type: 'pH', unit: 'pH', min: 6.0, max: 8.5, variance: 0.3 },
  { type: 'water_temp', unit: '°C', min: 18, max: 28, variance: 1 }
];

function generateSensorTimestamp() {
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
    
    const sleepMs = Number(process.env.SLEEP_MS || 0);
    if (sleepMs > 0) {
      console.log('Throttling next sensor record... ' + sleepMs + ' ms');
      await new Promise(resolve => setTimeout(resolve, sleepMs));
    }
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

async function generateSensorReadingsData() {
  console.log('🔄 Generating sensor readings data...');
  
  const structure = await generateCustomerFarmStructure();
  const totalIntervals = (DAYS * 24 * 60) / INTERVAL_MINUTES; // 1440 intervals for 60 days
  let totalRecords = 0;
  
  console.log(`📊 Total intervals to process: ${totalIntervals}`);
  
  for (let interval = 0; interval < totalIntervals; interval++) {
    const timestamp = generateSensorTimestamp();
    
    // Progress indicator
    if (interval % Math.floor(totalIntervals / 20) === 0) {
      const progress = Math.floor((interval / totalIntervals) * 100);
      console.log(`📈 Progress: ${progress}% (${interval}/${totalIntervals} intervals)`);
    }
    
    for (const customer of structure) {
      for (const farm of customer.farms) {
        for (const house of farm.houses) {
          for (const sensorType of SENSOR_TYPES) {
            const sensorReading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              houseId: house.id,
              sensorType: sensorType.type,
              timestamp: timestamp,
              value: generateSensorValue(sensorType),
              unit: sensorType.unit,
              location: {
                x: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                y: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                z: faker.number.float({ min: 0, max: 10, fractionDigits: 2 })
              },
              metadata: {
                customerId: customer.id,
                interval: interval,
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
  
  console.log(`✅ Generated ${totalRecords} sensor readings`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Sensor Readings Data Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Sensors: ${SENSOR_TYPES.length} types per house, ${DAYS} days, every ${INTERVAL_MINUTES} minutes`);
  
  try {
    // Clear existing sensor readings data
    console.log('🧹 Clearing existing sensor readings data...');
    await prisma.deviceReading.deleteMany();
    console.log('✅ Sensor readings data cleared');
    
    // Generate sensor readings data
    const totalRecords = await generateSensorReadingsData();
    
    console.log(`\n🎉 Sensor Readings Data Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating sensor readings data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateSensorReadingsData };
