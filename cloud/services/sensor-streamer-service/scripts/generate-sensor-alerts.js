#!/usr/bin/env node

/**
 * Generate Sensor Alerts
 * 
 * This script generates sensor alerts for all devices
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

// Alert types and severities
const ALERT_TYPES = ['threshold', 'anomaly', 'offline', 'error', 'maintenance'];
const ALERT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function generateAlertTimestamp() {
  globalTimestampCounter++;
  const date = new Date();
  date.setTime(Date.now() + (globalTimestampCounter * 1000) + (globalTimestampCounter % 1000) + Math.floor(Math.random() * 100));
  return date.toISOString();
}

async function postSensorAlert(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sensor-alerts`, data, {
      headers: { 'x-api-key': API_KEY }
    });
    
    console.log('⏳ Waiting 1 second before next sensor alert record...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response.data;
  } catch (error) {
    console.error('Error posting sensor alert:', error.response?.data || error.message);
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

async function generateSensorAlertsData() {
  console.log('🔄 Generating sensor alerts...');
  
  const structure = await generateCustomerFarmStructure();
  let totalRecords = 0;
  
  for (const customer of structure) {
    for (const farm of customer.farms) {
      for (const house of farm.houses) {
        // Generate 0-2 alerts per day per house
        const alertsPerDay = faker.number.int({ min: 0, max: 2 });
        
        for (let day = 0; day < DAYS; day++) {
          for (let alert = 0; alert < alertsPerDay; alert++) {
            const alertType = faker.helpers.arrayElement(ALERT_TYPES);
            const severity = faker.helpers.arrayElement(ALERT_SEVERITIES);
            const isResolved = faker.datatype.boolean({ probability: 0.7 }); // 70% resolved
            const timestamp = generateAlertTimestamp();
            
            // Generate alert message based on type
            let message = '';
            let value = null;
            let threshold = null;
            
            switch (alertType) {
              case 'threshold':
                value = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
                threshold = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
                message = `Value ${value} exceeded threshold ${threshold}`;
                break;
              case 'anomaly':
                value = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
                message = `Anomalous value detected: ${value}`;
                break;
              case 'offline':
                message = `Device ${house.deviceId} is offline`;
                break;
              case 'error':
                message = `Device error: ${faker.lorem.words(3)}`;
                break;
              case 'maintenance':
                message = `Maintenance required for device ${house.deviceId}`;
                break;
            }
            
            const sensorAlert = {
              deviceId: house.deviceId,
              farmId: farm.id,
              houseId: house.id,
              alertType: alertType,
              severity: severity,
              message: message,
              value: value,
              threshold: threshold,
              isResolved: isResolved,
              resolvedAt: isResolved ? generateAlertTimestamp() : null,
              metadata: {
                customerId: customer.id,
                day: day,
                alert: alert,
                generatedAt: new Date().toISOString()
              },
              createdAt: timestamp
            };
            
            const result = await postSensorAlert(sensorAlert);
            if (result) {
              totalRecords++;
            }
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${totalRecords} sensor alerts`);
  return totalRecords;
}

async function main() {
  console.log('🚀 Starting Sensor Alerts Generation...');
  console.log(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  console.log(`📊 Alerts: 0-2 per house per day, ${DAYS} days`);
  
  try {
    // Clear existing sensor alerts
    console.log('🧹 Clearing existing sensor alerts...');
    await prisma.sensorAlert.deleteMany();
    console.log('✅ Sensor alerts cleared');
    
    // Generate sensor alerts
    const totalRecords = await generateSensorAlertsData();
    
    console.log(`\n🎉 Sensor Alerts Generation Complete!`);
    console.log(`📊 Total records generated: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Error generating sensor alerts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateSensorAlertsData };
