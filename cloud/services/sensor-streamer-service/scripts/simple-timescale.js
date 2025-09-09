#!/usr/bin/env node

/**
 * Simple TimescaleDB Setup
 * Basic hypertable creation without complex functions
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupSimpleTimescale() {
  console.log('🚀 Setting up TimescaleDB (Simple)...');

  try {
    // Create hypertables one by one
    const tables = [
      'sensor_readings',
      'sweep_readings', 
      'lab_readings',
      'data_ingestion_logs'
    ];

    for (const table of tables) {
      try {
        console.log(`📊 Creating hypertable: ${table}`);
        await prisma.$executeRawUnsafe(`SELECT create_hypertable('sensors.${table}', 'timestamp');`);
        console.log(`✅ Hypertable created: ${table}`);
      } catch (error) {
        if (error.message.includes('already a hypertable')) {
          console.log(`⚠️  ${table} is already a hypertable`);
        } else {
          console.log(`❌ Failed to create hypertable ${table}: ${error.message}`);
        }
      }
    }

    // Create basic indexes
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_timestamp ON sensors.sensor_readings (device_id, timestamp DESC);",
      "CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_type ON sensors.sensor_readings (sensor_type);",
      "CREATE INDEX IF NOT EXISTS idx_sweep_readings_device_timestamp ON sensors.sweep_readings (device_id, timestamp DESC);",
      "CREATE INDEX IF NOT EXISTS idx_lab_readings_sample_timestamp ON sensors.lab_readings (sample_id, timestamp DESC);",
      "CREATE INDEX IF NOT EXISTS idx_lab_readings_test_type ON sensors.lab_readings (test_type);"
    ];

    for (const index of indexes) {
      try {
        console.log(`📊 Creating index...`);
        await prisma.$executeRawUnsafe(index);
        console.log(`✅ Index created`);
      } catch (error) {
        console.log(`⚠️  Index creation failed (may already exist): ${error.message}`);
      }
    }

    // Verify installation
    console.log('✅ Verifying TimescaleDB installation...');
    
    const timescaleVersion = await prisma.$queryRaw`
      SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';
    `;

    if (timescaleVersion.length > 0) {
      console.log(`✅ TimescaleDB version ${timescaleVersion[0].extversion} installed successfully`);
    } else {
      throw new Error('TimescaleDB extension not found');
    }

    // Check hypertables
    const hypertables = await prisma.$queryRaw`
      SELECT count(*) as count FROM timescaledb_information.hypertables WHERE hypertable_schema = 'sensors';
    `;

    console.log(`✅ Found ${hypertables[0].count} hypertables in sensors schema`);

    console.log('🎉 TimescaleDB setup completed successfully!');

  } catch (error) {
    console.error('❌ TimescaleDB setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupSimpleTimescale();
