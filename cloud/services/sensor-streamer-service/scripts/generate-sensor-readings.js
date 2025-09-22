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
// Scenario: duck grow-out 60 days
const DAYS = Number(process.env.DAYS || 60);
const INTERVAL_MINUTES = Number(process.env.INTERVAL_MINUTES || 60); // hourly env metrics

// FCR scenario configuration
const ANIMAL_COUNT = Number(process.env.ANIMALS || 200);
const START_WEIGHT_KG = Number(process.env.START_WEIGHT_KG || 0.8);
const END_WEIGHT_KG = Number(process.env.END_WEIGHT_KG || 2.95);
const FEED_PER_ANIMAL_KG_PER_DAY = Number(process.env.FEED_PER_ANIMAL_KG_PER_DAY || 0.1); // 100 grams per animal per day

let globalTimestampCounter = 0;

function padId(value) {
  return value.toString().padStart(2, '0');
}

function buildEntityIds(customerIndex, farmIndex, houseIndex) {
  const tenantId = `tenant${padId(customerIndex)}`;
  const farmId = `farm${padId(customerIndex)}f${padId(farmIndex)}`;
  const houseId = `house${padId(customerIndex)}f${padId(farmIndex)}h${padId(houseIndex)}`;
  const deviceId = `device_${tenantId}_${houseId}`;
  const flockId = `flock${padId(customerIndex)}${padId(farmIndex)}`;
  return { tenantId, farmId, houseId, deviceId, flockId };
}

// Hourly environmental sensors (24 readings/day)
const HOURLY_SENSORS = [
  { type: 'temperature', unit: '°C', min: 22, max: 35, variance: 1.5 },
  { type: 'humidity', unit: '%', min: 40, max: 80, variance: 5 },
  { type: 'CO2', unit: 'ppm', min: 300, max: 2000, variance: 50 },
  { type: 'NH3', unit: 'ppm', min: 0, max: 50, variance: 2 },
  { type: 'illuminance', unit: 'lux', min: 0, max: 8000, variance: 200 },
  { type: 'photoperiod', unit: 'hours', min: 0, max: 24, variance: 0.5 },
  { type: 'VOCs', unit: 'ppb', min: 0, max: 800, variance: 15 },
];

// Daily sensors (1 reading/day)
const DAILY_SENSORS = [
  { type: 'feed.intake.kg', unit: 'kg' },
  { type: 'sensors.weight_scale.current_kg', unit: 'kg' },
  { type: 'sensors.weight_predict.current_kg', unit: 'kg' },
];

// Daily-only sensors moved from hourly per request
const DAILY_EXTRA_SENSORS = [
  { type: 'pH', unit: 'pH', min: 6.0, max: 8.5, variance: 0.3 },
  { type: 'TDS', unit: 'ppm', min: 100, max: 2000, variance: 50 },
  { type: 'EC', unit: 'mS/cm', min: 0.2, max: 5.0, variance: 0.1 },
  { type: 'water_volume', unit: 'L', min: 0, max: 5000, variance: 50 },
  { type: 'water_temp', unit: '°C', min: 18, max: 28, variance: 1 },
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

function weightForDay(dayIndex) {
  const t = dayIndex / (DAYS - 1);
  const linear = START_WEIGHT_KG + (END_WEIGHT_KG - START_WEIGHT_KG) * t;
  const noise = faker.number.float({ min: -0.05, max: 0.05, fractionDigits: 2 });
  return Math.max(0, Number((linear + noise).toFixed(3)));
}

function dailyFeedIntakeKg() {
  const base = ANIMAL_COUNT * FEED_PER_ANIMAL_KG_PER_DAY; // e.g., 200 * 0.1 = 20kg
  const noise = faker.number.float({ min: -1.0, max: 1.0, fractionDigits: 2 });
  return Math.max(0.1, Number((base + noise).toFixed(2)));
}

function dayHourTimestamp(baseTs, dayIndex, hour) {
  const d = new Date(baseTs);
  d.setUTCDate(d.getUTCDate() + dayIndex);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
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
  
  for (let customerIndex = 1; customerIndex <= CUSTOMERS; customerIndex++) {
    const { tenantId } = buildEntityIds(customerIndex, 1, 1);
    const customer = {
      id: tenantId,
      name: `Customer ${customerIndex}`,
      farms: []
    };
    
    for (let farmIndex = 1; farmIndex <= FARMS_PER_CUSTOMER; farmIndex++) {
      const { farmId, flockId } = buildEntityIds(customerIndex, farmIndex, 1);
      const farm = {
        id: farmId,
        name: `Farm ${customerIndex}-${farmIndex}`,
        tenantId: customer.id,
        flockId,
        houses: []
      };
      
      for (let houseIndex = 1; houseIndex <= HOUSES_PER_FARM; houseIndex++) {
        const ids = buildEntityIds(customerIndex, farmIndex, houseIndex);
        const house = {
          id: ids.houseId,
          name: `House ${customerIndex}-${farmIndex}-${houseIndex}`,
          deviceId: ids.deviceId,
          tenantId: ids.tenantId,
          farmId: farmId,
          flockId: farm.flockId
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
  let totalRecords = 0;
  const baseStart = new Date();
  baseStart.setUTCHours(0, 0, 0, 0);
  // Shift baseStart back so that we generate historical data ending today
  baseStart.setUTCDate(baseStart.getUTCDate() - (DAYS - 1));

  for (let day = 0; day < DAYS; day++) {
    // Hourly environment readings (24 per day)
    for (let hour = 0; hour < 24; hour++) {
      for (const customer of structure) {
        for (const farm of customer.farms) {
          for (const house of farm.houses) {
            for (const s of HOURLY_SENSORS) {
              const sensorReading = {
                deviceId: house.deviceId,
                farmId: farm.id,
                houseId: house.id,
                tenantId: customer.id,
                sensorType: s.type,
                timestamp: dayHourTimestamp(baseStart, day, hour),
                value: generateSensorValue(s),
                unit: s.unit,
                location: {
                  x: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                  y: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                  z: faker.number.float({ min: 0, max: 10, fractionDigits: 2 })
                },
                metadata: {
                  customerId: customer.id,
                  tenantId: customer.id,
                  farmId: farm.id,
                  houseId: house.id,
                  flockId: house.flockId,
                  dayIndex: day,
                  hour,
                  generatedAt: new Date().toISOString()
                }
              };
              const result = await postSensorReading(sensorReading);
              if (result) totalRecords++;
            }
          }
        }
      }
    }

    // Daily readings (1 per day): feed intake + weights + daily-only sensors
    const dailyTs = dayHourTimestamp(baseStart, day, 12); // midday
    const dailyWeight = weightForDay(day);
    const dailyFeed = dailyFeedIntakeKg();

    for (const customer of structure) {
      for (const farm of customer.farms) {
        for (const house of farm.houses) {
          // feed.intake.kg
          {
            const reading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              houseId: house.id,
              tenantId: customer.id,
              sensorType: 'feed.intake.kg',
              timestamp: dailyTs,
              value: dailyFeed,
              unit: 'kg',
              metadata: { customerId: customer.id, tenantId: customer.id, farmId: farm.id, houseId: house.id, flockId: house.flockId, dayIndex: day }
            };
            const r = await postSensorReading(reading);
            if (r) totalRecords++;
          }
          // sensors.weight_scale.current_kg - 200 animals per house
          for (let animalId = 1; animalId <= ANIMAL_COUNT; animalId++) {
            const individualWeight = dailyWeight + faker.number.float({ min: -0.2, max: 0.2, fractionDigits: 3 });
            const tsOffset = new Date(new Date(dailyTs).getTime() + animalId * 1000).toISOString();
            const reading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              houseId: house.id,
              tenantId: customer.id,
              sensorType: 'sensors.weight_scale.current_kg',
              sensorId: `weight_scale_${animalId}`,
              timestamp: tsOffset,
              value: Math.max(0.1, individualWeight),
              unit: 'kg',
              metadata: { 
                customerId: customer.id, 
                tenantId: customer.id, 
                farmId: farm.id, 
                houseId: house.id, 
                flockId: house.flockId, 
                dayIndex: day, 
                animalId: animalId,
                animalCount: ANIMAL_COUNT
              }
            };
            const r = await postSensorReading(reading);
            if (r) totalRecords++;
          }
          // sensors.weight_predict.current_kg - 200 animals per house
          for (let animalId = 1; animalId <= ANIMAL_COUNT; animalId++) {
            const individualWeight = dailyWeight + faker.number.float({ min: -0.15, max: 0.15, fractionDigits: 3 });
            const tsOffset = new Date(new Date(dailyTs).getTime() + animalId * 1000 + 500).toISOString();
            const reading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              houseId: house.id,
              tenantId: customer.id,
              sensorType: 'sensors.weight_predict.current_kg',
              sensorId: `weight_predict_${animalId}`,
              timestamp: tsOffset,
              value: Math.max(0.1, individualWeight),
              unit: 'kg',
              metadata: { 
                customerId: customer.id, 
                tenantId: customer.id, 
                farmId: farm.id, 
                houseId: house.id, 
                flockId: house.flockId, 
                dayIndex: day, 
                animalId: animalId,
                animalCount: ANIMAL_COUNT
              }
            };
            const r = await postSensorReading(reading);
            if (r) totalRecords++;
          }
          // Daily-only extra sensors
          for (const s of DAILY_EXTRA_SENSORS) {
            const reading = {
              deviceId: house.deviceId,
              farmId: farm.id,
              houseId: house.id,
              tenantId: customer.id,
              sensorType: s.type,
              timestamp: dailyTs,
              value: generateSensorValue(s),
              unit: s.unit,
              metadata: { customerId: customer.id, tenantId: customer.id, farmId: farm.id, houseId: house.id, flockId: house.flockId, dayIndex: day }
            };
            const r = await postSensorReading(reading);
            if (r) totalRecords++;
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
  console.log(`📊 Sensors: ${HOURLY_SENSORS.length} hourly + ${DAILY_SENSORS.length} daily types per house, ${DAYS} days, every ${INTERVAL_MINUTES} minutes`);
  
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


