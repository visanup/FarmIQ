// Test database connection and list tables
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres1611@localhost:25432/farmiq_cloud?schema=analytics'
    }
  }
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test connection by running a simple query
    const result = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'analytics' 
      ORDER BY tablename;
    `;
    
    console.log('✅ Database connection successful!');
    console.log('📊 Tables in analytics schema:');
    console.table(result);
    
    // Test specific models
    console.log('\n🧪 Testing Prisma models...');
    
    // Test MinuteFeatures model
    const minuteFeaturesCount = await prisma.minuteFeatures.count();
    console.log(`📈 MinuteFeatures table: ${minuteFeaturesCount} records`);
    
    // Test FCR models
    const fcrCalculationsCount = await prisma.fcrCalculation.count();
    console.log(`🐄 FCR Calculations table: ${fcrCalculationsCount} records`);
    
    // Test Health metrics
    const healthMetricsCount = await prisma.healthMetrics.count();
    console.log(`🏥 Health Metrics table: ${healthMetricsCount} records`);
    
    // Test Production metrics
    const productionMetricsCount = await prisma.productionMetrics.count();
    console.log(`🥚 Production Metrics table: ${productionMetricsCount} records`);
    
    // Test Environmental metrics
    const environmentalMetricsCount = await prisma.environmentalMetrics.count();
    console.log(`🌡️ Environmental Metrics table: ${environmentalMetricsCount} records`);
    
    console.log('\n🎉 All tests passed! Database is ready for use.');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
