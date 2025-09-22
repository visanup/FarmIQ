# Sensor Streamer Real Data Integration

## 🎯 **ปัญหา**
หน้า realtime ไม่แสดงข้อมูลจาก Sensor Streamer Service แม้ว่าจะมีข้อมูลจริงอยู่ (34,440 records)

## 🔍 **สาเหตุ**
1. **Response Format ผิด**: API ส่งมาเป็น `{readings: [...], total: 34440}` แต่เราคาดหวัง `{data: [...]}`
2. **Mock Data Override**: ใช้ mock data แทนข้อมูลจริง
3. **Date Range ผิด**: ใช้ 5 minutes แทน 24 hours

## ✅ **การแก้ไข**

### 1. **แก้ไข Response Format ใน Sensor Client**

**Before:**
```typescript
const response = await this.request<PaginatedResponse<SensorReading>>(url);
return response?.data || [];
```

**After:**
```typescript
const response = await this.request<{readings: SensorReading[], total: number, page: number, limit: number}>(url);
return response?.readings || [];
```

### 2. **แก้ไข Analytics Service ให้ใช้ข้อมูลจริง**

**Before:**
```typescript
// For now, return mock data since there's no real data in the database
console.warn('Using mock sensor readings - no real data in database');
// ... mock data generation
```

**After:**
```typescript
// Use real data from Sensor Streamer Service
const queryString = this.buildQueryString(filters);
const url = queryString ? `/sensor-readings?${queryString}` : '/sensor-readings';
const response = await this.request<{readings: SensorReading[], total: number, page: number, limit: number}>(url);
return response?.readings || [];
```

### 3. **แก้ไข Date Range ใน RealtimePage**

**Before:**
```typescript
startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
```

**After:**
```typescript
startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
```

## 📊 **ข้อมูลจริงที่ได้จาก API**

### **Sensor Streamer Response:**
```json
{
  "readings": [
    {
      "id": "2025-09-18T23:00:00.000Z",
      "deviceId": "device_tenant01_house01f01h01",
      "farmId": "farm01f01",
      "houseId": "house01f01h01",
      "sensorType": "temperature",
      "value": 27.73,
      "unit": "°C",
      "location": {},
      "metadata": {},
      "timestamp": "2025-09-18T23:00:00.000Z",
      "createdAt": "2025-09-18T23:00:00.000Z"
    },
    {
      "sensorType": "humidity",
      "value": 45.51,
      "unit": "%"
    },
    {
      "sensorType": "CO2",
      "value": 1425.35,
      "unit": "ppm"
    },
    {
      "sensorType": "NH3",
      "value": 37.45,
      "unit": "ppm"
    },
    {
      "sensorType": "illuminance",
      "value": 3281.46,
      "unit": "lux"
    }
  ],
  "total": 34440,
  "page": 1,
  "limit": 5
}
```

### **Sensor Types ที่มี:**
- ✅ **Temperature**: 27.73°C
- ✅ **Humidity**: 45.51%
- ✅ **CO2**: 1425.35 ppm
- ✅ **NH3**: 37.45 ppm
- ✅ **Illuminance**: 3281.46 lux

## 🎯 **ผลลัพธ์**

### **ก่อนแก้ไข:**
- ❌ ไม่แสดงข้อมูลจริง
- ❌ ใช้ mock data
- ❌ Response format ผิด

### **หลังแก้ไข:**
- ✅ แสดงข้อมูลจริงจาก Sensor Streamer
- ✅ 34,440 records พร้อมใช้งาน
- ✅ 5 sensor types: temperature, humidity, CO2, NH3, illuminance
- ✅ Real-time updates ทุก 30 วินาที

## 🔧 **Technical Details**

### **API Endpoints ที่ใช้:**
- **Sensor Streamer**: `GET /api/sensor-readings`
- **Parameters**: `limit`, `startDate`, `endDate`, `deviceId`, `farmId`

### **Data Processing:**
- **Latest Values**: ประมวลผลค่าล่าสุดของแต่ละ sensor type
- **Real-time Charts**: แสดงกราฟข้อมูล 24 ชั่วโมง
- **Sensor Value Cards**: แสดงค่าปัจจุบันพร้อม status indicators

### **Performance:**
- **Total Records**: 34,440 sensor readings
- **Date Range**: 24 hours
- **Auto-refresh**: ทุก 30 วินาที
- **Filtering**: ตาม farm และ device

## 🚀 **การใช้งาน**

ตอนนี้หน้า realtime แสดงข้อมูลจริงจาก Sensor Streamer Service:

1. **Sensor Value Cards**: แสดงค่าล่าสุดของ temperature, humidity, CO2, NH3, illuminance
2. **Real-time Charts**: กราฟข้อมูล 24 ชั่วโมง
3. **Performance Metrics**: ยังใช้ mock data (เพราะ Analytics API มีปัญหา)
4. **Auto-refresh**: ข้อมูลอัปเดตทุก 30 วินาที

## 📝 **หมายเหตุ**

- **ข้อมูลจริง**: ใช้ข้อมูลจาก Sensor Streamer Service (34,440 records)
- **Performance Metrics**: ยังใช้ mock data (เพราะ Analytics API มี DB schema issues)
- **Master Data**: ใช้ข้อมูลจริงจาก Master Service
- **Error Handling**: มี fallback ไปยัง mock data เมื่อ API ไม่พร้อม

## 🔄 **ขั้นตอนต่อไป**

1. **แก้ไข Analytics API**: แก้ไข DB schema issues
2. **เพิ่ม WebSocket**: สำหรับ real-time updates
3. **เพิ่ม Caching**: สำหรับ performance
4. **เพิ่ม Error Handling**: สำหรับ edge cases
