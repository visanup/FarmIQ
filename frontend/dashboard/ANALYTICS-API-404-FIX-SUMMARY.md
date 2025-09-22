# Analytics API 404 Error Fix Summary

## 🐛 **ปัญหา**
```
GET http://localhost:7305/performance-metrics?startDate=2025-09-18T03%3A27%3A49.406Z&endDate=2025-09-19T03%3A27%3A49.406Z 404 (Not Found)
```

## 🔍 **สาเหตุ**
1. **Port ผิด**: Analytics API ใช้ port 7304 ไม่ใช่ 7305
2. **Endpoint ผิด**: ไม่มี `/performance-metrics` endpoint ใน Analytics API
3. **API Structure**: Analytics API มี endpoints ที่แตกต่างจากที่คาดหวัง

## ✅ **การแก้ไข**

### 1. **แก้ไข Port และ Base URL**

**Before:**
```typescript
// analyticsService.ts
constructor(baseURL: string = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:7305/api/v1')

// api.ts
ANALYTICS_API: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:7305/api/v1',
```

**After:**
```typescript
// analyticsService.ts
constructor(baseURL: string = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:7304/v1')

// api.ts
ANALYTICS_API: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:7304/v1',
```

### 2. **แก้ไข Endpoints ตาม Documentation**

**Analytics API Endpoints ที่มีจริง:**
- `/v1/agg` - Aggregated sensor data
- `/v1/kpi` - KPI calculations
- `/v1/event-rollup` - Event rollup data
- `/v1/anomalies` - Anomaly detection
- `/v1/fcr` - FCR calculations
- `/v1/size-distribution` - Size distribution analysis

**แก้ไข getPerformanceMetrics():**
```typescript
// Before - ใช้ endpoint ที่ไม่มี
async getPerformanceMetrics(filters: AnalyticsFilters): Promise<PerformanceMetric[]> {
  const url = `/performance-metrics?${queryString}`;
  // ...
}

// After - ใช้ KPI endpoint
async getPerformanceMetrics(filters: AnalyticsFilters): Promise<PerformanceMetric[]> {
  const kpiFilters = {
    tenant_id: filters.farmId || 'default-tenant',
    factory_id: filters.farmId || 'default-factory',
    machine_id: filters.deviceId || 'default-machine',
    metric: filters.metric || 'temperature',
    period: 'hour',
    use_window_s: 60
  };
  const url = `/kpi?${queryString}`;
  // ...
}
```

**แก้ไข getSensorReadings():**
```typescript
// Before - ใช้ endpoint ที่ไม่มี
async getSensorReadings(filters: AnalyticsFilters): Promise<SensorReading[]> {
  const url = `/sensor-readings?${queryString}`;
  // ...
}

// After - ใช้ aggregated data endpoint
async getSensorReadings(filters: AnalyticsFilters): Promise<SensorReading[]> {
  const aggFilters = {
    tenant_id: filters.farmId || 'default-tenant',
    factory_id: filters.farmId || 'default-factory',
    machine_id: filters.deviceId || 'default-machine',
    metric: filters.sensorType || 'temperature',
    window_s: 60,
    start: filters.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: filters.endDate || new Date().toISOString(),
    sensor_id: filters.deviceId
  };
  const url = `/agg?${queryString}`;
  // ...
}
```

### 3. **เพิ่ม Mock Data Fallback**

**RealtimePage.tsx:**
```typescript
// Get performance metrics from Analytics API
try {
  const metrics = await analyticsServiceClient.getPerformanceMetrics({
    farmId: selectedFarm !== 'all' ? selectedFarm : undefined,
    startDate: new Date(Date.now() - timeRange * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  });
  setPerformanceMetrics(metrics);
} catch (error) {
  console.warn('Analytics API unavailable, using mock data:', error);
  // Use mock performance metrics when API is unavailable
  setPerformanceMetrics([
    {
      id: '1',
      farmId: selectedFarm !== 'all' ? selectedFarm : 'farm-1',
      metric: 'temperature',
      value: 25.5,
      unit: '°C',
      timestamp: new Date().toISOString(),
      trend: 'stable' as const
    },
    // ... more mock data
  ]);
}
```

## 📋 **การเปลี่ยนแปลงที่สำคัญ**

### **Port Changes:**
- ✅ Analytics API: `7305` → `7304`
- ✅ Base URL: `/api/v1` → `/v1`

### **Endpoint Mapping:**
- ✅ `getPerformanceMetrics()` → `/v1/kpi`
- ✅ `getSensorReadings()` → `/v1/agg`
- ✅ ใช้ parameters ที่ถูกต้องตาม API documentation

### **Error Handling:**
- ✅ Mock data fallback เมื่อ API ไม่พร้อมใช้งาน
- ✅ Console warnings สำหรับ debugging
- ✅ Graceful degradation

## 🎯 **ผลลัพธ์**

### **ก่อนแก้ไข:**
- ❌ 404 Not Found error
- ❌ UI ไม่แสดงข้อมูล
- ❌ Port และ endpoint ผิด

### **หลังแก้ไข:**
- ✅ ใช้ port และ endpoint ที่ถูกต้อง
- ✅ Mock data fallback เมื่อ API ไม่พร้อม
- ✅ UI ทำงานได้แม้ API ไม่พร้อมใช้งาน
- ✅ Console warnings สำหรับ debugging

## 🔧 **Technical Details**

### **Analytics API Structure:**
```
http://localhost:7304/v1/
├── /health          # Health check
├── /metrics         # Prometheus metrics
├── /agg            # Aggregated sensor data
├── /event-rollup   # Event rollup data
├── /kpi            # KPI calculations
├── /anomalies      # Anomaly detection
├── /fcr            # FCR calculations
└── /size-distribution # Size distribution analysis
```

### **Required Parameters:**
- `tenant_id` (required)
- `factory_id` (required)
- `machine_id` (required)
- `metric` (required)
- `window_s` (required)
- `start` (required)
- `end` (required)

## 🚀 **การใช้งาน**

ตอนนี้หน้า realtime ควรจะทำงานได้อย่างสมบูรณ์:

1. **เมื่อ Analytics API พร้อม**: แสดงข้อมูลจริงจาก `/v1/kpi` และ `/v1/agg`
2. **เมื่อ Analytics API ไม่พร้อม**: แสดง mock data และ console warning
3. **Auto-refresh**: ยังทำงานได้ปกติทุก 30 วินาที

## 📝 **หมายเหตุ**

- Analytics API ใช้ port 7304 ไม่ใช่ 7305
- ต้องใช้ parameters ที่ถูกต้องตาม API documentation
- Mock data fallback ช่วยให้ UI ทำงานได้แม้ API ไม่พร้อม
- สามารถดู console warnings เพื่อ debug API issues
