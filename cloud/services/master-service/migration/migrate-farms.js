#!/usr/bin/env node

/**
 * Farm Service Migration Script
 * Migrates data from farm-service to master-service
 */

const { PrismaClient: MasterPrisma } = require('@prisma/client');
const { PrismaClient: FarmPrisma } = require('@prisma/client');

const masterPrisma = new MasterPrisma({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sensor_cloud_db?schema=master'
    }
  }
});

const farmPrisma = new FarmPrisma({
  datasources: {
    db: {
      url: process.env.FARM_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sensor_cloud_db?schema=farms'
    }
  }
});

class FarmMigration {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      errors: 0,
      skipped: 0
    };
    this.customerMap = new Map();
    this.farmMap = new Map();
    this.houseMap = new Map();
  }

  async migrate() {
    console.log('🚀 Starting Farm Service Migration...');
    
    try {
      // 1. Migrate farms
      await this.migrateFarms();
      
      // 2. Migrate houses
      await this.migrateHouses();
      
      // 3. Migrate animals (as flocks)
      await this.migrateAnimals();
      
      // 4. Migrate genetic factors
      await this.migrateGeneticFactors();
      
      // 5. Migrate feed programs
      await this.migrateFeedPrograms();
      
      // 6. Migrate environmental factors
      await this.migrateEnvironmentalFactors();
      
      // 7. Migrate housing conditions
      await this.migrateHousingConditions();
      
      // 8. Migrate water quality
      await this.migrateWaterQuality();
      
      // 9. Migrate health records
      await this.migrateHealthRecords();
      
      // 10. Migrate welfare indicators
      await this.migrateWelfareIndicators();
      
      // 11. Migrate performance metrics
      await this.migratePerformanceMetrics();
      
      // 12. Migrate operational records
      await this.migrateOperationalRecords();
      
      // 13. Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async migrateFarms() {
    console.log('📦 Migrating farms...');
    
    const farms = await farmPrisma.farm.findMany();
    this.stats.total += farms.length;

    for (const farm of farms) {
      try {
        // Check if farm already exists
        const existingFarm = await masterPrisma.farm.findFirst({
          where: {
            farmId: farm.farm_id.toString()
          }
        });

        if (existingFarm) {
          console.log(`⏭️  Skipping existing farm: ${farm.name}`);
          this.stats.skipped++;
          continue;
        }

        // Find customer
        const customer = await this.findOrCreateCustomer(farm.customer_id);

        // Create farm in master service
        const migratedFarm = await masterPrisma.farm.create({
          data: {
            farmId: farm.farm_id.toString(),
            customerId: customer.id,
            name: farm.name,
            location: farm.location,
            area: farm.area,
            status: this.mapStatus(farm.status),
            description: farm.description,
            createdAt: farm.created_at,
            updatedAt: farm.updated_at
          }
        });

        this.farmMap.set(farm.farm_id, migratedFarm.id);
        console.log(`✅ Migrated farm: ${farm.name} (ID: ${migratedFarm.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate farm ${farm.name}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateHouses() {
    console.log('📦 Migrating houses...');
    
    const houses = await farmPrisma.house.findMany();
    this.stats.total += houses.length;

    for (const house of houses) {
      try {
        // Check if house already exists
        const existingHouse = await masterPrisma.house.findFirst({
          where: {
            houseId: house.house_id.toString()
          }
        });

        if (existingHouse) {
          console.log(`⏭️  Skipping existing house: ${house.name}`);
          this.stats.skipped++;
          continue;
        }

        // Find farm
        const farmId = this.farmMap.get(house.farm_id);
        if (!farmId) {
          console.log(`⏭️  Farm not found for house: ${house.name}`);
          this.stats.skipped++;
          continue;
        }

        // Create house in master service
        const migratedHouse = await masterPrisma.house.create({
          data: {
            houseId: house.house_id.toString(),
            farmId: farmId,
            name: house.name,
            area: house.area,
            capacity: house.capacity,
            status: this.mapStatus(house.status),
            description: house.description,
            createdAt: house.created_at,
            updatedAt: house.updated_at
          }
        });

        this.houseMap.set(house.house_id, migratedHouse.id);
        console.log(`✅ Migrated house: ${house.name} (ID: ${migratedHouse.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate house ${house.name}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateAnimals() {
    console.log('📦 Migrating animals as flocks...');
    
    const animals = await farmPrisma.animal.findMany();
    this.stats.total += animals.length;

    for (const animal of animals) {
      try {
        // Check if flock already exists
        const existingFlock = await masterPrisma.flock.findFirst({
          where: {
            flockId: animal.animal_id.toString()
          }
        });

        if (existingFlock) {
          console.log(`⏭️  Skipping existing flock: ${animal.species}`);
          this.stats.skipped++;
          continue;
        }

        // Find farm and house
        const farmId = this.farmMap.get(animal.farm_id);
        const houseId = this.houseMap.get(animal.house_id);

        if (!farmId) {
          console.log(`⏭️  Farm not found for animal: ${animal.species}`);
          this.stats.skipped++;
          continue;
        }

        // Create flock in master service
        const migratedFlock = await masterPrisma.flock.create({
          data: {
            flockId: animal.animal_id.toString(),
            farmId: farmId,
            houseId: houseId,
            species: animal.species,
            breed: animal.breed,
            age: this.calculateAge(animal.birth_date),
            gender: this.mapGender(animal.gender),
            status: this.mapStatus(animal.status),
            birthDate: animal.birth_date,
            description: animal.description,
            createdAt: animal.created_at,
            updatedAt: animal.updated_at
          }
        });

        console.log(`✅ Migrated flock: ${animal.species} (ID: ${migratedFlock.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate animal ${animal.species}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateGeneticFactors() {
    console.log('📦 Migrating genetic factors...');
    
    const geneticFactors = await farmPrisma.geneticFactor.findMany();
    this.stats.total += geneticFactors.length;

    for (const factor of geneticFactors) {
      try {
        // Find flock
        const flock = await masterPrisma.flock.findFirst({
          where: {
            flockId: factor.animal_id.toString()
          }
        });

        if (!flock) {
          console.log(`⏭️  Flock not found for genetic factor: ${factor.id}`);
          this.stats.skipped++;
          continue;
        }

        // Update flock with genetic info
        const geneticInfo = {
          testType: factor.test_type,
          result: factor.result,
          testDate: factor.test_date,
          notes: factor.notes
        };

        await masterPrisma.flock.update({
          where: { id: flock.id },
          data: {
            geneticInfo: geneticInfo
          }
        });

        console.log(`✅ Updated genetic info for flock: ${flock.species}`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate genetic factor ${factor.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateFeedPrograms() {
    console.log('📦 Migrating feed programs...');
    
    const feedPrograms = await farmPrisma.feedProgram.findMany();
    this.stats.total += feedPrograms.length;

    for (const program of feedPrograms) {
      try {
        // Find farm
        const farmId = this.farmMap.get(program.farm_id);
        if (!farmId) {
          console.log(`⏭️  Farm not found for feed program: ${program.name}`);
          this.stats.skipped++;
          continue;
        }

        // Create feed type in master service
        const migratedFeedType = await masterPrisma.feedType.create({
          data: {
            name: program.name,
            description: program.description,
            type: 'PROGRAM',
            status: this.mapStatus(program.status),
            effectiveStart: program.effective_start,
            effectiveEnd: program.effective_end,
            createdAt: program.created_at,
            updatedAt: program.updated_at
          }
        });

        console.log(`✅ Migrated feed program: ${program.name} (ID: ${migratedFeedType.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate feed program ${program.name}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateEnvironmentalFactors() {
    console.log('📦 Migrating environmental factors...');
    
    const factors = await farmPrisma.environmentalFactor.findMany();
    this.stats.total += factors.length;

    for (const factor of factors) {
      try {
        // Find farm
        const farmId = this.farmMap.get(factor.farm_id);
        if (!farmId) {
          console.log(`⏭️  Farm not found for environmental factor: ${factor.id}`);
          this.stats.skipped++;
          continue;
        }

        // Create zone in master service
        const migratedZone = await masterPrisma.zone.create({
          data: {
            farmId: farmId,
            name: `Environmental Zone ${factor.id}`,
            type: 'ENVIRONMENTAL',
            status: 'ACTIVE',
            description: factor.note,
            metadata: {
              ventilationRate: factor.ventilation_rate,
              measurementDate: factor.measurement_date,
              effectiveStart: factor.effective_start,
              effectiveEnd: factor.effective_end
            },
            createdAt: factor.created_at,
            updatedAt: factor.updated_at
          }
        });

        console.log(`✅ Migrated environmental factor: ${factor.id} (ID: ${migratedZone.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate environmental factor ${factor.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateHousingConditions() {
    console.log('📦 Migrating housing conditions...');
    
    const conditions = await farmPrisma.housingCondition.findMany();
    this.stats.total += conditions.length;

    for (const condition of conditions) {
      try {
        // Find farm
        const farmId = this.farmMap.get(condition.farm_id);
        if (!farmId) {
          console.log(`⏭️  Farm not found for housing condition: ${condition.id}`);
          this.stats.skipped++;
          continue;
        }

        // Create zone in master service
        const migratedZone = await masterPrisma.zone.create({
          data: {
            farmId: farmId,
            name: `Housing Zone ${condition.id}`,
            type: 'HOUSING',
            status: 'ACTIVE',
            description: condition.note,
            metadata: {
              flooringHumidity: condition.flooring_humidity,
              animalDensity: condition.animal_density,
              area: condition.area,
              effectiveStart: condition.effective_start,
              effectiveEnd: condition.effective_end
            },
            createdAt: condition.created_at,
            updatedAt: condition.updated_at
          }
        });

        console.log(`✅ Migrated housing condition: ${condition.id} (ID: ${migratedZone.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate housing condition ${condition.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateWaterQuality() {
    console.log('📦 Migrating water quality...');
    
    const waterQuality = await farmPrisma.waterQuality.findMany();
    this.stats.total += waterQuality.length;

    for (const quality of waterQuality) {
      try {
        // Find farm
        const farmId = this.farmMap.get(quality.farm_id);
        if (!farmId) {
          console.log(`⏭️  Farm not found for water quality: ${quality.id}`);
          this.stats.skipped++;
          continue;
        }

        // Create zone in master service
        const migratedZone = await masterPrisma.zone.create({
          data: {
            farmId: farmId,
            name: `Water Quality Zone ${quality.id}`,
            type: 'WATER_QUALITY',
            status: 'ACTIVE',
            description: quality.note,
            metadata: {
              fe: quality.fe,
              pb: quality.pb,
              measurementDate: quality.measurement_date
            },
            createdAt: quality.created_at,
            updatedAt: quality.updated_at
          }
        });

        console.log(`✅ Migrated water quality: ${quality.id} (ID: ${migratedZone.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate water quality ${quality.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateHealthRecords() {
    console.log('📦 Migrating health records...');
    
    const healthRecords = await farmPrisma.healthRecord.findMany();
    this.stats.total += healthRecords.length;

    for (const record of healthRecords) {
      try {
        // Find flock
        const flock = await masterPrisma.flock.findFirst({
          where: {
            flockId: record.animal_id.toString()
          }
        });

        if (!flock) {
          console.log(`⏭️  Flock not found for health record: ${record.id}`);
          this.stats.skipped++;
          continue;
        }

        // Update flock with health info
        const healthInfo = {
          healthStatus: record.health_status,
          disease: record.disease,
          vaccine: record.vaccine,
          recordedDate: record.recorded_date,
          notes: record.notes
        };

        await masterPrisma.flock.update({
          where: { id: flock.id },
          data: {
            healthRecords: healthInfo
          }
        });

        console.log(`✅ Updated health info for flock: ${flock.species}`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate health record ${record.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateWelfareIndicators() {
    console.log('📦 Migrating welfare indicators...');
    
    const indicators = await farmPrisma.welfareIndicator.findMany();
    this.stats.total += indicators.length;

    for (const indicator of indicators) {
      try {
        // Find flock
        const flock = await masterPrisma.flock.findFirst({
          where: {
            flockId: indicator.animal_id.toString()
          }
        });

        if (!flock) {
          console.log(`⏭️  Flock not found for welfare indicator: ${indicator.id}`);
          this.stats.skipped++;
          continue;
        }

        // Update flock with welfare info
        const welfareInfo = {
          footpadLesion: indicator.footpad_lesion,
          stressHormone: indicator.stress_hormone,
          recordedDate: indicator.recorded_date,
          notes: indicator.notes
        };

        await masterPrisma.flock.update({
          where: { id: flock.id },
          data: {
            welfareIndicators: welfareInfo
          }
        });

        console.log(`✅ Updated welfare info for flock: ${flock.species}`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate welfare indicator ${indicator.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migratePerformanceMetrics() {
    console.log('📦 Migrating performance metrics...');
    
    const metrics = await farmPrisma.performanceMetric.findMany();
    this.stats.total += metrics.length;

    for (const metric of metrics) {
      try {
        // Find flock
        const flock = await masterPrisma.flock.findFirst({
          where: {
            flockId: metric.animal_id.toString()
          }
        });

        if (!flock) {
          console.log(`⏭️  Flock not found for performance metric: ${metric.id}`);
          this.stats.skipped++;
          continue;
        }

        // Update flock with performance info
        const performanceInfo = {
          adg: metric.adg,
          fcr: metric.fcr,
          survivalRate: metric.survival_rate,
          piScore: metric.pi_score,
          mortalityRate: metric.mortality_rate,
          healthScore: metric.health_score,
          behaviorScore: metric.behavior_score,
          bodyConditionScore: metric.body_condition_score,
          stressLevel: metric.stress_level,
          diseaseIncidenceRate: metric.disease_incidence_rate,
          vaccinationStatus: metric.vaccination_status,
          recordedDate: metric.recorded_date
        };

        await masterPrisma.flock.update({
          where: { id: flock.id },
          data: {
            performanceMetrics: performanceInfo
          }
        });

        console.log(`✅ Updated performance info for flock: ${flock.species}`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate performance metric ${metric.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateOperationalRecords() {
    console.log('📦 Migrating operational records...');
    
    const records = await farmPrisma.operationalRecord.findMany();
    this.stats.total += records.length;

    for (const record of records) {
      try {
        // Find farm
        const farmId = this.farmMap.get(record.farm_id);
        if (!farmId) {
          console.log(`⏭️  Farm not found for operational record: ${record.id}`);
          this.stats.skipped++;
          continue;
        }

        // Create master event
        const migratedEvent = await masterPrisma.masterEvent.create({
          data: {
            farmId: farmId,
            type: 'OPERATIONAL',
            title: record.type,
            description: record.description,
            eventDate: record.record_date,
            status: 'COMPLETED',
            metadata: {
              originalId: record.id,
              originalType: record.type
            },
            createdAt: record.created_at,
            updatedAt: record.updated_at
          }
        });

        console.log(`✅ Migrated operational record: ${record.type} (ID: ${migratedEvent.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate operational record ${record.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async findOrCreateCustomer(customerId) {
    if (this.customerMap.has(customerId)) {
      return this.customerMap.get(customerId);
    }

    // Try to find existing customer
    let customer = await masterPrisma.customer.findFirst({
      where: {
        customerId: customerId.toString()
      }
    });

    if (!customer) {
      // Create placeholder customer
      customer = await masterPrisma.customer.create({
        data: {
          customerId: customerId.toString(),
          name: `Customer ${customerId}`,
          email: `customer${customerId}@example.com`,
          status: 'ACTIVE',
          role: 'USER'
        }
      });
    }

    this.customerMap.set(customerId, customer.id);
    return customer;
  }

  calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    return Math.floor(ageInDays / 30); // Return age in months
  }

  mapStatus(status) {
    const statusMap = {
      'active': 'ACTIVE',
      'inactive': 'INACTIVE',
      'suspended': 'SUSPENDED',
      'pending': 'PENDING'
    };
    return statusMap[status] || 'ACTIVE';
  }

  mapGender(gender) {
    const genderMap = {
      'male': 'MALE',
      'female': 'FEMALE',
      'unknown': 'UNKNOWN'
    };
    return genderMap[gender] || 'UNKNOWN';
  }

  generateReport() {
    console.log('\n📊 Migration Report:');
    console.log('==================');
    console.log(`Total records: ${this.stats.total}`);
    console.log(`Migrated: ${this.stats.migrated}`);
    console.log(`Skipped: ${this.stats.skipped}`);
    console.log(`Errors: ${this.stats.errors}`);
    console.log(`Success rate: ${((this.stats.migrated / this.stats.total) * 100).toFixed(2)}%`);
  }

  async cleanup() {
    await masterPrisma.$disconnect();
    await farmPrisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new FarmMigration();
  migration.migrate()
    .then(() => {
      console.log('✅ Farm migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Farm migration failed:', error);
      process.exit(1);
    });
}

module.exports = FarmMigration;

