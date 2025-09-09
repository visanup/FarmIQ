#!/usr/bin/env node

/**
 * Install TimescaleDB Extension
 * Installs TimescaleDB extension first
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function installTimescale() {
  console.log('🚀 Installing TimescaleDB extension...');

  try {
    // Install TimescaleDB extension
    console.log('📦 Installing TimescaleDB extension...');
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS timescaledb;`;
    console.log('✅ TimescaleDB extension installed');

    // Verify installation
    const version = await prisma.$queryRaw`
      SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';
    `;
    
    if (version.length > 0) {
      console.log(`✅ TimescaleDB version ${version[0].extversion} is ready`);
    } else {
      throw new Error('TimescaleDB extension not found after installation');
    }

  } catch (error) {
    console.error('❌ TimescaleDB installation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

installTimescale();
