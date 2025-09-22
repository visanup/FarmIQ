#!/usr/bin/env node

/**
 * Generate Device Configurations
 * 
 * This script generates device configurations for all devices
 */

const axios = require('axios');
const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');

const API_BASE_URL = 'http://localhost:7302';
const API_KEY = 'admin-key';
const prisma = new PrismaClient();

// Configuration - align with 60-day scenario (static configs per device)
const CUSTOMERS = Number(process.env.CUSTOMERS || 1);
const FARMS_PER_CUSTOMER = Number(process.env.FARMS_PER_CUSTOMER || 1);
const HOUSES_PER_FARM = Number(process.env.HOUSES_PER_FARM || 1);

let globalTimestampCounter = 0;

// Config types
const CONFIG_TYPES = ['SENSOR_CONFIG', 'STREAM_CONFIG', 'ALERT_CONFIG', 'DEVICE_CONFIG'];

function generateConfigTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
}

async function postDeviceConfiguration(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/device-configurations`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    
    console.log('⏳ Waiting 1 second before next device configuration record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    console.error('Error posting device configuration:', error.response?.data || error.message);
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

async function generateDeviceConfigurationsData() {
  console.log('🔄 Generating device configurations...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate one configuration per device (not per config type)
        const configType = faker.helpers.arrayElement(CONFIG_TYPES);
          const isActive = faker.datatype.boolean({ probability: 0.9 }); // 90% active
          const appliedAt = isActive ? generateConfigTimestamp() : null;
          
          // Generate config data based on type
          let configData = {};
          switch (configType) {
            case 'SENSOR_CONFIG':
              configData = {
                samplingInterval: faker.number.int({ min: 1000, max: 60000 }),
                thresholds: {
                  temperature: { min: 15, max: 35 },
                  humidity: { min: 40, max: 80 },
                  co2: { min: 300, max: 2000 }
                },
                qualityChecks: {
                  enabled: true,
                  rangeCheck: true,
                  nullCheck: true,
                  duplicateCheck: true
                }
              };
              break;
            case 'STREAM_CONFIG':
              configData = {
                batchSize: faker.number.int({ min: 10, max: 1000 }),
                flushInterval: faker.number.int({ min: 5000, max: 60000 }),
                retryAttempts: faker.number.int({ min: 1, max: 5 }),
                timeout: faker.number.int({ min: 5000, max: 30000 })
              };
              break;
            case 'ALERT_CONFIG':
              configData = {
                enabled: true,
                severity: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
                thresholds: {
                  temperature: { min: 10, max: 40 },
                  humidity: { min: 30, max: 90 },
                  co2: { min: 200, max: 2500 }
                },
                notificationChannels: ['email', 'sms', 'webhook']
              };
              break;
            case 'DEVICE_CONFIG':
              configData = {
                deviceName: house.name,
                location: {
                  farm: farm.name,
                  house: house.name,
                  coordinates: {
                    lat: faker.number.float({ min: -90, max: 90, fractionDigits: 6 }),
                    lng: faker.number.float({ min: -180, max: 180, fractionDigits: 6 })
                  }
                },
                settings: {
                  timezone: 'UTC',
                  language: 'en',
                  units: 'metric'
                }
              };
              break;
          }
          
          const deviceConfiguration = {
            deviceId: house.deviceId,
            configType: configType,
            configData: configData,
            version: faker.system.semver(),
            isActive: isActive,
            appliedAt: appliedAt,
            metadata: {
              customerId: customer.id,
              farmId: farm.id,
              houseId: house.id,
              generatedAt: new Date().toISOString()
            }
          };
          
        const result = await postDeviceConfiguration(deviceConfiguration);
        if (result) {
          totalRecords++;
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} device configurations`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Device Configurations Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Config types: ${CONFIG_TYPES.length} types per device`);
  
  try {
    // Clear existing device configurations
    console.log('🧹 Clearing existing device configurations...');
    await prisma.deviceConfiguration.deleteMany();
    console.log('✅ Device configurations cleared');
    
    // Generate device configurations
    const totalRecords = await generateDeviceConfigurationsData();
    
    console.log(`\n🎉 Device Configurations Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating device configurations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateDeviceConfigurationsData };
