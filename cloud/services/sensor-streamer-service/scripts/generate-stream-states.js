#!/usr/bin/env node

/**
 * Generate Stream States
 * 
 * This script generates stream states for all devices
 */

const axios = require('axios');
const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');

const API_BASE_URL = 'http://localhost:7302';
const API_KEY = 'admin-key';
const prisma = new PrismaClient();

// Configuration - Reduced for testing
const CUSTOMERS = 1;
const FARMS_PER_CUSTOMER = 1;
const HOUSES_PER_FARM = 1;

let globalTimestampCounter = 0;

// Stream types
const STREAM_TYPES = ['SENSOR', 'LAB', 'SWEEP', 'HEALTH'];

function generateStreamTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
}

async function postStreamState(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/stream-states`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    
    console.log('⏳ Waiting 1 second before next stream state record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    console.error('Error posting stream state:', error.response?.data || error.message);
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

async function generateStreamStatesData() {
  console.log('🔄 Generating stream states...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate one stream state per device (not per stream type)
        const streamType = faker.helpers.arrayElement(STREAM_TYPES);
          const isActive = faker.datatype.boolean({ probability: 0.8 }); // 80% active
          const lastProcessedAt = isActive ? generateStreamTimestamp() : null;
          const lastError = !isActive && faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null;
          const retryCount = lastError ? faker.number.int({ min: 0, max: 5 }) : 0;
          
          const streamState = {
            deviceId: house.deviceId,
            streamType: streamType,
            isActive: isActive,
            lastProcessedAt: lastProcessedAt,
            lastError: lastError,
            retryCount: retryCount,
            config: {
              customerId: customer.id,
              farmId: farm.id,
              houseId: house.id,
              batchSize: faker.number.int({ min: 10, max: 1000 }),
              intervalMs: faker.number.int({ min: 1000, max: 60000 }),
              timeoutMs: faker.number.int({ min: 5000, max: 30000 }),
              retryDelayMs: faker.number.int({ min: 1000, max: 10000 }),
              generatedAt: new Date().toISOString()
            }
          };
          
        const result = await postStreamState(streamState);
        if (result) {
          totalRecords++;
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} stream states`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Stream States Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Stream types: ${STREAM_TYPES.length} types per device`);
  
  try {
    // Clear existing stream states
    console.log('🧹 Clearing existing stream states...');
    await prisma.streamState.deleteMany();
    console.log('✅ Stream states cleared');
    
    // Generate stream states
    const totalRecords = await generateStreamStatesData();
    
    console.log(`\n🎉 Stream States Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating stream states:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateStreamStatesData };
