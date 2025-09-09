#!/usr/bin/env node

/**
 * Database Statistics Script
 * Shows database statistics, hypertable information, and performance metrics
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showDatabaseStats() {
  console.log('📊 FarmIQ Sensor Streamer Database Statistics\n');

  try {
    // TimescaleDB version
    console.log('🔧 TimescaleDB Information:');
    const timescaleVersion = await prisma.$queryRaw`
      SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';
    `;
    console.log(`   Version: ${timescaleVersion[0]?.extversion || 'Not installed'}\n`);

    // Hypertables information
    console.log('📈 Hypertables:');
    const hypertables = await prisma.$queryRaw`
      SELECT 
        hypertable_name,
        num_dimensions,
        num_chunks,
        pg_size_pretty(hypertable_size) as size
      FROM timescaledb_information.hypertables 
      WHERE schema_name = 'sensors'
      ORDER BY hypertable_name;
    `;

    hypertables.forEach(table => {
      console.log(`   ${table.hypertable_name}:`);
      console.log(`     Dimensions: ${table.num_dimensions}`);
      console.log(`     Chunks: ${table.num_chunks}`);
      console.log(`     Size: ${table.size}\n`);
    });

    // Continuous aggregates
    console.log('🔄 Continuous Aggregates:');
    const aggregates = await prisma.$queryRaw`
      SELECT 
        view_name,
        materialization_hypertable,
        view_definition
      FROM timescaledb_information.continuous_aggregates 
      WHERE view_schema = 'sensors'
      ORDER BY view_name;
    `;

    aggregates.forEach(agg => {
      console.log(`   ${agg.view_name}:`);
      console.log(`     Materialization Table: ${agg.materialization_hypertable}\n`);
    });

    // Data retention policies
    console.log('🗑️  Data Retention Policies:');
    const retentionPolicies = await prisma.$queryRaw`
      SELECT 
        hypertable_name,
        interval_length,
        created_at
      FROM timescaledb_information.data_retention_policies
      WHERE schema_name = 'sensors'
      ORDER BY hypertable_name;
    `;

    retentionPolicies.forEach(policy => {
      console.log(`   ${policy.hypertable_name}: ${policy.interval_length}\n`);
    });

    // Compression settings
    console.log('🗜️  Compression Settings:');
    const compressionSettings = await prisma.$queryRaw`
      SELECT 
        hypertable_name,
        compression_enabled,
        compression_ratio
      FROM timescaledb_information.compression_settings
      WHERE schema_name = 'sensors'
      ORDER BY hypertable_name;
    `;

    compressionSettings.forEach(setting => {
      console.log(`   ${setting.hypertable_name}:`);
      console.log(`     Enabled: ${setting.compression_enabled}`);
      console.log(`     Ratio: ${setting.compression_ratio || 'N/A'}\n`);
    });

    // Table row counts
    console.log('📊 Table Statistics:');
    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables 
      WHERE schemaname = 'sensors'
      ORDER BY n_live_tup DESC;
    `;

    tableStats.forEach(table => {
      console.log(`   ${table.tablename}:`);
      console.log(`     Live Rows: ${table.live_rows.toLocaleString()}`);
      console.log(`     Dead Rows: ${table.dead_rows.toLocaleString()}`);
      console.log(`     Inserts: ${table.inserts.toLocaleString()}`);
      console.log(`     Updates: ${table.updates.toLocaleString()}`);
      console.log(`     Deletes: ${table.deletes.toLocaleString()}\n`);
    });

    // Recent data activity
    console.log('⏰ Recent Data Activity:');
    const recentActivity = await prisma.$queryRaw`
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

    recentActivity.forEach(activity => {
      console.log(`   ${activity.table_name}:`);
      console.log(`     Total Records: ${activity.total_records.toLocaleString()}`);
      console.log(`     Date Range: ${activity.earliest_record} to ${activity.latest_record}\n`);
    });

  } catch (error) {
    console.error('❌ Error retrieving database statistics:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  showDatabaseStats();
}

module.exports = { showDatabaseStats };

