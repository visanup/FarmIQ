#!/usr/bin/env node

/**
 * Edge Sensor Mockup
 * 
 * ส่งข้อมูล sensor ผ่าน MQTT ตาม format ของ edge sensor-service
 * ข้อมูลจะถูกส่งไปยัง topic: sensor.raw/{tenant}/{metric}/{deviceId}
 */

import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';
import { createMqttClient } from './mqttClient.js';

const { client, logger } = createMqttClient();

// Configuration
const CUSTOMERS = 1;
const FARMS_PER_CUSTOMER = 1;
const HOUSES_PER_FARM = 1;
const SENSORS_PER_HOUSE = 5;

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

// Daily water quality sensors
const DAILY_WATER_SENSORS = [
  { type: 'pH', unit: 'pH', min: 6.0, max: 8.5, variance: 0.3 },
  { type: 'TDS', unit: 'ppm', min: 100, max: 2000, variance: 50 },
  { type: 'EC', unit: 'mS/cm', min: 0.2, max: 5.0, variance: 0.1 },
  { type: 'water_volume', unit: 'L', min: 0, max: 5000, variance: 50 },
  { type: 'water_temp', unit: '°C', min: 18, max: 28, variance: 1 },
];

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

function generateSensorValue(sensorConfig) {
  const base = Math.random() * (sensorConfig.max - sensorConfig.min) + sensorConfig.min;
  const variance = (Math.random() - 0.5) * 2 * sensorConfig.variance;
  const value = base + variance;
  return Math.max(sensorConfig.min, Math.min(sensorConfig.max, value));
}

function weightForDay(dayIndex) {
  const START_WEIGHT_KG = 0.8;
  const END_WEIGHT_KG = 2.95;
  const DAYS = 60;
  const t = dayIndex / (DAYS - 1);
  const linear = START_WEIGHT_KG + (END_WEIGHT_KG - START_WEIGHT_KG) * t;
  const noise = (Math.random() - 0.5) * 0.1;
  return Math.max(0, Number((linear + noise).toFixed(3)));
}

function dailyFeedIntakeKg() {
  const ANIMAL_COUNT = 200;
  const FEED_PER_ANIMAL_KG_PER_DAY = 0.1;
  const base = ANIMAL_COUNT * FEED_PER_ANIMAL_KG_PER_DAY;
  const noise = (Math.random() - 0.5) * 2;
  return Math.max(0.1, Number((base + noise).toFixed(2)));
}

function publishSensorReading(tenantId, metric, deviceId, value, unit, sensorId = null, metadata = {}) {
  const topic = `sensor.raw/${tenantId}/${metric}/${deviceId}`;
  const payload = {
    ts: new Date().toISOString(),
    tenant: tenantId,
    device_id: deviceId,
    metric,
    value,
    unit,
    sensor_id: sensorId,
    metadata: {
      ...metadata,
      generatedAt: new Date().toISOString()
    }
  };

  client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      logger.error('Failed to publish sensor reading:', err);
    } else {
      logger.info(`📡 Published: ${topic} = ${value} ${unit}`);
    }
  });
}

function generateCustomerFarmStructure() {
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

function startSensorSimulation() {
  const structure = generateCustomerFarmStructure();
  let dayIndex = 0;
  
  logger.info('🚀 Starting Edge Sensor Simulation...');
  logger.info(`📊 Configuration: ${CUSTOMERS} customers, ${FARMS_PER_CUSTOMER} farms per customer, ${HOUSES_PER_FARM} houses per farm`);
  
  // Hourly environmental readings (every 30 seconds for testing)
  setInterval(() => {
    const hour = new Date().getHours();
    
    for (const customer of structure) {
      for (const farm of customer.farms) {
        for (const house of farm.houses) {
          for (const sensor of HOURLY_SENSORS) {
            const value = generateSensorValue(sensor);
            const sensorId = `env_${sensor.type}_${hour}`;
            
            publishSensorReading(
              house.tenantId,
              sensor.type,
              house.deviceId,
              value,
              sensor.unit,
              sensorId,
              {
                customerId: customer.id,
                farmId: farm.id,
                houseId: house.id,
                flockId: house.flockId,
                dayIndex,
                hour,
                sensorType: 'environmental'
              }
            );
          }
        }
      }
    }
  }, 30000); // Every 30 seconds
  
  // Daily readings (every 2 minutes for testing)
  setInterval(() => {
    const dailyWeight = weightForDay(dayIndex);
    const dailyFeed = dailyFeedIntakeKg();
    
    for (const customer of structure) {
      for (const farm of customer.farms) {
        for (const house of farm.houses) {
          // Feed intake
          publishSensorReading(
            house.tenantId,
            'feed.intake.kg',
            house.deviceId,
            dailyFeed,
            'kg',
            'feed_intake',
            {
              customerId: customer.id,
              farmId: farm.id,
              houseId: house.id,
              flockId: house.flockId,
              dayIndex,
              sensorType: 'feed'
            }
          );
          
          // Weight scale readings (5 animals per batch)
          for (let animalId = 1; animalId <= 5; animalId++) {
            const individualWeight = dailyWeight + (Math.random() - 0.5) * 0.4;
            const sensorId = `weight_scale_${animalId}`;
            
            publishSensorReading(
              house.tenantId,
              'sensors.weight_scale.current_kg',
              house.deviceId,
              Math.max(0.1, individualWeight),
              'kg',
              sensorId,
              {
                customerId: customer.id,
                farmId: farm.id,
                houseId: house.id,
                flockId: house.flockId,
                dayIndex,
                animalId,
                sensorType: 'weight_scale'
              }
            );
          }
          
          // Weight prediction readings (5 animals per batch)
          for (let animalId = 1; animalId <= 5; animalId++) {
            const individualWeight = dailyWeight + (Math.random() - 0.5) * 0.3;
            const sensorId = `weight_predict_${animalId}`;
            
            publishSensorReading(
              house.tenantId,
              'sensors.weight_predict.current_kg',
              house.deviceId,
              Math.max(0.1, individualWeight),
              'kg',
              sensorId,
              {
                customerId: customer.id,
                farmId: farm.id,
                houseId: house.id,
                flockId: house.flockId,
                dayIndex,
                animalId,
                sensorType: 'weight_predict'
              }
            );
          }
          
          // Water quality sensors
          for (const sensor of DAILY_WATER_SENSORS) {
            const value = generateSensorValue(sensor);
            const sensorId = `water_${sensor.type}`;
            
            publishSensorReading(
              house.tenantId,
              sensor.type,
              house.deviceId,
              value,
              sensor.unit,
              sensorId,
              {
                customerId: customer.id,
                farmId: farm.id,
                houseId: house.id,
                flockId: house.flockId,
                dayIndex,
                sensorType: 'water_quality'
              }
            );
          }
        }
      }
    }
  }, 120000); // Every 2 minutes
  
  // Advance day every 10 minutes for testing
  setInterval(() => {
    dayIndex++;
    logger.info(`📅 Advanced to day ${dayIndex}`);
  }, 600000); // Every 10 minutes
}

// Start the simulation
startSensorSimulation();
