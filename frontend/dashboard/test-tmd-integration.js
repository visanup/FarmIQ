// Test script for TMD Weather Service Integration
import { weatherService, THAILAND_REGIONS } from '../src/services/weather';

async function testTMDIntegration() {
  console.log('🌤️  Testing TMD Weather Service Integration');
  console.log('==========================================');
  
  try {
    // Test available regions
    console.log('\n📍 Available Thailand Regions:');
    Object.keys(THAILAND_REGIONS).forEach((region, index) => {
      const coords = THAILAND_REGIONS[region as keyof typeof THAILAND_REGIONS];
      console.log(`${index + 1}. ${region}: ${coords.lat1}°N-${coords.lat2}°N, ${coords.lon1}°E-${coords.lon2}°E`);
    });

    // Test weather data for Chiang Mai
    console.log('\n🌡️  Testing Weather Data for Chiang Mai:');
    const weatherData = await weatherService.getRegionWeather('Chiang Mai');
    
    console.log(`\nLocation: ${weatherData.location}`);
    console.log(`Coordinates: ${weatherData.coordinates.lat.toFixed(4)}°N, ${weatherData.coordinates.lon.toFixed(4)}°E`);
    
    console.log('\nCurrent Conditions:');
    console.log(`  Temperature: ${weatherData.current.temperature}°C`);
    console.log(`  Condition: ${weatherData.current.condition}`);
    console.log(`  Humidity: ${weatherData.current.humidity}%`);
    console.log(`  Wind: ${weatherData.current.windSpeed.toFixed(1)} km/h ${weatherData.current.windDirection}`);
    console.log(`  Pressure: ${weatherData.current.pressure.toFixed(1)} hPa`);
    console.log(`  Rainfall: ${weatherData.current.rainfall}mm`);
    
    console.log(`\nForecast Data Points: ${weatherData.forecast.length}`);
    
    // Show next 6 hours forecast
    console.log('\nNext 6 Hours Forecast:');
    weatherData.forecast.slice(0, 6).forEach((forecast, index) => {
      console.log(`  Hour ${index + 1}: ${forecast.temperature}°C, ${forecast.condition}, ${forecast.rainfall}mm rain`);
    });

    // Test weather alerts
    const alerts = weatherService.getWeatherAlerts(weatherData);
    console.log(`\n⚠️  Weather Alerts: ${alerts.length}`);
    alerts.forEach((alert, index) => {
      console.log(`  ${index + 1}. [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`);
    });

    // Test domain info
    console.log('\n📊 TMD Domain Information:');
    const domainInfo = await weatherService.getDomainInfo();
    domainInfo.forEach((domain) => {
      console.log(`  Domain ${domain.domain}: ${domain.min} to ${domain.max}`);
    });

    console.log('\n✅ TMD Weather Service Integration Test Completed Successfully!');
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
  }
}

// Export test function for manual testing
export { testTMDIntegration };

// Auto-run if this is executed directly
if (typeof window === 'undefined') {
  testTMDIntegration();
}