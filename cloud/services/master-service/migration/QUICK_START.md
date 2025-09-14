# Migration Quick Start Guide

คู่มือการใช้งาน migration scripts สำหรับย้ายข้อมูลจาก services เก่าไป master-service

## 🚀 การเริ่มต้น

### 1. ติดตั้ง Dependencies

```bash
cd migration
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your database URLs
nano .env
```

### 3. ตรวจสอบ Database Connections

```bash
# Test master service connection
npm run validate

# Test individual service connections
node -e "console.log('Testing connections...')"
```

## 📦 การรัน Migration

### รัน Migration ทั้งหมด

```bash
# รัน migration ทั้งหมดตามลำดับ
npm run migrate:all
```

### รัน Migration แยกตาม Service

```bash
# Migrate customers
npm run migrate:customers

# Migrate farms
npm run migrate:farms

# Migrate devices
npm run migrate:devices

# Migrate feeds
npm run migrate:feeds

# Migrate formulas
npm run migrate:formulas

# Migrate economic data
npm run migrate:economic

# Migrate external factors
npm run migrate:external-factors
```

## 🔍 การตรวจสอบข้อมูล

### ตรวจสอบ Migration Results

```bash
# Validate migrated data
npm run validate
```

### ตรวจสอบข้อมูลเฉพาะ

```bash
# Check customer data
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.customer.count().then(count => console.log('Customers:', count));
"

# Check farm data
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.farm.count().then(count => console.log('Farms:', count));
"
```

## 🔄 การ Rollback

### Rollback ทั้งหมด

```bash
# Rollback all migrations
npm run rollback:all
```

### Rollback แยกตาม Service

```bash
# Rollback customers
npm run rollback:customers

# Rollback farms
npm run rollback:farms

# Rollback devices
npm run rollback:devices
```

## 📊 การตรวจสอบสถานะ

### ดู Migration Status

```bash
# Check migration logs
tail -f logs/migration.log

# Check database status
psql -h localhost -U postgres -d sensor_cloud_db -c "
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'master'
ORDER BY tablename;
"
```

### ตรวจสอบ Data Integrity

```bash
# Run comprehensive validation
npm run validate

# Check foreign key relationships
psql -h localhost -U postgres -d sensor_cloud_db -c "
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'master';
"
```

## ⚠️ การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Connection Error**
   ```bash
   # ตรวจสอบ database connection
   psql -h localhost -U postgres -d sensor_cloud_db -c "SELECT 1;"
   ```

2. **Schema Not Found**
   ```bash
   # ตรวจสอบ schema
   psql -h localhost -U postgres -d sensor_cloud_db -c "
   SELECT schema_name FROM information_schema.schemata 
   WHERE schema_name IN ('master', 'customers', 'farms', 'devices');
   "
   ```

3. **Permission Denied**
   ```bash
   # ตรวจสอบ permissions
   psql -h localhost -U postgres -d sensor_cloud_db -c "
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_schema = 'master';
   "
   ```

### การ Debug

```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run migrate:all

# Check specific migration
node migrate-customers.js --debug

# Validate with verbose output
node validate-migration.js --verbose
```

## 📈 การ Monitor

### ดู Progress

```bash
# Watch migration progress
watch -n 5 'psql -h localhost -U postgres -d sensor_cloud_db -c "
SELECT 
  schemaname,
  tablename,
  n_tup_ins as records
FROM pg_stat_user_tables 
WHERE schemaname = '\''master'\''
ORDER BY n_tup_ins DESC;
"'
```

### ดู Performance

```bash
# Check database performance
psql -h localhost -U postgres -d sensor_cloud_db -c "
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%master%'
ORDER BY total_time DESC
LIMIT 10;
"
```

## 🎯 Best Practices

### 1. Backup ก่อน Migration

```bash
# Backup database
pg_dump -h localhost -U postgres -d sensor_cloud_db > backup_before_migration.sql

# Backup specific schemas
pg_dump -h localhost -U postgres -d sensor_cloud_db -n master > master_backup.sql
```

### 2. Test ใน Staging Environment

```bash
# ใช้ staging database
export MASTER_DATABASE_URL="postgresql://postgres:password@localhost:5432/sensor_cloud_db_staging?schema=master"
npm run migrate:all
```

### 3. Monitor Resource Usage

```bash
# Monitor CPU and Memory
top -p $(pgrep -f "node.*migrate")

# Monitor Database Connections
psql -h localhost -U postgres -d sensor_cloud_db -c "
SELECT count(*) as connections 
FROM pg_stat_activity 
WHERE state = 'active';
"
```

## 📞 Support

หากมีปัญหาหรือคำถาม:

1. ตรวจสอบ logs ใน `logs/migration.log`
2. ใช้ `npm run validate` เพื่อตรวจสอบข้อมูล
3. ใช้ rollback scripts หากจำเป็น
4. ติดต่อ development team

## 📚 Additional Resources

- [Migration Plan](./README.md)
- [Master Service Documentation](../README.md)
- [Database Schema](../prisma/schema.prisma)
- [API Documentation](../docs/api.md)

