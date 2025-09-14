#!/usr/bin/env node

/**
 * Generate Device Health Data
 * 
 * This script generates device health data for all devices
 */

const axios = require('axios');
const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');

const API_BASE_URL = 'http://localhost:7302';
const API_KEY = 'admin-key';
const prisma = new PrismaClient();

// Configuration
const CUSTOMERS = 2;
const FARMS_PER_CUSTOMER = 2;
const HOUSES_PER_FARM = 2;

let globalTimestampCounter = 0;

function generateHealthTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
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

async function generateDeviceHealthData() {
  console.log('🔄 Generating device health data...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        const status = faker.helpers.arrayElement(['ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE']);
        const lastSeen = generateHealthTimestamp();
        
        const deviceHealth = {
          deviceId: house.deviceId,
          status: status,
          lastSeen: lastSeen,
          batteryLevel: faker.number.int({ min: 20, max: 100 }),
          signalStrength: faker.number.int({ min: -100, max: -30 }),
          temperature: faker.number.float({ min: 15, max: 45, fractionDigits: 1 }),
          errors: status === 'ERROR' ? [faker.helpers.arrayElement(['SENSOR_FAILURE', 'COMM_ERROR', 'BATTERY_LOW'])] : [],
          warnings: faker.helpers.arrayElements(['MAINTENANCE_DUE', 'SIGNAL_WEAK', 'TEMPERATURE_HIGH'], { min: 0, max: 2 })
        };
        
        const result = await postDeviceHealth(deviceHealth);
        if (result) {
          totalRecords++;
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} device health records`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Device Health Data Generation...');
  
  try {
    // Clear existing device health data
    console.log('🧹 Clearing existing device health data...');
    await prisma.deviceHealth.deleteMany();
    console.log('✅ Device health data cleared');
    
    // Generate device health data
    const totalRecords = await generateDeviceHealthData();
    
    console.log(`\n🎉 Device Health Data Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating device health data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateDeviceHealthData };
