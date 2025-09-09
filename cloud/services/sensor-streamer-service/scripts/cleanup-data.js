#!/usr/bin/env node

/**
 * Data Cleanup Script
 * Cleans up old data based on retention policies
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOldData(daysToKeep = 365) {
  console.log(`🧹 Cleaning up data older than ${daysToKeep} days...`);

  try {
    // Use the cleanup function we created
    const result = await prisma.$queryRaw`
      SELECT sensors.cleanup_old_data(${daysToKeep}) as deleted_count;
    `;

    const deletedCount = result[0].deleted_count;
    console.log(`✅ Cleaned up ${deletedCount.toLocaleString()} old records`);

    // Show current data distribution
    console.log('\n📊 Current data distribution:');
    
    const dataDistribution = await prisma.$queryRaw`
      SELECT 
        'sensor_readings' as table_name,
        COUNT(*) as total_records,
        MIN(timestamp) as earliest_record,
        MAX(timestamp) as latest_record
      FROM sensors.sensor_readings
      UNION ALL
      SELECT 
        'sweep_readings' as table_name,
        COUNT(*) as total_records,
        MIN(timestamp) as earliest_record,
        MAX(timestamp) as latest_record
      FROM sensors.sweep_readings
      UNION ALL
      SELECT 
        'lab_readings' as table_name,
        COUNT(*) as total_records,
        MIN(timestamp) as earliest_record,
        MAX(timestamp) as latest_record
      FROM sensors.lab_readings
      ORDER BY total_records DESC;
    `;

    dataDistribution.forEach(table => {
      console.log(`   ${table.table_name}: ${table.total_records.toLocaleString()} records`);
      console.log(`     Date range: ${table.earliest_record} to ${table.latest_record}`);
    });

    // Vacuum analyze to reclaim space
    console.log('\n🔧 Running VACUUM ANALYZE to reclaim space...');
    await prisma.$executeRaw`VACUUM ANALYZE;`;
    console.log('✅ VACUUM ANALYZE completed');

  } catch (error) {
    console.error('❌ Data cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const daysToKeep = args[0] ? parseInt(args[0]) : 365;

if (isNaN(daysToKeep) || daysToKeep < 1) {
  console.error('❌ Invalid number of days. Please provide a positive integer.');
  process.exit(1);
}

// Run if called directly
if (require.main === module) {
  cleanupOldData(daysToKeep);
}

module.exports = { cleanupOldData };

