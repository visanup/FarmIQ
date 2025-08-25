// Animal Weight Tracking Service for Aquaculture/Livestock
import { format, subDays, addDays } from 'date-fns';

// TypeScript interfaces for animal weight data
export interface WeightMeasurement {
  id: string;
  date: string;
  customerId: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  // Weight statistics
  averageWeight: number; // grams
  minWeight: number;
  maxWeight: number;
  standardDeviation: number;
  sampleSize: number;
  // Weight distribution
  weightDistribution: {
    range: string; // e.g., "0-100g", "100-200g"
    count: number;
    percentage: number;
  }[];
  // Growth indicators
  weightGain: number; // grams from previous measurement
  dailyGrowthRate: number; // percentage
  cumulativeGrowth: number; // percentage from initial weight
  // Additional metrics
  biomass: number; // total kg
  uniformity: number; // coefficient of variation (%)
  feedEfficiency: number; // weight gain / feed consumption
}

export interface WeightTimeSeriesData {
  measurements: WeightMeasurement[];
  growthTrend: {
    startWeight: number;
    endWeight: number;
    totalGrowth: number;
    averageDailyGain: number;
    growthRate: number; // %
  };
  projections: {
    targetWeight: number;
    estimatedDays: number;
    projectedDate: string;
  };
}

export interface WeightFilters {
  customerId?: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  dateRange: {
    start: string;
    end: string;
  };
  measurementType?: 'daily' | 'weekly' | 'monthly';
}

export interface WeightGrowthAnalysis {
  currentPeriod: WeightTimeSeriesData;
  previousPeriod: WeightTimeSeriesData;
  comparison: {
    weightGainImprovement: number; // %
    growthRateImprovement: number; // %
    uniformityImprovement: number; // %
    feedEfficiencyImprovement: number; // %
  };
  alerts: {
    type: 'slow_growth' | 'high_variation' | 'low_uniformity' | 'excellent_growth';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

class AnimalWeightService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_WEIGHT_API_URL || 'http://localhost:3001/api';
  }

  // Generate mock weight measurement data
  private generateMockWeightData(
    days: number = 30,
    customerId: number = 1,
    level: 'overview' | 'farm' | 'pen' = 'overview'
  ): WeightMeasurement[] {
    const data: WeightMeasurement[] = [];
    let currentWeight = 180; // Starting weight in grams
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      
      // Simulate realistic growth pattern
      const dailyGrowth = 5 + Math.random() * 6; // 5-11g daily growth
      currentWeight += dailyGrowth;
      
      // Add some variation based on level
      const levelVariation = level === 'overview' ? 1 : level === 'farm' ? 0.8 : 0.6;
      const avgWeight = currentWeight * (0.9 + Math.random() * 0.2) * levelVariation;
      
      // Generate weight distribution
      const sampleSize = level === 'overview' ? 1000 : level === 'farm' ? 200 : 50;
      const stdDev = avgWeight * 0.15; // 15% coefficient of variation
      
      const weightDistribution = [
        { range: '0-100g', count: Math.floor(sampleSize * 0.1), percentage: 10 },
        { range: '100-200g', count: Math.floor(sampleSize * 0.3), percentage: 30 },
        { range: '200-300g', count: Math.floor(sampleSize * 0.4), percentage: 40 },
        { range: '300-400g', count: Math.floor(sampleSize * 0.15), percentage: 15 },
        { range: '400g+', count: Math.floor(sampleSize * 0.05), percentage: 5 }
      ];

      const measurement: WeightMeasurement = {
        id: `${customerId}-${level}-${date}`,
        date,
        customerId,
        farmId: level !== 'overview' ? `farm-${Math.floor(Math.random() * 5) + 1}` : undefined,
        penId: level === 'pen' ? `pen-${Math.floor(Math.random() * 10) + 1}` : undefined,
        level,
        averageWeight: Number(avgWeight.toFixed(1)),
        minWeight: Number((avgWeight * 0.6).toFixed(1)),
        maxWeight: Number((avgWeight * 1.4).toFixed(1)),
        standardDeviation: Number(stdDev.toFixed(1)),
        sampleSize,
        weightDistribution,
        weightGain: i === days - 1 ? 0 : Number(dailyGrowth.toFixed(1)),
        dailyGrowthRate: Number(((dailyGrowth / (avgWeight - dailyGrowth)) * 100).toFixed(2)),
        cumulativeGrowth: Number((((avgWeight - 180) / 180) * 100).toFixed(1)),
        biomass: Number(((avgWeight * sampleSize) / 1000).toFixed(1)), // kg
        uniformity: Number((100 - (stdDev / avgWeight) * 100).toFixed(1)), // %
        feedEfficiency: Number((dailyGrowth / 15).toFixed(2)) // assuming 15g feed per day
      };
      
      data.push(measurement);
    }
    
    return data.reverse(); // Most recent first
  }

  // Get weight measurements with filters
  async getWeightMeasurements(filters: WeightFilters): Promise<WeightTimeSeriesData> {
    try {
      // For development, use mock data
      if (import.meta.env.DEV) {
        const measurements = this.generateMockWeightData(
          30,
          filters.customerId || 1,
          filters.level
        );

        // Calculate growth trend
        const startWeight = measurements[measurements.length - 1]?.averageWeight || 0;
        const endWeight = measurements[0]?.averageWeight || 0;
        const totalGrowth = endWeight - startWeight;
        const days = measurements.length;
        const averageDailyGain = totalGrowth / days;
        const growthRate = (totalGrowth / startWeight) * 100;

        const growthTrend = {
          startWeight: Number(startWeight.toFixed(1)),
          endWeight: Number(endWeight.toFixed(1)),
          totalGrowth: Number(totalGrowth.toFixed(1)),
          averageDailyGain: Number(averageDailyGain.toFixed(1)),
          growthRate: Number(growthRate.toFixed(1))
        };

        // Calculate projections (to reach 500g target)
        const targetWeight = 500;
        const daysToTarget = Math.ceil((targetWeight - endWeight) / averageDailyGain);
        const projectedDate = format(addDays(new Date(), daysToTarget), 'yyyy-MM-dd');

        const projections = {
          targetWeight,
          estimatedDays: daysToTarget,
          projectedDate
        };

        return { measurements, growthTrend, projections };
      }

      // Production API call
      const params = new URLSearchParams({
        customerId: filters.customerId?.toString() || '',
        farmId: filters.farmId || '',
        penId: filters.penId || '',
        level: filters.level,
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        measurementType: filters.measurementType || 'daily'
      });

      const response = await fetch(`${this.baseUrl}/weight/measurements?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Weight API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching weight measurements:', error);
      // Fallback to mock data
      const measurements = this.generateMockWeightData(30, filters.customerId || 1, filters.level);
      const startWeight = measurements[measurements.length - 1]?.averageWeight || 0;
      const endWeight = measurements[0]?.averageWeight || 0;
      const totalGrowth = endWeight - startWeight;
      const averageDailyGain = totalGrowth / measurements.length;

      return {
        measurements,
        growthTrend: {
          startWeight: Number(startWeight.toFixed(1)),
          endWeight: Number(endWeight.toFixed(1)),
          totalGrowth: Number(totalGrowth.toFixed(1)),
          averageDailyGain: Number(averageDailyGain.toFixed(1)),
          growthRate: Number(((totalGrowth / startWeight) * 100).toFixed(1))
        },
        projections: {
          targetWeight: 500,
          estimatedDays: Math.ceil((500 - endWeight) / averageDailyGain),
          projectedDate: format(addDays(new Date(), Math.ceil((500 - endWeight) / averageDailyGain)), 'yyyy-MM-dd')
        }
      };
    }
  }

  // Get weight growth analysis with comparison
  async getWeightGrowthAnalysis(filters: WeightFilters): Promise<WeightGrowthAnalysis> {
    const currentPeriod = await this.getWeightMeasurements(filters);
    
    // Get previous period for comparison
    const previousFilters = {
      ...filters,
      dateRange: {
        start: format(subDays(new Date(filters.dateRange.start), 30), 'yyyy-MM-dd'),
        end: filters.dateRange.start
      }
    };
    
    const previousPeriod = await this.getWeightMeasurements(previousFilters);
    
    // Calculate improvements
    const currentAvgGain = currentPeriod.growthTrend.averageDailyGain;
    const previousAvgGain = previousPeriod.growthTrend.averageDailyGain;
    const currentGrowthRate = currentPeriod.growthTrend.growthRate;
    const previousGrowthRate = previousPeriod.growthTrend.growthRate;
    
    const currentUniformity = currentPeriod.measurements[0]?.uniformity || 0;
    const previousUniformity = previousPeriod.measurements[0]?.uniformity || 0;
    
    const currentFeedEfficiency = currentPeriod.measurements[0]?.feedEfficiency || 0;
    const previousFeedEfficiency = previousPeriod.measurements[0]?.feedEfficiency || 0;
    
    const comparison = {
      weightGainImprovement: Number((((currentAvgGain - previousAvgGain) / previousAvgGain) * 100).toFixed(1)),
      growthRateImprovement: Number((((currentGrowthRate - previousGrowthRate) / previousGrowthRate) * 100).toFixed(1)),
      uniformityImprovement: Number((((currentUniformity - previousUniformity) / previousUniformity) * 100).toFixed(1)),
      feedEfficiencyImprovement: Number((((currentFeedEfficiency - previousFeedEfficiency) / previousFeedEfficiency) * 100).toFixed(1))
    };
    
    // Generate alerts based on performance
    const alerts: WeightGrowthAnalysis['alerts'] = [];
    
    if (currentAvgGain < 5) {
      alerts.push({
        type: 'slow_growth',
        message: 'การเจริญเติบโตช้ากว่าปกติ ควรตรวจสอบคุณภาพอาหารและสภาพแวดล้อม',
        severity: 'high'
      });
    }
    
    if (currentUniformity < 80) {
      alerts.push({
        type: 'low_uniformity',
        message: 'ความสม่ำเสมอของน้ำหนักต่ำ อาจต้องปรับการจัดการอาหาร',
        severity: 'medium'
      });
    }
    
    if (currentAvgGain > 8 && currentUniformity > 85) {
      alerts.push({
        type: 'excellent_growth',
        message: 'การเจริญเติบโตดีเยี่ยม! รักษาระบบการจัดการปัจจุบัน',
        severity: 'low'
      });
    }
    
    return {
      currentPeriod,
      previousPeriod,
      comparison,
      alerts
    };
  }

  // Record new weight measurement
  async recordWeightMeasurement(data: Omit<WeightMeasurement, 'id'>): Promise<WeightMeasurement> {
    try {
      if (import.meta.env.DEV) {
        // Return mock successful recording
        return {
          ...data,
          id: `${data.customerId}-${data.level}-${data.date}-${Date.now()}`
        };
      }

      const response = await fetch(`${this.baseUrl}/weight/measurements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Weight recording error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording weight measurement:', error);
      throw error;
    }
  }

  // Get weight targets and recommendations
  async getWeightTargets(filters: Pick<WeightFilters, 'customerId' | 'farmId' | 'penId' | 'level'>): Promise<{
    currentTarget: number;
    nextMilestone: number;
    recommendedActions: string[];
    optimalGrowthRate: number;
  }> {
    try {
      if (import.meta.env.DEV) {
        return {
          currentTarget: 500, // grams
          nextMilestone: 600,
          recommendedActions: [
            'เพิ่มความถี่ในการให้อาหาร',
            'ตรวจสอบคุณภาพน้ำ',
            'ปรับปรุงระบบระบายอากาศ',
            'เพิ่มโปรตีนในอาหาร'
          ],
          optimalGrowthRate: 7.5 // grams per day
        };
      }

      const response = await fetch(`${this.baseUrl}/weight/targets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`Weight targets error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching weight targets:', error);
      // Fallback data
      return {
        currentTarget: 500,
        nextMilestone: 600,
        recommendedActions: ['ตรวจสอบระบบอาหาร', 'เพิ่มการตรวจสอบน้ำหนัก'],
        optimalGrowthRate: 7.5
      };
    }
  }
}

export const animalWeightService = new AnimalWeightService();
export default animalWeightService;