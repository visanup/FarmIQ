import { PrismaClient } from '@prisma/client';
import { publishToKafka } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateHouseData {
  houseId: string;
  farmId: string;
  name: string;
  type?: string;
  capacity?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  meta?: Record<string, any>;
}

export interface UpdateHouseData {
  houseId?: string;
  farmId?: string;
  name?: string;
  type?: string;
  capacity?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  meta?: Record<string, any>;
}

export interface HouseFilters {
  farmId?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export class HouseService {
  async createHouse(data: CreateHouseData) {
    try {
      const house = await prisma.house.create({
        data: {
          houseId: data.houseId,
          farmId: data.farmId,
          name: data.name,
          type: data.type || 'broiler',
          capacity: data.capacity || 1000,
          dimensions: data.dimensions || {},
          tenantId: 'default-tenant',
          meta: data.meta || {}
        }
      });

      // Publish to Kafka
      await publishToKafka('house.snapshot.created', {
        id: house.id,
        houseId: house.houseId,
        farmId: house.farmId,
        name: house.name,
        type: house.type,
        capacity: house.capacity,
        dimensions: house.dimensions,
        meta: house.meta,
        createdAt: house.createdAt,
        updatedAt: house.updatedAt
      });

      return {
        success: true,
        data: house,
        message: 'House created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create house: ${(error as Error).message}`);
    }
  }

  async getAllHouses(filters: HouseFilters = {}) {
    try {
      const where: any = {};
      
      if (filters.farmId) {
        where.farmId = filters.farmId;
      }
      
      if (filters.type) {
        where.type = filters.type;
      }

      const [houses, total] = await Promise.all([
        prisma.house.findMany({
          where,
          take: filters.limit || 10,
          skip: filters.offset || 0,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.house.count({ where })
      ]);

      return {
        success: true,
        data: houses,
        pagination: {
          total,
          limit: filters.limit || 10,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 10) < total
        }
      };
    } catch (error) {
      throw new Error(`Failed to get houses: ${(error as Error).message}`);
    }
  }

  async getHouseById(id: string) {
    try {
      const house = await prisma.house.findUnique({
        where: { id }
      });

      if (!house) {
        throw new Error('House not found');
      }

      return {
        success: true,
        data: house
      };
    } catch (error) {
      throw new Error(`Failed to get house: ${(error as Error).message}`);
    }
  }

  async updateHouse(id: string, data: UpdateHouseData) {
    try {
      const house = await prisma.house.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      // Publish to Kafka
      await publishToKafka('house.snapshot.updated', {
        id: house.id,
        houseId: house.houseId,
        farmId: house.farmId,
        name: house.name,
        type: house.type,
        capacity: house.capacity,
        dimensions: house.dimensions,
        meta: house.meta,
        createdAt: house.createdAt,
        updatedAt: house.updatedAt
      });

      return {
        success: true,
        data: house,
        message: 'House updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update house: ${(error as Error).message}`);
    }
  }

  async deleteHouse(id: string) {
    try {
      const house = await prisma.house.delete({
        where: { id }
      });

      // Publish to Kafka
      await publishToKafka('house.snapshot.deleted', {
        id: house.id,
        houseId: house.houseId,
        farmId: house.farmId,
        name: house.name,
        type: house.type,
        capacity: house.capacity,
        dimensions: house.dimensions,
        meta: house.meta,
        createdAt: house.createdAt,
        updatedAt: house.updatedAt
      });

      return {
        success: true,
        message: 'House deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete house: ${(error as Error).message}`);
    }
  }
}
