#!/usr/bin/env python3

"""
Test script for analytics-worker service
Run: python test-worker.py
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = 'http://localhost:7305'

def test_endpoint(method, endpoint, data=None, params=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, params=params, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, timeout=10)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"{method} {endpoint} - Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ Response: {json.dumps(result, indent=2, default=str)[:200]}...")
                return True
            except:
                print(f"✅ Response: {response.text[:200]}...")
                return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def run_tests():
    """Run all API tests"""
    print("🧪 Testing analytics-worker service...\n")
    
    tests = [
        # Health checks
        {
            "name": "Health Check",
            "method": "GET",
            "endpoint": "/v1/health",
            "expected_status": 200
        },
        {
            "name": "Metrics",
            "method": "GET", 
            "endpoint": "/v1/metrics",
            "expected_status": 200
        }
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        print(f"\n🔍 Testing: {test['name']}")
        success = test_endpoint(
            test["method"],
            test["endpoint"], 
            test.get("data"),
            test.get("params")
        )
        
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📊 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! Service is working correctly.")
        return True
    else:
        print("💥 Some tests failed. Check the service logs.")
        return False

def check_worker_status():
    """Check worker status and provide recommendations"""
    print("\n🔍 Checking worker status...")
    
    try:
        response = requests.get(f"{BASE_URL}/v1/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            
            print(f"📊 Service Status: {health_data.get('status', 'unknown')}")
            print(f"🗄️ Database: {health_data.get('database', 'unknown')}")
            print(f"⚙️ Worker Enabled: {health_data.get('worker_enabled', 'unknown')}")
            print(f"⏰ Scheduler Enabled: {health_data.get('scheduler_enabled', 'unknown')}")
            print(f"🧵 Active Threads: {health_data.get('active_threads', 'unknown')}")
            print(f"📝 Thread Names: {', '.join(health_data.get('thread_names', []))}")
            
            # Check if worker thread is running
            thread_names = health_data.get('thread_names', [])
            if 'analytics-stream-worker' in thread_names:
                print("✅ Kafka worker thread is running")
            else:
                print("⚠️ Kafka worker thread not found - check ENABLE_WORKER setting")
            
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to service: {e}")
        return False

if __name__ == "__main__":
    try:
        # Check if service is running
        response = requests.get(f"{BASE_URL}/v1/health", timeout=5)
        if response.status_code == 200:
            run_tests()
            check_worker_status()
        else:
            print("❌ Service not responding. Make sure to start the service first:")
            print("  python -m app.main")
            print("  or")
            print("  docker-compose -f ../../../docker-compose.apps.yml up analytics-worker --build")
    except requests.exceptions.RequestException:
        print("❌ Service not running or not accessible at", BASE_URL)
        print("Make sure to start the service first:")
        print("  python -m app.main")
        print("  or") 
        print("  docker-compose -f ../../../docker-compose.apps.yml up analytics-worker --build")
