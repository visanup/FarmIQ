# API Keys Setup Guide

## 🔑 API Keys Configuration

FarmIQ Dashboard ต้องการ API keys เพื่อเชื่อมต่อกับ backend services

### 📋 Required API Keys

| Service | Environment Variable | Default Value | Description |
|---------|---------------------|---------------|-------------|
| Master Service | `VITE_MASTER_SERVICE_API_KEY` | `admin-key` | API key สำหรับ Master Service |
| Analytics API | `VITE_ANALYTICS_API_KEY` | `analytics-key` | API key สำหรับ Analytics Service |
| Sensor Streamer | `VITE_SENSOR_STREAMER_API_KEY` | `sensor-key` | API key สำหรับ Sensor Streamer |

### 🚀 Quick Setup

#### 1. Create Environment File
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

#### 2. Verify Backend Services
ตรวจสอบว่า backend services ทำงานอยู่:

```bash
# เริ่มต้น infrastructure
cd D:\FarmIQ\cloud
docker-compose -f docker-compose.infra.yml up -d

# เริ่มต้น services
docker-compose -f docker-compose.yml up -d
```

#### 3. Test API Keys
ทดสอบ API keys:

```bash
# Master Service
curl -H "X-API-Key: admin-key" http://localhost:7307/api/v1/health

# Analytics API
curl -H "X-API-Key: analytics-key" http://localhost:7305/api/v1/health

# Sensor Streamer
curl -H "X-API-Key: sensor-key" http://localhost:7302/api/health
```

### 🔧 Configuration Details

#### Master Service API Key
- **Default**: `admin-key`
- **Location**: `cloud/services/master-service/src/config/config.ts`
- **Environment Variable**: `ADMIN_API_KEY`
- **Usage**: ใช้สำหรับการเข้าถึงข้อมูล master data

#### Analytics API Key
- **Default**: `analytics-key`
- **Location**: `cloud/services/analytic/services/analytics-api/`
- **Environment Variable**: `ANALYTICS_API_KEY`
- **Usage**: ใช้สำหรับการเข้าถึงข้อมูล analytics

#### Sensor Streamer API Key
- **Default**: `sensor-key`
- **Location**: `cloud/services/sensor-streamer-service/`
- **Environment Variable**: `SENSOR_API_KEY`
- **Usage**: ใช้สำหรับการเข้าถึงข้อมูล sensor

### 🛠️ Troubleshooting

#### Error: "API key is required"
```
Error: Master Service request failed: 401 - {"success":false,"error":"Unauthorized","message":"API key is required"}
```

**Solution:**
1. ตรวจสอบว่าไฟล์ `.env` มีอยู่และมี API key ที่ถูกต้อง
2. ตรวจสอบว่า environment variable ถูกโหลด:
   ```javascript
   console.log('Master Service API Key:', import.meta.env.VITE_MASTER_SERVICE_API_KEY);
   ```
3. ตรวจสอบว่า backend service ทำงานอยู่

#### Error: "Invalid API key"
```
Error: Master Service request failed: 403 - {"success":false,"error":"Forbidden","message":"Invalid API key"}
```

**Solution:**
1. ตรวจสอบว่า API key ตรงกับที่ตั้งค่าใน backend
2. ตรวจสอบว่าไม่มี whitespace หรือ special characters
3. ตรวจสอบ case sensitivity

#### Error: "Service not found"
```
Error: Master Service request failed: 404 - Not Found
```

**Solution:**
1. ตรวจสอบว่า backend service ทำงานอยู่
2. ตรวจสอบ URL configuration
3. ตรวจสอบ port numbers

### 🔒 Security Best Practices

#### 1. Environment Variables
- เก็บ API keys ใน environment variables
- ไม่ commit API keys ลง git
- ใช้ `.env.example` เป็น template

#### 2. API Key Rotation
- เปลี่ยน API keys เป็นระยะ
- ใช้ strong, random keys
- เก็บ backup ของ keys ที่ใช้งาน

#### 3. Access Control
- จำกัดการเข้าถึง API keys
- ใช้ different keys สำหรับ different environments
- Monitor API key usage

### 📝 Environment Variables Reference

#### Development
```bash
# API Keys
VITE_MASTER_SERVICE_API_KEY=admin-key
VITE_ANALYTICS_API_KEY=analytics-key
VITE_SENSOR_STREAMER_API_KEY=sensor-key

# API URLs
VITE_MASTER_SERVICE_URL=http://localhost:7307/api/v1
VITE_ANALYTICS_API_URL=http://localhost:7305/api/v1
VITE_SENSOR_STREAMER_URL=http://localhost:7302/api

# Development
VITE_NODE_ENV=development
VITE_DEBUG=true
```

#### Production
```bash
# API Keys (use strong, random keys)
VITE_MASTER_SERVICE_API_KEY=your-production-master-key
VITE_ANALYTICS_API_KEY=your-production-analytics-key
VITE_SENSOR_STREAMER_API_KEY=your-production-sensor-key

# API URLs (use production URLs)
VITE_MASTER_SERVICE_URL=https://api.farmiq.com/master/v1
VITE_ANALYTICS_API_URL=https://api.farmiq.com/analytics/v1
VITE_SENSOR_STREAMER_URL=https://api.farmiq.com/sensor/v1

# Production
VITE_NODE_ENV=production
VITE_DEBUG=false
```

### 🧪 Testing API Keys

#### 1. Health Check Script
สร้างไฟล์ `test-api-keys.js`:

```javascript
const API_KEYS = {
  master: process.env.VITE_MASTER_SERVICE_API_KEY || 'admin-key',
  analytics: process.env.VITE_ANALYTICS_API_KEY || 'analytics-key',
  sensor: process.env.VITE_SENSOR_STREAMER_API_KEY || 'sensor-key'
};

const SERVICES = {
  master: 'http://localhost:7307/api/v1',
  analytics: 'http://localhost:7305/api/v1',
  sensor: 'http://localhost:7302/api'
};

async function testAPIKey(service, url, key) {
  try {
    const response = await fetch(`${url}/health`, {
      headers: { 'X-API-Key': key }
    });
    
    if (response.ok) {
      console.log(`✅ ${service} service: OK`);
    } else {
      console.log(`❌ ${service} service: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ ${service} service: ${error.message}`);
  }
}

async function testAllServices() {
  console.log('Testing API Keys...\n');
  
  for (const [service, url] of Object.entries(SERVICES)) {
    await testAPIKey(service, url, API_KEYS[service]);
  }
}

testAllServices();
```

#### 2. Run Test
```bash
node test-api-keys.js
```

### 📚 Additional Resources

- [Master Service Documentation](../cloud/services/master-service/README.md)
- [Analytics Service Documentation](../cloud/services/analytic/README.md)
- [Sensor Streamer Documentation](../cloud/services/sensor-streamer-service/README.md)
- [Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)

### 🆘 Support

หากพบปัญหาเกี่ยวกับ API keys:

1. ตรวจสอบ logs ของ backend services
2. ตรวจสอบ network requests ใน browser dev tools
3. ตรวจสอบ environment variables
4. ติดต่อทีมพัฒนา

---

**Note**: API keys เป็นข้อมูลสำคัญ ควรเก็บรักษาให้ปลอดภัยและไม่เปิดเผยต่อสาธารณะ
