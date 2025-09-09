#!/usr/bin/env node

/**
 * Test script for analytics-alerts service
 * Run: node test-alerts.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:7306';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoint(method, endpoint, data = null, headers = {}) {
  try {
    const response = await makeRequest(method, endpoint, data, headers);
    console.log(`${method} ${endpoint} - Status: ${response.statusCode}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`✅ Response: ${JSON.stringify(response.body).substring(0, 200)}...`);
      return true;
    } else {
      console.log(`❌ Error: ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing analytics-alerts service...\n');
  
  // Mock JWT token for testing (in real scenario, you'd get this from auth service)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.test-signature';
  const authHeaders = { 'Authorization': `Bearer ${mockToken}` };
  
  const tests = [
    // Health checks
    {
      name: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      expected_status: 200
    },
    
    // Alert endpoints (will fail without proper JWT, but we can test the structure)
    {
      name: 'Get All Alerts',
      method: 'GET',
      endpoint: '/api/alerts?page=1&limit=10',
      headers: authHeaders
    },
    {
      name: 'Get Alerts by Tenant',
      method: 'GET',
      endpoint: '/api/alerts/tenant/tenant1?page=1&limit=10',
      headers: authHeaders
    },
    {
      name: 'Get Unresolved Alerts',
      method: 'GET',
      endpoint: '/api/alerts/unresolved?page=1&limit=10',
      headers: authHeaders
    },
    {
      name: 'Create Alert',
      method: 'POST',
      endpoint: '/api/alerts',
      data: {
        type: 'temperature_anomaly',
        message: 'Temperature exceeded threshold',
        metadata: { threshold: 30, current: 35 },
        tenant_id: 'tenant1',
        factory_id: 'factory1',
        device_id: 'device1',
        metric: 'temperature',
        value: 35.5,
        alert_time: new Date().toISOString(),
        severity: 'high',
        alert_type: 'threshold_exceeded'
      },
      headers: authHeaders
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n🔍 Testing: ${test.name}`);
    const success = await testEndpoint(
      test.method,
      test.endpoint,
      test.data,
      test.headers || {}
    );
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Service is working correctly.');
    return true;
  } else {
    console.log('💥 Some tests failed. Check the service logs.');
    return false;
  }
}

async function checkServiceStatus() {
  console.log('\n🔍 Checking service status...');
  
  try {
    const response = await makeRequest('GET', '/health');
    
    if (response.statusCode === 200) {
      console.log('✅ Service is running and healthy');
      console.log(`📊 Health Response: ${JSON.stringify(response.body)}`);
      return true;
    } else {
      console.log(`❌ Service health check failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to service: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    const isHealthy = await checkServiceStatus();
    if (isHealthy) {
      await runTests();
    } else {
      console.log('❌ Service not responding. Make sure to start the service first:');
      console.log('  npm run dev');
      console.log('  or');
      console.log('  docker-compose -f ../../../docker-compose.apps.yml up analytics-alerts --build');
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runTests, checkServiceStatus };
