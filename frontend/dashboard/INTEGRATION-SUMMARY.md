# FarmIQ Dashboard - Backend Integration Summary

## 🎯 สรุปการทำงาน

ได้ทำการออกแบบและสร้างระบบเชื่อมต่อข้อมูลจาก cloud backend services ไปยัง dashboard เรียบร้อยแล้ว โดยเริ่มจาก **Master Service** ตามที่ต้องการ

## 📁 ไฟล์ที่สร้างใหม่

### 1. API Service Clients
- `src/services/api/masterService.ts` - เชื่อมต่อ Master Service (port 7307)
- `src/services/api/analyticsService.ts` - เชื่อมต่อ Analytics API (port 7305)
- `src/services/api/sensorClient.ts` - เชื่อมต่อ Sensor Streamer (port 7302)
- `src/services/api/index.ts` - Centralized exports

### 2. Configuration
- `src/config/api.ts` - API configuration และ service status tracking

### 3. Custom Hooks
- `src/hooks/useMasterData.ts` - Hook สำหรับ Master Service data
- `src/hooks/useAnalyticsData.ts` - Hook สำหรับ Analytics data

### 4. Example Components
- `src/pages/dashboard/components/RealTimeDataPanel.tsx` - ตัวอย่างการใช้งาน

### 5. Documentation
- `docs/API-INTEGRATION-GUIDE.md` - คู่มือการใช้งาน API integration

## 🔄 การอัปเดตไฟล์เดิม

### API Client (`src/services/api/client.ts`)
- อัปเดตให้ใช้ Master Service สำหรับข้อมูลหลัก (Customers, Farms, Devices, Animals)
- อัปเดตให้ใช้ Analytics Service สำหรับ Performance Metrics และ Health Records
- อัปเดตให้ใช้ Sensor Streamer Service สำหรับ Sensor Readings
- เพิ่ม fallback strategy เมื่อ services ไม่พร้อมใช้งาน

## 🏗️ Architecture Pattern

### Service Integration
```
Dashboard Frontend
├── Auth Service (7300) ✅ เชื่อมต่อแล้ว
├── Master Service (7307) ✅ เชื่อมต่อใหม่
├── Analytics API (7305) ✅ เชื่อมต่อใหม่
└── Sensor Streamer (7302) ✅ เชื่อมต่อใหม่
```

### Data Flow
1. **Authentication** → Auth Service
2. **Master Data** → Master Service (Customers, Farms, Devices, Animals)
3. **Real-time Data** → Sensor Streamer Service
4. **Analytics** → Analytics API (KPIs, Anomalies, FCR, etc.)
5. **Fallback** → Mock data เมื่อ services ไม่พร้อม

## 🚀 วิธีการใช้งาน

### 1. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ใน dashboard root:
```bash
VITE_API_BASE_URL=http://localhost:7300/api
VITE_MASTER_SERVICE_URL=http://localhost:7307/api/v1
VITE_ANALYTICS_API_URL=http://localhost:7305/api/v1
VITE_SENSOR_STREAMER_URL=http://localhost:7302/api
```

### 2. เริ่มต้น Backend Services
```bash
cd D:\FarmIQ\cloud
docker-compose -f docker-compose.infra.yml up -d
docker-compose -f docker-compose.yml up -d
```

### 3. เริ่มต้น Dashboard
```bash
cd D:\FarmIQ\frontend\dashboard
yarn install
yarn dev
```

## 📊 ตัวอย่างการใช้งาน

### ใช้ Master Service
```typescript
import { masterServiceClient } from '@/services/api';

// ดึงข้อมูลฟาร์ม
const farms = await masterServiceClient.getFarms();

// สร้างฟาร์มใหม่
const newFarm = await masterServiceClient.createFarm({
  name: 'ฟาร์มใหม่',
  location: 'กรุงเทพฯ',
  type: 'dairy',
  isActive: true
});
```

### ใช้ Analytics Service
```typescript
import { analyticsServiceClient } from '@/services/api';

// ดึงข้อมูล KPI
const kpiMetrics = await analyticsServiceClient.getKPIMetrics({
  farmId: 'farm-1',
  metric: 'milk_production'
});

// ดึงข้อมูล Anomaly Detection
const anomalies = await analyticsServiceClient.getAnomalies({
  farmId: 'farm-1',
  severity: 'high'
});
```

### ใช้ Custom Hooks
```typescript
import { useMasterData, useAnalyticsData } from '@/hooks';

function Dashboard() {
  const { farms, devices, loading, error } = useMasterData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const { kpiMetrics, anomalies, criticalAnomalies } = useAnalyticsData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  return (
    <div>
      <h2>Total Farms: {farms.length}</h2>
      <h2>Critical Alerts: {criticalAnomalies}</h2>
    </div>
  );
}
```

## 🔧 Features ที่เพิ่มเข้ามา

### 1. Graceful Fallback
- ระบบจะใช้ mock data เมื่อ backend services ไม่พร้อมใช้งาน
- แสดง warning ใน console เมื่อ fallback ทำงาน
- UI ยังคงใช้งานได้แม้ services ไม่พร้อม

### 2. Service Status Tracking
- ติดตามสถานะของแต่ละ service
- แสดงข้อมูลใน console สำหรับ debugging
- สามารถตรวจสอบ service health ได้

### 3. Real-time Updates
- Auto-refresh data ทุก 30 วินาที (configurable)
- Manual refresh button
- Loading states และ error handling

### 4. Type Safety
- TypeScript types สำหรับทุก API responses
- Zod validation schemas
- IntelliSense support

## 🎨 UI Components

### RealTimeDataPanel
- แสดงข้อมูล real-time จาก Master Service และ Analytics Service
- แสดง Farm Overview, Device Status, Animal Count
- แสดง Alerts, KPI Metrics, FCR Performance
- แสดง Recent Anomalies
- Auto-refresh และ manual refresh

## 📈 Performance Optimizations

### 1. Caching Strategy
- Service status caching
- Data caching ใน custom hooks
- Configurable cache duration

### 2. Error Handling
- Centralized error handling
- Graceful degradation
- User-friendly error messages

### 3. Loading States
- Individual loading states สำหรับแต่ละ service
- Global loading indicator
- Skeleton loading (สามารถเพิ่มได้)

## 🔍 Debugging

### 1. Console Logging
- Service status logging
- API call logging
- Error logging

### 2. Health Checks
```typescript
// ตรวจสอบ service health
const health = await masterServiceClient.healthCheck();
console.log('Master Service:', health);
```

### 3. Service Status
```typescript
import { serviceStatus } from '@/config/api';

// ตรวจสอบสถานะ service
const isOnline = serviceStatus.getServiceStatus('master');
console.log('Master Service Online:', isOnline);
```

## 🚀 Next Steps

### 1. Testing
- Unit tests สำหรับ API clients
- Integration tests สำหรับ service connections
- E2E tests สำหรับ user workflows

### 2. Monitoring
- Performance monitoring
- Error tracking
- Service health monitoring

### 3. Optimization
- Data caching strategies
- Request batching
- Lazy loading

### 4. Additional Features
- WebSocket connections สำหรับ real-time updates
- Push notifications สำหรับ alerts
- Data export functionality

## 📚 Documentation

- `docs/API-INTEGRATION-GUIDE.md` - คู่มือการใช้งาน API integration
- `src/config/api.ts` - API configuration
- `src/hooks/` - Custom hooks documentation
- `src/services/api/` - API client documentation

---

## ✅ สรุป

ได้ทำการเชื่อมต่อข้อมูลจาก cloud backend services ไปยัง dashboard เรียบร้อยแล้ว โดย:

1. **Master Service** - ข้อมูลหลัก (Customers, Farms, Devices, Animals)
2. **Analytics Service** - ข้อมูล analytics (KPIs, Anomalies, FCR, etc.)
3. **Sensor Streamer** - ข้อมูล real-time sensor
4. **Fallback Strategy** - ใช้ mock data เมื่อ services ไม่พร้อม
5. **Type Safety** - TypeScript types และ validation
6. **Real-time Updates** - Auto-refresh และ manual refresh
7. **Error Handling** - Graceful degradation และ user-friendly errors

ระบบพร้อมใช้งานและสามารถขยายเพิ่มเติมได้ตามต้องการ! 🎉
