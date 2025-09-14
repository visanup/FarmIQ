#!/usr/bin/env node

/**
 * Generate Lab Readings Data
 * 
 * This script generates lab readings data for all farms
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
const DAYS = 7; // Reduced from 60 to 7 days

let globalTimestampCounter = 0;

// Lab test types
const LAB_TEST_TYPES = [
  { type: 'water_quality', unit: 'score', min: 0, max: 100 },
  { type: 'feed_analysis', unit: 'mg/kg', min: 0, max: 1000 },
  { type: 'soil_analysis', unit: 'pH', min: 5.0, max: 8.5 },
  { type: 'pathogen_test', unit: 'cfu/ml', min: 0, max: 10000 },
  { type: 'nutrient_analysis', unit: 'ppm', min: 0, max: 500 }
];

function generateLabTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
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
        name: `Farm ${customerId}-${farmId}`
      };
      
      customer.farms.push(farm);
    }
    
    structure.push(customer);
  }
  
  return structure;
}

async function generateLabReadingsData() {
  console.log('🔄 Generating lab readings data...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      // Generate 1-2 lab readings per farm per day
      const readingsPerDay = faker.number.int({ min: 1, max: 2 });
      
      for (let day = 0; day < DAYS; day++) {
        for (let reading = 0; reading < readingsPerDay; reading++) {
          const testType = faker.helpers.arrayElement(LAB_TEST_TYPES);
          const timestamp = generateLabTimestamp();
          
          const labReading = {
            sampleId: `lab_${customer.id}_${farm.id}_${day}_${reading}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

async function main() {
  console.log('🚀 Starting Lab Readings Data Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer`);
  console.log(`📊 Lab tests: ${LAB_TEST_TYPES.length} types, ${DAYS} days`);
  
  try {
    // Clear existing lab readings data
    console.log('🧹 Clearing existing lab readings data...');
    await prisma.labReading.deleteMany();
    console.log('✅ Lab readings data cleared');
    
    // Generate lab readings data
    const totalRecords = await generateLabReadingsData();
    
    console.log(`\n🎉 Lab Readings Data Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating lab readings data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateLabReadingsData };
