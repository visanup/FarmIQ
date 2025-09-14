#!/usr/bin/env node

/**
 * Generate Data Quality Checks
 * 
 * This script generates data quality checks for all data types
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

// Check types and statuses
const CHECK_TYPES = ['range_check', 'null_check', 'duplicate_check', 'consistency_check', 'completeness_check'];
const CHECK_STATUSES = ['pass', 'fail', 'warning'];

function generateCheckTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
}

async function postDataQualityCheck(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/data-quality-checks`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    
    console.log('⏳ Waiting 1 second before next data quality check record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    console.error('Error posting data quality check:', error.response?.data || error.message);
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

async function generateDataQualityChecksData() {
  console.log('🔄 Generating data quality checks...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate 1-3 quality checks per day per house
        const checksPerDay = faker.number.int({ min: 1, max: 3 });
        
        for (let day = 0; day < DAYS; day++) {
          for (let check = 0; check < checksPerDay; check++) {
            const checkType = faker.helpers.arrayElement(CHECK_TYPES);
            const status = faker.helpers.arrayElement(CHECK_STATUSES);
            const timestamp = generateCheckTimestamp();
            
            // Generate check message based on type and status
            let message = '';
            let value = null;
            let expectedMin = null;
            let expectedMax = null;
            
            switch (checkType) {
              case 'range_check':
                value = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
                expectedMin = faker.number.float({ min: 0, max: 50, fractionDigits: 2 });
                expectedMax = faker.number.float({ min: 50, max: 100, fractionDigits: 2 });
                message = `Value ${value} is ${status === 'pass' ? 'within' : 'outside'} expected range [${expectedMin}, ${expectedMax}]`;
                break;
              case 'null_check':
                message = `Null values check ${status === 'pass' ? 'passed' : 'failed'}`;
                break;
              case 'duplicate_check':
                message = `Duplicate values check ${status === 'pass' ? 'passed' : 'failed'}`;
                break;
              case 'consistency_check':
                message = `Data consistency check ${status === 'pass' ? 'passed' : 'failed'}`;
                break;
              case 'completeness_check':
                message = `Data completeness check ${status === 'pass' ? 'passed' : 'failed'}`;
                break;
            }
            
            const dataQualityCheck = {
              deviceId: house.deviceId,
              checkType: checkType,
              status: status,
              message: message,
              value: value,
              expectedMin: expectedMin,
              expectedMax: expectedMax,
              metadata: {
                customerId: customer.id,
                farmId: farm.id,
                houseId: house.id,
                day: day,
                check: check,
                generatedAt: new Date().toISOString()
              },
              timestamp: timestamp
            };
            
            const result = await postDataQualityCheck(dataQualityCheck);
            if (result) {
              totalRecords++;
            }
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} data quality checks`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Data Quality Checks Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Quality checks: 1-3 per house per day, ${DAYS} days`);
  
  try {
    // Clear existing data quality checks
    console.log('🧹 Clearing existing data quality checks...');
    await prisma.dataQualityCheck.deleteMany();
    console.log('✅ Data quality checks cleared');
    
    // Generate data quality checks
    const totalRecords = await generateDataQualityChecksData();
    
    console.log(`\n🎉 Data Quality Checks Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating data quality checks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateDataQualityChecksData };
