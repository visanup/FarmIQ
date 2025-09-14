import { PrismaClient } from '@prisma/client';
import { publishToKafka } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateFarmData {
  farmId: string;
  customerId: string;
  name: string;
  location: {
    lat: number;
    lon: number;
    address?: string;
  };
  region?: string;
  farmType?: string;
  totalArea?: number;
  tenantId?: string;
  meta?: Record<string, any>;
}

export interface UpdateFarmData {
  farmId?: string;
  customerId?: string;
  name?: string;
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };
  region?: string;
  farmType?: string;
  totalArea?: number;
  tenantId?: string;
  meta?: Record<string, any>;
}

export interface FarmFilters {
  customerId?: string;
  region?: string;
  farmType?: string;
  limit?: number;
  offset?: number;
}

export class FarmService {
  async createFarm(data: CreateFarmData) {
    try {
      const farm = await prisma.farm.create({
        data: {
          farmId: data.farmId,
          customerId: data.customerId,
          name: data.name,
          location: data.location,
          region: data.region,
          farmType: data.farmType,
          totalArea: data.totalArea,
          tenantId: data.tenantId || 'default-tenant',
          meta: data.meta || {}
        }
      });

      // Publish to Kafka
      await publishToKafka('farm.snapshot.created', {
        id: farm.id,
        farmId: farm.farmId,
        customerId: farm.customerId,
        name: farm.name,
        location: farm.location,
        region: farm.region,
        farmType: farm.farmType,
        totalArea: farm.totalArea,
        meta: farm.meta,
        createdAt: farm.createdAt,
        updatedAt: farm.updatedAt
      });

      return {
        success: true,
        data: farm,
        message: 'Farm created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create farm: ${(error as Error).message}`);
    }
  }

  async getAllFarms(filters: FarmFilters = {}) {
    try {
      const where: any = {};
      
      if (filters.customerId) {
        where.customerId = filters.customerId;
      }
      
      if (filters.region) {
        where.region = filters.region;
      }
      
      if (filters.farmType) {
        where.farmType = filters.farmType;
      }

      const [farms, total] = await Promise.all([
        prisma.farm.findMany({
          where,
          take: filters.limit || 10,
          skip: filters.offset || 0,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.farm.count({ where })
      ]);

      return {
        success: true,
        data: farms,
        pagination: {
          total,
          limit: filters.limit || 10,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 10) < total
        }
      };
    } catch (error) {
      throw new Error(`Failed to get farms: ${(error as Error).message}`);
    }
  }

  async getFarmById(id: string) {
    try {
      const farm = await prisma.farm.findUnique({
        where: { id }
      });

      if (!farm) {
        throw new Error('Farm not found');
      }

      return {
        success: true,
        data: farm
      };
    } catch (error) {
      throw new Error(`Failed to get farm: ${(error as Error).message}`);
    }
  }

  async updateFarm(id: string, data: UpdateFarmData) {
    try {
      const farm = await prisma.farm.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      // Publish to Kafka
      await publishToKafka('farm.snapshot.updated', {
        id: farm.id,
        farmId: farm.farmId,
        customerId: farm.customerId,
        name: farm.name,
        location: farm.location,
        region: farm.region,
        farmType: farm.farmType,
        totalArea: farm.totalArea,
        meta: farm.meta,
        createdAt: farm.createdAt,
        updatedAt: farm.updatedAt
      });

      return {
        success: true,
        data: farm,
        message: 'Farm updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update farm: ${(error as Error).message}`);
    }
  }

  async deleteFarm(id: string) {
    try {
      const farm = await prisma.farm.delete({
        where: { id }
      });

      // Publish to Kafka
      await publishToKafka('farm.snapshot.deleted', {
        id: farm.id,
        farmId: farm.farmId,
        customerId: farm.customerId,
        name: farm.name,
        location: farm.location,
        region: farm.region,
        farmType: farm.farmType,
        totalArea: farm.totalArea,
        meta: farm.meta,
        createdAt: farm.createdAt,
        updatedAt: farm.updatedAt
      });

      return {
        success: true,
        message: 'Farm deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete farm: ${(error as Error).message}`);
    }
  }
}
