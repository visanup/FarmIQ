#!/usr/bin/env node

/**
 * Migration Validation Script
 * Validates migrated data integrity and completeness
 */

const { PrismaClient: MasterPrisma } = require('@prisma/client');

const masterPrisma = new MasterPrisma({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL || 'postgresql://postgres:postgres1611@localhost:15432/agroatlas?schema=master'
    }
  }
});

class MigrationValidator {
  constructor() {
    this.results = {
      customers: { total: 0, valid: 0, invalid: 0, issues: [] },
      farms: { total: 0, valid: 0, invalid: 0, issues: [] },
      houses: { total: 0, valid: 0, invalid: 0, issues: [] },
      flocks: { total: 0, valid: 0, invalid: 0, issues: [] },
      devices: { total: 0, valid: 0, invalid: 0, issues: [] },
      deviceTypes: { total: 0, valid: 0, invalid: 0, issues: [] },
      deviceGroups: { total: 0, valid: 0, invalid: 0, issues: [] },
      feedTypes: { total: 0, valid: 0, invalid: 0, issues: [] },
      formulas: { total: 0, valid: 0, invalid: 0, issues: [] },
      economicData: { total: 0, valid: 0, invalid: 0, issues: [] },
      externalDataSources: { total: 0, valid: 0, invalid: 0, issues: [] },
      zones: { total: 0, valid: 0, invalid: 0, issues: [] },
      masterEvents: { total: 0, valid: 0, invalid: 0, issues: [] }
    };
  }

  async validate() {
    console.log('🔍 Starting Migration Validation...');
    console.log('===================================');
    
    try {
      // Validate each entity type
      await this.validateCustomers();
      await this.validateFarms();
      await this.validateHouses();
      await this.validateFlocks();
      await this.validateDevices();
      await this.validateDeviceTypes();
      await this.validateDeviceGroups();
      await this.validateFeedTypes();
      await this.validateFormulas();
      await this.validateEconomicData();
      await this.validateExternalDataSources();
      await this.validateZones();
      await this.validateMasterEvents();
      
      // Generate validation report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async validateCustomers() {
    console.log('📦 Validating customers...');
    
    const customers = await masterPrisma.customer.findMany();
    this.results.customers.total = customers.length;

    for (const customer of customers) {
      const issues = [];
      
      // Check required fields
      if (!customer.customerId) issues.push('Missing customerId');
      if (!customer.name) issues.push('Missing name');
      if (!customer.email) issues.push('Missing email');
      if (!customer.status) issues.push('Missing status');
      
      // Check email format
      if (customer.email && !this.isValidEmail(customer.email)) {
        issues.push('Invalid email format');
      }
      
      // Check status values
      if (customer.status && !['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].includes(customer.status)) {
        issues.push('Invalid status value');
      }
      
      if (issues.length === 0) {
        this.results.customers.valid++;
      } else {
        this.results.customers.invalid++;
        this.results.customers.issues.push({
          id: customer.id,
          customerId: customer.customerId,
          issues: issues
        });
      }
    }
  }

  async validateFarms() {
    console.log('📦 Validating farms...');
    
    const farms = await masterPrisma.farm.findMany();
    this.results.farms.total = farms.length;

    for (const farm of farms) {
      const issues = [];
      
      // Check required fields
      if (!farm.farmId) issues.push('Missing farmId');
      if (!farm.name) issues.push('Missing name');
      if (!farm.customerId) issues.push('Missing customerId');
      if (!farm.status) issues.push('Missing status');
      
      // Check customer exists
      if (farm.customerId) {
        const customer = await masterPrisma.customer.findUnique({
          where: { id: farm.customerId }
        });
        if (!customer) issues.push('Referenced customer not found');
      }
      
      if (issues.length === 0) {
        this.results.farms.valid++;
      } else {
        this.results.farms.invalid++;
        this.results.farms.issues.push({
          id: farm.id,
          farmId: farm.farmId,
          issues: issues
        });
      }
    }
  }

  async validateHouses() {
    console.log('📦 Validating houses...');
    
    const houses = await masterPrisma.house.findMany();
    this.results.houses.total = houses.length;

    for (const house of houses) {
      const issues = [];
      
      // Check required fields
      if (!house.houseId) issues.push('Missing houseId');
      if (!house.name) issues.push('Missing name');
      if (!house.farmId) issues.push('Missing farmId');
      if (!house.status) issues.push('Missing status');
      
      // Check farm exists
      if (house.farmId) {
        const farm = await masterPrisma.farm.findUnique({
          where: { id: house.farmId }
        });
        if (!farm) issues.push('Referenced farm not found');
      }
      
      if (issues.length === 0) {
        this.results.houses.valid++;
      } else {
        this.results.houses.invalid++;
        this.results.houses.issues.push({
          id: house.id,
          houseId: house.houseId,
          issues: issues
        });
      }
    }
  }

  async validateFlocks() {
    console.log('📦 Validating flocks...');
    
    const flocks = await masterPrisma.flock.findMany();
    this.results.flocks.total = flocks.length;

    for (const flock of flocks) {
      const issues = [];
      
      // Check required fields
      if (!flock.flockId) issues.push('Missing flockId');
      if (!flock.species) issues.push('Missing species');
      if (!flock.farmId) issues.push('Missing farmId');
      if (!flock.status) issues.push('Missing status');
      
      // Check farm exists
      if (flock.farmId) {
        const farm = await masterPrisma.farm.findUnique({
          where: { id: flock.farmId }
        });
        if (!farm) issues.push('Referenced farm not found');
      }
      
      // Check house exists (if specified)
      if (flock.houseId) {
        const house = await masterPrisma.house.findUnique({
          where: { id: flock.houseId }
        });
        if (!house) issues.push('Referenced house not found');
      }
      
      if (issues.length === 0) {
        this.results.flocks.valid++;
      } else {
        this.results.flocks.invalid++;
        this.results.flocks.issues.push({
          id: flock.id,
          flockId: flock.flockId,
          issues: issues
        });
      }
    }
  }

  async validateDevices() {
    console.log('📦 Validating devices...');
    
    const devices = await masterPrisma.device.findMany();
    this.results.devices.total = devices.length;

    for (const device of devices) {
      const issues = [];
      
      // Check required fields
      if (!device.deviceId) issues.push('Missing deviceId');
      if (!device.model) issues.push('Missing model');
      if (!device.status) issues.push('Missing status');
      
      // Check device type exists (if specified)
      if (device.deviceTypeId) {
        const deviceType = await masterPrisma.deviceType.findUnique({
          where: { id: device.deviceTypeId }
        });
        if (!deviceType) issues.push('Referenced device type not found');
      }
      
      // Check device group exists (if specified)
      if (device.deviceGroupId) {
        const deviceGroup = await masterPrisma.deviceGroup.findUnique({
          where: { id: device.deviceGroupId }
        });
        if (!deviceGroup) issues.push('Referenced device group not found');
      }
      
      // Check house exists (if specified)
      if (device.houseId) {
        const house = await masterPrisma.house.findUnique({
          where: { id: device.houseId }
        });
        if (!house) issues.push('Referenced house not found');
      }
      
      if (issues.length === 0) {
        this.results.devices.valid++;
      } else {
        this.results.devices.invalid++;
        this.results.devices.issues.push({
          id: device.id,
          deviceId: device.deviceId,
          issues: issues
        });
      }
    }
  }

  async validateDeviceTypes() {
    console.log('📦 Validating device types...');
    
    const deviceTypes = await masterPrisma.deviceType.findMany();
    this.results.deviceTypes.total = deviceTypes.length;

    for (const deviceType of deviceTypes) {
      const issues = [];
      
      // Check required fields
      if (!deviceType.name) issues.push('Missing name');
      if (!deviceType.status) issues.push('Missing status');
      
      if (issues.length === 0) {
        this.results.deviceTypes.valid++;
      } else {
        this.results.deviceTypes.invalid++;
        this.results.deviceTypes.issues.push({
          id: deviceType.id,
          name: deviceType.name,
          issues: issues
        });
      }
    }
  }

  async validateDeviceGroups() {
    console.log('📦 Validating device groups...');
    
    const deviceGroups = await masterPrisma.deviceGroup?.findMany() || [];
    this.results.deviceGroups.total = deviceGroups.length;

    for (const deviceGroup of deviceGroups) {
      const issues = [];
      
      // Check required fields
      if (!deviceGroup.name) issues.push('Missing name');
      if (!deviceGroup.status) issues.push('Missing status');
      
      // Check parent group exists (if specified)
      if (deviceGroup.parentId) {
        const parentGroup = await masterPrisma.deviceGroup.findUnique({
          where: { id: deviceGroup.parentId }
        });
        if (!parentGroup) issues.push('Referenced parent group not found');
      }
      
      if (issues.length === 0) {
        this.results.deviceGroups.valid++;
      } else {
        this.results.deviceGroups.invalid++;
        this.results.deviceGroups.issues.push({
          id: deviceGroup.id,
          name: deviceGroup.name,
          issues: issues
        });
      }
    }
  }

  async validateFeedTypes() {
    console.log('📦 Validating feed types...');
    
    const feedTypes = await masterPrisma.feedType.findMany();
    this.results.feedTypes.total = feedTypes.length;

    for (const feedType of feedTypes) {
      const issues = [];
      
      // Check required fields
      if (!feedType.name) issues.push('Missing name');
      if (!feedType.status) issues.push('Missing status');
      
      if (issues.length === 0) {
        this.results.feedTypes.valid++;
      } else {
        this.results.feedTypes.invalid++;
        this.results.feedTypes.issues.push({
          id: feedType.id,
          name: feedType.name,
          issues: issues
        });
      }
    }
  }

  async validateFormulas() {
    console.log('📦 Validating formulas...');
    
    const formulas = await masterPrisma.formula.findMany();
    this.results.formulas.total = formulas.length;

    for (const formula of formulas) {
      const issues = [];
      
      // Check required fields
      if (!formula.formulaNo) issues.push('Missing formulaNo');
      if (!formula.name) issues.push('Missing name');
      if (!formula.status) issues.push('Missing status');
      
      if (issues.length === 0) {
        this.results.formulas.valid++;
      } else {
        this.results.formulas.invalid++;
        this.results.formulas.issues.push({
          id: formula.id,
          formulaNo: formula.formulaNo,
          issues: issues
        });
      }
    }
  }

  async validateEconomicData() {
    console.log('📦 Validating economic data...');
    
    const economicData = await masterPrisma.economicData.findMany();
    this.results.economicData.total = economicData.length;

    for (const data of economicData) {
      const issues = [];
      
      // Check required fields
      if (!data.farmId) issues.push('Missing farmId');
      if (!data.costType) issues.push('Missing costType');
      if (!data.amount) issues.push('Missing amount');
      if (!data.recordDate) issues.push('Missing recordDate');
      
      // Check farm exists
      if (data.farmId) {
        const farm = await masterPrisma.farm.findUnique({
          where: { id: data.farmId }
        });
        if (!farm) issues.push('Referenced farm not found');
      }
      
      if (issues.length === 0) {
        this.results.economicData.valid++;
      } else {
        this.results.economicData.invalid++;
        this.results.economicData.issues.push({
          id: data.id,
          farmId: data.farmId,
          issues: issues
        });
      }
    }
  }

  async validateExternalDataSources() {
    console.log('📦 Validating external data sources...');
    
    const externalDataSources = await masterPrisma.externalDataSource.findMany();
    this.results.externalDataSources.total = externalDataSources.length;

    for (const source of externalDataSources) {
      const issues = [];
      
      // Check required fields
      if (!source.name) issues.push('Missing name');
      if (!source.type) issues.push('Missing type');
      if (!source.status) issues.push('Missing status');
      
      if (issues.length === 0) {
        this.results.externalDataSources.valid++;
      } else {
        this.results.externalDataSources.invalid++;
        this.results.externalDataSources.issues.push({
          id: source.id,
          name: source.name,
          issues: issues
        });
      }
    }
  }

  async validateZones() {
    console.log('📦 Validating zones...');
    
    const zones = await masterPrisma.zone.findMany();
    this.results.zones.total = zones.length;

    for (const zone of zones) {
      const issues = [];
      
      // Check required fields
      if (!zone.name) issues.push('Missing name');
      if (!zone.type) issues.push('Missing type');
      if (!zone.farmId) issues.push('Missing farmId');
      if (!zone.status) issues.push('Missing status');
      
      // Check farm exists
      if (zone.farmId) {
        const farm = await masterPrisma.farm.findUnique({
          where: { id: zone.farmId }
        });
        if (!farm) issues.push('Referenced farm not found');
      }
      
      if (issues.length === 0) {
        this.results.zones.valid++;
      } else {
        this.results.zones.invalid++;
        this.results.zones.issues.push({
          id: zone.id,
          name: zone.name,
          issues: issues
        });
      }
    }
  }

  async validateMasterEvents() {
    console.log('📦 Validating master events...');
    
    const events = await masterPrisma.masterEvent.findMany();
    this.results.masterEvents.total = events.length;

    for (const event of events) {
      const issues = [];
      
      // Check required fields
      if (!event.type) issues.push('Missing type');
      if (!event.title) issues.push('Missing title');
      if (!event.status) issues.push('Missing status');
      
      // Check farm exists (if specified)
      if (event.farmId) {
        const farm = await masterPrisma.farm.findUnique({
          where: { id: event.farmId }
        });
        if (!farm) issues.push('Referenced farm not found');
      }
      
      // Check device exists (if specified)
      if (event.deviceId) {
        const device = await masterPrisma.device.findUnique({
          where: { id: event.deviceId }
        });
        if (!device) issues.push('Referenced device not found');
      }
      
      if (issues.length === 0) {
        this.results.masterEvents.valid++;
      } else {
        this.results.masterEvents.invalid++;
        this.results.masterEvents.issues.push({
          id: event.id,
          type: event.type,
          issues: issues
        });
      }
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateReport() {
    console.log('\n📊 Migration Validation Report');
    console.log('==============================');
    
    let totalRecords = 0;
    let totalValid = 0;
    let totalInvalid = 0;
    
    for (const [entity, result] of Object.entries(this.results)) {
      totalRecords += result.total;
      totalValid += result.valid;
      totalInvalid += result.invalid;
      
      const successRate = result.total > 0 ? ((result.valid / result.total) * 100).toFixed(2) : '0.00';
      
      console.log(`\n${entity.toUpperCase()}:`);
      console.log(`  Total: ${result.total}`);
      console.log(`  Valid: ${result.valid}`);
      console.log(`  Invalid: ${result.invalid}`);
      console.log(`  Success Rate: ${successRate}%`);
      
      if (result.issues.length > 0) {
        console.log(`  Issues:`);
        result.issues.slice(0, 5).forEach(issue => {
          console.log(`    - ${issue.id || issue.name || issue.type}: ${issue.issues.join(', ')}`);
        });
        if (result.issues.length > 5) {
          console.log(`    ... and ${result.issues.length - 5} more issues`);
        }
      }
    }
    
    const overallSuccessRate = totalRecords > 0 ? ((totalValid / totalRecords) * 100).toFixed(2) : '0.00';
    
    console.log('\n📈 Overall Summary:');
    console.log('==================');
    console.log(`Total Records: ${totalRecords}`);
    console.log(`Valid Records: ${totalValid}`);
    console.log(`Invalid Records: ${totalInvalid}`);
    console.log(`Overall Success Rate: ${overallSuccessRate}%`);
    
    if (totalInvalid > 0) {
      console.log('\n⚠️  Some records have validation issues. Please review and fix them.');
    } else {
      console.log('\n✅ All records passed validation!');
    }
  }

  async cleanup() {
    await masterPrisma.$disconnect();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new MigrationValidator();
  validator.validate()
    .then(() => {
      console.log('✅ Validation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = MigrationValidator;
