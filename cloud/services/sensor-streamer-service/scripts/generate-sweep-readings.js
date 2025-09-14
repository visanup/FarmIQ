#!/usr/bin/env node

/**
 * Generate Sweep Readings Data
 * 
 * This script generates sweep readings data for all devices
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
const DAYS = 7; // Reduced from 60 to 7 days

let globalTimestampCounter = 0;

function generateSweepTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
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

async function generateSweepReadingsData() {
  console.log('🔄 Generating sweep readings data...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate 1 sweep reading per house per day
        const sweepsPerDay = 1;
        
        for (let day = 0; day < DAYS; day++) {
          for (let sweep = 0; sweep < sweepsPerDay; sweep++) {
            const timestamp = generateSweepTimestamp();
            
            const sweepReading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              sweepId: `sweep_${customer.id}_${farm.id}_${house.id}_${day}_${sweep}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              data: {
                zones: faker.number.int({ min: 1, max: 5 }),
                animalsDetected: faker.number.int({ min: 0, max: 50 }),
                averageWeight: faker.number.float({ min: 0.5, max: 4.0, fractionDigits: 2 }),
                temperature: faker.number.float({ min: 15, max: 35, fractionDigits: 1 }),
                humidity: faker.number.float({ min: 40, max: 80, fractionDigits: 1 }),
                co2: faker.number.float({ min: 300, max: 2000, fractionDigits: 0 }),
                sweepDuration: faker.number.int({ min: 30, max: 300 }), // seconds
                success: faker.datatype.boolean()
              },
              metadata: {
                customerId: customer.id,
                houseId: house.id,
                day: day,
                sweep: sweep,
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
  }
  
  console.log(`✅ Generated ${totalRecords} sweep readings`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Sweep Readings Data Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Sweep readings: 1 per house per day, ${DAYS} days`);
  
  try {
    // Clear existing sweep readings data
    console.log('🧹 Clearing existing sweep readings data...');
    await prisma.sweepReading.deleteMany();
    console.log('✅ Sweep readings data cleared');
    
    // Generate sweep readings data
    const totalRecords = await generateSweepReadingsData();
    
    console.log(`\n🎉 Sweep Readings Data Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating sweep readings data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateSweepReadingsData };
