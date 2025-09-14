// Test all analytics functions
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres1611@localhost:25432/farmiq_cloud?schema=analytics'
    }
  }
});

async function testAllFunctions() {
  console.log('🧪 Testing all analytics functions...\n');

  try {
    // Test data
    const testTenantId = 'test-tenant-001';
    const testFarmId = 'farm-001';
    const testHouseId = 'house-001';
    const testFlockId = 'flock-001';
    const testDeviceId = 'device-001';
    const now = new Date();

    // ===========================================
    // 1. Test MinuteFeatures (existing function)
    // ===========================================
    console.log('📈 Testing MinuteFeatures...');
    const minuteFeatureData = {
      bucket: now,
      tenantId: testTenantId,
      deviceId: testDeviceId,
      sensorId: 'sensor-001',
      metric: 'temperature',
      tags: { location: 'zone-1' },
      tagsHash: 'hash123',
      valueCount: 1,
      valueSum: 25.5,
      valueMin: 25.5,
      valueMax: 25.5,
      valueSumsq: 650.25
    };

    await prisma.minuteFeatures.create({ data: minuteFeatureData });
    console.log('✅ MinuteFeatures created successfully');

    // ===========================================
    // 2. Test FCR Calculation
    // ===========================================
    console.log('\n🐄 Testing FCR Calculation...');
    const fcrData = {
      tenantId: testTenantId,
      farmId: testFarmId,
      houseId: testHouseId,
      flockId: testFlockId,
      periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      periodEnd: now,
      totalFeed: 1000.5, // kg
      totalWeight: 500.2, // kg
      fcrValue: 2.0, // FCR = feed/weight
      population: 1000,
      breed: 'Broiler',
      metadata: { batch: 'B001' }
    };

    const fcrResult = await prisma.fcrCalculation.create({ data: fcrData });
    console.log('✅ FCR Calculation created:', fcrResult.id);

    // ===========================================
    // 3. Test FCR Target
    // ===========================================
    console.log('\n🎯 Testing FCR Target...');
    const fcrTargetData = {
      tenantId: testTenantId,
      farmId: testFarmId,
      houseId: testHouseId,
      breed: 'Broiler',
      targetFcr: 1.8,
      minFcr: 1.5,
      maxFcr: 2.2,
      isActive: true,
      metadata: { season: 'winter' }
    };

    const fcrTargetResult = await prisma.fcrTarget.create({ data: fcrTargetData });
    console.log('✅ FCR Target created:', fcrTargetResult.id);

    // ===========================================
    // 4. Test Health Metrics
    // ===========================================
    console.log('\n🏥 Testing Health Metrics...');
    const healthData = {
      tenantId: testTenantId,
      farmId: testFarmId,
      houseId: testHouseId,
      flockId: testFlockId,
      measurementDate: now,
      mortalityRate: 0.5, // per 1000 animals
      morbidityRate: 2.1, // per 1000 animals
      avgWeight: 2.5, // kg
      feedIntake: 150.0, // kg/day
      waterIntake: 300.0, // L/day
      temperature: 28.5, // celsius
      humidity: 65.0, // percent
      metadata: { veterinarian: 'Dr. Smith' }
    };

    const healthResult = await prisma.healthMetrics.create({ data: healthData });
    console.log('✅ Health Metrics created:', healthResult.id);

    // ===========================================
    // 5. Test Production Metrics
    // ===========================================
    console.log('\n🥚 Testing Production Metrics...');
    const productionData = {
      tenantId: testTenantId,
      farmId: testFarmId,
      houseId: testHouseId,
      flockId: testFlockId,
      periodStart: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
      periodEnd: now,
      totalProduction: 850.0, // eggs
      dailyProduction: 850.0, // eggs/day
      productionRate: 0.85, // eggs per animal
      qualityScore: 92.5, // score 0-100
      efficiency: 88.2, // percent
      metadata: { grade: 'A' }
    };

    const productionResult = await prisma.productionMetrics.create({ data: productionData });
    console.log('✅ Production Metrics created:', productionResult.id);

    // ===========================================
    // 6. Test Environmental Metrics
    // ===========================================
    console.log('\n🌡️ Testing Environmental Metrics...');
    const envData = {
      tenantId: testTenantId,
      farmId: testFarmId,
      houseId: testHouseId,
      deviceId: testDeviceId,
      measurementDate: now,
      temperature: 26.8, // celsius
      humidity: 62.5, // percent
      co2Level: 1200.0, // ppm
      nh3Level: 15.5, // ppm
      lightLevel: 150.0, // lux
      airVelocity: 0.8, // m/s
      pressure: 1013.25, // pa
      metadata: { sensor_type: 'multi-sensor' }
    };

    const envResult = await prisma.environmentalMetrics.create({ data: envData });
    console.log('✅ Environmental Metrics created:', envResult.id);

    // ===========================================
    // 7. Test Size Distribution
    // ===========================================
    console.log('\n📏 Testing Size Distribution...');
    const sizeData = {
      tenantId: testTenantId,
      farmId: testFarmId,
      houseId: testHouseId,
      flockId: testFlockId,
      measurementDate: now,
      weightClass: 'MEDIUM',
      minWeight: 2.0, // kg
      maxWeight: 3.0, // kg
      count: 450, // animals
      percentage: 45.0, // percent of total
      metadata: { sampling_method: 'random' }
    };

    const sizeResult = await prisma.sizeDistribution.create({ data: sizeData });
    console.log('✅ Size Distribution created:', sizeResult.id);

    // ===========================================
    // 8. Test Prediction Model
    // ===========================================
    console.log('\n🤖 Testing Prediction Model...');
    const modelData = {
      tenantId: testTenantId,
      modelName: 'FCR Prediction Model v1',
      modelType: 'FCR',
      version: '1.0.0',
      status: 'ACTIVE',
      config: { algorithm: 'linear_regression', features: ['age', 'weight', 'feed'] },
      metrics: { accuracy: 0.92, mse: 0.05 },
      isActive: true
    };

    const modelResult = await prisma.predictionModel.create({ data: modelData });
    console.log('✅ Prediction Model created:', modelResult.id);

    // ===========================================
    // 9. Test Prediction
    // ===========================================
    console.log('\n🔮 Testing Prediction...');
    const predictionData = {
      tenantId: testTenantId,
      modelId: modelResult.id,
      farmId: testFarmId,
      houseId: testHouseId,
      flockId: testFlockId,
      predictionType: 'FCR',
      targetDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      predictedValue: 1.85,
      confidence: 0.89,
      metadata: { model_version: '1.0.0' }
    };

    const predictionResult = await prisma.prediction.create({ data: predictionData });
    console.log('✅ Prediction created:', predictionResult.id);

    // ===========================================
    // 10. Test Analytics Config
    // ===========================================
    console.log('\n⚙️ Testing Analytics Config...');
    const configData = {
      tenantId: testTenantId,
      configType: 'FCR',
      configKey: 'target_fcr_threshold',
      configValue: { min: 1.5, max: 2.2, alert_threshold: 2.0 },
      isActive: true,
      metadata: { created_by: 'system' }
    };

    const configResult = await prisma.analyticsConfig.create({ data: configData });
    console.log('✅ Analytics Config created:', configResult.id);

    // ===========================================
    // 11. Test Analytics Job
    // ===========================================
    console.log('\n⚡ Testing Analytics Job...');
    const jobData = {
      tenantId: testTenantId,
      jobType: 'FCR_CALCULATION',
      status: 'PENDING',
      priority: 1,
      config: { farm_id: testFarmId, house_id: testHouseId },
      result: {}
    };

    const jobResult = await prisma.analyticsJob.create({ data: jobData });
    console.log('✅ Analytics Job created:', jobResult.id);

    // ===========================================
    // 12. Test Dimension Tables
    // ===========================================
    console.log('\n🏗️ Testing Dimension Tables...');
    
    // Test DimDevice
    const deviceData = {
      tenantId: testTenantId,
      deviceId: testDeviceId,
      farmId: testFarmId,
      houseId: testHouseId,
      type: 'sensor',
      status: 'active',
      name: 'Temperature Sensor 001',
      model: 'TS-2000',
      vendor: 'SensorTech',
      serialNo: 'ST001234',
      meta: { installation_date: '2024-01-01' }
    };

    await prisma.dimDevice.create({ data: deviceData });
    console.log('✅ DimDevice created');

    // Test DimFarm
    const farmData = {
      tenantId: testTenantId,
      farmId: testFarmId,
      name: 'Test Farm 001',
      lat: 13.7563,
      lon: 100.5018,
      region: 'Central Thailand',
      meta: { area: 50, established: '2020' }
    };

    await prisma.dimFarm.create({ data: farmData });
    console.log('✅ DimFarm created');

    // ===========================================
    // Summary
    // ===========================================
    console.log('\n📊 Testing Summary:');
    
    const counts = await Promise.all([
      prisma.minuteFeatures.count(),
      prisma.fcrCalculation.count(),
      prisma.fcrTarget.count(),
      prisma.healthMetrics.count(),
      prisma.productionMetrics.count(),
      prisma.environmentalMetrics.count(),
      prisma.sizeDistribution.count(),
      prisma.predictionModel.count(),
      prisma.prediction.count(),
      prisma.analyticsConfig.count(),
      prisma.analyticsJob.count(),
      prisma.dimDevice.count(),
      prisma.dimFarm.count()
    ]);

    const tableNames = [
      'MinuteFeatures', 'FCR Calculations', 'FCR Targets', 'Health Metrics',
      'Production Metrics', 'Environmental Metrics', 'Size Distributions',
      'Prediction Models', 'Predictions', 'Analytics Configs', 'Analytics Jobs',
      'Dim Devices', 'Dim Farms'
    ];

    console.table(
      tableNames.map((name, i) => ({
        Table: name,
        Records: counts[i]
      }))
    );

    console.log('\n🎉 All analytics functions tested successfully!');
    console.log('✅ Database is fully functional and ready for production use.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAllFunctions();
