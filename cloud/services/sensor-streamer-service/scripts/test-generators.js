#!/usr/bin/env node

/**
 * Test Data Generators
 * 
 * This script tests the data generators with minimal data
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runScript(scriptName, description) {
  console.log(`\n🚀 ${description}...`);
  console.log(`📁 Running: node scripts/${scriptName}`);
  
  try {
    // All scripts now run directly without confirmation
    const command = `node scripts/${scriptName}`;
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minutes timeout
      maxBuffer: 1024 * 1024 * 5 // 5MB buffer
    });
    
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
    
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Data Generators with Minimal Data...');
  console.log('📋 This will test each generator individually');
  
  const scripts = [
    { file: 'clear-all-tables.js', description: 'Clearing all tables' },
    { file: 'generate-device-health.js', description: 'Generating device health data' },
    { file: 'generate-sensor-readings.js', description: 'Generating sensor readings data (7 days, 5 sensors)' },
    { file: 'generate-lab-readings.js', description: 'Generating lab readings data' },
    { file: 'generate-sweep-readings.js', description: 'Generating sweep readings data' },
    { file: 'generate-data-ingestion-logs.js', description: 'Generating data ingestion logs' },
    { file: 'generate-stream-states.js', description: 'Generating stream states' },
    { file: 'generate-device-configurations.js', description: 'Generating device configurations' },
    { file: 'generate-sensor-alerts.js', description: 'Generating sensor alerts' },
    { file: 'generate-data-quality-checks.js', description: 'Generating data quality checks' }
  ];
  
  let successCount = 0;
  let totalCount = scripts.length;
  
  for (const script of scripts) {
    const success = await runScript(script.file, script.description);
    if (success) {
      successCount++;
    }
    
    // Add delay between scripts
    console.log('⏳ Waiting 5 seconds before next script...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`\n🎉 Test Complete!`);
  console.log(`📊 Successfully completed: ${successCount}/${totalCount} scripts`);
  
  if (successCount === totalCount) {
    console.log('✅ All scripts completed successfully!');
  } else {
    console.log('⚠️ Some scripts failed. Please check the logs above.');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
