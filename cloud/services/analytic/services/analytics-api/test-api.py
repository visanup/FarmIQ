#!/usr/bin/env python3

"""
Test script for analytics-api service
Run: python test-api.py
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = 'http://localhost:7304'

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
    print("🧪 Testing analytics-api service...\n")
    
    # Test data
    now = datetime.now()
    start_time = now - timedelta(hours=1)
    end_time = now
    
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
        },
        
        # Data retrieval
        {
            "name": "Get Aggregated Data",
            "method": "GET",
            "endpoint": "/v1/agg",
            "params": {
                "tenant_id": "test_tenant",
                "factory_id": "test_factory", 
                "machine_id": "test_machine",
                "metric": "temperature",
                "window_s": 60,
                "start": start_time.isoformat(),
                "end": end_time.isoformat(),
                "limit": 10
            }
        },
        {
            "name": "Get Event Rollup",
            "method": "GET",
            "endpoint": "/v1/event-rollup",
            "params": {
                "tenant_id": "test_tenant",
                "domain": "farms",
                "entity_type": "house",
                "entity_id": "house1",
                "event_type": "feeding",
                "window_s": 300,
                "start": start_time.isoformat(),
                "end": end_time.isoformat(),
                "limit": 10
            }
        },
        
        # Analytics
        {
            "name": "Detect Anomalies",
            "method": "POST",
            "endpoint": "/v1/anomalies",
            "data": {
                "tenant_id": "test_tenant",
                "factory_id": "test_factory",
                "machine_id": "test_machine", 
                "metric": "temperature",
                "window_s": 60,
                "start": start_time.isoformat(),
                "end": end_time.isoformat(),
                "limit": 100
            }
        },
        {
            "name": "Calculate KPI",
            "method": "POST",
            "endpoint": "/v1/kpi",
            "data": {
                "period": "day",
                "metric": "temperature",
                "use_window_s": 60
            }
        },
        {
            "name": "Get KPI Data",
            "method": "GET",
            "endpoint": "/v1/kpi",
            "params": {
                "period": "day",
                "metric": "temperature",
                "limit": 10
            }
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

if __name__ == "__main__":
    try:
        # Check if service is running
        response = requests.get(f"{BASE_URL}/v1/health", timeout=5)
        if response.status_code == 200:
            run_tests()
        else:
            print("❌ Service not responding. Make sure to start the service first:")
            print("  python -m app.main")
            print("  or")
            print("  docker-compose -f ../../../docker-compose.apps.yml up analytics-api --build")
    except requests.exceptions.RequestException:
        print("❌ Service not running or not accessible at", BASE_URL)
        print("Make sure to start the service first:")
        print("  python -m app.main")
        print("  or") 
        print("  docker-compose -f ../../../docker-compose.apps.yml up analytics-api --build")
