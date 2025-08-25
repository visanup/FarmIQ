import { ProcessedWeatherData, THAILAND_REGIONS } from './tmdService';

// Mock TMD service for development/demo purposes
class MockTMDService {
  // Generate realistic mock weather data
  private generateMockWeatherData(regionName: string): ProcessedWeatherData {
    const regionCoords = THAILAND_REGIONS[regionName as keyof typeof THAILAND_REGIONS];
    if (!regionCoords) {
      throw new Error(`Region "${regionName}" not found`);
    }

    const centerCoords = {
      lat: (regionCoords.lat1 + regionCoords.lat2) / 2,
      lon: (regionCoords.lon1 + regionCoords.lon2) / 2
    };

    // Base temperature varies by region (northern regions cooler)
    const baseTemp = centerCoords.lat > 16 ? 25 : centerCoords.lat > 14 ? 28 : 30;
    const tempVariation = Math.random() * 10 - 5; // ±5°C variation

    // Generate current weather
    const current = {
      temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
      humidity: Math.round(60 + Math.random() * 35), // 60-95%
      windSpeed: Math.round((5 + Math.random() * 25) * 10) / 10, // 5-30 km/h
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      pressure: Math.round((1008 + Math.random() * 15) * 10) / 10, // 1008-1023 hPa
      condition: this.getRandomCondition(),
      conditionCode: Math.floor(Math.random() * 8) + 1, // 1-8
      rainfall: Math.round(Math.random() * 5 * 10) / 10, // 0-5mm
      cloudCover: Math.round(Math.random() * 100), // 0-100%
      solarRadiation: Math.round(200 + Math.random() * 800) // 200-1000 W/m²
    };

    // Generate 72-hour forecast
    const forecast = [];
    const now = new Date();
    
    for (let i = 1; i <= 72; i++) {
      const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = forecastTime.getHours();
      
      // Temperature variation by time of day
      const tempOffset = Math.sin((hour - 6) * Math.PI / 12) * 5; // Peak at 2 PM
      const dailyVariation = Math.sin(i * Math.PI / 24) * 3; // Daily cycle
      
      forecast.push({
        date: forecastTime.toISOString().split('T')[0],
        hour: hour,
        temperature: Math.round((current.temperature + tempOffset + dailyVariation + (Math.random() * 4 - 2)) * 10) / 10,
        humidity: Math.max(40, Math.min(95, current.humidity + Math.random() * 20 - 10)),
        windSpeed: Math.max(0, current.windSpeed + Math.random() * 10 - 5),
        windDirection: current.windDirection,
        rainfall: this.generateRainfall(i),
        condition: this.getRandomCondition(),
        conditionCode: Math.floor(Math.random() * 8) + 1,
        cloudCover: Math.max(0, Math.min(100, current.cloudCover + Math.random() * 40 - 20))
      });
    }

    return {
      location: regionName,
      coordinates: centerCoords,
      current,
      forecast
    };
  }

  private getRandomCondition(): string {
    const conditions = [
      'Clear', 'Partly Cloudy', 'Cloudy', 'Overcast',
      'Light Rain', 'Moderate Rain', 'Heavy Rain', 'Thunderstorm'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private generateRainfall(hourOffset: number): number {
    // Simulate rainy season patterns
    const rainProbability = Math.sin(hourOffset * Math.PI / 168) * 0.3 + 0.2; // Weekly cycle
    const hasRain = Math.random() < rainProbability;
    
    if (!hasRain) return 0;
    
    // Generate rainfall amount (exponential distribution for realistic pattern)
    const intensity = Math.random();
    if (intensity < 0.6) return Math.round(Math.random() * 5 * 10) / 10; // Light rain
    if (intensity < 0.85) return Math.round((5 + Math.random() * 20) * 10) / 10; // Moderate rain
    return Math.round((25 + Math.random() * 50) * 10) / 10; // Heavy rain
  }

  // Mock methods matching the real TMD service interface
  async getDomainInfo() {
    return [
      { domain: 0, min: "2024-01-01", max: "2024-05-01" },
      { domain: 1, min: "2024-01-01", max: "2024-02-01" },
      { domain: 2, min: "2024-01-01", max: "2024-01-04" },
      { domain: 3, min: "2024-01-01", max: "2024-01-03" }
    ];
  }

  async getRegionWeather(regionName: string): Promise<ProcessedWeatherData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (!THAILAND_REGIONS[regionName as keyof typeof THAILAND_REGIONS]) {
      throw new Error(`Region "${regionName}" not found`);
    }

    return this.generateMockWeatherData(regionName);
  }

  async getCustomAreaWeather(
    name: string,
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    domain: number = 2
  ): Promise<ProcessedWeatherData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const centerCoords = {
      lat: (lat1 + lat2) / 2,
      lon: (lon1 + lon2) / 2
    };

    // Use closest known region as base for realistic data
    const closestRegion = this.findClosestRegion(centerCoords.lat, centerCoords.lon);
    const baseData = this.generateMockWeatherData(closestRegion);
    
    return {
      ...baseData,
      location: name,
      coordinates: centerCoords
    };
  }

  private findClosestRegion(lat: number, lon: number): string {
    let closestRegion = 'Bangkok';
    let minDistance = Infinity;

    Object.entries(THAILAND_REGIONS).forEach(([regionName, coords]) => {
      const centerLat = (coords.lat1 + coords.lat2) / 2;
      const centerLon = (coords.lon1 + coords.lon2) / 2;
      const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lon - centerLon, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = regionName;
      }
    });

    return closestRegion;
  }

  getWeatherAlerts(weatherData: ProcessedWeatherData) {
    const alerts = [];
    const { current, forecast } = weatherData;

    // Heavy rain warning
    const heavyRainForecast = forecast.filter(f => f.rainfall > 35);
    if (heavyRainForecast.length > 0) {
      alerts.push({
        id: 'heavy-rain',
        type: 'warning' as const,
        title: 'Heavy Rain Expected',
        message: `Heavy rainfall (${heavyRainForecast[0].rainfall}mm) expected. Consider adjusting irrigation schedules and protect sensitive crops.`,
        severity: heavyRainForecast[0].rainfall > 75 ? 'high' as const : 'medium' as const
      });
    }

    // High temperature warning
    if (current.temperature > 35) {
      alerts.push({
        id: 'high-temp',
        type: 'warning' as const,
        title: 'High Temperature Alert',
        message: `Current temperature is ${current.temperature}°C. Ensure adequate irrigation and shade for crops.`,
        severity: current.temperature > 40 ? 'high' as const : 'medium' as const
      });
    }

    // Strong wind warning
    if (current.windSpeed > 50) {
      alerts.push({
        id: 'strong-wind',
        type: 'warning' as const,
        title: 'Strong Wind Warning',
        message: `Strong winds (${current.windSpeed.toFixed(1)} km/h) detected. Secure greenhouse panels and provide support for tall crops.`,
        severity: current.windSpeed > 70 ? 'high' as const : 'medium' as const
      });
    }

    // High humidity alert
    if (current.humidity > 85) {
      alerts.push({
        id: 'high-humidity',
        type: 'info' as const,
        title: 'High Humidity Alert',
        message: `High humidity (${current.humidity}%) may increase fungal disease risk. Consider preventive treatments for susceptible crops.`,
        severity: 'low' as const
      });
    }

    // Optimal conditions info
    if (current.temperature >= 20 && current.temperature <= 30 && 
        current.humidity >= 50 && current.humidity <= 70 &&
        current.rainfall === 0) {
      alerts.push({
        id: 'optimal-conditions',
        type: 'info' as const,
        title: 'Optimal Growing Conditions',
        message: 'Weather conditions are ideal for most agricultural activities. Consider scheduling field work and planting.',
        severity: 'low' as const
      });
    }

    return alerts;
  }

  setAccessToken(token: string) {
    // Mock implementation - no actual token needed
    console.log('Mock TMD service: Token set');
  }
}

export const mockTMDService = new MockTMDService();
export default MockTMDService;