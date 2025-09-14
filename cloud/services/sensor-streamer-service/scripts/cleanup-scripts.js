#!/usr/bin/env node

/**
 * Cleanup Scripts - Remove unnecessary files
 * 
 * This script removes files that are not needed for the current setup:
 * - Database setup scripts (already done)
 * - Old mock data scripts (replaced with new ones)
 * - Documentation files (can be recreated)
 */

const fs = require('fs');
const path = require('path');

// Files to keep (essential for current setup)
const KEEP_FILES = [
  'generate-quick-mock-data.js',      // Main sensor data generator
  'generate-snapshot-data.js',       // New snapshot data generator
  'cleanup-data.js',                 // Data cleanup utility
  'database-stats.js',               // Database statistics
  'cleanup-scripts.js'               // This script
];

// Files to remove (not needed for current setup)
const REMOVE_FILES = [
  'check-schema.js',                 // Database schema check (already done)
  'correct-timescale.js',            // TimescaleDB setup (already done)
  'generate-comprehensive-mock-data.js', // Old comprehensive generator
  'generate-mock-data.js',           // Old mock data generator
  'install-timescale.js',            // TimescaleDB installation (already done)
  'setup-timescale.js',              // TimescaleDB setup (already done)
  'setup-timescaledb.bat',           // Windows TimescaleDB setup
  'setup-timescaledb.sh',            // Linux TimescaleDB setup
  'simple-mock-data.js',             // Simple mock data (replaced)
  'simple-timescale.js',             // Simple TimescaleDB (replaced)
  'README-mock-data.md',             // Old documentation
  'README-weight-data-generation.md' // Old documentation
];

// Directories to keep
const KEEP_DIRS = [
  'scripts' // Keep the scripts directory itself
];

function cleanupScripts() {
  console.log('🧹 Starting scripts cleanup...');
  
  const scriptsDir = __dirname;
  let removedCount = 0;
  let keptCount = 0;

  try {
    // Remove unnecessary files
    for (const file of REMOVE_FILES) {
      const filePath = path.join(scriptsDir, file);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`❌ Removed: ${file}`);
        removedCount++;
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    }

    // Count kept files
    for (const file of KEEP_FILES) {
      const filePath = path.join(scriptsDir, file);
      
      if (fs.existsSync(filePath)) {
        console.log(`✅ Kept: ${file}`);
        keptCount++;
      } else {
        console.log(`⚠️  Expected file not found: ${file}`);
      }
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`  - Files removed: ${removedCount}`);
    console.log(`  - Files kept: ${keptCount}`);
    console.log(`  - Total files processed: ${removedCount + keptCount}`);

    console.log(`\n📁 Current scripts directory contents:`);
    const remainingFiles = fs.readdirSync(scriptsDir);
    remainingFiles.forEach(file => {
      const filePath = path.join(scriptsDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        console.log(`  📄 ${file}`);
      } else if (stats.isDirectory()) {
        console.log(`  📁 ${file}/`);
      }
    });

    console.log(`\n🎉 Cleanup completed successfully!`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupScripts();
}

module.exports = { cleanupScripts };
