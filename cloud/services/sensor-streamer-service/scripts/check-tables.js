#!/usr/bin/env node

/**
 * Check Database Tables
 * 
 * This script checks if tables exist and shows their row counts
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  try {
    // Check each table
    const tables = [
      { name: 'device_readings', model: prisma.deviceReading },
      { name: 'device_health', model: prisma.deviceHealth },
      { name: 'lab_readings', model: prisma.labReading },
      { name: 'sweep_readings', model: prisma.sweepReading },
      { name: 'data_ingestion_logs', model: prisma.dataIngestionLog },
      { name: 'stream_states', model: prisma.streamState },
      { name: 'device_configurations', model: prisma.deviceConfiguration },
      { name: 'sensor_alerts', model: prisma.sensorAlert },
      { name: 'data_quality_checks', model: prisma.dataQualityCheck }
    ];
    
    console.log('\n📊 Table Status:');
    console.log('================');
    
    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`✅ ${table.name}: ${count} records`);
      } catch (error) {
        console.log(`❌ ${table.name}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Table check completed!');
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkTables().catch(console.error);
}

module.exports = { checkTables };
