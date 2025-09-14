const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

// =====================================================
// CLEANUP ALL DATA FROM ALL TABLES
// =====================================================

async function cleanupAllData() {
  console.log('🧹 Starting cleanup of all master data...');
  
  try {
    // Clear all tables in reverse dependency order
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
    
    for (const table of clearOrder) {
      try {
        const delegate = prismaDelegateMap[table];
        if (!delegate || !prisma[delegate] || typeof prisma[delegate].deleteMany !== 'function') {
          throw new Error(`Unknown Prisma delegate for table ${table}`);
        }
        const result = await prisma[delegate].deleteMany({});
        console.log(`✅ Cleared ${table}: ${result.count} records deleted`);
      } catch (error) {
        console.log(`⚠️  Could not clear ${table}: ${error.message}`);
      }
    }
    
    console.log('✅ All data cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  cleanupAllData()
    .then(() => {
      console.log('✅ Cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupAllData };

