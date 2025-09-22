#!/usr/bin/env python3
"""
Test script for analytics worker API
Run this to test analytics calculations via API
"""

import requests
import json
import time

# Analytics Worker API base URL
BASE_URL = "http://localhost:7305/v1"

def test_health():
    """Test health endpoint"""
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_active_farms():
    """Test active farms endpoint"""
    print("\n🏭 Testing active farms endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/analytics/farms")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Active farms check failed: {e}")
        return False

def test_hourly_analytics():
    """Test hourly analytics trigger"""
    print("\n⏰ Testing hourly analytics trigger...")
    try:
        response = requests.post(f"{BASE_URL}/analytics/trigger/hourly")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Hourly analytics failed: {e}")
        return False

def test_daily_analytics():
    """Test daily analytics trigger"""
    print("\n📅 Testing daily analytics trigger...")
    try:
        response = requests.post(f"{BASE_URL}/analytics/trigger/daily")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Daily analytics failed: {e}")
        return False

def test_weekly_analytics():
    """Test weekly analytics trigger"""
    print("\n📆 Testing weekly analytics trigger...")
    try:
        response = requests.post(f"{BASE_URL}/analytics/trigger/weekly")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Weekly analytics failed: {e}")
        return False

def test_all_analytics():
    """Test all analytics trigger"""
    print("\n🚀 Testing all analytics trigger...")
    try:
        response = requests.post(f"{BASE_URL}/analytics/trigger/all")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ All analytics failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Starting Analytics Worker API Tests")
    print("=" * 50)
    
    # Test health first
    if not test_health():
        print("❌ Health check failed. Make sure analytics-worker is running on port 7305")
        return
    
    # Test active farms
    test_active_farms()
    
    # Test analytics triggers
    print("\n" + "=" * 50)
    print("🧮 Testing Analytics Calculations")
    print("=" * 50)
    
    # Test individual triggers
    test_hourly_analytics()
    time.sleep(2)  # Small delay between tests
    
    test_daily_analytics()
    time.sleep(2)
    
    test_weekly_analytics()
    time.sleep(2)
    
    # Test all analytics
    print("\n" + "=" * 50)
    print("🎯 Testing All Analytics (Recommended)")
    print("=" * 50)
    test_all_analytics()
    
    print("\n✅ All tests completed!")
    print("\n📊 Check the database for new analytics data:")
    print("   - analytics.fcr_calculation")
    print("   - analytics.health_metrics") 
    print("   - analytics.production_metrics")

if __name__ == "__main__":
    main()
