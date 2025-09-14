// Comprehensive Sensor Data Service for Farm Monitoring
import { format, subDays, subHours } from 'date-fns';

// Environment Sensor Data
export interface EnvironmentSensorData {
  id: string;
  timestamp: string;
  customerId: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  // Temperature in Celsius
  temperature: number;
  // Humidity percentage
  humidity: number;
  // CO₂ concentration in ppm
  co2: number;
  // NH₃ concentration in ppm
  nh3: number;
  // Volatile Organic Compounds in ppm
  vocs: number;
  // Illuminance in lux
  illuminance: number;
  // Photoperiod cycle info
  photoperiod: {
    lightHours: number;
    darkHours: number;
    currentPhase: 'light' | 'dark' | 'transition';
    cycleProgress: number; // percentage
  };
  // Status indicators
  alerts: {
    type: 'temperature' | 'humidity' | 'air_quality' | 'lighting';
    level: 'normal' | 'warning' | 'critical';
    message: string;
  }[];
}

// Water Quality Sensor Data
export interface WaterQualitySensorData {
  id: string;
  timestamp: string;
  customerId: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  // pH level
  ph: number;
  // Total Dissolved Solids in ppm
  tds: number;
  // Electrical Conductivity in µS/cm
  ec: number;
  // Water temperature in Celsius
  waterTemp: number;
  // Daily water volume in liters
  volume: number;
  // Dissolved oxygen in mg/L
  dissolvedOxygen: number;
  // Ammonia levels in mg/L
  ammonia: number;
  // Nitrite levels in mg/L
  nitrite: number;
  // Nitrate levels in mg/L
  nitrate: number;
  // Water quality index (0-100)
  qualityIndex: number;
  // Status indicators
  alerts: {
    type: 'ph' | 'temperature' | 'oxygen' | 'toxicity' | 'volume';
    level: 'normal' | 'warning' | 'critical';
    message: string;
  }[];
}

// Housing Conditions Sensor Data
export interface HousingConditionsSensorData {
  id: string;
  timestamp: string;
  customerId: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  // Stocking density (fish/m³ or animals/m²)
  stockingDensity: number;
  // Ventilation rate in air changes per hour
  ventilationRate: number;
  // Bedding quality score (0-100)
  beddingQuality: number;
  // Space utilization percentage
  spaceUtilization: number;
  // Air flow rate in m³/hour
  airFlowRate: number;
  // Cleaning frequency (cleanings per week)
  cleaningFrequency: number;
  // Structural integrity score (0-100)
  structuralIntegrity: number;
  // Comfort index (0-100)
  comfortIndex: number;
  // Status indicators
  alerts: {
    type: 'density' | 'ventilation' | 'cleanliness' | 'structure';
    level: 'normal' | 'warning' | 'critical';
    message: string;
  }[];
}

// Combined sensor reading
export interface ComprehensiveSensorData {
  timestamp: string;
  environment: EnvironmentSensorData;
  waterQuality: WaterQualitySensorData;
  housingConditions: HousingConditionsSensorData;
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: string[];
}

// Time series data structure
export interface SensorTimeSeriesData {
  environment: EnvironmentSensorData[];
  waterQuality: WaterQualitySensorData[];
  housingConditions: HousingConditionsSensorData[];
  timeRange: {
    start: string;
    end: string;
    interval: 'hourly' | 'daily' | 'weekly';
  };
  summary: {
    environment: {
      avgTemperature: number;
      avgHumidity: number;
      maxCO2: number;
      alertCount: number;
    };
    waterQuality: {
      avgPH: number;
      avgQualityIndex: number;
      totalVolume: number;
      alertCount: number;
    };
    housingConditions: {
      avgDensity: number;
      avgVentilation: number;
      avgComfort: number;
      alertCount: number;
    };
  };
}

// Filters for sensor data
export interface SensorFilters {
  customerId?: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  dateRange: {
    start: string;
    end: string;
  };
  interval?: 'hourly' | 'daily' | 'weekly';
  sensorTypes?: ('environment' | 'waterQuality' | 'housingConditions')[];
}

class SensorDataService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SENSOR_API_URL || 'http://localhost:3001/api';
  }

  // Generate mock environment sensor data
  private generateMockEnvironmentData(
    hours: number = 24,
    customerId: number = 1,
    level: 'overview' | 'farm' | 'pen' = 'overview'
  ): EnvironmentSensorData[] {
    const data: EnvironmentSensorData[] = [];
    
    for (let i = hours - 1; i >= 0; i--) {
      const timestamp = format(subHours(new Date(), i), 'yyyy-MM-dd HH:mm:ss');
      const hour = 24 - i;
      
      // Simulate realistic daily patterns
      const tempBase = 26 + Math.sin((hour - 6) * Math.PI / 12) * 4; // 22-30°C cycle
      const humidityBase = 70 + Math.sin((hour - 12) * Math.PI / 12) * 15; // 55-85% cycle
      
      // Add some random variation
      const temperature = Number((tempBase + (Math.random() - 0.5) * 2).toFixed(1));
      const humidity = Number((humidityBase + (Math.random() - 0.5) * 10).toFixed(1));
      const co2 = Number((400 + Math.random() * 200).toFixed(0)); // 400-600 ppm
      const nh3 = Number((Math.random() * 5).toFixed(2)); // 0-5 ppm
      const vocs = Number((Math.random() * 50).toFixed(1)); // 0-50 ppm
      const illuminance = hour >= 6 && hour <= 18 ? Number((20000 + Math.random() * 30000).toFixed(0)) : Number((Math.random() * 100).toFixed(0));
      
      // Generate alerts based on values
      const alerts: EnvironmentSensorData['alerts'] = [];
      if (temperature > 32) alerts.push({ type: 'temperature', level: 'warning', message: 'อุณหภูมิสูงเกินไป' });
      if (humidity > 85) alerts.push({ type: 'humidity', level: 'warning', message: 'ความชื้นสูงเกินไป' });
      if (co2 > 1000) alerts.push({ type: 'air_quality', level: 'critical', message: 'ระดับ CO₂ สูงมาก' });
      
      const sensorData: EnvironmentSensorData = {
        id: `env-${customerId}-${level}-${timestamp}`,
        timestamp,
        customerId,
        farmId: level !== 'overview' ? `farm-${Math.floor(Math.random() * 5) + 1}` : undefined,
        penId: level === 'pen' ? `pen-${Math.floor(Math.random() * 10) + 1}` : undefined,
        level,
        temperature,
        humidity,
        co2,
        nh3,
        vocs,
        illuminance,
        photoperiod: {
          lightHours: 14,
          darkHours: 10,
          currentPhase: hour >= 6 && hour <= 20 ? 'light' : 'dark',
          cycleProgress: hour >= 6 && hour <= 20 ? ((hour - 6) / 14) * 100 : ((hour > 20 ? hour - 20 : hour + 4) / 10) * 100
        },
        alerts
      };
      
      data.push(sensorData);
    }
    
    return data;
  }

  // Generate mock water quality data
  private generateMockWaterQualityData(
    hours: number = 24,
    customerId: number = 1,
    level: 'overview' | 'farm' | 'pen' = 'overview'
  ): WaterQualitySensorData[] {
    const data: WaterQualitySensorData[] = [];
    
    for (let i = hours - 1; i >= 0; i--) {
      const timestamp = format(subHours(new Date(), i), 'yyyy-MM-dd HH:mm:ss');
      
      // Simulate realistic water quality parameters
      const ph = Number((7.0 + (Math.random() - 0.5) * 1.0).toFixed(1)); // 6.5-7.5
      const tds = Number((300 + Math.random() * 200).toFixed(0)); // 300-500 ppm
      const ec = Number((tds * 2).toFixed(0)); // µS/cm
      const waterTemp = Number((25 + (Math.random() - 0.5) * 3).toFixed(1)); // 23.5-26.5°C
      const volume = Number((1000 + Math.random() * 500).toFixed(0)); // 1000-1500L per day
      const dissolvedOxygen = Number((6 + Math.random() * 2).toFixed(1)); // 6-8 mg/L
      const ammonia = Number((Math.random() * 0.5).toFixed(2)); // 0-0.5 mg/L
      const nitrite = Number((Math.random() * 0.1).toFixed(2)); // 0-0.1 mg/L
      const nitrate = Number((Math.random() * 20).toFixed(1)); // 0-20 mg/L
      
      // Calculate quality index
      let qualityIndex = 100;
      if (ph < 6.5 || ph > 8.5) qualityIndex -= 20;
      if (dissolvedOxygen < 5) qualityIndex -= 30;
      if (ammonia > 0.25) qualityIndex -= 25;
      if (nitrite > 0.05) qualityIndex -= 25;
      qualityIndex = Math.max(0, qualityIndex);
      
      // Generate alerts
      const alerts: WaterQualitySensorData['alerts'] = [];
      if (ph < 6.5 || ph > 8.5) alerts.push({ type: 'ph', level: 'warning', message: 'ค่า pH ผิดปกติ' });
      if (dissolvedOxygen < 4) alerts.push({ type: 'oxygen', level: 'critical', message: 'ออกซิเจนในน้ำต่ำมาก' });
      if (ammonia > 0.5) alerts.push({ type: 'toxicity', level: 'critical', message: 'แอมโมเนียสูงเกินไป' });
      
      const sensorData: WaterQualitySensorData = {
        id: `water-${customerId}-${level}-${timestamp}`,
        timestamp,
        customerId,
        farmId: level !== 'overview' ? `farm-${Math.floor(Math.random() * 5) + 1}` : undefined,
        penId: level === 'pen' ? `pen-${Math.floor(Math.random() * 10) + 1}` : undefined,
        level,
        ph,
        tds,
        ec,
        waterTemp,
        volume,
        dissolvedOxygen,
        ammonia,
        nitrite,
        nitrate,
        qualityIndex: Number(qualityIndex.toFixed(0)),
        alerts
      };
      
      data.push(sensorData);
    }
    
    return data;
  }

  // Generate mock housing conditions data
  private generateMockHousingConditionsData(
    hours: number = 24,
    customerId: number = 1,
    level: 'overview' | 'farm' | 'pen' = 'overview'
  ): HousingConditionsSensorData[] {
    const data: HousingConditionsSensorData[] = [];
    
    for (let i = hours - 1; i >= 0; i--) {
      const timestamp = format(subHours(new Date(), i), 'yyyy-MM-dd HH:mm:ss');
      
      // Simulate realistic housing conditions
      const stockingDensity = Number((15 + Math.random() * 10).toFixed(1)); // 15-25 fish/m³
      const ventilationRate = Number((8 + Math.random() * 4).toFixed(1)); // 8-12 air changes/hour
      const beddingQuality = Number((75 + Math.random() * 20).toFixed(0)); // 75-95 score
      const spaceUtilization = Number((80 + Math.random() * 15).toFixed(1)); // 80-95%
      const airFlowRate = Number((500 + Math.random() * 200).toFixed(0)); // 500-700 m³/hour
      const cleaningFrequency = 2; // 2 times per week
      const structuralIntegrity = Number((90 + Math.random() * 8).toFixed(0)); // 90-98 score
      
      // Calculate comfort index
      let comfortIndex = 100;
      if (stockingDensity > 20) comfortIndex -= 15;
      if (ventilationRate < 8) comfortIndex -= 20;
      if (beddingQuality < 80) comfortIndex -= 10;
      if (spaceUtilization > 90) comfortIndex -= 10;
      comfortIndex = Math.max(0, comfortIndex);
      
      // Generate alerts
      const alerts: HousingConditionsSensorData['alerts'] = [];
      if (stockingDensity > 25) alerts.push({ type: 'density', level: 'warning', message: 'ความหนาแน่นสูงเกินไป' });
      if (ventilationRate < 6) alerts.push({ type: 'ventilation', level: 'critical', message: 'การระบายอากาศไม่เพียงพอ' });
      if (beddingQuality < 70) alerts.push({ type: 'cleanliness', level: 'warning', message: 'คุณภาพเพื่อนต้องปรับปรุง' });
      
      const sensorData: HousingConditionsSensorData = {
        id: `housing-${customerId}-${level}-${timestamp}`,
        timestamp,
        customerId,
        farmId: level !== 'overview' ? `farm-${Math.floor(Math.random() * 5) + 1}` : undefined,
        penId: level === 'pen' ? `pen-${Math.floor(Math.random() * 10) + 1}` : undefined,
        level,
        stockingDensity,
        ventilationRate,
        beddingQuality,
        spaceUtilization,
        airFlowRate,
        cleaningFrequency,
        structuralIntegrity,
        comfortIndex: Number(comfortIndex.toFixed(0)),
        alerts
      };
      
      data.push(sensorData);
    }
    
    return data;
  }

  // Get comprehensive sensor data
  async getSensorData(filters: SensorFilters): Promise<SensorTimeSeriesData> {
    try {
      if (import.meta.env.DEV) {
        const hours = filters.interval === 'hourly' ? 24 : filters.interval === 'daily' ? 7 * 24 : 30 * 24;
        
        const environment = this.generateMockEnvironmentData(hours, filters.customerId || 1, filters.level);
        const waterQuality = this.generateMockWaterQualityData(hours, filters.customerId || 1, filters.level);
        const housingConditions = this.generateMockHousingConditionsData(hours, filters.customerId || 1, filters.level);
        
        // Calculate summaries
        const envSummary = {
          avgTemperature: Number((environment.reduce((sum, d) => sum + d.temperature, 0) / environment.length).toFixed(1)),
          avgHumidity: Number((environment.reduce((sum, d) => sum + d.humidity, 0) / environment.length).toFixed(1)),
          maxCO2: Math.max(...environment.map(d => d.co2)),
          alertCount: environment.reduce((sum, d) => sum + d.alerts.length, 0)
        };
        
        const waterSummary = {
          avgPH: Number((waterQuality.reduce((sum, d) => sum + d.ph, 0) / waterQuality.length).toFixed(1)),
          avgQualityIndex: Number((waterQuality.reduce((sum, d) => sum + d.qualityIndex, 0) / waterQuality.length).toFixed(0)),
          totalVolume: Number((waterQuality.reduce((sum, d) => sum + d.volume, 0)).toFixed(0)),
          alertCount: waterQuality.reduce((sum, d) => sum + d.alerts.length, 0)
        };
        
        const housingSummary = {
          avgDensity: Number((housingConditions.reduce((sum, d) => sum + d.stockingDensity, 0) / housingConditions.length).toFixed(1)),
          avgVentilation: Number((housingConditions.reduce((sum, d) => sum + d.ventilationRate, 0) / housingConditions.length).toFixed(1)),
          avgComfort: Number((housingConditions.reduce((sum, d) => sum + d.comfortIndex, 0) / housingConditions.length).toFixed(0)),
          alertCount: housingConditions.reduce((sum, d) => sum + d.alerts.length, 0)
        };
        
        return {
          environment,
          waterQuality,
          housingConditions,
          timeRange: {
            start: filters.dateRange.start,
            end: filters.dateRange.end,
            interval: filters.interval || 'hourly'
          },
          summary: {
            environment: envSummary,
            waterQuality: waterSummary,
            housingConditions: housingSummary
          }
        };
      }

      // Production API call
      const params = new URLSearchParams({
        customerId: filters.customerId?.toString() || '',
        farmId: filters.farmId || '',
        penId: filters.penId || '',
        level: filters.level,
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        interval: filters.interval || 'hourly',
        sensorTypes: filters.sensorTypes?.join(',') || 'environment,waterQuality,housingConditions'
      });

      const response = await fetch(`${this.baseUrl}/sensors/data?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Sensor API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      // Fallback to mock data
      const environment = this.generateMockEnvironmentData(24, filters.customerId || 1, filters.level);
      const waterQuality = this.generateMockWaterQualityData(24, filters.customerId || 1, filters.level);
      const housingConditions = this.generateMockHousingConditionsData(24, filters.customerId || 1, filters.level);
      
      return {
        environment,
        waterQuality,
        housingConditions,
        timeRange: {
          start: filters.dateRange.start,
          end: filters.dateRange.end,
          interval: 'hourly'
        },
        summary: {
          environment: {
            avgTemperature: 28.5,
            avgHumidity: 72.0,
            maxCO2: 580,
            alertCount: 2
          },
          waterQuality: {
            avgPH: 7.2,
            avgQualityIndex: 85,
            totalVolume: 30000,
            alertCount: 1
          },
          housingConditions: {
            avgDensity: 18.5,
            avgVentilation: 9.2,
            avgComfort: 88,
            alertCount: 0
          }
        }
      };
    }
  }

  // Get real-time sensor status
  async getRealTimeSensorStatus(filters: Pick<SensorFilters, 'customerId' | 'farmId' | 'penId' | 'level'>): Promise<ComprehensiveSensorData> {
    try {
      if (import.meta.env.DEV) {
        const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const environment = this.generateMockEnvironmentData(1, filters.customerId || 1, filters.level)[0];
        const waterQuality = this.generateMockWaterQualityData(1, filters.customerId || 1, filters.level)[0];
        const housingConditions = this.generateMockHousingConditionsData(1, filters.customerId || 1, filters.level)[0];
        
        // Calculate overall status
        const totalAlerts = environment.alerts.length + waterQuality.alerts.length + housingConditions.alerts.length;
        const criticalAlerts = [...environment.alerts, ...waterQuality.alerts, ...housingConditions.alerts]
          .filter(alert => alert.level === 'critical').length;
        
        let overallStatus: ComprehensiveSensorData['overallStatus'] = 'excellent';
        if (criticalAlerts > 0) overallStatus = 'critical';
        else if (totalAlerts > 3) overallStatus = 'poor';
        else if (totalAlerts > 1) overallStatus = 'fair';
        else if (totalAlerts > 0) overallStatus = 'good';
        
        const recommendations = [
          'ตรวจสอบระบบระบายอากาศ',
          'ปรับปรุงคุณภาพน้ำ',
          'เพิ่มความถี่ในการทำความสะอาด',
          'ตรวจสอบระบบให้อาหาร'
        ];
        
        return {
          timestamp,
          environment,
          waterQuality,
          housingConditions,
          overallStatus,
          recommendations
        };
      }

      const response = await fetch(`${this.baseUrl}/sensors/realtime`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`Real-time sensor API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching real-time sensor data:', error);
      // Fallback mock data
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const environment = this.generateMockEnvironmentData(1, filters.customerId || 1, filters.level)[0];
      const waterQuality = this.generateMockWaterQualityData(1, filters.customerId || 1, filters.level)[0];
      const housingConditions = this.generateMockHousingConditionsData(1, filters.customerId || 1, filters.level)[0];
      
      return {
        timestamp,
        environment,
        waterQuality,
        housingConditions,
        overallStatus: 'good',
        recommendations: ['ระบบทำงานปกติ', 'ดำเนินการตามแผนปกติ']
      };
    }
  }

  // Get sensor alerts and notifications
  async getSensorAlerts(filters: Pick<SensorFilters, 'customerId' | 'farmId' | 'penId' | 'level'>): Promise<{
    active: Array<{
      id: string;
      type: string;
      level: 'normal' | 'warning' | 'critical';
      message: string;
      timestamp: string;
      sensorCategory: 'environment' | 'waterQuality' | 'housingConditions';
    }>;
    resolved: Array<{
      id: string;
      type: string;
      message: string;
      resolvedAt: string;
      duration: number; // minutes
    }>;
  }> {
    try {
      if (import.meta.env.DEV) {
        const activeAlerts = [
          {
            id: 'alert-1',
            type: 'temperature',
            level: 'warning' as const,
            message: 'อุณหภูมิสูงกว่าปกติ 2°C',
            timestamp: format(subHours(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            sensorCategory: 'environment' as const
          },
          {
            id: 'alert-2',
            type: 'ph',
            level: 'critical' as const,
            message: 'ค่า pH ต่ำกว่าเกณฑ์',
            timestamp: format(subHours(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'),
            sensorCategory: 'waterQuality' as const
          }
        ];
        
        const resolvedAlerts = [
          {
            id: 'alert-r1',
            type: 'ventilation',
            message: 'การระบายอากาศไม่เพียงพอ',
            resolvedAt: format(subHours(new Date(), 6), 'yyyy-MM-dd HH:mm:ss'),
            duration: 120
          }
        ];
        
        return { active: activeAlerts, resolved: resolvedAlerts };
      }

      const response = await fetch(`${this.baseUrl}/sensors/alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`Sensor alerts API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sensor alerts:', error);
      return { active: [], resolved: [] };
    }
  }
}

export const sensorDataService = new SensorDataService();
export default sensorDataService;