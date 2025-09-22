#!/usr/bin/env python3
"""
Test script for analytics calculator
Run this to manually trigger analytics calculations
"""

import sys
import os
import logging
from datetime import datetime, timezone, timedelta

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.workers.analytics_scheduler import AnalyticsScheduler

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_analytics_calculator():
    """Test the analytics calculator manually"""
    logger.info("🚀 Starting manual analytics calculation test...")
    
    try:
        scheduler = AnalyticsScheduler()
        
        # Test getting active farms
        logger.info("📊 Getting active farms...")
        farms = scheduler.get_active_farms()
        logger.info(f"Found {len(farms)} active farms: {farms}")
        
        if not farms:
            logger.warning("No active farms found. Make sure data exists in minute_features table.")
            return
        
        # Test hourly analytics (most recent data)
        logger.info("⏰ Running hourly analytics...")
        scheduler.run_hourly_analytics()
        
        # Test daily analytics
        logger.info("📅 Running daily analytics...")
        scheduler.run_daily_analytics()
        
        # Test weekly analytics
        logger.info("📆 Running weekly analytics...")
        scheduler.run_weekly_analytics()
        
        logger.info("✅ Analytics calculation test completed!")
        
    except Exception as e:
        logger.error(f"❌ Error in analytics calculation test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analytics_calculator()
