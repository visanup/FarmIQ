#!/usr/bin/env node

/**
 * Customer Service Migration Script
 * Migrates data from customer-service to master-service
 */

const { PrismaClient: MasterPrisma } = require('@prisma/client');
const { PrismaClient: CustomerPrisma } = require('@prisma/client');

const masterPrisma = new MasterPrisma({
  datasources: {
    db: {
      url: process.env.MASTER_DATABASE_URL || 'postgresql://postgres:postgres1611@localhost:15432/agroatlas?schema=master'
    }
  }
});

const customerPrisma = new CustomerPrisma({
  datasources: {
    db: {
      url: process.env.CUSTOMER_DATABASE_URL || 'postgresql://postgres:postgres1611@localhost:15432/agroatlas?schema=customer'
    }
  }
});

class CustomerMigration {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      errors: 0,
      skipped: 0
    };
  }

  async migrate() {
    console.log('🚀 Starting Customer Service Migration...');
    
    try {
      // 1. Migrate customers
      await this.migrateCustomers();
      
      // 2. Migrate subscriptions
      await this.migrateSubscriptions();
      
      // 3. Migrate user roles
      await this.migrateUserRoles();
      
      // 4. Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async migrateCustomers() {
    console.log('📦 Migrating customers...');
    
    const customers = await customerPrisma.customer.findMany({
      include: {
        subscriptions: true,
        contacts: true
      }
    });

    this.stats.total = customers.length;

    for (const customer of customers) {
      try {
        // Check if customer already exists
        const existingCustomer = await masterPrisma.customer.findFirst({
          where: {
            OR: [
              { email: customer.email },
              { customerId: customer.customer_id.toString() }
            ]
          }
        });

        if (existingCustomer) {
          console.log(`⏭️  Skipping existing customer: ${customer.email}`);
          this.stats.skipped++;
          continue;
        }

        // Create customer in master service
        const migratedCustomer = await masterPrisma.customer.create({
          data: {
            customerId: customer.id,
            name: customer.name || 'Unknown',
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null,
            city: null,
            state: null,
            country: 'Thailand',
            postalCode: null,
            status: customer.isActive ? 'ACTIVE' : 'INACTIVE',
            subscriptionType: this.mapSubscriptionType(customer.subscriptions?.[0]?.status),
            role: 'USER',
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
          }
        });

        console.log(`✅ Migrated customer: ${customer.email} (ID: ${migratedCustomer.id})`);
        this.stats.migrated++;

      } catch (error) {
        console.error(`❌ Failed to migrate customer ${customer.email}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  async migrateSubscriptions() {
    console.log('📦 Migrating subscriptions...');
    
    const subscriptions = await customerPrisma.subscription.findMany();

    for (const subscription of subscriptions) {
      try {
        // Find the migrated customer
        const customer = await masterPrisma.customer.findFirst({
          where: {
            customerId: subscription.customerId
          }
        });

        if (!customer) {
          console.log(`⏭️  Customer not found for subscription: ${subscription.id}`);
          continue;
        }

        // Update customer with subscription info
        await masterPrisma.customer.update({
          where: { id: customer.id },
          data: {
            subscriptionType: this.mapSubscriptionType(subscription.status),
            subscriptionStatus: this.mapSubscriptionStatus(subscription.status),
            subscriptionStartDate: subscription.startDate,
            subscriptionEndDate: subscription.endDate
          }
        });

        console.log(`✅ Updated subscription for customer: ${customer.email}`);

      } catch (error) {
        console.error(`❌ Failed to migrate subscription ${subscription.id}:`, error.message);
      }
    }
  }

  async migrateUserRoles() {
    console.log('📦 Migrating user roles...');
    
    const users = await customerPrisma.user.findMany();

    for (const user of users) {
      try {
        // Find the migrated customer
        const customer = await masterPrisma.customer.findFirst({
          where: {
            email: user.email
          }
        });

        if (!customer) {
          console.log(`⏭️  Customer not found for user: ${user.email}`);
          continue;
        }

        // Update customer with role info
        await masterPrisma.customer.update({
          where: { id: customer.id },
          data: {
            role: this.mapRole(user.role),
            permissions: null
          }
        });

        console.log(`✅ Updated role for customer: ${customer.email}`);

      } catch (error) {
        console.error(`❌ Failed to migrate user role ${user.id}:`, error.message);
      }
    }
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

  mapSubscriptionType(type) {
    const typeMap = {
      'basic': 'BASIC',
      'premium': 'PREMIUM',
      'enterprise': 'ENTERPRISE',
      'trial': 'TRIAL'
    };
    return typeMap[type] || 'BASIC';
  }

  mapSubscriptionStatus(status) {
    const statusMap = {
      'active': 'ACTIVE',
      'expired': 'EXPIRED',
      'cancelled': 'CANCELLED',
      'pending': 'PENDING'
    };
    return statusMap[status] || 'ACTIVE';
  }

  mapRole(role) {
    const roleMap = {
      'ADMIN': 'ADMIN',
      'USER': 'USER',
      'VIEWER': 'VIEWER'
    };
    return roleMap[role] || 'USER';
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
    await customerPrisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new CustomerMigration();
  migration.migrate()
    .then(() => {
      console.log('✅ Customer migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Customer migration failed:', error);
      process.exit(1);
    });
}

module.exports = CustomerMigration;
