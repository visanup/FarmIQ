import { apiClient } from '@/services/api/client';
import { webSocketService } from '@/services/websocket/client';
import { AnalyticsFeature, SensorReading, TimeRange, ChartData } from '@/types';

export class AnalyticsService {
  // Get aggregated data for a specific metric
  async getMetricData(params: {
    tenant_id: string;
    device_id: string;
    metric: string;
    timeRange: TimeRange;
    window?: '1m' | '5m' | '1h';
  }): Promise<AnalyticsFeature[]> {
    const response = await apiClient.getTimeSeriesData(params);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch metric data');
  }

  // Convert analytics features to chart data format
  convertToChartData(
    features: AnalyticsFeature[],
    metricLabel: string,
    valueField: 'avg' | 'min' | 'max' | 'count' = 'avg'
  ): ChartData {
    const labels = features.map(f => 
      new Date(f.bucket).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const data = features.map(f => f[valueField]);

    return {
      labels,
      datasets: [{
        label: metricLabel,
        data,
        borderColor: this.getMetricColor(features[0]?.metric || ''),
        backgroundColor: this.getMetricColor(features[0]?.metric || '', 0.1),
        fill: false,
      }],
    };
  }

  // Get multiple metrics for comparison
  async getMultiMetricData(params: {
    tenant_id: string;
    device_id: string;
    metrics: string[];
    timeRange: TimeRange;
    window?: '1m' | '5m' | '1h';
  }): Promise<ChartData> {
    const { metrics, ...baseParams } = params;
    
    const promises = metrics.map(metric =>
      this.getMetricData({ ...baseParams, metric })
    );

    const results = await Promise.all(promises);
    
    if (results.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Use the first result's timestamps as labels
    const labels = results[0].map(f => 
      new Date(f.bucket).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const datasets = results.map((features, index) => ({
      label: this.getMetricLabel(metrics[index]),
      data: features.map(f => f.avg),
      borderColor: this.getMetricColor(metrics[index]),
      backgroundColor: this.getMetricColor(metrics[index], 0.1),
      fill: false,
    }));

    return { labels, datasets };
  }

  // Get device comparison data
  async getDeviceComparisonData(params: {
    tenant_id: string;
    device_ids: string[];
    metric: string;
    timeRange: TimeRange;
    window?: '1m' | '5m' | '1h';
  }): Promise<ChartData> {
    const { device_ids, ...baseParams } = params;
    
    const promises = device_ids.map(device_id =>
      this.getMetricData({ ...baseParams, device_id })
    );

    const results = await Promise.all(promises);
    
    if (results.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = results[0].map(f => 
      new Date(f.bucket).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const datasets = results.map((features, index) => ({
      label: `อุปกรณ์ ${device_ids[index]}`,
      data: features.map(f => f.avg),
      borderColor: this.getDeviceColor(index),
      backgroundColor: this.getDeviceColor(index, 0.1),
      fill: false,
    }));

    return { labels, datasets };
  }

  // Real-time data subscription
  subscribeToRealTimeData(
    filters: { tenant_id?: string; device_id?: string; metric?: string },
    callback: (data: SensorReading) => void
  ): string {
    return webSocketService.subscribeSensorReadings(filters, callback);
  }

  // Unsubscribe from real-time data
  unsubscribeFromRealTimeData(subscriptionId: string): void {
    webSocketService.unsubscribe(subscriptionId);
  }

  // Calculate statistical insights
  calculateStatistics(features: AnalyticsFeature[]) {
    if (features.length === 0) {
      return {
        average: 0,
        minimum: 0,
        maximum: 0,
        trend: 'stable' as 'increasing' | 'decreasing' | 'stable',
        totalDataPoints: 0,
      };
    }

    const values = features.map(f => f.avg);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);

    // Simple trend calculation
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.ceil(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const difference = secondAvg - firstAvg;
    const threshold = average * 0.05; // 5% threshold
    
    if (difference > threshold) trend = 'increasing';
    else if (difference < -threshold) trend = 'decreasing';

    return {
      average: Number(average.toFixed(2)),
      minimum: Number(minimum.toFixed(2)),
      maximum: Number(maximum.toFixed(2)),
      trend,
      totalDataPoints: features.reduce((sum, f) => sum + f.count, 0),
    };
  }

  // Helper methods
  private getMetricColor(metric: string, alpha: number = 1): string {
    const colors: Record<string, string> = {
      temp: '#FF6B6B',
      temperature: '#FF6B6B',
      humidity: '#4ECDC4',
      pressure: '#45B7D1',
      ph: '#96CEB4',
      dissolved_oxygen: '#FFEAA7',
      ammonia: '#DDA0DD',
      turbidity: '#98D8C8',
    };

    const baseColor = colors[metric.toLowerCase()] || '#74B9FF';
    
    if (alpha === 1) return baseColor;
    
    // Convert hex to rgba
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private getDeviceColor(index: number, alpha: number = 1): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#74B9FF'
    ];
    
    const baseColor = colors[index % colors.length];
    
    if (alpha === 1) return baseColor;
    
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private getMetricLabel(metric: string): string {
    const labels: Record<string, string> = {
      temp: 'อุณหภูมิ (°C)',
      temperature: 'อุณหภูมิ (°C)',
      humidity: 'ความชื้น (%)',
      pressure: 'ความดัน (Pa)',
      ph: 'ค่า pH',
      dissolved_oxygen: 'ออกซิเจนละลาย (mg/L)',
      ammonia: 'แอมโมเนีย (mg/L)',
      turbidity: 'ความขุ่น (NTU)',
    };

    return labels[metric.toLowerCase()] || metric;
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;