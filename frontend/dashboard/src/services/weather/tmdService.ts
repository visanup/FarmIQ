import axios, { AxiosInstance } from 'axios';

// TMD API Types based on documentation
export interface TMDDomainInfo {
  domain: number;
  min: string;
  max: string;
}

export interface TMDAreaForecastParams {
  domain: number;
  lat1: number; // bottom-left latitude
  lon1: number; // bottom-left longitude
  lat2: number; // top-right latitude
  lon2: number; // top-right longitude
  fields: string; // comma-separated field names
  date?: string; // optional date filter
  hour?: number; // optional hour filter
}

export interface TMDWeatherData {
  lat: number;
  lon: number;
  tc?: number; // Temperature (°C)
  rh?: number; // Relative humidity (%)
  slp?: number; // Sea level pressure (hPa)
  rain?: number; // Rain volume (mm)
  ws10m?: number; // Wind speed at 10m (m/s)
  wd10m?: number; // Wind direction at 10m (degree)
  cond?: number; // Weather condition (1-12)
  cloudlow?: number; // Low cloud fraction (%)
  cloudmed?: number; // Medium cloud fraction (%)
  cloudhigh?: number; // High cloud fraction (%)
  swdown?: number; // Solar radiation (W/m²)
}

export interface TMDForecastResponse {
  date: string;
  hour: number;
  data: TMDWeatherData[];
}

export interface ProcessedWeatherData {
  location: string;
  coordinates: { lat: number; lon: number };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number; // converted to km/h
    windDirection: string;
    pressure: number;
    condition: string;
    conditionCode: number;
    rainfall: number;
    cloudCover: number;
    solarRadiation: number;
  };
  forecast: {
    date: string;
    hour: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    rainfall: number;
    condition: string;
    conditionCode: number;
    cloudCover: number;
  }[];
}

// Weather condition mapping based on TMD documentation
const WEATHER_CONDITIONS = {
  1: 'Clear',
  2: 'Partly Cloudy',
  3: 'Cloudy',
  4: 'Overcast',
  5: 'Light Rain',
  6: 'Moderate Rain',
  7: 'Heavy Rain',
  8: 'Thunderstorm',
  9: 'Very Cold',
  10: 'Cold',
  11: 'Cool',
  12: 'Very Hot'
};

// Thai region coordinates for major agricultural areas
export const THAILAND_REGIONS = {
  'Chiang Mai': { lat1: 18.5, lon1: 98.5, lat2: 19.5, lon2: 99.5 },
  'Bangkok': { lat1: 13.5, lon1: 100.3, lat2: 14.0, lon2: 100.8 },
  'Nakhon Ratchasima': { lat1: 14.5, lon1: 101.5, lat2: 15.5, lon2: 102.5 },
  'Khon Kaen': { lat1: 16.0, lon1: 102.5, lat2: 16.5, lon2: 103.0 },
  'Ubon Ratchathani': { lat1: 15.0, lon1: 104.5, lat2: 15.5, lon2: 105.0 },
  'Surat Thani': { lat1: 8.5, lon1: 99.0, lat2: 9.5, lon2: 100.0 },
  'Songkhla': { lat1: 6.5, lon1: 100.0, lat2: 7.5, lon2: 101.0 },
  'Chon Buri': { lat1: 13.0, lon1: 100.5, lat2: 13.5, lon2: 101.5 },
  'Rayong': { lat1: 12.5, lon1: 101.0, lat2: 13.0, lon2: 101.5 },
  'Prachuap Khiri Khan': { lat1: 11.5, lon1: 99.5, lat2: 12.5, lon2: 100.0 }
};

class TMDService {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string = '') {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: 'https://data.tmd.go.th/nwpapi/v1',
      timeout: 30000, // TMD API can be slow
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Add authorization header if token is provided
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Get available domains and their date ranges
  async getDomainInfo(): Promise<TMDDomainInfo[]> {
    try {
      const response = await this.client.get('/forecast/area');
      return response.data;
    } catch (error) {
      console.error('Error fetching TMD domain info:', error);
      throw new Error('Failed to fetch domain information from TMD API');
    }
  }

  // Get area forecast data
  async getAreaForecast(params: TMDAreaForecastParams): Promise<TMDForecastResponse[]> {
    try {
      const { domain, lat1, lon1, lat2, lon2, fields, date, hour } = params;
      
      const queryParams: any = {
        domain,
        lat1,
        lon1,
        lat2,
        lon2,
        fields
      };

      if (date) queryParams.date = date;
      if (hour !== undefined) queryParams.hour = hour;

      const response = await this.client.get('/forecast/area/by-bbox', {
        params: queryParams
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching TMD area forecast:', error);
      throw new Error('Failed to fetch area forecast from TMD API');
    }
  }

  // Process raw TMD data into a more usable format
  private processWeatherData(
    rawData: TMDForecastResponse[],
    regionName: string,
    coordinates: { lat: number; lon: number }
  ): ProcessedWeatherData {
    if (!rawData || rawData.length === 0) {
      throw new Error('No weather data available');
    }

    // Get current conditions (first data point)
    const currentData = rawData[0]?.data?.[0];
    if (!currentData) {
      throw new Error('No current weather data available');
    }

    // Convert wind speed from m/s to km/h
    const convertWindSpeed = (speedMs: number) => speedMs * 3.6;

    // Convert wind direction from degrees to cardinal direction
    const getWindDirection = (degrees: number): string => {
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                         'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const index = Math.round(degrees / 22.5) % 16;
      return directions[index];
    };

    // Calculate average cloud cover
    const getCloudCover = (low: number, med: number, high: number): number => {
      return Math.max(low || 0, med || 0, high || 0);
    };

    const current = {
      temperature: currentData.tc || 0,
      humidity: currentData.rh || 0,
      windSpeed: convertWindSpeed(currentData.ws10m || 0),
      windDirection: getWindDirection(currentData.wd10m || 0),
      pressure: currentData.slp || 0,
      condition: WEATHER_CONDITIONS[currentData.cond as keyof typeof WEATHER_CONDITIONS] || 'Unknown',
      conditionCode: currentData.cond || 1,
      rainfall: currentData.rain || 0,
      cloudCover: getCloudCover(currentData.cloudlow || 0, currentData.cloudmed || 0, currentData.cloudhigh || 0),
      solarRadiation: currentData.swdown || 0
    };

    // Process forecast data
    const forecast = rawData.slice(0, 72).map(item => ({ // 72 hours forecast
      date: item.date,
      hour: item.hour,
      temperature: item.data[0]?.tc || 0,
      humidity: item.data[0]?.rh || 0,
      windSpeed: convertWindSpeed(item.data[0]?.ws10m || 0),
      windDirection: getWindDirection(item.data[0]?.wd10m || 0),
      rainfall: item.data[0]?.rain || 0,
      condition: WEATHER_CONDITIONS[item.data[0]?.cond as keyof typeof WEATHER_CONDITIONS] || 'Unknown',
      conditionCode: item.data[0]?.cond || 1,
      cloudCover: getCloudCover(
        item.data[0]?.cloudlow || 0,
        item.data[0]?.cloudmed || 0,
        item.data[0]?.cloudhigh || 0
      )
    }));

    return {
      location: regionName,
      coordinates,
      current,
      forecast
    };
  }

  // Get weather data for a specific Thai region
  async getRegionWeather(regionName: string): Promise<ProcessedWeatherData> {
    const regionCoords = THAILAND_REGIONS[regionName as keyof typeof THAILAND_REGIONS];
    if (!regionCoords) {
      throw new Error(`Region "${regionName}" not found`);
    }

    try {
      // Use Domain 2 for detailed hourly forecasts (72 hours, 6km resolution)
      const params: TMDAreaForecastParams = {
        domain: 2,
        lat1: regionCoords.lat1,
        lon1: regionCoords.lon1,
        lat2: regionCoords.lat2,
        lon2: regionCoords.lon2,
        fields: 'tc,rh,slp,rain,ws10m,wd10m,cond,cloudlow,cloudmed,cloudhigh,swdown'
      };

      const rawData = await this.getAreaForecast(params);
      
      // Calculate center coordinates for the region
      const centerCoords = {
        lat: (regionCoords.lat1 + regionCoords.lat2) / 2,
        lon: (regionCoords.lon1 + regionCoords.lon2) / 2
      };

      return this.processWeatherData(rawData, regionName, centerCoords);
    } catch (error) {
      console.error(`Error fetching weather for ${regionName}:`, error);
      throw error;
    }
  }

  // Get weather data for custom coordinates
  async getCustomAreaWeather(
    name: string,
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    domain: number = 2
  ): Promise<ProcessedWeatherData> {
    try {
      const params: TMDAreaForecastParams = {
        domain,
        lat1,
        lon1,
        lat2,
        lon2,
        fields: 'tc,rh,slp,rain,ws10m,wd10m,cond,cloudlow,cloudmed,cloudhigh,swdown'
      };

      const rawData = await this.getAreaForecast(params);
      
      const centerCoords = {
        lat: (lat1 + lat2) / 2,
        lon: (lon1 + lon2) / 2
      };

      return this.processWeatherData(rawData, name, centerCoords);
    } catch (error) {
      console.error(`Error fetching weather for custom area:`, error);
      throw error;
    }
  }

  // Get weather alerts based on conditions
  getWeatherAlerts(weatherData: ProcessedWeatherData): Array<{
    id: string;
    type: 'warning' | 'info';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    const alerts = [];
    const { current, forecast } = weatherData;

    // Heavy rain warning
    const heavyRainForecast = forecast.filter(f => f.rainfall > 35); // >35mm considered heavy
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
    if (current.windSpeed > 50) { // >50 km/h
      alerts.push({
        id: 'strong-wind',
        type: 'warning' as const,
        title: 'Strong Wind Warning',
        message: `Strong winds (${current.windSpeed.toFixed(1)} km/h) detected. Secure greenhouse panels and provide support for tall crops.`,
        severity: current.windSpeed > 70 ? 'high' as const : 'medium' as const
      });
    }

    // High humidity alert (fungal disease risk)
    if (current.humidity > 85) {
      alerts.push({
        id: 'high-humidity',
        type: 'info' as const,
        title: 'High Humidity Alert',
        message: `High humidity (${current.humidity}%) may increase fungal disease risk. Consider preventive treatments for susceptible crops.`,
        severity: 'low' as const
      });
    }

    return alerts;
  }
}

// Create service instance with mock token for demo
// In production, this should be injected from environment or auth service
export const tmdService = new TMDService(import.meta.env.VITE_TMD_API_TOKEN || '');

export default TMDService;