# FarmIQ Dashboard - API Integration Guide

## 📋 Overview

This guide explains how the FarmIQ Dashboard integrates with the cloud backend services to display real-time agricultural data.

## 🏗️ Architecture

### Service Integration Pattern

```
Dashboard (Frontend)
├── Auth Service (7300) - Authentication & User Management
├── Master Service (7307) - Master Data (Customers, Farms, Devices, Animals)
├── Analytics API (7305) - Analytics & Performance Metrics
└── Sensor Streamer (7302) - Real-time Sensor Data
```

### Data Flow

1. **Authentication**: User logs in via Auth Service
2. **Master Data**: Dashboard fetches farms, devices, animals from Master Service
3. **Real-time Data**: Sensor readings from Sensor Streamer Service
4. **Analytics**: Performance metrics and health records from Analytics API
5. **Fallback**: Mock data when services are unavailable

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the dashboard root:

```bash
# API Base URLs
VITE_API_BASE_URL=http://localhost:7300/api
VITE_MASTER_SERVICE_URL=http://localhost:7307/api/v1
VITE_ANALYTICS_API_URL=http://localhost:7305/api/v1
VITE_SENSOR_STREAMER_URL=http://localhost:7302/api

# Optional: TMD Weather API Token
VITE_TMD_API_TOKEN=your_tmd_api_token_here

# Development mode
DEV=true
```

### Service Configuration

The API configuration is centralized in `src/config/api.ts`:

```typescript
import { API_CONFIG, serviceStatus } from '@/config/api';

// Check if a service is online
const isMasterServiceOnline = serviceStatus.getServiceStatus('master');
```

## 📡 API Services

### 1. Master Service Client (`masterService.ts`)

**Purpose**: Centralized master data management

**Endpoints**:
- `GET /customers` - List all customers
- `GET /farms` - List all farms
- `GET /devices` - List all devices
- `GET /animals` - List all animals
- `GET /device-health` - Device health status

**Usage**:
```typescript
import { masterServiceClient } from '@/services/api';

// Get all farms
const farms = await masterServiceClient.getFarms();

// Get farms by customer
const customerFarms = await masterServiceClient.getFarmsByCustomer('customer-1');

// Create new farm
const newFarm = await masterServiceClient.createFarm({
  name: 'New Farm',
  location: 'Bangkok',
  type: 'dairy',
  isActive: true
});
```

### 2. Analytics Service Client (`analyticsService.ts`)

**Purpose**: Analytics, KPIs, and performance metrics

**Endpoints**:
- `GET /sensor-readings/time-series` - Time series sensor data
- `GET /performance-metrics` - Performance metrics
- `GET /kpi` - KPI calculations
- `GET /anomalies` - Anomaly detection
- `GET /fcr` - Feed Conversion Ratio calculations
- `GET /dashboard/summary` - Dashboard summary

**Usage**:
```typescript
import { analyticsServiceClient } from '@/services/api';

// Get sensor time series data
const timeSeriesData = await analyticsServiceClient.getSensorTimeSeries({
  farmId: 'farm-1',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  sensorType: 'temperature'
});

// Get KPI metrics
const kpiMetrics = await analyticsServiceClient.getKPIMetrics({
  farmId: 'farm-1',
  metric: 'milk_production'
});

// Get anomaly detection
const anomalies = await analyticsServiceClient.getAnomalies({
  farmId: 'farm-1',
  severity: 'high'
});
```

### 3. Sensor Streamer Client (`sensorClient.ts`)

**Purpose**: Real-time sensor data ingestion

**Endpoints**:
- `GET /sensor-readings` - Sensor readings
- `GET /device-health` - Device health status
- `GET /lab-readings` - Lab test results
- `GET /sweep-readings` - Sweep data
- `GET /time-series` - Aggregated time series data

**Usage**:
```typescript
import { sensorStreamerClient } from '@/services/api';

// Get real-time sensor readings
const readings = await sensorStreamerClient.getSensorReadings({
  deviceId: 'device-1',
  sensorType: 'temperature',
  limit: 100
});

// Get device health
const deviceHealth = await sensorStreamerClient.getDeviceHealth({
  deviceId: 'device-1'
});
```

## 🔄 Fallback Strategy

### Graceful Degradation

All API clients implement a fallback strategy:

1. **Primary**: Try to connect to real service
2. **Fallback**: Use mock data if service is unavailable
3. **Logging**: Log warnings for debugging

```typescript
// Example from apiClient.ts
async getFarms(): Promise<Farm[]> {
  try {
    return await masterServiceClient.getFarms();
  } catch (error) {
    console.warn('Master Service unavailable, falling back to mock data:', error);
    return mockFarms; // Fallback to mock data
  }
}
```

### Service Status Tracking

The dashboard tracks service availability:

```typescript
import { serviceStatus } from '@/config/api';

// Check service status
const isOnline = serviceStatus.getServiceStatus('master');

// Get all service statuses
const allStatuses = serviceStatus.getAllStatus();
```

## 📊 Data Types

### Core Types

```typescript
// Master Data Types
interface Farm {
  id: string;
  name: string;
  location: string;
  size: number;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Device {
  id: string;
  farmId: string;
  houseId?: string;
  deviceTypeId: string;
  serialNumber: string;
  name: string;
  location: { x: number; y: number; z: number };
  isActive: boolean;
  lastSeen: string;
}

// Analytics Types
interface KPIMetrics {
  farmId: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  trend?: 'up' | 'down' | 'stable';
}

interface AnomalyDetection {
  id: string;
  deviceId: string;
  farmId: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}
```

## 🚀 Getting Started

### 1. Start Backend Services

```bash
# Start cloud services
cd D:\FarmIQ\cloud
docker-compose -f docker-compose.infra.yml up -d
docker-compose -f docker-compose.yml up -d
```

### 2. Configure Dashboard

```bash
# Copy environment file
cp .env.example .env

# Edit configuration
# Update API URLs if needed
```

### 3. Start Dashboard

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### 4. Verify Integration

1. Open http://localhost:3001
2. Login with demo credentials
3. Check browser console for service status
4. Verify data is loading from real services

## 🔍 Debugging

### Service Health Checks

```typescript
// Check individual service health
const health = await masterServiceClient.healthCheck();
console.log('Master Service:', health);

// Check all services
const services = ['auth', 'master', 'analytics', 'sensor'];
for (const service of services) {
  try {
    const health = await apiClient.healthCheck();
    serviceStatus.setServiceStatus(service, true);
  } catch (error) {
    serviceStatus.setServiceStatus(service, false);
  }
}
```

### Network Monitoring

```typescript
// Monitor API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('API Call:', args[0]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status, response.statusText);
  return response;
};
```

## 📈 Performance Optimization

### Caching Strategy

```typescript
// Implement caching for frequently accessed data
const cache = new Map();

async function getCachedFarms(): Promise<Farm[]> {
  const cacheKey = 'farms';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
    return cached.data;
  }
  
  const farms = await masterServiceClient.getFarms();
  cache.set(cacheKey, { data: farms, timestamp: Date.now() });
  return farms;
}
```

### Error Handling

```typescript
// Centralized error handling
class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public service?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage in API clients
if (!res.ok) {
  throw new APIError(
    `Request failed: ${res.statusText}`,
    res.status,
    'master-service'
  );
}
```

## 🔐 Security

### Authentication

All API calls include JWT tokens:

```typescript
// Automatic token inclusion
const res = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  },
});
```

### CORS Configuration

Services are configured with appropriate CORS settings:

```typescript
// Master Service CORS
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOWED_ORIGINS=*
CORS_ALLOW_METHODS=*
CORS_ALLOW_HEADERS=*
```

## 📚 Additional Resources

- [Master Service Documentation](../cloud/services/master-service/README.md)
- [Analytics Platform Documentation](../cloud/services/analytic/README.md)
- [Sensor Streamer Documentation](../cloud/services/sensor-streamer-service/README.md)
- [System Architecture](../cloud/docs/System-Architecture.md)

## 🆘 Troubleshooting

### Common Issues

1. **Service Unavailable**: Check if backend services are running
2. **CORS Errors**: Verify CORS configuration in services
3. **Authentication Errors**: Check JWT token validity
4. **Data Not Loading**: Check browser console for errors

### Support

- Check service health endpoints
- Review browser console logs
- Verify network connectivity
- Check service configuration

---

*Last updated: 2024-01-15*
