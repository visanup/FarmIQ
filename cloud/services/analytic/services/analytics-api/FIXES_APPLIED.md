# Analytics-API Fixes Applied

## 🔧 **ปัญหาที่แก้ไขแล้ว**

### 1. **Database Schema Compatibility**
- **ปัญหา**: Analytics-API ใช้ `analytics.analytics_agg` แต่ Prisma schema ใช้ `analytics.minute_features`
- **การแก้ไข**: 
  - แก้ไข `catalog.py` ให้ใช้ `minute_features` และ query tags JSON
  - แก้ไข `agg.py` ให้ aggregate ข้อมูลจาก `minute_features` แบบ real-time
  - แก้ไข `anomalies.py` ให้ใช้ `minute_features`

### 2. **Missing Pydantic Models**
- **ปัญหา**: ขาด Pydantic models สำหรับ FCR และ Size Distribution
- **การแก้ไข**: เพิ่ม models ใน `domain/models.py`:
  - `FcrData` - สำหรับ FCR calculation results
  - `SizeDistributionData` - สำหรับ size distribution results
  - `WeightCategory` - สำหรับ weight categories
  - `Quartiles` - สำหรับ quartile analysis
  - `KpiResponse` - สำหรับ KPI responses

### 3. **Database Connection Management**
- **ปัญหา**: บาง services ใช้ `SessionLocal()` โดยตรง
- **การแก้ไข**: 
  - แก้ไข `fcr_calculator.py` ให้รองรับ dependency injection
  - แก้ไข `size_distribution.py` ให้รองรับ dependency injection
  - เพิ่ม `db_session` parameter ใน helper methods

### 4. **Schema Compatibility Utilities**
- **การเพิ่ม**: สร้าง `utils/schema_compat.py`:
  - `get_aggregated_data()` - aggregate ข้อมูลจาก minute_features
  - `get_catalog_data()` - ดึง catalog data จาก minute_features
  - `get_anomaly_data()` - ดึงข้อมูลสำหรับ anomaly detection

## 📊 **การเปลี่ยนแปลงหลัก**

### **Catalog Endpoints**
```sql
-- เดิม (ใช้ analytics_agg)
SELECT DISTINCT factory_id FROM analytics.analytics_agg

-- ใหม่ (ใช้ minute_features)
SELECT DISTINCT tags->>'factory_id' as factory_id 
FROM analytics.minute_features
WHERE tags->>'factory_id' IS NOT NULL
```

### **Aggregation Endpoints**
```sql
-- เดิม (ใช้ analytics_agg)
SELECT * FROM analytics.analytics_agg

-- ใหม่ (aggregate จาก minute_features)
SELECT 
  time_bucket(INTERVAL '60 seconds', bucket) AS bucket_start,
  SUM(value_count) AS count_n,
  AVG(value_sum / NULLIF(value_count, 0)) AS avg_val
FROM analytics.minute_features
GROUP BY time_bucket(INTERVAL '60 seconds', bucket)
```

### **Anomaly Detection**
```sql
-- เดิม (ใช้ analytics_agg)
SELECT value, bucket_start as time FROM analytics.analytics_agg

-- ใหม่ (ใช้ minute_features)
SELECT 
  value_sum / NULLIF(value_count, 0) as value,
  bucket as time
FROM analytics.minute_features
```

## 🚀 **ผลลัพธ์**

### **✅ ข้อดี**
1. **Schema Compatibility**: API ทำงานกับ Prisma schema ได้
2. **Real-time Aggregation**: ข้อมูล aggregate แบบ real-time
3. **Better Error Handling**: รองรับ dependency injection
4. **Type Safety**: มี Pydantic models ครบถ้วน

### **⚠️ ข้อควรระวัง**
1. **Performance**: Real-time aggregation อาจช้ากว่า pre-aggregated data
2. **Indexing**: ต้องมี indexes ที่เหมาะสมสำหรับ JSON queries
3. **Data Volume**: minute_features อาจมีข้อมูลมากกว่า analytics_agg

## 🔧 **การตั้งค่าเพิ่มเติมที่แนะนำ**

### **1. Database Indexes**
```sql
-- สำหรับ JSON queries
CREATE INDEX idx_minute_features_tags_gin ON analytics.minute_features USING GIN (tags);

-- สำหรับ time-based queries
CREATE INDEX idx_minute_features_bucket ON analytics.minute_features (bucket);

-- สำหรับ metric queries
CREATE INDEX idx_minute_features_metric ON analytics.minute_features (metric);
```

### **2. TimescaleDB Hypertable**
```sql
-- ตั้งค่า hypertable สำหรับ minute_features
SELECT create_hypertable('analytics.minute_features', 'bucket');
```

### **3. Connection Pooling**
```python
# ใน database.py
engine = create_engine(
    Config.FULL_DATABASE_URL(),
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

## 📝 **การทดสอบ**

### **1. Health Check**
```bash
curl http://localhost:7305/v1/health
```

### **2. Catalog Endpoints**
```bash
curl "http://localhost:7305/v1/catalog/tenants"
curl "http://localhost:7305/v1/catalog/factories?tenant_id=test-tenant"
curl "http://localhost:7305/v1/catalog/machines?tenant_id=test-tenant&factory_id=test-factory"
curl "http://localhost:7305/v1/catalog/metrics?tenant_id=test-tenant"
```

### **3. Aggregation Endpoints**
```bash
curl "http://localhost:7305/v1/agg?tenant_id=test-tenant&factory_id=test-factory&machine_id=test-machine&metric=temperature&window_s=60&start=2024-01-01T00:00:00Z&end=2024-01-01T23:59:59Z"
```

### **4. FCR Endpoints**
```bash
curl "http://localhost:7305/v1/fcr?tenant_id=test-tenant&house_id=test-house&start_date=2024-01-01&end_date=2024-01-31"
```

## 🎯 **ขั้นตอนต่อไป**

1. **ทดสอบ API endpoints** ทั้งหมด
2. **ตั้งค่า database indexes** ตามที่แนะนำ
3. **Monitor performance** และปรับแต่งตามต้องการ
4. **เพิ่ม caching** สำหรับ queries ที่ใช้บ่อย
5. **ตั้งค่า monitoring** สำหรับ API performance
