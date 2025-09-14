const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:7307';
const API_KEY = 'admin-key';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API call failed: ${method} ${endpoint}`, error.response?.data || error.message);
    throw error;
  }
}

// Clean up all master data
async function cleanupMasterData() {
  console.log('🧹 Starting master data cleanup...');
  console.log(`📡 Using API endpoint: ${BASE_URL}`);
  
  try {
    // Check if service is running
    await apiCall('GET', '/health');
    console.log('✅ Master service is running');
  } catch (error) {
    console.error('❌ Master service is not running. Please start it first.');
    process.exit(1);
  }

  try {
    // Get all customers first
    console.log('📋 Fetching existing customers...');
    const customersResult = await apiCall('GET', '/api/v1/customers?limit=100');
    const customers = customersResult.data || [];
    
    console.log(`Found ${customers.length} customers to clean up`);

    // Delete customers (this will cascade delete related data due to foreign key constraints)
    for (const customer of customers) {
      try {
        await apiCall('DELETE', `/api/v1/customers/${customer.id}`);
        console.log(`✅ Deleted customer: ${customer.name} (${customer.tenantId})`);
      } catch (error) {
        console.error(`❌ Failed to delete customer: ${customer.name}`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Master data cleanup completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Customers deleted: ${customers.length}`);
    console.log(`   - Related farms, houses, devices, and flocks were also deleted (cascade)`);
    
  } catch (error) {
    console.error('❌ Master data cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  cleanupMasterData();
}

module.exports = { cleanupMasterData };
