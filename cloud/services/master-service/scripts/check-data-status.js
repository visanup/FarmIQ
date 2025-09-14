const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Map Prisma model names to delegate names on PrismaClient
const prismaDelegateMap = {
  Customer: 'customer',
  Farm: 'farm',
  House: 'house',
  Device: 'device',
  AnimalType: 'animalType',
  Breed: 'breed',
  Flock: 'flock',
  DeviceType: 'deviceType',
  SensorType: 'sensorType',
  FeedType: 'feedType',
  Formula: 'formula',
  EconomicData: 'economicData',
  ExternalDataSource: 'externalDataSource',
  Zone: 'zone',
  Station: 'station',
  DeviceHealth: 'deviceHealth',
  MasterEvent: 'masterEvent'
};

// =====================================================
// CHECK DATA STATUS IN ALL TABLES
// =====================================================

async function checkDataStatus() {
  console.log('🔍 Checking data status in all tables...');
  
  try {
    const results = {};
    
    // Check all tables
    const tables = [
      'Customer',
      'Farm',
      'House',
      'Device',
      'AnimalType',
      'Breed',
      'Flock',
      'DeviceType',
      'SensorType',
      'FeedType',
      'Formula',
      'EconomicData',
      'ExternalDataSource',
      'Zone',
      'Station',
      'DeviceHealth',
      'MasterEvent'
    ];
    
    for (const table of tables) {
      try {
        const delegate = prismaDelegateMap[table];
        if (!delegate || !prisma[delegate] || typeof prisma[delegate].count !== 'function') {
          throw new Error(`Unknown Prisma delegate for table ${table}`);
        }
        const count = await prisma[delegate].count();
        results[table] = count;
        console.log(`✅ ${table}: ${count} records`);
      } catch (error) {
        results[table] = `Error: ${error.message}`;
        console.log(`❌ ${table}: Error - ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n📊 Summary:');
    const totalRecords = Object.values(results).reduce((sum, count) => {
      return typeof count === 'number' ? sum + count : sum;
    }, 0);
    
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Tables with data: ${Object.values(results).filter(count => typeof count === 'number' && count > 0).length}`);
    console.log(`   Empty tables: ${Object.values(results).filter(count => typeof count === 'number' && count === 0).length}`);
    console.log(`   Error tables: ${Object.values(results).filter(count => typeof count === 'string').length}`);
    
    // Check relationships
    console.log('\n🔗 Relationship checks:');
    await checkRelationships();
    
  } catch (error) {
    console.error('❌ Data status check failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkRelationships() {
  try {
    // Check Customer -> Farm relationships
    const customersWithFarms = await prisma.customer.findMany({
      include: { farms: true }
    });
    console.log(`   Customers with farms: ${customersWithFarms.filter(c => c.farms.length > 0).length}/${customersWithFarms.length}`);
    
    // Check Farm -> House relationships
    const farmsWithHouses = await prisma.farm.findMany({
      include: { houses: true }
    });
    console.log(`   Farms with houses: ${farmsWithHouses.filter(f => f.houses.length > 0).length}/${farmsWithHouses.length}`);
    
    // Check House -> Device relationships
    const housesWithDevices = await prisma.house.findMany({
      include: { devices: true }
    });
    console.log(`   Houses with devices: ${housesWithDevices.filter(h => h.devices.length > 0).length}/${housesWithDevices.length}`);
    
    // Check AnimalType -> Breed relationships
    const animalTypesWithBreeds = await prisma.animalType.findMany({
      include: { breeds: true }
    });
    console.log(`   Animal types with breeds: ${animalTypesWithBreeds.filter(at => at.breeds.length > 0).length}/${animalTypesWithBreeds.length}`);
    
    // Check Flock relationships
    const flocksWithRelations = await prisma.flock.findMany({
      include: {
        farm: true,
        house: true,
        animalType: true,
        breed: true
      }
    });
    console.log(`   Flocks with complete relationships: ${flocksWithRelations.length}`);
    
  } catch (error) {
    console.log(`   Relationship check error: ${error.message}`);
  }
}

// Run the script
if (require.main === module) {
  checkDataStatus()
    .then(() => {
      console.log('✅ Data status check completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Data status check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDataStatus };

