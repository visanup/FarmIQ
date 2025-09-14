#!/usr/bin/env node

/**
 * Migration Status Dashboard
 * Shows current migration status and progress
 */

const { PrismaClient } = require('@prisma/client');

const masterPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL || 'postgresql://postgres:postgres1611@localhost:15432/agroatlas?schema=master'
    }
  }
});

class MigrationStatus {
  constructor() {
    this.entities = [
      { name: 'Customers', table: 'Customer', color: '🟢' },
      { name: 'Farms', table: 'Farm', color: '🟡' },
      { name: 'Houses', table: 'House', color: '🟠' },
      { name: 'Flocks', table: 'Flock', color: '🔵' },
      { name: 'Devices', table: 'Device', color: '🟣' },
      { name: 'Device Types', table: 'DeviceType', color: '⚪' },
      { name: 'Device Groups', table: 'DeviceGroup', color: '⚫' },
      { name: 'Feed Types', table: 'FeedType', color: '🟤' },
      { name: 'Formulas', table: 'Formula', color: '🔴' },
      { name: 'Economic Data', table: 'EconomicData', color: '🟢' },
      { name: 'External Data Sources', table: 'ExternalDataSource', color: '🟡' },
      { name: 'Zones', table: 'Zone', color: '🟠' },
      { name: 'Master Events', table: 'MasterEvent', color: '🔵' }
    ];
  }

  async showStatus() {
    console.log('📊 Migration Status Dashboard');
    console.log('============================');
    console.log(`Generated at: ${new Date().toLocaleString()}`);
    console.log('');

    try {
      // Get counts for each entity
      const counts = await this.getEntityCounts();
      
      // Display status table
      this.displayStatusTable(counts);
      
      // Display summary
      this.displaySummary(counts);
      
      // Display recent activity
      await this.displayRecentActivity();
      
    } catch (error) {
      console.error('❌ Failed to get migration status:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async getEntityCounts() {
    const counts = {};
    
    for (const entity of this.entities) {
      try {
        const count = await masterPrisma[entity.table].count();
        counts[entity.name] = count;
      } catch (error) {
        counts[entity.name] = 0;
      }
    }
    
    return counts;
  }

  displayStatusTable(counts) {
    console.log('📋 Entity Status:');
    console.log('-----------------');
    
    // Calculate column widths
    const nameWidth = Math.max(...this.entities.map(e => e.name.length)) + 2;
    const countWidth = 10;
    const statusWidth = 15;
    
    // Header
    console.log(
      'Entity'.padEnd(nameWidth) +
      'Count'.padStart(countWidth) +
      'Status'.padStart(statusWidth)
    );
    console.log('-'.repeat(nameWidth + countWidth + statusWidth));
    
    // Rows
    for (const entity of this.entities) {
      const count = counts[entity.name] || 0;
      const status = count > 0 ? '✅ Migrated' : '⏳ Pending';
      
      console.log(
        entity.name.padEnd(nameWidth) +
        count.toString().padStart(countWidth) +
        status.padStart(statusWidth)
      );
    }
    
    console.log('');
  }

  displaySummary(counts) {
    const totalEntities = this.entities.length;
    const migratedEntities = Object.values(counts).filter(count => count > 0).length;
    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    console.log('📈 Summary:');
    console.log('-----------');
    console.log(`Total Entities: ${totalEntities}`);
    console.log(`Migrated Entities: ${migratedEntities}`);
    console.log(`Migration Progress: ${((migratedEntities / totalEntities) * 100).toFixed(1)}%`);
    console.log(`Total Records: ${totalRecords.toLocaleString()}`);
    console.log('');
  }

  async displayRecentActivity() {
    console.log('🕒 Recent Activity:');
    console.log('------------------');
    
    try {
      // Get recent master events
      const recentEvents = await masterPrisma.masterEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          type: true,
          title: true,
          createdAt: true,
          status: true
        }
      });
      
      if (recentEvents.length === 0) {
        console.log('No recent activity found.');
        return;
      }
      
      for (const event of recentEvents) {
        const timeAgo = this.getTimeAgo(event.createdAt);
        console.log(
          `${event.type.padEnd(15)} ${event.title.padEnd(30)} ${timeAgo.padEnd(10)} ${event.status}`
        );
      }
      
    } catch (error) {
      console.log('Unable to fetch recent activity.');
    }
    
    console.log('');
  }

  getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  async cleanup() {
    await masterPrisma.$disconnect();
  }
}

// Run status if called directly
if (require.main === module) {
  const status = new MigrationStatus();
  status.showStatus()
    .then(() => {
      console.log('✅ Status check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Status check failed:', error);
      process.exit(1);
    });
}

module.exports = MigrationStatus;
