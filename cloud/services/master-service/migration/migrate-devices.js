#!/usr/bin/env node

/**
 * Devices Service Migration Script
 * Migrates data from devices-service to master-service
 */

const { PrismaClient: MasterPrisma } = require('@prisma/client');
const { PrismaClient: DevicePrisma } = require('@prisma/client');

const masterPrisma = new MasterPrisma({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sensor_cloud_db?schema=master'
    }
  }
});

const devicePrisma = new DevicePrisma({
  datasources: {
    db: {
      url: process.env.DEVICE_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sensor_cloud_db?schema=devices'
    }
  }
});

class DeviceMigration {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      errors: 0,
      skipped: 0
    };
    this.deviceTypeMap = new Map();
    this.deviceGroupMap = new Map();
    this.deviceMap = new Map();
  }

  async migrate() {
    console.log('🚀 Starting Devices Service Migration...');
    
    try {
      // 1. Migrate device types
      await this.migrateDeviceTypes();
      
      // 2. Migrate device groups
      await this.migrateDeviceGroups();
      
      // 3. Migrate devices
      await this.migrateDevices();
      
      // 4. Migrate device logs
      await this.migrateDeviceLogs();
      
      // 5. Migrate device status history
      await this.migrateDeviceStatusHistory();
      
      // 6. Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async migrateDeviceTypes() {
    console.log('📦 Migrating device types...');
    
    const deviceTypes = await devicePrisma.deviceType.findMany();
    this.stats.total += deviceTypes.length;

    for (const deviceType of deviceTypes) {
      try {
        // Check if device type already exists
        const existingDeviceType = await masterPrisma.deviceType.findFirst({
          where: {
            name: deviceType.name
          }
        });

        if (existingDeviceType) {
          console.log(`⏭️  Skipping existing device type: ${deviceType.name}`);
          this.deviceTypeMap.set(deviceType.type_id, existingDeviceType.id);
          this.stats.skipped++;
          continue;
        }

        // Create device type in master service
        const migratedDeviceType = await masterPrisma.deviceType.create({
          data: {
            name: deviceType.name,
            description: deviceType.description || null,
            iconCssClass: deviceType.icon_css_class || null,
            defaultImageUrl: deviceType.default_image_url || null,
            status: 'ACTIVE',
            createdAt: deviceType.created_at,
            updatedAt: deviceType.updated_at
          }
        });

        this.deviceTypeMap.set(deviceType.type_id, migratedDeviceType.id);
        console.log(`✅ Migrated device type: ${deviceType.name} (ID: ${migratedDeviceType.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate device type ${deviceType.name}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateDeviceGroups() {
    console.log('📦 Migrating device groups...');
    
    const deviceGroups = await devicePrisma.deviceGroup.findMany();
    this.stats.total += deviceGroups.length;

    for (const deviceGroup of deviceGroups) {
      try {
        // Check if device group already exists
        const existingDeviceGroup = await masterPrisma.deviceGroup.findFirst({
          where: {
            name: deviceGroup.name
          }
        });

        if (existingDeviceGroup) {
          console.log(`⏭️  Skipping existing device group: ${deviceGroup.name}`);
          this.deviceGroupMap.set(deviceGroup.group_id, existingDeviceGroup.id);
          this.stats.skipped++;
          continue;
        }

        // Find parent group if exists
        let parentId = null;
        if (deviceGroup.parent_id) {
          parentId = this.deviceGroupMap.get(deviceGroup.parent_id);
        }

        // Create device group in master service
        const migratedDeviceGroup = await masterPrisma.deviceGroup.create({
          data: {
            name: deviceGroup.name,
            description: deviceGroup.note || null,
            category: deviceGroup.category || 'GENERAL',
            parentId: parentId,
            status: 'ACTIVE',
            createdAt: deviceGroup.created_at,
            updatedAt: deviceGroup.updated_at
          }
        });

        this.deviceGroupMap.set(deviceGroup.group_id, migratedDeviceGroup.id);
        console.log(`✅ Migrated device group: ${deviceGroup.name} (ID: ${migratedDeviceGroup.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate device group ${deviceGroup.name}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateDevices() {
    console.log('📦 Migrating devices...');
    
    const devices = await devicePrisma.device.findMany();
    this.stats.total += devices.length;

    for (const device of devices) {
      try {
        // Check if device already exists
        const existingDevice = await masterPrisma.device.findFirst({
          where: {
            deviceId: device.device_id.toString()
          }
        });

        if (existingDevice) {
          console.log(`⏭️  Skipping existing device: ${device.model}`);
          this.deviceMap.set(device.device_id, existingDevice.id);
          this.stats.skipped++;
          continue;
        }

        // Find device type and group
        const deviceTypeId = this.deviceTypeMap.get(device.type_id);
        const deviceGroupId = this.deviceGroupMap.get(device.group_id);

        // Find house if exists
        let houseId = null;
        if (device.house_id) {
          const house = await masterPrisma.house.findFirst({
            where: {
              houseId: device.house_id.toString()
            }
          });
          houseId = house?.id;
        }

        // Create device in master service
        const migratedDevice = await masterPrisma.device.create({
          data: {
            deviceId: device.device_id.toString(),
            houseId: houseId,
            deviceTypeId: deviceTypeId,
            deviceGroupId: deviceGroupId,
            model: device.model || 'Unknown',
            serialNumber: device.serial_number || null,
            installDate: device.install_date,
            calibrationDate: device.calibration_date,
            lastMaintenanceDate: device.last_maintenance,
            buildDate: device.build_date,
            lastSeen: device.last_seen,
            locationDetail: device.location_detail || null,
            manufacturer: device.manufacturer || null,
            specs: device.specs || null,
            config: device.config || null,
            credentials: device.credentials || null,
            tags: device.tags || [],
            status: this.mapDeviceStatus(device.status),
            createdAt: device.created_at,
            updatedAt: device.updated_at
          }
        });

        this.deviceMap.set(device.device_id, migratedDevice.id);
        console.log(`✅ Migrated device: ${device.model} (ID: ${migratedDevice.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate device ${device.model}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateDeviceLogs() {
    console.log('📦 Migrating device logs...');
    
    const deviceLogs = await devicePrisma.deviceLog.findMany();
    this.stats.total += deviceLogs.length;

    for (const log of deviceLogs) {
      try {
        // Find device
        const deviceId = this.deviceMap.get(log.device_id);
        if (!deviceId) {
          console.log(`⏭️  Device not found for log: ${log.log_id}`);
          this.stats.skipped++;
          continue;
        }

        // Create master event
        const migratedEvent = await masterPrisma.masterEvent.create({
          data: {
            deviceId: deviceId,
            type: 'DEVICE_LOG',
            title: log.event_type,
            description: `Device log: ${log.event_type}`,
            eventDate: log.created_at,
            status: 'COMPLETED',
            performedBy: log.performed_by || 'System',
            metadata: {
              originalId: log.log_id,
              eventType: log.event_type,
              eventData: log.event_data
            },
            createdAt: log.created_at,
            updatedAt: log.created_at
          }
        });

        console.log(`✅ Migrated device log: ${log.event_type} (ID: ${migratedEvent.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate device log ${log.log_id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateDeviceStatusHistory() {
    console.log('📦 Migrating device status history...');
    
    const statusHistory = await devicePrisma.deviceStatusHistory.findMany();
    this.stats.total += statusHistory.length;

    for (const status of statusHistory) {
      try {
        // Find device
        const deviceId = this.deviceMap.get(status.device_id);
        if (!deviceId) {
          console.log(`⏭️  Device not found for status history: ${status.id}`);
          this.stats.skipped++;
          continue;
        }

        // Create device health record
        const migratedDeviceHealth = await masterPrisma.deviceHealth.create({
          data: {
            deviceId: deviceId,
            status: this.mapDeviceStatus(status.status),
            healthScore: this.calculateHealthScore(status.status),
            lastSeen: status.changed_at,
            batteryLevel: null,
            signalStrength: null,
            temperature: null,
            humidity: null,
            notes: status.note || null,
            performedBy: status.performed_by || 'System',
            createdAt: status.changed_at,
            updatedAt: status.changed_at
          }
        });

        console.log(`✅ Migrated device status: ${status.status} (ID: ${migratedDeviceHealth.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate device status ${status.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  mapDeviceStatus(status) {
    const statusMap = {
      'active': 'ACTIVE',
      'inactive': 'INACTIVE',
      'maintenance': 'MAINTENANCE',
      'offline': 'OFFLINE',
      'error': 'ERROR',
      'online': 'ONLINE'
    };
    return statusMap[status] || 'ACTIVE';
  }

  calculateHealthScore(status) {
    const healthScoreMap = {
      'active': 100,
      'online': 95,
      'inactive': 50,
      'maintenance': 75,
      'offline': 0,
      'error': 25
    };
    return healthScoreMap[status] || 50;
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
    await devicePrisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new DeviceMigration();
  migration.migrate()
    .then(() => {
      console.log('✅ Device migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Device migration failed:', error);
      process.exit(1);
    });
}

module.exports = DeviceMigration;

