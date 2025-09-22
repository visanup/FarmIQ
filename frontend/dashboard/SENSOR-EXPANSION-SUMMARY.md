# Sensor Expansion Summary

## 🎯 **การเพิ่มเซ็นเซอร์ใหม่ตาม Mockup**

### 📋 **การแก้ไขหลัก:**

#### **1. แก้ไขชื่อการ์ด:**
- **`sensors.weight_predict.current_kg`** → **"น้ำหนัก Estimate"**
- **`sensors.weight_scale.current_kg`** → **"น้ำหนักเครื่องชั่ง"**

#### **2. เพิ่มเซ็นเซอร์ครบตาม Mockup:**

**HOURLY_SENSORS (7 ตัว):**
- ✅ **temperature** - อุณหภูมิ (°C)
- ✅ **humidity** - ความชื้น (%)
- ✅ **CO2** - คาร์บอนไดออกไซด์ (ppm)
- ✅ **NH3** - แอมโมเนีย (ppm)
- ✅ **illuminance** - ความสว่าง (lux)
- ✅ **photoperiod** - ช่วงแสง (h)
- ✅ **VOCs** - สารอินทรีย์ระเหย (ppb)

**DAILY_SENSORS (3 ตัว):**
- ✅ **feed.intake.kg** - ปริมาณอาหาร (kg)
- ✅ **sensors.weight_scale.current_kg** - น้ำหนักเครื่องชั่ง (kg)
- ✅ **sensors.weight_predict.current_kg** - น้ำหนัก Estimate (kg)

**DAILY_EXTRA_SENSORS (5 ตัว):**
- ✅ **pH** - ค่า pH (pH)
- ✅ **TDS** - Total Dissolved Solids (ppm)
- ✅ **EC** - ค่าการนำไฟฟ้า (mS/cm)
- ✅ **water_volume** - ปริมาณน้ำ (L)
- ✅ **water_temp** - อุณหภูมิน้ำ (°C)

## 🎨 **การออกแบบใหม่**

### **Icons สำหรับเซ็นเซอร์ใหม่:**
```typescript
VOCs: CloudQueueIcon (เมฆ)
Weight: ScaleIcon (เครื่องชั่ง)
Feed: RestaurantIcon (อาหาร)
pH: ScienceIcon (วิทยาศาสตร์)
TDS: OpacityIcon (ความทึบ)
EC: ElectricBoltIcon (ไฟฟ้า)
Water Volume: PoolIcon (สระน้ำ)
Water Temp: AcUnitIcon (เครื่องปรับอากาศ)
```

### **สีสำหรับเซ็นเซอร์ใหม่:**
```typescript
VOCs: #607d8b (เทา)
Weight Predict: #4caf50 (เขียว)
Weight Scale: #2196f3 (น้ำเงิน)
Feed: #ff9800 (ส้ม)
pH: #e91e63 (ชมพู)
TDS: #00bcd4 (ฟ้า)
EC: #9c27b0 (ม่วง)
Water Volume: #00bcd4 (ฟ้า)
Water Temp: #03a9f4 (น้ำเงินอ่อน)
```

### **หน่วยวัด:**
```typescript
VOCs: ppb (parts per billion)
Weight: kg (กิโลกรัม)
Feed: kg (กิโลกรัม)
pH: pH (pH scale)
TDS: ppm (parts per million)
EC: mS/cm (millisiemens per centimeter)
Water Volume: L (ลิตร)
Water Temp: °C (องศาเซลเซียส)
```

## 📊 **Status Logic ใหม่**

### **น้ำหนัก (Weight):**
```typescript
// น้ำหนัก Estimate และ น้ำหนักเครื่องชั่ง
if (value < 1 || value > 10) return 'error';    // < 1kg หรือ > 10kg
if (value < 2 || value > 8) return 'warning';   // 2-8kg
return 'success';                                // 2-8kg ปกติ
```

### **ปริมาณอาหาร (Feed):**
```typescript
if (value < 0.5 || value > 5) return 'error';   // < 0.5kg หรือ > 5kg
if (value < 1 || value > 4) return 'warning';   // 1-4kg
return 'success';                                // 1-4kg ปกติ
```

### **ค่า pH:**
```typescript
if (value < 6.5 || value > 8.0) return 'error'; // < 6.5 หรือ > 8.0
if (value < 6.8 || value > 7.5) return 'warning'; // 6.8-7.5
return 'success';                                // 6.8-7.5 ปกติ
```

### **TDS (Total Dissolved Solids):**
```typescript
if (value < 200 || value > 1500) return 'error'; // < 200ppm หรือ > 1500ppm
if (value < 300 || value > 1200) return 'warning'; // 300-1200ppm
return 'success';                                // 300-1200ppm ปกติ
```

### **EC (Electrical Conductivity):**
```typescript
if (value < 0.5 || value > 3.0) return 'error'; // < 0.5mS/cm หรือ > 3.0mS/cm
if (value < 0.8 || value > 2.5) return 'warning'; // 0.8-2.5mS/cm
return 'success';                                // 0.8-2.5mS/cm ปกติ
```

### **ปริมาณน้ำ (Water Volume):**
```typescript
if (value < 100 || value > 4000) return 'error'; // < 100L หรือ > 4000L
if (value < 200 || value > 3500) return 'warning'; // 200-3500L
return 'success';                                // 200-3500L ปกติ
```

### **อุณหภูมิน้ำ (Water Temperature):**
```typescript
if (value < 20 || value > 26) return 'error';   // < 20°C หรือ > 26°C
if (value < 22 || value > 25) return 'warning'; // 22-25°C
return 'success';                                // 22-25°C ปกติ
```

### **VOCs (Volatile Organic Compounds):**
```typescript
if (value > 600) return 'error';                // > 600ppb
if (value > 400) return 'warning';              // 400-600ppb
return 'success';                                // < 400ppb ปกติ
```

## 📈 **Progress Bar Logic**

### **น้ำหนัก:**
```typescript
// 0-10kg range
return Math.min((value / 10) * 100, 100);
```

### **ปริมาณอาหาร:**
```typescript
// 0-5kg range
return Math.min((value / 5) * 100, 100);
```

### **ค่า pH:**
```typescript
// 6-8.5 range
return ((value - 6) / 2.5) * 100;
```

### **TDS:**
```typescript
// 0-2000ppm range
return Math.min((value / 2000) * 100, 100);
```

### **EC:**
```typescript
// 0-5mS/cm range
return Math.min((value / 5) * 100, 100);
```

### **ปริมาณน้ำ:**
```typescript
// 0-5000L range
return Math.min((value / 5000) * 100, 100);
```

### **อุณหภูมิน้ำ:**
```typescript
// 18-28°C range
return Math.min(((value - 18) / 10) * 100, 100);
```

### **VOCs:**
```typescript
// 0-800ppb range
return Math.min((value / 800) * 100, 100);
```

## 🎯 **ผลลัพธ์**

### **ก่อนปรับปรุง:**
- ❌ **ชื่อไม่ชัดเจน**: sensors.weight_predict.current_kg
- ❌ **เซ็นเซอร์ไม่ครบ**: มีแค่ 7 ตัว
- ❌ **ไม่มี Icons**: ใช้ icon เดียวกัน
- ❌ **ไม่มี Status Logic**: ไม่มีเกณฑ์การประเมิน

### **หลังปรับปรุง:**
- ✅ **ชื่อชัดเจน**: "น้ำหนัก Estimate", "น้ำหนักเครื่องชั่ง"
- ✅ **เซ็นเซอร์ครบ**: 15 ตัว ตาม mockup
- ✅ **Icons หลากหลาย**: แต่ละประเภทมี icon เฉพาะ
- ✅ **Status Logic ครบ**: มีเกณฑ์การประเมินทุกเซ็นเซอร์
- ✅ **Progress Bar ถูกต้อง**: แสดงความคืบหน้าตามค่าจริง

## 📱 **การแสดงผล**

### **HOURLY_SENSORS (7 การ์ด):**
1. **อุณหภูมิ** - 27.73°C (ปกติ)
2. **ความชื้น** - 45.51% (ปกติ)
3. **คาร์บอนไดออกไซด์** - 1425.35ppm (ผิดปกติ)
4. **แอมโมเนีย** - 37.45ppm (ผิดปกติ)
5. **ความสว่าง** - 3281.46lux (เตือน)
6. **ช่วงแสง** - 21.31h (ผิดปกติ)
7. **สารอินทรีย์ระเหย** - 538.67ppb (ผิดปกติ)

### **DAILY_SENSORS (3 การ์ด):**
1. **ปริมาณอาหาร** - 2.5kg (ปกติ)
2. **น้ำหนักเครื่องชั่ง** - 2.97kg (ปกติ)
3. **น้ำหนัก Estimate** - 3.01kg (ปกติ)

### **DAILY_EXTRA_SENSORS (5 การ์ด):**
1. **ค่า pH** - 7.2pH (ปกติ)
2. **Total Dissolved Solids** - 850ppm (ปกติ)
3. **ค่าการนำไฟฟ้า** - 1.8mS/cm (ปกติ)
4. **ปริมาณน้ำ** - 2500L (ปกติ)
5. **อุณหภูมิน้ำ** - 23.5°C (ปกติ)

## 🔧 **Technical Implementation**

### **Function Updates:**
- `getSensorName()` - เพิ่มชื่อไทย 15 ตัว
- `getSensorUnit()` - เพิ่มหน่วย 15 ตัว
- `getSensorColor()` - เพิ่มสี 15 ตัว
- `getSensorIcon()` - เพิ่ม icons 15 ตัว
- `getStatusColor()` - เพิ่มเกณฑ์ 15 ตัว
- `getProgressValue()` - เพิ่ม progress 15 ตัว

### **Icon Imports:**
```typescript
import {
  CloudQueue as VOCsIcon,
  Scale as WeightIcon,
  Restaurant as FeedIcon,
  Science as PhIcon,
  Water as WaterIcon,
  ElectricBolt as ECIcon,
  Opacity as TDSIcon,
  Pool as WaterVolumeIcon,
  AcUnit as WaterTempIcon,
} from '@mui/icons-material';
```

## 🎉 **สรุป**

การเพิ่มเซ็นเซอร์ใหม่ทำให้:
- **ข้อมูลครบถ้วน** 📊
- **ชื่อชัดเจน** 🏷️
- **Icons หลากหลาย** 🎨
- **Status ถูกต้อง** ✅
- **Progress Bar แม่นยำ** 📈
