#!/usr/bin/env node

/**
 * Clear All Tables Script
 * 
 * This script clears ALL data from all tables in the sensors schema
 * WARNING: This will permanently delete all data!
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllTables() {
  console.log('🗑️  Starting to clear all tables...');
  console.log('⚠️  WARNING: This will delete ALL data from all tables!');
  
  try {
    // Clear junction tables first (to avoid foreign key constraints)
    console.log('\n1. Clearing junction tables...');
    
    // Clear DataQualityCheck relationships
    await prisma.$executeRaw`DELETE FROM "_DataQualityCheckToDeviceReading"`;
    console.log('   ✅ Cleared _DataQualityCheckToDeviceReading');
    
    await prisma.$executeRaw`DELETE FROM "_DataQualityCheckToLabReading"`;
    console.log('   ✅ Cleared _DataQualityCheckToLabReading');
    
    await prisma.$executeRaw`DELETE FROM "_DataQualityCheckToSweepReading"`;
    console.log('   ✅ Cleared _DataQualityCheckToSweepReading');
    
    await prisma.$executeRaw`DELETE FROM "_DeviceReadingToSensorAlert"`;
    console.log('   ✅ Cleared _DeviceReadingToSensorAlert');

    // Clear main data tables
    console.log('\n2. Clearing main data tables...');
    
    await prisma.deviceReading.deleteMany();
    console.log('   ✅ Cleared device_readings');
    
    await prisma.labReading.deleteMany();
    console.log('   ✅ Cleared lab_readings');
    
    await prisma.sweepReading.deleteMany();
    console.log('   ✅ Cleared sweep_readings');
    
    await prisma.sensorAlert.deleteMany();
    console.log('   ✅ Cleared sensor_alerts');
    
    await prisma.dataQualityCheck.deleteMany();
    console.log('   ✅ Cleared data_quality_checks');

    // Clear configuration and state tables
    console.log('\n3. Clearing configuration and state tables...');
    
    await prisma.deviceConfiguration.deleteMany();
    console.log('   ✅ Cleared device_configurations');
    
    await prisma.streamState.deleteMany();
    console.log('   ✅ Cleared stream_states');
    
    await prisma.deviceHealth.deleteMany();
    console.log('   ✅ Cleared device_health');
    
    await prisma.dataIngestionLog.deleteMany();
    console.log('   ✅ Cleared data_ingestion_logs');

    // Show final counts
    console.log('\n4. Verifying cleanup...');
    
    const counts = await Promise.all([
      prisma.deviceReading.count(),
      prisma.labReading.count(),
      prisma.sweepReading.count(),
      prisma.sensorAlert.count(),
      prisma.dataQualityCheck.count(),
      prisma.deviceHealth.count(),
      prisma.streamState.count(),
      prisma.deviceConfiguration.count(),
      prisma.dataIngestionLog.count()
    ]);

    console.log('\n📊 Final table counts:');
    console.log(`   device_readings: ${counts[0]}`);
    console.log(`   lab_readings: ${counts[1]}`);
    console.log(`   sweep_readings: ${counts[2]}`);
    console.log(`   sensor_alerts: ${counts[3]}`);
    console.log(`   data_quality_checks: ${counts[4]}`);
    console.log(`   device_health: ${counts[5]}`);
    console.log(`   stream_states: ${counts[6]}`);
    console.log(`   device_configurations: ${counts[7]}`);
    console.log(`   data_ingestion_logs: ${counts[8]}`);

    const totalRecords = counts.reduce((sum, count) => sum + count, 0);
    
    if (totalRecords === 0) {
      console.log('\n🎉 All tables cleared successfully!');
      console.log('✅ Database is now empty and ready for fresh data.');
    } else {
      console.log(`\n⚠️  Warning: ${totalRecords} records still remain in the database.`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Confirmation prompt
async function confirmClear() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Are you sure you want to delete ALL data? Type "YES" to confirm: ', (answer) => {
      rl.close();
      resolve(answer.toUpperCase() === 'YES');
    });
  });
}

// Main execution
async function main() {
  console.log('🧹 Clearing ALL data from the database...');
  console.log('📋 Tables that will be cleared:');
  console.log('   - device_readings');
  console.log('   - lab_readings');
  console.log('   - sweep_readings');
  console.log('   - sensor_alerts');
  console.log('   - data_quality_checks');
  console.log('   - device_health');
  console.log('   - stream_states');
  console.log('   - device_configurations');
  console.log('   - data_ingestion_logs');
  console.log('   - All junction tables\n');

  // Auto-confirm and clear all tables
  await clearAllTables();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { clearAllTables };
