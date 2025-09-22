#!/usr/bin/env node

/**
 * Generate Data Ingestion Logs
 * 
 * This script generates data ingestion logs for all data types
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
const DAYS = Number(process.env.DAYS || 60);

let globalTimestampCounter = 0;

// Data sources and types
const DATA_SOURCES = ['edge', 'api', 'mqtt', 'kafka', 'file'];
const DATA_TYPES = ['sensor', 'lab', 'sweep', 'health', 'alert'];
const STATUSES = ['success', 'error', 'partial'];

function generateLogTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
}

async function postDataIngestionLog(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/data-ingestion-logs`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    
    console.log('⏳ Waiting 1 second before next log record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    console.error('Error posting data ingestion log:', error.response?.data || error.message);
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

async function generateDataIngestionLogsData() {
  console.log('🔄 Generating data ingestion logs...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate 2-3 logs per day per house
        const logsPerDay = faker.number.int({ min: 2, max: 3 });
        
        for (let day = 0; day < DAYS; day++) {
          for (let log = 0; log < logsPerDay; log++) {
            const source = faker.helpers.arrayElement(DATA_SOURCES);
            const dataType = faker.helpers.arrayElement(DATA_TYPES);
            const status = faker.helpers.arrayElement(STATUSES);
            const timestamp = generateLogTimestamp();
            
            const ingestionLog = {
              source: source,
              dataType: dataType,
              recordCount: faker.number.int({ min: 1, max: 1000 }),
              status: status,
              message: status === 'error' ? faker.lorem.sentence() : null,
              metadata: {
                customerId: customer.id,
                farmId: farm.id,
                houseId: house.id,
                deviceId: house.deviceId,
                day: day,
                log: log,
                processingTime: faker.number.int({ min: 100, max: 5000 }),
                memoryUsage: faker.number.int({ min: 50, max: 500 }),
                generatedAt: new Date().toISOString()
              },
              timestamp: timestamp
            };
            
            const result = await postDataIngestionLog(ingestionLog);
            if (result) {
              totalRecords++;
            }
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} data ingestion logs`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Data Ingestion Logs Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Logs: 2-3 per house per day, ${DAYS} days`);
  
  try {
    // Clear existing data ingestion logs
    console.log('🧹 Clearing existing data ingestion logs...');
    await prisma.dataIngestionLog.deleteMany();
    console.log('✅ Data ingestion logs cleared');
    
    // Generate data ingestion logs
    const totalRecords = await generateDataIngestionLogsData();
    
    console.log(`\n🎉 Data Ingestion Logs Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating data ingestion logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateDataIngestionLogsData };
