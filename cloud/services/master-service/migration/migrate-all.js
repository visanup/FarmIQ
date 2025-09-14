#!/usr/bin/env node

/**
 * Master Migration Script
 * Orchestrates migration of all services to master-service
 */

const CustomerMigration = require('./migrate-customers');
const FarmMigration = require('./migrate-farms');
const DeviceMigration = require('./migrate-devices');

class MasterMigration {
  constructor() {
    this.migrations = [
      { name: 'Customer Service', migration: CustomerMigration, order: 1 },
      { name: 'Farm Service', migration: FarmMigration, order: 2 },
      { name: 'Device Service', migration: DeviceMigration, order: 3 }
    ];
    
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      startTime: null,
      endTime: null
    };
  }

  async migrate() {
    console.log('🚀 Starting Master Migration Process...');
    console.log('=====================================');
    
    this.stats.startTime = new Date();
    
    try {
      // Sort migrations by order
      this.migrations.sort((a, b) => a.order - b.order);
      
      for (const { name, migration: MigrationClass } of this.migrations) {
        console.log(`\n📦 Starting ${name} Migration...`);
        console.log('-----------------------------------');
        
        try {
          const migration = new MigrationClass();
          await migration.migrate();
          
          console.log(`✅ ${name} migration completed successfully!`);
          this.stats.completed++;
          
        } catch (error) {
          console.error(`❌ ${name} migration failed:`, error.message);
          this.stats.failed++;
          
          // Ask user if they want to continue
          const shouldContinue = await this.askContinue(name, error);
          if (!shouldContinue) {
            console.log('🛑 Migration stopped by user.');
            break;
          }
        }
      }
      
      this.stats.endTime = new Date();
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ Master migration failed:', error);
      throw error;
    }
  }

  async askContinue(serviceName, error) {
    // In a real implementation, you would use readline or similar
    // For now, we'll just log and continue
    console.log(`⚠️  Continuing with next service despite ${serviceName} failure...`);
    return true;
  }

  generateFinalReport() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationMinutes = Math.round(duration / 60000);
    
    console.log('\n🎉 Master Migration Complete!');
    console.log('============================');
    console.log(`Total services: ${this.migrations.length}`);
    console.log(`Completed: ${this.stats.completed}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Duration: ${durationMinutes} minutes`);
    console.log(`Success rate: ${((this.stats.completed / this.migrations.length) * 100).toFixed(2)}%`);
    
    if (this.stats.failed > 0) {
      console.log('\n⚠️  Some migrations failed. Please check the logs and retry failed services.');
    } else {
      console.log('\n✅ All migrations completed successfully!');
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new MasterMigration();
  migration.migrate()
    .then(() => {
      console.log('✅ Master migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Master migration failed:', error);
      process.exit(1);
    });
}

module.exports = MasterMigration;

