#!/usr/bin/env node

/**
 * Simple Migration Validation Script
 * Validates basic migration status
 */

const { PrismaClient } = require('@prisma/client');

const masterPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL || 'postgresql://postgres:postgres1611@localhost:15432/agroatlas?schema=master'
    }
  }
});

class SimpleValidator {
  constructor() {
    this.results = {};
  }

  async validate() {
    console.log('🔍 Starting Simple Migration Validation...');
    console.log('==========================================');
    
    try {
      // Test database connection
      await masterPrisma.$connect();
      console.log('✅ Database connection successful');
      
      // Check available tables
      await this.checkTables();
      
      // Generate simple report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async checkTables() {
    console.log('\n📋 Checking Master Service Tables:');
    console.log('-----------------------------------');
    
    const tables = [
      'Customer',
      'Farm', 
      'House',
      'Flock',
      'Device',
      'DeviceType',
      'DeviceGroup',
      'FeedType',
      'Formula',
      'EconomicData',
      'ExternalDataSource',
      'Zone',
      'MasterEvent'
    ];

    for (const table of tables) {
      try {
        const count = await masterPrisma[table].count();
        this.results[table] = count;
        console.log(`${table.padEnd(20)}: ${count.toString().padStart(6)} records`);
      } catch (error) {
        this.results[table] = 0;
        console.log(`${table.padEnd(20)}: Not available`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 Migration Status Summary:');
    console.log('=============================');
    
    const totalRecords = Object.values(this.results).reduce((sum, count) => sum + count, 0);
    const availableTables = Object.values(this.results).filter(count => count > 0).length;
    const totalTables = Object.keys(this.results).length;
    
    console.log(`Total Tables: ${totalTables}`);
    console.log(`Available Tables: ${availableTables}`);
    console.log(`Total Records: ${totalRecords.toLocaleString()}`);
    console.log(`Migration Progress: ${((availableTables / totalTables) * 100).toFixed(1)}%`);
    
    if (totalRecords === 0) {
      console.log('\n⚠️  No data found. Ready to start migration.');
    } else {
      console.log('\n✅ Data found. Migration may have already started.');
    }
  }

  async cleanup() {
    await masterPrisma.$disconnect();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SimpleValidator();
  validator.validate()
    .then(() => {
      console.log('✅ Simple validation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Simple validation failed:', error);
      process.exit(1);
    });
}

module.exports = SimpleValidator;

