// Performance Metrics Service for Aquaculture/Livestock
import { format, subDays } from 'date-fns';

// TypeScript interfaces for performance metrics
export interface PerformanceMetrics {
  id: string;
  date: string;
  customerId: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  // Feed Conversion Ratio (FCR) - Lower is better
  fcr: number;
  // Average Daily Gain (ADG) - grams per day
  adg: number;
  // Specific Growth Rate (SGR) - percentage per day
  sgr: number;
  // Survival Rate - percentage
  survivalRate: number;
  // Average Weight - grams
  avgWeight: number;
  // Size Distribution
  sizeDistribution: {
    small: number; // percentage < 100g
    medium: number; // percentage 100-500g
    large: number; // percentage > 500g
  };
  // Additional metrics
  totalBiomass: number; // kg
  feedConsumption: number; // kg/day
  stockingDensity: number; // fish/m³ or animals/m²
}

export interface PerformanceTimeSeriesData {
  metrics: PerformanceMetrics[];
  summary: {
    avgFCR: number;
    avgADG: number;
    avgSGR: number;
    avgSurvivalRate: number;
    totalBiomass: number;
    period: string;
  };
}

export interface PerformanceFilters {
  customerId?: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  dateRange: {
    start: string;
    end: string;
  };
}

class PerformanceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_PERFORMANCE_API_URL || 'http://localhost:3001/api';
  }

  // Generate mock performance data for development
  private generateMockPerformanceData(
    days: number = 30,
    customerId: number = 1,
    level: 'overview' | 'farm' | 'pen' = 'overview'
  ): PerformanceMetrics[] {
    const data: PerformanceMetrics[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      
      // Base values with realistic trends for aquaculture
      const baseFCR = 1.2 + Math.random() * 0.3; // FCR typically 1.2-1.8 for fish
      const baseADG = 8 + Math.random() * 4; // 8-12g/day growth for fish
      const baseSGR = 2.5 + Math.random() * 1.5; // 2.5-4% SGR for fish
      const baseSurvival = 92 + Math.random() * 6; // 92-98% survival rate
      const baseWeight = 200 + (days - i) * 8 + Math.random() * 50; // Growth over time
      
      // Adjust values based on level
      const levelMultiplier = level === 'overview' ? 1 : level === 'farm' ? 0.95 : 0.9;
      
      const metrics: PerformanceMetrics = {
        id: `${customerId}-${level}-${date}`,
        date,
        customerId,
        farmId: level !== 'overview' ? `farm-${Math.floor(Math.random() * 5) + 1}` : undefined,
        penId: level === 'pen' ? `pen-${Math.floor(Math.random() * 10) + 1}` : undefined,
        level,
        fcr: Number((baseFCR * levelMultiplier).toFixed(2)),
        adg: Number((baseADG * levelMultiplier).toFixed(1)),
        sgr: Number((baseSGR * levelMultiplier).toFixed(2)),
        survivalRate: Number((baseSurvival * levelMultiplier).toFixed(1)),
        avgWeight: Number((baseWeight * levelMultiplier).toFixed(0)),
        sizeDistribution: {
          small: Number((20 + Math.random() * 15).toFixed(1)),
          medium: Number((60 + Math.random() * 15).toFixed(1)),
          large: Number((20 + Math.random() * 15).toFixed(1))
        },
        totalBiomass: Number((1000 + Math.random() * 500).toFixed(0)),
        feedConsumption: Number((50 + Math.random() * 20).toFixed(1)),
        stockingDensity: Number((15 + Math.random() * 5).toFixed(1))
      };
      
      data.push(metrics);
    }
    
    return data;
  }

  // Get performance metrics with filters
  async getPerformanceMetrics(filters: PerformanceFilters): Promise<PerformanceTimeSeriesData> {
    try {
      // For development, use mock data
      if (import.meta.env.DEV) {
        const metrics = this.generateMockPerformanceData(
          30,
          filters.customerId || 1,
          filters.level
        );

        // Calculate summary statistics
        const summary = {
          avgFCR: Number((metrics.reduce((sum, m) => sum + m.fcr, 0) / metrics.length).toFixed(2)),
          avgADG: Number((metrics.reduce((sum, m) => sum + m.adg, 0) / metrics.length).toFixed(1)),
          avgSGR: Number((metrics.reduce((sum, m) => sum + m.sgr, 0) / metrics.length).toFixed(2)),
          avgSurvivalRate: Number((metrics.reduce((sum, m) => sum + m.survivalRate, 0) / metrics.length).toFixed(1)),
          totalBiomass: Number((metrics.reduce((sum, m) => sum + m.totalBiomass, 0)).toFixed(0)),
          period: `${filters.dateRange.start} to ${filters.dateRange.end}`
        };

        return { metrics, summary };
      }

      // Production API call
      const params = new URLSearchParams({
        customerId: filters.customerId?.toString() || '',
        farmId: filters.farmId || '',
        penId: filters.penId || '',
        level: filters.level,
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end
      });

      const response = await fetch(`${this.baseUrl}/performance/metrics?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Performance API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      // Fallback to mock data on error
      const metrics = this.generateMockPerformanceData(30, filters.customerId || 1, filters.level);
      const summary = {
        avgFCR: Number((metrics.reduce((sum, m) => sum + m.fcr, 0) / metrics.length).toFixed(2)),
        avgADG: Number((metrics.reduce((sum, m) => sum + m.adg, 0) / metrics.length).toFixed(1)),
        avgSGR: Number((metrics.reduce((sum, m) => sum + m.sgr, 0) / metrics.length).toFixed(2)),
        avgSurvivalRate: Number((metrics.reduce((sum, m) => sum + m.survivalRate, 0) / metrics.length).toFixed(1)),
        totalBiomass: Number((metrics.reduce((sum, m) => sum + m.totalBiomass, 0)).toFixed(0)),
        period: `${filters.dateRange.start} to ${filters.dateRange.end}`
      };
      return { metrics, summary };
    }
  }

  // Get performance trends comparison
  async getPerformanceTrends(filters: PerformanceFilters): Promise<{
    current: PerformanceTimeSeriesData;
    previous: PerformanceTimeSeriesData;
    improvement: {
      fcr: number;
      adg: number;
      sgr: number;
      survivalRate: number;
    };
  }> {
    const current = await this.getPerformanceMetrics(filters);
    
    // Get previous period data for comparison
    const previousFilters = {
      ...filters,
      dateRange: {
        start: format(subDays(new Date(filters.dateRange.start), 30), 'yyyy-MM-dd'),
        end: filters.dateRange.start
      }
    };
    
    const previous = await this.getPerformanceMetrics(previousFilters);
    
    // Calculate improvement percentages
    const improvement = {
      fcr: Number((((previous.summary.avgFCR - current.summary.avgFCR) / previous.summary.avgFCR) * 100).toFixed(1)),
      adg: Number((((current.summary.avgADG - previous.summary.avgADG) / previous.summary.avgADG) * 100).toFixed(1)),
      sgr: Number((((current.summary.avgSGR - previous.summary.avgSGR) / previous.summary.avgSGR) * 100).toFixed(1)),
      survivalRate: Number((((current.summary.avgSurvivalRate - previous.summary.avgSurvivalRate) / previous.summary.avgSurvivalRate) * 100).toFixed(1))
    };
    
    return { current, previous, improvement };
  }

  // Get farms and pens for filtering
  async getFarmsAndPens(customerId: number): Promise<{
    farms: Array<{id: string; name: string; penCount: number}>;
    pens: Array<{id: string; name: string; farmId: string}>;
  }> {
    try {
      if (import.meta.env.DEV) {
        // Mock farm and pen data
        const farms = Array.from({ length: 5 }, (_, i) => ({
          id: `farm-${i + 1}`,
          name: `ฟาร์ม ${i + 1}`,
          penCount: Math.floor(Math.random() * 10) + 5
        }));

        const pens = farms.flatMap(farm => 
          Array.from({ length: farm.penCount }, (_, i) => ({
            id: `pen-${farm.id}-${i + 1}`,
            name: `เล้า ${i + 1}`,
            farmId: farm.id
          }))
        );

        return { farms, pens };
      }

      const response = await fetch(`${this.baseUrl}/farms/${customerId}/structure`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Farms API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching farms and pens:', error);
      // Fallback mock data
      const farms = Array.from({ length: 3 }, (_, i) => ({
        id: `farm-${i + 1}`,
        name: `ฟาร์ม ${i + 1}`,
        penCount: 5
      }));
      
      const pens = farms.flatMap(farm => 
        Array.from({ length: 5 }, (_, i) => ({
          id: `pen-${farm.id}-${i + 1}`,
          name: `เล้า ${i + 1}`,
          farmId: farm.id
        }))
      );
      
      return { farms, pens };
    }
  }
}

export const performanceService = new PerformanceService();
export default performanceService;