#!/usr/bin/env node

/**
 * TimescaleDB Setup Script
 * Sets up TimescaleDB extensions, hypertables, and functions
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupTimescaleDB() {
  console.log('🚀 Setting up TimescaleDB...');

  try {
    // Read and execute TimescaleDB setup SQL
    const setupSQL = fs.readFileSync(
      path.join(__dirname, '..', 'prisma', 'migrations', '001_timescale_setup.sql'),
      'utf8'
    );

    console.log('📊 Creating hypertables and continuous aggregates...');
    
    // Split SQL into individual commands and execute them one by one
    const setupCommands = setupSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of setupCommands) {
      if (command.trim()) {
        try {
          await prisma.$executeRawUnsafe(command);
          console.log(`✅ Executed: ${command.substring(0, 50)}...`);
        } catch (error) {
          console.log(`⚠️  Command failed (may already exist): ${command.substring(0, 50)}...`);
          console.log(`   Error: ${error.message}`);
        }
      }
    }

    // Read and execute TimescaleDB functions SQL
    const functionsSQL = fs.readFileSync(
      path.join(__dirname, '..', 'prisma', 'migrations', '002_timescale_functions.sql'),
      'utf8'
    );

    console.log('🔧 Creating helper functions...');
    
    // Split functions SQL into individual commands
    const functionCommands = functionsSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of functionCommands) {
      if (command.trim()) {
        try {
          await prisma.$executeRawUnsafe(command);
          console.log(`✅ Executed: ${command.substring(0, 50)}...`);
        } catch (error) {
          console.log(`⚠️  Command failed (may already exist): ${command.substring(0, 50)}...`);
          console.log(`   Error: ${error.message}`);
        }
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

    // Check continuous aggregates
    const aggregates = await prisma.$queryRaw`
      SELECT count(*) as count FROM timescaledb_information.continuous_aggregates WHERE view_schema = 'sensors';
    `;

    console.log(`✅ Found ${aggregates[0].count} continuous aggregates`);

    console.log('🎉 TimescaleDB setup completed successfully!');

  } catch (error) {
    console.error('❌ TimescaleDB setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setupTimescaleDB();
}

module.exports = { setupTimescaleDB };

