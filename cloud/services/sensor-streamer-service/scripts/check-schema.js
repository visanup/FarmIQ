#!/usr/bin/env node

/**
 * Check Database Schema
 * Shows current table structure
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchema() {
  console.log('🔍 Checking database schema...');

  try {
    // Check if TimescaleDB extension exists
    const extensions = await prisma.$queryRaw`
      SELECT extname, extversion FROM pg_extension WHERE extname = 'timescaledb';
    `;
    
    if (extensions.length > 0) {
      console.log(`✅ TimescaleDB extension found: ${extensions[0].extversion}`);
    } else {
      console.log('❌ TimescaleDB extension not found');
    }

    // Check tables in sensors schema
    const tables = await prisma.$queryRaw`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'sensors'
      ORDER BY table_name;
    `;
    
    console.log('\n📊 Tables in sensors schema:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });

    // Check columns for each table
    for (const table of tables) {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'sensors' AND table_name = ${table.table_name}
        ORDER BY ordinal_position;
      `;
      
      console.log(`\n🔍 Columns in ${table.table_name}:`);
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
