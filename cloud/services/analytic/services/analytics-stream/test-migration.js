#!/usr/bin/env node

/**
 * Test script for analytics-stream Fastify + Prisma migration
 * Run: node test-migration.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:7303';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTests() {
  console.log('🧪 Testing analytics-stream migration...\n');

  const tests = [
    {
      name: 'Health Check',
      path: '/health',
      expectedStatus: 200,
      expectedData: { ok: true }
    },
    {
      name: 'Readiness Check',
      path: '/ready',
      expectedStatus: 200,
      expectedData: { ok: true }
    },
    {
      name: 'Metrics Endpoint',
      path: '/metrics',
      expectedStatus: 200,
      expectedData: null // Prometheus metrics format
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await makeRequest(test.path);
      
      if (result.status === test.expectedStatus) {
        if (test.expectedData === null || 
            JSON.stringify(result.data) === JSON.stringify(test.expectedData)) {
          console.log(`✅ ${test.name}: PASSED`);
          passed++;
        } else {
          console.log(`❌ ${test.name}: FAILED - Unexpected data:`, result.data);
          failed++;
        }
      } else {
        console.log(`❌ ${test.name}: FAILED - Expected status ${test.expectedStatus}, got ${result.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Migration successful.');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed. Check the service logs.');
    process.exit(1);
  }
}

// Check if service is running
makeRequest('/health')
  .then(() => runTests())
  .catch((error) => {
    console.log('❌ Service not running or not accessible at', BASE_URL);
    console.log('Make sure to start the service first:');
    console.log('  yarn dev');
    console.log('  or');
    console.log('  docker-compose -f ../../../docker-compose.apps.yml up analytics-stream --build');
    process.exit(1);
  });
