#!/usr/bin/env node

/**
 * Correct TimescaleDB Setup
 * Uses correct column names from actual schema
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupCorrectTimescale() {
  console.log('🚀 Setting up TimescaleDB (Correct)...');

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

    // Create basic indexes with correct column names
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_timestamp ON sensors.sensor_readings (\"deviceId\", timestamp DESC);",
      "CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_type ON sensors.sensor_readings (\"sensorType\");",
      "CREATE INDEX IF NOT EXISTS idx_sweep_readings_device_timestamp ON sensors.sweep_readings (\"deviceId\", timestamp DESC);",
      "CREATE INDEX IF NOT EXISTS idx_lab_readings_sample_timestamp ON sensors.lab_readings (\"sampleId\", timestamp DESC);",
      "CREATE INDEX IF NOT EXISTS idx_lab_readings_test_type ON sensors.lab_readings (\"testType\");",
      "CREATE INDEX IF NOT EXISTS idx_data_ingestion_logs_source ON sensors.data_ingestion_logs (source);",
      "CREATE INDEX IF NOT EXISTS idx_data_ingestion_logs_data_type ON sensors.data_ingestion_logs (\"dataType\");"
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

setupCorrectTimescale();
