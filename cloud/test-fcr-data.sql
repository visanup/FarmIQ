-- ลบข้อมูลเก่า
DELETE FROM analytics.minute_features WHERE tenant_id = 'test-tenant';

-- สร้างข้อมูลทดสอบ FCR ที่สมบูรณ์
INSERT INTO analytics.minute_features (
  bucket, tenant_id, device_id, sensor_id, metric, tags,
  value_count, value_sum, value_min, value_max, value_sumsq
) VALUES 
-- น้ำหนักสัตว์เริ่มต้น (weight_scale) - 1000kg
('2024-01-01 00:00:00+00', 'test-tenant', 'house-001', 'weight-scale-sensor', 'sensors.weight_scale.total', 
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "scale"}',
 1, 1000, 1000, 1000, 1000000),
-- น้ำหนักสัตว์สิ้นสุด (weight_scale) - 1500kg
('2024-01-31 23:59:00+00', 'test-tenant', 'house-001', 'weight-scale-sensor', 'sensors.weight_scale.total',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "scale"}',
 1, 1500, 1500, 1500, 2250000),
-- น้ำหนักสัตว์เริ่มต้น (weight_predict) - 980kg
('2024-01-01 00:00:00+00', 'test-tenant', 'house-001', 'weight-predict-sensor', 'sensors.weight_predict.total', 
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "predict"}',
 1, 980, 980, 980, 960400),
-- น้ำหนักสัตว์สิ้นสุด (weight_predict) - 1480kg
('2024-01-31 23:59:00+00', 'test-tenant', 'house-001', 'weight-predict-sensor', 'sensors.weight_predict.total',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "predict"}',
 1, 1480, 1480, 1480, 2190400),
-- การบริโภคอาหารรวม (1550kg)
('2024-01-01 00:00:00+00', 'test-tenant', 'house-001', 'feed-sensor', 'feed.consumption.kg',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg"}',
 1, 1550, 1550, 1550, 2402500),
-- ข้อมูลน้ำหนักสัตว์รายตัว (weight_predict) สำหรับ Size Distribution
('2024-01-15 12:00:00+00', 'test-tenant', 'house-001', 'weight-predict-sensor', 'sensors.weight_predict.individual',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "predict", "animal_id": "A001"}',
 1, 2.1, 2.1, 2.1, 4.41),
('2024-01-15 12:00:00+00', 'test-tenant', 'house-001', 'weight-predict-sensor', 'sensors.weight_predict.individual',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "predict", "animal_id": "A002"}',
 1, 2.3, 2.3, 2.3, 5.29),
('2024-01-15 12:00:00+00', 'test-tenant', 'house-001', 'weight-predict-sensor', 'sensors.weight_predict.individual',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "predict", "animal_id": "A003"}',
 1, 1.9, 1.9, 1.9, 3.61),
('2024-01-15 12:00:00+00', 'test-tenant', 'house-001', 'weight-predict-sensor', 'sensors.weight_predict.individual',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "predict", "animal_id": "A004"}',
 1, 2.5, 2.5, 2.5, 6.25),
('2024-01-15 12:00:00+00', 'test-tenant', 'house-001', 'weight-predict-sensor', 'sensors.weight_predict.individual',
 '{"farm_id": "farm-001", "house_id": "house-001", "unit": "kg", "sensor_type": "predict", "animal_id": "A005"}',
 1, 2.0, 2.0, 2.0, 4.0);
