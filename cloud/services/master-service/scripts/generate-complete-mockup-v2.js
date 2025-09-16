const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const { Kafka } = require('kafkajs');

// Import services for proper business logic and Kafka publishing
const { CustomerService } = require('../dist/services/customer.service');
const { FarmService } = require('../dist/services/farm.service');
const { HouseService } = require('../dist/services/house.service');
const { DeviceService } = require('../dist/services/device.service');
const { FlockService } = require('../dist/services/flock.service');
const { AnimalTypeService } = require('../dist/services/animalType.service');
const { BreedService } = require('../dist/services/breed.service');
const { DeviceTypeService } = require('../dist/services/deviceType.service');
const { SensorTypeService } = require('../dist/services/sensorType.service');
const { FeedTypeService } = require('../dist/services/feedType.service');
const { FormulaService } = require('../dist/services/formula.service');
const { EconomicDataService } = require('../dist/services/economicData.service');
const { ExternalDataSourceService } = require('../dist/services/externalDataSource.service');
const { ZoneService } = require('../dist/services/zone.service');
const { StationService } = require('../dist/services/station.service');
const { DeviceHealthService } = require('../dist/services/deviceHealth.service');
const { MasterEventService } = require('../dist/services/masterEvent.service');

const prisma = new PrismaClient();

// Initialize services
const customerService = new CustomerService();
const farmService = new FarmService();
const houseService = new HouseService();
const deviceService = new DeviceService();
const flockService = new FlockService();
const animalTypeService = new AnimalTypeService();
const breedService = new BreedService();
const deviceTypeService = new DeviceTypeService();
const sensorTypeService = new SensorTypeService();
const feedTypeService = new FeedTypeService();
const formulaService = new FormulaService();
const economicDataService = new EconomicDataService();
const externalDataSourceService = new ExternalDataSourceService();
const zoneService = new ZoneService();
const stationService = new StationService();
const deviceHealthService = new DeviceHealthService();
const masterEventService = new MasterEventService();


async function generateCompleteMockup() {
  console.log('🚀 Starting complete master data mockup generation for all tables...');

  try {
    // Initialize Kafka connection for publishing events
    console.log('📤 Initializing Kafka connection for event publishing...');

    // Clear all tables first
    await clearAllTables();

    // Generate data in dependency order
    const customers = await generateCustomers();
    const animalTypes = await generateAnimalTypes();
    const breeds = await generateBreeds(animalTypes);
    const farms = await generateFarms(customers);
    const houses = await generateHouses(farms);
    const devices = await generateDevices(houses);
    const flocks = await generateFlocks(farms, houses, animalTypes, breeds);

    // Reference data
    const deviceTypes = await generateDeviceTypes();
    const sensorTypes = await generateSensorTypes();
    const feedTypes = await generateFeedTypes();
    const formulas = await generateFormulas();
    const economicData = await generateEconomicData();
    const externalDataSources = await generateExternalDataSources();

    // Extended features
    const zones = await generateZones(farms, houses);
    const stations = await generateStations(farms, houses);
    const deviceHealth = await generateDeviceHealth(devices);
    const masterEvents = await generateMasterEvents(customers, farms, houses, devices, flocks);

    console.log('\n🎉 Complete mockup generation completed!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Customers: ${customers.length}`);
    console.log(`   🏡 Farms: ${farms.length}`);
    console.log(`   🏠 Houses: ${houses.length}`);
    console.log(`   📱 Devices: ${devices.length}`);
    console.log(`   🐔 Animal Types: ${animalTypes.length}`);
    console.log(`   🧬 Breeds: ${breeds.length}`);
    console.log(`   🐓 Flocks: ${flocks.length}`);
    console.log(`   📚 Reference Data: ${deviceTypes.length + sensorTypes.length + feedTypes.length + formulas.length + economicData.length + externalDataSources.length}`);
    console.log(`   🔧 Extended Features: ${zones.length + stations.length + deviceHealth.length + masterEvents.length}`);

  } catch (error) {
    console.error('❌ Mockup generation failed:', error.message);
    throw error;
  } finally {
    // Disconnect Kafka
    try {
      const { KafkaPublisher } = require('../dist/utils/kafka');
      const publisher = KafkaPublisher.getInstance();
      await publisher.disconnect();
      console.log('📤 Kafka connection closed');
    } catch (error) {
      console.log('📤 Kafka disconnect skipped (not connected)');
    }

    console.log('✅ Mockup generation completed');
    await prisma.$disconnect();
  }
}

// Clear all tables
async function clearAllTables() {
  console.log('🧹 Clearing all tables...');

  const clearOrder = [
    'MasterEvent',
    'DeviceHealth',
    'Station',
    'Zone',
    'Flock',
    'Breed',
    'AnimalType',
    'Device',
    'House',
    'Farm',
    'Customer',
    'ExternalDataSource',
    'EconomicData',
    'Formula',
    'FeedType',
    'SensorType',
    'DeviceType'
  ];

  // Map Prisma model names to delegate names on PrismaClient
  const prismaDelegateMap = {
    MasterEvent: 'masterEvent',
    DeviceHealth: 'deviceHealth',
    Station: 'station',
    Zone: 'zone',
    Flock: 'flock',
    Breed: 'breed',
    AnimalType: 'animalType',
    Device: 'device',
    House: 'house',
    Farm: 'farm',
    Customer: 'customer',
    ExternalDataSource: 'externalDataSource',
    EconomicData: 'economicData',
    Formula: 'formula',
    FeedType: 'feedType',
    SensorType: 'sensorType',
    DeviceType: 'deviceType'
  };

  for (const table of clearOrder) {
    try {
      const delegate = prismaDelegateMap[table];
      if (!delegate || !prisma[delegate] || typeof prisma[delegate].deleteMany !== 'function') {
        throw new Error(`Unknown Prisma delegate for table ${table}`);
      }
      await prisma[delegate].deleteMany({});
      console.log(`✅ Cleared ${table}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${table}: ${error.message}`);
    }
  }
}

// Generate Customers
async function generateCustomers() {
  console.log('👥 Generating customers...');
  const customers = [];

  for (let i = 0; i < 5; i++) {
    const customerData = {
      tenantId: `tenant_${String(i + 1).padStart(3, '0')}`,
      name: faker.helpers.arrayElement([
        'สหกรณ์การเกษตรตัวอย่าง',
        'บริษัท ฟาร์มไก่เนื้อ จำกัด',
        'กลุ่มเกษตรกรผู้เลี้ยงสัตว์',
        'ฟาร์มอินทรีย์แห่งประเทศไทย',
        'สหกรณ์ผู้เลี้ยงไก่เนื้อ'
      ]),
      email: faker.internet.email(),
      phone: faker.phone.number('+66-2-###-####'),
      address: faker.location.streetAddress() + ', กรุงเทพฯ 10110',
      meta: {
        industry: 'Agriculture',
        established_year: faker.date.past({ years: 20 }).getFullYear(),
        employees: faker.number.int({ min: 10, max: 500 }),
        farm_type: faker.helpers.arrayElement(['poultry', 'livestock', 'mixed']),
        certification: faker.helpers.arrayElement(['GAP', 'Organic', 'HACCP', 'ISO']),
        revenue: faker.number.int({ min: 1000000, max: 50000000 })
      }
    };

    // Use service layer for proper business logic and Kafka publishing
    const result = await customerService.createCustomer(customerData);
    const customer = result.data;
    customers.push(customer);
    console.log(`✅ Created customer: ${customer.name} (${result.message})`);
  }

  return customers;
}

// Generate Animal Types
async function generateAnimalTypes() {
  console.log('🐔 Generating animal types...');
  const animalTypes = [];

  const types = [
    { name: 'Chicken', category: 'Poultry', description: 'Domestic fowl kept for meat and eggs' },
    { name: 'Pig', category: 'Livestock', description: 'Domestic pig raised for meat production' },
    { name: 'Cattle', category: 'Livestock', description: 'Domestic cattle for meat and dairy production' },
    { name: 'Duck', category: 'Poultry', description: 'Domestic duck for meat and eggs' },
    { name: 'Goat', category: 'Livestock', description: 'Domestic goat for meat and milk production' },
    { name: 'Sheep', category: 'Livestock', description: 'Domestic sheep for meat and wool production' }
  ];

  for (const type of types) {
    const animalTypeData = {
      ...type,
      meta: {
        avg_weight: faker.helpers.arrayElement(['2-4 kg', '100-200 kg', '400-800 kg']),
        lifespan: faker.helpers.arrayElement(['5-10 years', '15-20 years', '18-25 years']),
        breeding_cycle: faker.helpers.arrayElement(['21 days', '114 days', '280 days'])
      }
    };

    // Use service layer for proper business logic and Kafka publishing
    const result = await animalTypeService.createAnimalType(animalTypeData);
    const animalType = result.data;
    animalTypes.push(animalType);
    console.log(`✅ Created animal type: ${animalType.name} (${result.message})`);
  }

  return animalTypes;
}

async function generateBreeds(animalTypes) {
  console.log('🧬 Generating breeds...');
  const breeds = [];


  // catalog to seed
  const breedData = [
    { animalType: 'Chicken', name: 'Ross 308', code: 'R308', description: 'Fast-growing broiler chicken breed' },
    { animalType: 'Chicken', name: 'Cobb 500', code: 'C500', description: 'High-performance broiler breed' },
    { animalType: 'Chicken', name: 'Hubbard', code: 'HUB', description: 'Reliable broiler breed' },
    { animalType: 'Chicken', name: 'Lohmann Brown', code: 'LB', description: 'High-producing layer breed' },
    { animalType: 'Pig', name: 'Large White', code: 'LW', description: 'Popular commercial pig breed' },
    { animalType: 'Pig', name: 'Landrace', code: 'LR', description: 'Excellent mothering ability breed' },
    { animalType: 'Pig', name: 'Duroc', code: 'DU', description: 'Premium meat quality breed' },
    { animalType: 'Cattle', name: 'Holstein Friesian', code: 'HF', description: 'High milk production dairy breed' },
    { animalType: 'Cattle', name: 'Angus', code: 'ANG', description: 'Premium beef cattle breed' },
    { animalType: 'Cattle', name: 'Brahman', code: 'BR', description: 'Heat-tolerant beef breed' },
    { animalType: 'Duck', name: 'Pekin', code: 'PEK', description: 'Fast-growing duck breed' },
    { animalType: 'Duck', name: 'Khaki Campbell', code: 'KC', description: 'High egg-producing duck breed' },
    { animalType: 'Goat', name: 'Boer', code: 'GO-BO', description: 'Meat-type goat with rapid growth' },
    { animalType: 'Goat', name: 'Saanen', code: 'GO-SA', description: 'High milk production dairy goat' },
    { animalType: 'Sheep', name: 'Merino', code: 'SH-ME', description: 'Fine-wool sheep breed' },
    { animalType: 'Sheep', name: 'Dorper', code: 'SH-DO', description: 'Hair sheep known for hardiness' }
  ];


  for (const b of breedData) {
    // find AnimalType object that was created earlier
    const at = animalTypes.find((x) => x.name === b.animalType);
    if (!at) {
      console.log(`⚠️ Skip breed ${b.name}: animal type '${b.animalType}' not found`);
      continue;
    }


    // ✅ IMPORTANT: go through service (NOT prisma directly)
    // so it will publish Kafka 'master.breed.snapshot.v1'
    const result = await breedService.createBreed({
      animalTypeId: at.id,
      name: b.name,
      code: b.code,
      description: b.description,
      characteristics: {
        growth_rate: faker.helpers.arrayElement(['fast', 'medium', 'slow']),
        feed_conversion: faker.number.float({ min: 1.5, max: 3.0, fractionDigits: 1 }),
        market_weight: faker.helpers.arrayElement(['2.5 kg', '100 kg', '500 kg']),
        days_to_market: faker.number.int({ min: 40, max: 200 })
      },
      meta: {
        origin: faker.helpers.arrayElement(['USA', 'UK', 'Germany', 'France', 'China']),
        company: faker.company.name(),
        market_share: faker.number.int({ min: 10, max: 50 }),
        price_per_chick: faker.number.float({ min: 10, max: 20, fractionDigits: 2 })
      }
    });
    const created = result.data;
    breeds.push(created);
    console.log(
      `✅ Created breed: ${created.name} (animalType=${b.animalType}) — ${result.message}`
    );
  }
  // little summary
  console.log(`📦 Total breeds created: ${breeds.length}`);
  // optional: short delay to let Kafka flush on small setups
  await new Promise((r) => setTimeout(r, 250));
  return breeds;
}

// Generate Farms
async function generateFarms(customers) {
  console.log('🏡 Generating farms...');
  const farms = [];

  for (const customer of customers) {
    for (let i = 0; i < 2; i++) {
      const farmData = {
        farmId: `farm_${customer.tenantId}_${String(i + 1).padStart(3, '0')}`,
        tenantId: customer.tenantId,
        customerId: customer.id,
        name: `${customer.name} สาขา ${i + 1}`,
        location: {
          lat: faker.location.latitude({ min: 13.0, max: 15.0 }),
          lon: faker.location.longitude({ min: 100.0, max: 102.0 }),
          address: faker.location.streetAddress() + ', กรุงเทพฯ 10110'
        },
        region: faker.helpers.arrayElement(['Central', 'North', 'Northeast', 'South']),
        farmType: customer.meta.farm_type || faker.helpers.arrayElement(['poultry', 'livestock', 'mixed']),
        totalArea: faker.number.int({ min: 5000, max: 50000 }),
        meta: {
          soil_type: faker.helpers.arrayElement(['Clay', 'Sandy', 'Loamy']),
          water_source: faker.helpers.arrayElement(['Well', 'River', 'Reservoir']),
          electricity: true,
          established_year: faker.date.past({ years: 10 }).getFullYear(),
          capacity: faker.number.int({ min: 10000, max: 100000 })
        }
      };

      // Use service layer for proper business logic and Kafka publishing
      const result = await farmService.createFarm(farmData);
      const farm = result.data;
      farms.push(farm);
      console.log(`✅ Created farm: ${farm.name} (${result.message})`);
    }
  }

  return farms;
}

// Generate Houses
async function generateHouses(farms) {
  console.log('🏠 Generating houses...');
  const houses = [];

  for (const farm of farms) {
    for (let i = 0; i < 2; i++) {
      const houseData = {
        houseId: `house_${farm.farmId}_${String(i + 1).padStart(3, '0')}`,
        tenantId: farm.tenantId,
        farmId: farm.id,
        name: `โรงเรือน ${String.fromCharCode(65 + i)}`,
        type: farm.farmType === 'poultry' ? 'broiler' : faker.helpers.arrayElement(['broiler', 'layer', 'breeding', 'quarantine']),
        capacity: faker.number.int({ min: 5000, max: 20000 }),
        dimensions: {
          length: faker.number.int({ min: 100, max: 150 }),
          width: faker.number.int({ min: 12, max: 20 }),
          height: faker.number.int({ min: 3, max: 4 })
        },
        ventilation: 'mechanical',
        heating: 'gas',
        meta: {
          construction_year: faker.date.past({ years: 8 }).getFullYear(),
          roof_material: 'Metal',
          floor_material: 'Concrete',
          insulation: true,
          automation_level: faker.helpers.arrayElement(['basic', 'intermediate', 'advanced']),
          zones: 20,
          animals_per_zone: 20
        }
      };

      // Use service layer for proper business logic and Kafka publishing
      const result = await houseService.createHouse(houseData);
      const house = result.data;
      houses.push(house);
      console.log(`✅ Created house: ${house.name} in ${farm.name} (${result.message})`);
    }
  }

  return houses;
}

// Generate Devices
async function generateDevices(houses) {
  console.log('📱 Generating devices...');
  const devices = [];

  const SENSOR_TYPES = [
    { type: 'temperature', unit: '°C', model: 'TempSensor Pro', vendor: 'IoT Solutions' },
    { type: 'humidity', unit: '%', model: 'HumidityMaster', vendor: 'ClimateTech' },
    { type: 'CO2', unit: 'ppm', model: 'CO2Monitor', vendor: 'AirQuality Inc' },
    { type: 'NH3', unit: 'ppm', model: 'NH3Detector', vendor: 'GasSense' },
    { type: 'pH', unit: 'pH', model: 'pHProbe', vendor: 'WaterTech' },
    { type: 'TDS', unit: 'ppm', model: 'TDSMeter', vendor: 'WaterTech' },
    { type: 'EC', unit: 'mS/cm', model: 'ECSensor', vendor: 'WaterTech' },
    { type: 'water_temp', unit: '°C', model: 'WaterTempProbe', vendor: 'AquaTech' },
    { type: 'water_volume', unit: 'L', model: 'VolumeMeter', vendor: 'FlowTech' },
    { type: 'illuminance', unit: 'lux', model: 'LightSensor', vendor: 'LightTech' },
    { type: 'photoperiod', unit: 'hours', model: 'PhotoTimer', vendor: 'LightTech' },
    { type: 'VOCs', unit: 'ppb', model: 'VOCDetector', vendor: 'AirQuality Inc' }
  ];

  for (const house of houses) {
    for (let i = 0; i < 12; i++) {
      const sensorType = SENSOR_TYPES[i % SENSOR_TYPES.length];
      const deviceData = {
        deviceId: `device_${house.houseId}_${String(i + 1).padStart(3, '0')}`,
        tenantId: house.tenantId,
        farmId: house.farmId,
        houseId: house.id,
        name: `เซ็นเซอร์${sensorType.type} ${String(i + 1)}`,
        type: 'sensor',
        model: sensorType.model,
        vendor: sensorType.vendor,
        serialNo: `${sensorType.vendor.substring(0, 3).toUpperCase()}${faker.string.alphanumeric(9)}`,
        status: faker.helpers.arrayElement(['active', 'inactive', 'maintenance', 'error']),
        location: {
          x: faker.number.float({ min: 0, max: house.dimensions.length, fractionDigits: 2 }),
          y: faker.number.float({ min: 0, max: house.dimensions.width, fractionDigits: 2 }),
          z: faker.number.float({ min: 0, max: house.dimensions.height, fractionDigits: 2 })
        },
        meta: {
          sensor_type: sensorType.type,
          unit: sensorType.unit,
          firmware_version: faker.system.semver(),
          last_maintenance: faker.date.past().toISOString(),
          warranty_expiry: faker.date.future().toISOString(),
          battery_level: faker.number.int({ min: 20, max: 100 }),
          signal_strength: faker.number.int({ min: -100, max: -30 })
        }
      };

      // Use service layer for proper business logic and Kafka publishing
      const result = await deviceService.createDevice(deviceData);
      const device = result.data;
      devices.push(device);
      console.log(`✅ Created device: ${device.name} in ${house.name} (${result.message})`);
    }
  }

  return devices;
}

// Generate Flocks
async function generateFlocks(farms, houses, animalTypes, breeds) {
  console.log('🐓 Generating flocks...');
  const flocks = [];

  for (const farm of farms) {
    const farmHouses = houses.filter(h => h.farmId === farm.id);

    for (const house of farmHouses) {
      const chickenBreeds = breeds.filter(b =>
        animalTypes.find(at => at.id === b.animalTypeId)?.name === 'Chicken'
      );

      if (chickenBreeds.length === 0) continue;

      const selectedBreed = faker.helpers.arrayElement(chickenBreeds);
      const selectedAnimalType = animalTypes.find(at => at.id === selectedBreed.animalTypeId);

      const flockData = {
        flockId: `flock_${house.houseId}_001`,
        tenantId: farm.tenantId,
        farmId: farm.id,
        houseId: house.id,
        animalTypeId: selectedBreed.animalTypeId,
        breedId: selectedBreed.id,
        name: `ฝูงไก่${house.name}`,
        startDate: faker.date.past({ years: 1 }),
        endDate: faker.date.future({ years: 1 }),
        population: house.capacity,
        sex: 'mixed',
        sourceFarm: faker.helpers.arrayElement([
          'ฟาร์มไก่เนื้อภาคเหนือ',
          'ฟาร์มไก่เนื้อภาคใต้',
          'ฟาร์มไก่เนื้อภาคอีสาน',
          'ฟาร์มไก่เนื้อภาคกลาง'
        ]),
        vaccinationStatus: faker.helpers.arrayElement(['complete', 'partial', 'pending']),
        feedType: faker.helpers.arrayElement(['starter', 'grower', 'finisher']),
        healthStatus: faker.helpers.arrayElement(['healthy', 'monitoring', 'treatment']),
        status: faker.helpers.arrayElement(['active', 'completed', 'archived']),
        meta: {
          batch_number: `B${faker.string.alphanumeric(5).toUpperCase()}`,
          supplier: faker.company.name(),
          arrival_date: faker.date.past().toISOString(),
          expected_market_date: faker.date.future().toISOString(),
          current_age_days: faker.number.int({ min: 1, max: 42 }),
          average_weight: faker.number.float({ min: 0.5, max: 2.5, fractionDigits: 2 }),
          feed_conversion_ratio: faker.number.float({ min: 1.5, max: 2.2, fractionDigits: 2 }),
          mortality_rate: faker.number.float({ min: 0.5, max: 3.0, fractionDigits: 2 })
        }
      };

      // Use service layer for proper business logic and Kafka publishing
      const result = await flockService.createFlock(flockData);
      const flock = result.data;
      flocks.push(flock);
      console.log(`✅ Created flock: ${flock.name} in ${farm.name} (${result.message})`);
    }
  }

  return flocks;
}

// Generate Device Types
async function generateDeviceTypes() {
  console.log('📱 Generating device types...');
  const deviceTypes = [];

  const types = [
    { name: 'Temperature Sensor', category: 'Sensor', description: 'Digital temperature sensor for environmental monitoring' },
    { name: 'Humidity Sensor', category: 'Sensor', description: 'Digital humidity sensor for air moisture monitoring' },
    { name: 'CO2 Sensor', category: 'Sensor', description: 'Carbon dioxide sensor for air quality monitoring' },
    { name: 'Weight Scale', category: 'Sensor', description: 'Digital weight scale for feed and animal monitoring' },
    { name: 'Camera', category: 'Actuator', description: 'IP camera for visual monitoring and surveillance' },
    { name: 'Feeder Controller', category: 'Controller', description: 'Automated feeding system controller' },
    { name: 'Water Controller', category: 'Controller', description: 'Automated watering system controller' },
    { name: 'Fan Controller', category: 'Controller', description: 'Variable speed fan controller for ventilation' },
    { name: 'Gateway', category: 'Controller', description: 'IoT gateway for device communication and data aggregation' }
  ];

  for (const type of types) {
    const deviceType = await prisma.deviceType.create({
      data: {
        ...type,
        specifications: {
          range: faker.helpers.arrayElement(['-40°C to 85°C', '0% to 100% RH', '0 to 10000 ppm']),
          accuracy: faker.helpers.arrayElement(['±0.1°C', '±2% RH', '±50 ppm']),
          resolution: faker.helpers.arrayElement(['0.01°C', '0.1% RH', '1 ppm']),
          response_time: faker.helpers.arrayElement(['1 second', '2 seconds', '30 seconds'])
        },
        meta: {
          manufacturer: faker.company.name(),
          model: faker.system.semver(),
          price: faker.number.float({ min: 25, max: 500, fractionDigits: 2 }),
          availability: 'in_stock',
          power_consumption: faker.helpers.arrayElement(['0.1W', '0.5W', '5W', '50W']),
          communication: faker.helpers.arrayElement(['WiFi', 'LoRaWAN', 'RS485', 'Ethernet'])
        }
      }
    });
    deviceTypes.push(deviceType);
    console.log(`✅ Created device type: ${deviceType.name}`);
  }

  return deviceTypes;
}

// Generate Sensor Types
async function generateSensorTypes() {
  console.log('🔍 Generating sensor types...');
  const sensorTypes = [];

  const types = [
    { name: 'Temperature', unit: '°C', dataType: 'numeric', range: { min: -40, max: 85 } },
    { name: 'Humidity', unit: '%', dataType: 'numeric', range: { min: 0, max: 100 } },
    { name: 'CO2', unit: 'ppm', dataType: 'numeric', range: { min: 0, max: 10000 } },
    { name: 'NH3', unit: 'ppm', dataType: 'numeric', range: { min: 0, max: 1000 } },
    { name: 'Weight', unit: 'kg', dataType: 'numeric', range: { min: 0, max: 1000 } },
    { name: 'pH', unit: 'pH', dataType: 'numeric', range: { min: 0, max: 14 } },
    { name: 'TDS', unit: 'ppm', dataType: 'numeric', range: { min: 0, max: 2000 } },
    { name: 'EC', unit: 'mS/cm', dataType: 'numeric', range: { min: 0, max: 20 } },
    { name: 'Illuminance', unit: 'lux', dataType: 'numeric', range: { min: 0, max: 100000 } },
    { name: 'Motion', unit: 'boolean', dataType: 'boolean', range: { min: 0, max: 1 } }
  ];

  for (const type of types) {
    const sensorType = await prisma.sensorType.create({
      data: {
        ...type,
        description: `${type.name} measurement sensor`,
        meta: {
          precision: faker.number.int({ min: 0, max: 2 }),
          sampling_rate: faker.helpers.arrayElement(['1 per minute', '1 per 5 minutes', '1 per hour']),
          calibration_required: faker.datatype.boolean(),
          applications: faker.helpers.arrayElements(['environmental_monitoring', 'climate_control', 'safety'], { min: 1, max: 3 })
        }
      }
    });
    sensorTypes.push(sensorType);
    console.log(`✅ Created sensor type: ${sensorType.name}`);
  }

  return sensorTypes;
}

// Generate Feed Types
async function generateFeedTypes() {
  console.log('🌾 Generating feed types...');
  const feedTypes = [];

  const types = [
    { name: 'Starter Feed', category: 'Starter', description: 'High protein feed for young animals (0-3 weeks)' },
    { name: 'Grower Feed', category: 'Grower', description: 'Balanced feed for growing animals (3-6 weeks)' },
    { name: 'Finisher Feed', category: 'Finisher', description: 'High energy feed for finishing animals (6+ weeks)' },
    { name: 'Layer Feed', category: 'Layer', description: 'High calcium feed for laying hens' }
  ];

  for (const type of types) {
    const feedType = await prisma.feedType.create({
      data: {
        ...type,
        composition: {
          protein: faker.number.int({ min: 16, max: 22 }),
          fat: faker.number.int({ min: 3, max: 6 }),
          fiber: faker.number.int({ min: 3, max: 6 }),
          ash: faker.number.int({ min: 6, max: 12 }),
          moisture: 12,
          calcium: faker.number.float({ min: 0.9, max: 3.5, fractionDigits: 1 }),
          phosphorus: faker.number.float({ min: 0.6, max: 0.8, fractionDigits: 1 })
        },
        energy: faker.number.int({ min: 2800, max: 3200 }),
        meta: {
          target_age: faker.helpers.arrayElement(['0-3 weeks', '3-6 weeks', '6+ weeks', '18+ weeks']),
          feed_conversion: faker.number.float({ min: 1.5, max: 2.2, fractionDigits: 1 }),
          cost_per_kg: faker.number.float({ min: 21, max: 26, fractionDigits: 2 }),
          shelf_life: '6 months',
          storage_conditions: 'cool_dry_place'
        }
      }
    });
    feedTypes.push(feedType);
    console.log(`✅ Created feed type: ${feedType.name}`);
  }

  return feedTypes;
}

// Generate Formulas
async function generateFormulas() {
  console.log('🧪 Generating formulas...');
  const formulas = [];

  const formulaData = [
    { name: 'Premium Broiler Formula', description: 'High-performance formula for commercial broiler production' },
    { name: 'Organic Layer Formula', description: 'Organic certified formula for free-range laying hens' },
    { name: 'Pig Starter Formula', description: 'High-quality starter formula for piglets' },
    { name: 'Cattle Growing Formula', description: 'Balanced formula for growing cattle' }
  ];

  for (const formula of formulaData) {
    const formulaRecord = await prisma.formula.create({
      data: {
        ...formula,
        composition: {
          protein: faker.number.int({ min: 16, max: 22 }),
          fat: faker.number.int({ min: 3, max: 6 }),
          fiber: faker.number.int({ min: 3, max: 6 }),
          ash: faker.number.int({ min: 6, max: 12 }),
          moisture: 12,
          calcium: faker.number.float({ min: 0.9, max: 3.5, fractionDigits: 1 }),
          phosphorus: faker.number.float({ min: 0.6, max: 0.8, fractionDigits: 1 }),
          lysine: faker.number.float({ min: 0.8, max: 1.4, fractionDigits: 1 }),
          methionine: faker.number.float({ min: 0.3, max: 0.6, fractionDigits: 1 })
        },
        energy: faker.number.int({ min: 2800, max: 3300 }),
        cost: faker.number.float({ min: 26, max: 32, fractionDigits: 2 }),
        meta: {
          target_species: faker.helpers.arrayElement(['Chicken', 'Pig', 'Cattle', 'Duck']),
          target_stage: faker.helpers.arrayElement(['Starter', 'Grower', 'Finisher', 'Layer']),
          feed_conversion: faker.number.float({ min: 1.6, max: 2.2, fractionDigits: 1 }),
          market_weight: faker.helpers.arrayElement(['2.5kg', '100kg', '500kg']),
          days_to_market: faker.number.int({ min: 40, max: 200 })
        }
      }
    });
    formulas.push(formulaRecord);
    console.log(`✅ Created formula: ${formulaRecord.name}`);
  }

  return formulas;
}

// Generate Economic Data
async function generateEconomicData() {
  console.log('💰 Generating economic data...');
  const economicData = [];

  const regions = ['Central', 'North', 'Northeast', 'South'];
  const dataTypes = [
    { type: 'FeedCost', unit: 'THB/kg', baseValue: 25 },
    { type: 'AnimalPrice', unit: 'THB/head', baseValue: 80 },
    { type: 'LaborCost', unit: 'THB/day', baseValue: 350 },
    { type: 'ElectricityCost', unit: 'THB/kWh', baseValue: 4.5 },
    { type: 'WaterCost', unit: 'THB/m3', baseValue: 15 },
    { type: 'TransportCost', unit: 'THB/km', baseValue: 8 }
  ];

  for (const region of regions) {
    for (const dataType of dataTypes) {
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        const economicDataPoint = await prisma.economicData.create({
          data: {
            dataType: dataType.type,
            region: region,
            value: faker.number.float({
              min: dataType.baseValue * 0.8,
              max: dataType.baseValue * 1.2,
              fractionDigits: 2
            }),
            unit: dataType.unit,
            currency: 'THB',
            timestamp: date,
            meta: {
              source: 'Market Research',
              confidence: faker.number.int({ min: 80, max: 95 }),
              sample_size: faker.number.int({ min: 50, max: 200 }),
              market_conditions: faker.helpers.arrayElement(['stable', 'volatile', 'growing', 'declining'])
            }
          }
        });
        economicData.push(economicDataPoint);
      }
    }
  }

  console.log(`✅ Created ${economicData.length} economic data points`);
  return economicData;
}

// Generate External Data Sources
async function generateExternalDataSources() {
  console.log('🌐 Generating external data sources...');
  const externalDataSources = [];

  const sources = [
    { name: 'กรมอุตุนิยมวิทยา', type: 'Weather', apiUrl: 'https://api.tmd.go.th/api/weather', apiKey: 'tmd_api_key_12345' },
    { name: 'MarketPriceAPI', type: 'Market', apiUrl: 'https://api.marketprice.com/v1/prices', apiKey: 'market_api_key_67890' },
    { name: 'กรมปศุสัตว์', type: 'Government', apiUrl: 'https://api.dld.go.th/api/livestock', apiKey: 'dld_api_key_11111' },
    { name: 'IoT Sensor Network', type: 'Sensor', apiUrl: 'https://api.iot-sensors.com/v1/data', apiKey: 'iot_api_key_22222' }
  ];

  for (const source of sources) {
    const externalDataSource = await prisma.externalDataSource.create({
      data: {
        ...source,
        description: `${source.name} data source`,
        status: 'active',
        meta: {
          update_frequency: faker.helpers.arrayElement(['hourly', 'daily', 'weekly', 'real-time']),
          data_types: faker.helpers.arrayElements(['temperature', 'humidity', 'rainfall', 'wind', 'feed_prices', 'animal_prices'], { min: 2, max: 4 }),
          coverage: faker.helpers.arrayElement(['Thailand', 'Southeast Asia', 'Global']),
          reliability: faker.helpers.arrayElement(['high', 'medium', 'low']),
          cost: faker.helpers.arrayElement(['free', 'subscription', 'per_device'])
        }
      }
    });
    externalDataSources.push(externalDataSource);
    console.log(`✅ Created external data source: ${externalDataSource.name}`);
  }

  return externalDataSources;
}

// Generate Zones
async function generateZones(farms, houses) {
  console.log('🗺️  Generating zones...');
  const zones = [];

  for (const farm of farms) {
    const farmHouses = houses.filter(h => h.farmId === farm.id);

    for (const house of farmHouses) {
      for (let i = 0; i < 20; i++) {
        const zone = await prisma.zone.create({
          data: {
            tenantId: farm.tenantId,
            farmId: farm.id,
            houseId: house.id,
            name: `Zone ${house.houseId}-${String(i + 1).padStart(2, '0')}`,
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [faker.number.float({ min: 0, max: house.dimensions.length, fractionDigits: 2 }), faker.number.float({ min: 0, max: house.dimensions.width, fractionDigits: 2 })],
                [faker.number.float({ min: 0, max: house.dimensions.length, fractionDigits: 2 }), faker.number.float({ min: 0, max: house.dimensions.width, fractionDigits: 2 })],
                [faker.number.float({ min: 0, max: house.dimensions.length, fractionDigits: 2 }), faker.number.float({ min: 0, max: house.dimensions.width, fractionDigits: 2 })],
                [faker.number.float({ min: 0, max: house.dimensions.length, fractionDigits: 2 }), faker.number.float({ min: 0, max: house.dimensions.width, fractionDigits: 2 })],
                [faker.number.float({ min: 0, max: house.dimensions.length, fractionDigits: 2 }), faker.number.float({ min: 0, max: house.dimensions.width, fractionDigits: 2 })]
              ]]
            },
            type: faker.helpers.arrayElement(['Feeding', 'Resting', 'Watering', 'Exercise']),
            capacity: faker.number.int({ min: 15, max: 25 }),
            meta: {
              area_sqm: faker.number.float({ min: 10, max: 20, fractionDigits: 2 }),
              temperature_range: { min: 20, max: 25 },
              humidity_range: { min: 60, max: 80 },
              lighting_level: faker.number.int({ min: 10, max: 50 }),
              ventilation_rate: faker.number.int({ min: 5, max: 15 })
            }
          }
        });
        zones.push(zone);
      }
    }
  }

  console.log(`✅ Created ${zones.length} zones`);
  return zones;
}

// Generate Stations
async function generateStations(farms, houses) {
  console.log('🏭 Generating stations...');
  const stations = [];

  for (const farm of farms) {
    const farmHouses = houses.filter(h => h.farmId === farm.id);

    for (const house of farmHouses) {
      const stationTypes = ['Lab', 'FeedingStation', 'WaterStation', 'ControlRoom', 'Storage'];

      for (const stationType of stationTypes) {
        const station = await prisma.station.create({
          data: {
            tenantId: farm.tenantId,
            farmId: farm.id,
            houseId: house.id,
            name: `${stationType} ${house.name}`,
            location: {
              lat: faker.location.latitude({ min: 13.0, max: 15.0 }),
              lon: faker.location.longitude({ min: 100.0, max: 102.0 }),
              x: faker.number.float({ min: 0, max: house.dimensions.length, fractionDigits: 2 }),
              y: faker.number.float({ min: 0, max: house.dimensions.width, fractionDigits: 2 }),
              z: faker.number.float({ min: 0, max: house.dimensions.height, fractionDigits: 2 })
            },
            type: stationType,
            status: faker.helpers.arrayElement(['active', 'inactive', 'maintenance']),
            meta: {
              capacity: stationType === 'Storage' ? faker.number.int({ min: 1000, max: 5000 }) : null,
              power_consumption: faker.number.int({ min: 100, max: 1000 }),
              maintenance_schedule: 'monthly',
              last_maintenance: faker.date.past(),
              next_maintenance: faker.date.future()
            }
          }
        });
        stations.push(station);
      }
    }
  }

  console.log(`✅ Created ${stations.length} stations`);
  return stations;
}

// Generate Device Health
async function generateDeviceHealth(devices) {
  console.log('🏥 Generating device health records...');
  const deviceHealthRecords = [];

  for (const device of devices) {
    const deviceHealth = await prisma.deviceHealth.create({
      data: {
        deviceId: device.deviceId,
        status: faker.helpers.arrayElement(['ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE']),
        lastSeen: faker.date.recent(),
        batteryLevel: device.type === 'sensor' ? faker.number.int({ min: 20, max: 100 }) : null,
        signalStrength: faker.number.int({ min: -100, max: -30 }),
        temperature: faker.number.float({ min: 20, max: 40, fractionDigits: 1 }),
        errors: faker.helpers.arrayElements(['ERR001', 'ERR002', 'ERR003', 'ERR004'], { min: 0, max: 2 }),
        warnings: faker.helpers.arrayElements(['WARN001', 'WARN002', 'WARN003'], { min: 0, max: 2 }),
        meta: {
          uptime: faker.number.int({ min: 80, max: 99 }),
          data_quality: faker.number.int({ min: 85, max: 100 }),
          network_latency: faker.number.int({ min: 10, max: 100 }),
          firmware_version: faker.system.semver(),
          last_reboot: faker.date.past()
        }
      }
    });
    deviceHealthRecords.push(deviceHealth);
  }

  console.log(`✅ Created ${deviceHealthRecords.length} device health records`);
  return deviceHealthRecords;
}

// Generate Master Events
async function generateMasterEvents(customers, farms, houses, devices, flocks) {
  console.log('📝 Generating master events...');
  const masterEvents = [];

  // Generate events for customers
  for (const customer of customers) {
    const event = await prisma.masterEvent.create({
      data: {
        eventType: 'customer.created',
        entityType: 'Customer',
        entityId: customer.id,
        tenantId: customer.tenantId,
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        },
        metadata: {
          source: 'api',
          user_id: 'system',
          ip_address: faker.internet.ip(),
          user_agent: 'FarmIQ-Master-Service/1.0'
        },
        timestamp: customer.createdAt
      }
    });
    masterEvents.push(event);
  }

  // Generate events for farms
  for (const farm of farms) {
    const event = await prisma.masterEvent.create({
      data: {
        eventType: 'farm.created',
        entityType: 'Farm',
        entityId: farm.id,
        tenantId: farm.tenantId,
        data: {
          name: farm.name,
          farmType: farm.farmType,
          region: farm.region,
          totalArea: farm.totalArea
        },
        metadata: {
          source: 'api',
          user_id: 'system',
          ip_address: faker.internet.ip(),
          user_agent: 'FarmIQ-Master-Service/1.0'
        },
        timestamp: farm.createdAt
      }
    });
    masterEvents.push(event);
  }

  console.log(`✅ Created ${masterEvents.length} master events`);
  return masterEvents;
}

// Run the script
if (require.main === module) {
  generateCompleteMockup()
    .then(() => {
      console.log('✅ Mockup generation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Mockup generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateCompleteMockup };

