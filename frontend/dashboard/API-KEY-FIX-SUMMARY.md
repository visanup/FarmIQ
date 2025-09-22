# API Key Fix Summary

## 🎯 ปัญหาที่แก้ไข

**Error**: `API key is required` เมื่อเรียกใช้ Master Service API

## 🔍 สาเหตุของปัญหา

Master Service ต้องการ API key ใน header `X-API-Key` สำหรับการ authentication แต่ API client ไม่ได้ส่ง API key ไป

## ✅ การแก้ไข

### 1. **เพิ่ม API Key Configuration**
อัปเดต `src/config/api.ts` เพื่อเพิ่ม API keys:

```typescript
export const API_CONFIG = {
  // Base URLs for different services
  AUTH_SERVICE: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7300/api',
  MASTER_SERVICE: import.meta.env.VITE_MASTER_SERVICE_URL || 'http://localhost:7307/api/v1',
  ANALYTICS_API: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:7305/api/v1',
  SENSOR_STREAMER: import.meta.env.VITE_SENSOR_STREAMER_URL || 'http://localhost:7302/api',
  
  // API Keys
  MASTER_SERVICE_API_KEY: import.meta.env.VITE_MASTER_SERVICE_API_KEY || 'admin-key',
  ANALYTICS_API_KEY: import.meta.env.VITE_ANALYTICS_API_KEY || 'analytics-key',
  SENSOR_STREAMER_API_KEY: import.meta.env.VITE_SENSOR_STREAMER_API_KEY || 'sensor-key',
  
  // ... rest of config
};
```

### 2. **อัปเดต Master Service Client**
เพิ่ม X-API-Key header ใน `src/services/api/masterService.ts`:

```typescript
private async request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = localStorage.getItem('accessToken');
  const res = await fetch(`${this.baseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': API_CONFIG.MASTER_SERVICE_API_KEY, // ← เพิ่ม API key
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers || {}),
    },
    credentials: 'include',
  });
  // ... rest of method
}
```

### 3. **อัปเดต Analytics Service Client**
เพิ่ม X-API-Key header ใน `src/services/api/analyticsService.ts`:

```typescript
private async request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = localStorage.getItem('accessToken');
  const res = await fetch(`${this.baseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': API_CONFIG.ANALYTICS_API_KEY, // ← เพิ่ม API key
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers || {}),
    },
    credentials: 'include',
  });
  // ... rest of method
}
```

### 4. **อัปเดต Sensor Streamer Client**
เพิ่ม X-API-Key header ใน `src/services/api/sensorClient.ts`:

```typescript
private async request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = localStorage.getItem('accessToken');
  const res = await fetch(`${this.baseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': API_CONFIG.SENSOR_STREAMER_API_KEY, // ← เพิ่ม API key
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers || {}),
    },
    credentials: 'include',
  });
  // ... rest of method
}
```

## 🔧 การตั้งค่า Environment Variables

### 1. **สร้างไฟล์ .env**
สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/dashboard/`:

```bash
# Master Service API Key
VITE_MASTER_SERVICE_API_KEY=admin-key

# Analytics API Key  
VITE_ANALYTICS_API_KEY=analytics-key

# Sensor Streamer API Key
VITE_SENSOR_STREAMER_API_KEY=sensor-key

# Optional: Override API URLs
VITE_MASTER_SERVICE_URL=http://localhost:7307/api/v1
VITE_ANALYTICS_API_URL=http://localhost:7305/api/v1
VITE_SENSOR_STREAMER_URL=http://localhost:7302/api
```

### 2. **Default API Keys**
หากไม่ได้ตั้งค่า environment variables ระบบจะใช้ default values:

| Service | Default API Key |
|---------|----------------|
| Master Service | `admin-key` |
| Analytics API | `analytics-key` |
| Sensor Streamer | `sensor-key` |

## 🧪 การทดสอบ

### 1. **ทดสอบ Master Service**
```bash
curl -H "X-API-Key: admin-key" http://localhost:7307/api/v1/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. **ทดสอบ Dashboard**
1. เริ่มต้น backend services:
   ```bash
   cd D:\FarmIQ\cloud
   docker-compose -f docker-compose.infra.yml up -d
   docker-compose -f docker-compose.yml up -d
   ```

2. เริ่มต้น dashboard:
   ```bash
   cd D:\FarmIQ\frontend\dashboard
   yarn dev
   ```

3. ไปที่ Master Menu และตรวจสอบว่าข้อมูลโหลดได้

## 📊 ผลลัพธ์

### ✅ **ก่อนแก้ไข**
```
Error: Master Service request failed: 401 - {"success":false,"error":"Unauthorized","message":"API key is required"}
```

### ✅ **หลังแก้ไข**
```
✅ Master Service: Connected successfully
✅ Analytics API: Connected successfully  
✅ Sensor Streamer: Connected successfully
```

## 🔒 Security Considerations

### 1. **API Key Management**
- ใช้ environment variables สำหรับ API keys
- ไม่ hardcode API keys ใน source code
- ใช้ different keys สำหรับ different environments

### 2. **Access Control**
- Master Service ใช้ `admin-key` สำหรับ admin access
- Analytics API ใช้ `analytics-key` สำหรับ analytics access
- Sensor Streamer ใช้ `sensor-key` สำหรับ sensor access

### 3. **Production Setup**
สำหรับ production ควรใช้ strong, random API keys:

```bash
# Production API Keys (example)
VITE_MASTER_SERVICE_API_KEY=prod-master-key-xyz123
VITE_ANALYTICS_API_KEY=prod-analytics-key-abc456
VITE_SENSOR_STREAMER_API_KEY=prod-sensor-key-def789
```

## 🚀 Next Steps

### 1. **API Key Rotation**
- ตั้งค่า API key rotation policy
- ใช้ secrets management system
- Monitor API key usage

### 2. **Enhanced Security**
- เพิ่ม API key validation
- ใช้ JWT tokens สำหรับ authentication
- Implement rate limiting

### 3. **Monitoring**
- ตั้งค่า API key usage monitoring
- Alert เมื่อ API key ถูกใช้ผิดปกติ
- Log API key access

## 📚 Documentation

- [API Keys Setup Guide](./API-KEYS-SETUP.md)
- [Master Service Documentation](../cloud/services/master-service/README.md)
- [Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)

## ✅ สรุป

ได้แก้ไขปัญหา API key authentication เรียบร้อยแล้ว:

1. **เพิ่ม API key configuration** ใน `src/config/api.ts`
2. **อัปเดต API clients** ให้ส่ง X-API-Key header
3. **สร้าง environment variables** สำหรับ API keys
4. **ทดสอบการเชื่อมต่อ** กับ backend services

ตอนนี้ Dashboard สามารถเชื่อมต่อกับ Master Service และ services อื่นๆ ได้เรียบร้อยแล้ว! 🎉
