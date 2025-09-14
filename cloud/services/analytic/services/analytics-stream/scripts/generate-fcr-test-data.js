// scripts/generate-fcr-test-data.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateFCRTestData() {
  console.log('🚀 Generating FCR test data...');

  const tenantId = 'test-tenant';
  const houseId = 'house-001';
  const farmId = 'farm-001';
  
  // สร้างข้อมูลน้ำหนักสัตว์ (เริ่มต้น 1000kg, สิ้นสุด 1500kg)
  const animalWeightData = [];
  const feedConsumptionData = [];
  
  const startDate = new Date('2024-01-01T00:00:00Z');
  const endDate = new Date('2024-01-31T23:59:59Z');
  
  // สร้างข้อมูลรายวัน
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    // คำนวณน้ำหนักสัตว์ (เพิ่มขึ้นเรื่อยๆ)
    const daysElapsed = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    const baseWeight = 1000 + (daysElapsed * 15); // เพิ่ม 15kg ต่อวัน
    const weightVariation = (Math.random() - 0.5) * 10; // ±5kg variation
    const dailyWeight = baseWeight + weightVariation;
    
    // คำนวณการบริโภคอาหาร (ประมาณ 50-60kg ต่อวัน)
    const baseFeedConsumption = 50 + (Math.random() * 10); // 50-60kg ต่อวัน
    
    // สร้างข้อมูลรายชั่วโมง (24 ชั่วโมง)
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(dayStart);
      timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      
      // น้ำหนักสัตว์ (รายชั่วโมง)
      animalWeightData.push({
        bucket: timestamp,
        tenant_id: tenantId,
        device_id: houseId,
        sensor_id: 'weight-sensor-001',
        metric: 'sensors.weight.total',
        tags: {
          farm_id: farmId,
          house_id: houseId,
          sensor_type: 'weight',
          unit: 'kg'
        },
        tags_hash: 'weight-tags',
        value_count: 1,
        value_sum: dailyWeight,
        value_min: dailyWeight,
        value_max: dailyWeight,
        value_sumsq: dailyWeight * dailyWeight
      });
      
      // การบริโภคอาหาร (รายชั่วโมง)
      const hourlyFeedConsumption = baseFeedConsumption / 24 + (Math.random() - 0.5) * 2;
      feedConsumptionData.push({
        bucket: timestamp,
        tenant_id: tenantId,
        device_id: houseId,
        sensor_id: 'feed-sensor-001',
        metric: 'feed.consumption.kg',
        tags: {
          farm_id: farmId,
          house_id: houseId,
          sensor_type: 'feed',
          unit: 'kg'
        },
        tags_hash: 'feed-tags',
        value_count: 1,
        value_sum: hourlyFeedConsumption,
        value_min: hourlyFeedConsumption,
        value_max: hourlyFeedConsumption,
        value_sumsq: hourlyFeedConsumption * hourlyFeedConsumption
      });
    }
  }

  console.log(`📊 Generated ${animalWeightData.length} weight records`);
  console.log(`🍽️ Generated ${feedConsumptionData.length} feed consumption records`);

  // บันทึกข้อมูลลงฐานข้อมูล
  try {
    console.log('💾 Inserting data into database...');
    
    // ลบข้อมูลเก่า (ถ้ามี)
    await prisma.$executeRaw`
      DELETE FROM analytics.minute_features 
      WHERE tenant_id = ${tenantId} 
        AND device_id = ${houseId}
        AND (metric = 'sensors.weight.total' OR metric = 'feed.consumption.kg')
    `;
    
    // แบ่งข้อมูลเป็น batch เพื่อป้องกัน memory overflow
    const batchSize = 1000;
    
    for (let i = 0; i < animalWeightData.length; i += batchSize) {
      const batch = animalWeightData.slice(i, i + batchSize);
      await prisma.minute_features.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`✅ Inserted weight batch ${i + 1}-${Math.min(i + batchSize, animalWeightData.length)}`);
    }
    
    for (let i = 0; i < feedConsumptionData.length; i += batchSize) {
      const batch = feedConsumptionData.slice(i, i + batchSize);
      await prisma.minute_features.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`✅ Inserted feed batch ${i + 1}-${Math.min(i + batchSize, feedConsumptionData.length)}`);
    }
    
    console.log('🎉 FCR test data generation completed!');
    
    // แสดงสรุปข้อมูล
    const summary = await prisma.$queryRaw`
      SELECT 
        metric,
        COUNT(*) as records,
        MIN(bucket) as earliest,
        MAX(bucket) as latest,
        SUM(value_sum) as total_value
      FROM analytics.minute_features
      WHERE tenant_id = ${tenantId} 
        AND device_id = ${houseId}
        AND (metric = 'sensors.weight.total' OR metric = 'feed.consumption.kg')
      GROUP BY metric
      ORDER BY metric
    `;
    
    console.log('\n📈 Data Summary:');
    console.table(summary);
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// รัน script
generateFCRTestData().catch(console.error);
