import { PrismaClient } from '@prisma/client';
import { publishToKafka, kafkaPublisher } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateFlockData {
  flockId: string;
  farmId: string;
  houseId: string;
  animalTypeId: string;
  breedId: string;
  name: string;
  startDate?: Date;
  expectedEndDate?: Date;
  initialCount?: number;
  currentCount?: number;
  meta?: Record<string, any>;
}

export interface UpdateFlockData {
  flockId?: string;
  farmId?: string;
  houseId?: string;
  animalTypeId?: string;
  breedId?: string;
  name?: string;
  startDate?: Date;
  expectedEndDate?: Date;
  initialCount?: number;
  currentCount?: number;
  meta?: Record<string, any>;
}

export interface FlockFilters {
  farmId?: string;
  houseId?: string;
  animalTypeId?: string;
  breedId?: string;
  limit?: number;
  offset?: number;
}

export class FlockService {
  async createFlock(data: CreateFlockData) {
    try {
      // Validate required fields
      if (!data.farmId || !data.animalTypeId || !data.breedId) {
        throw new Error('Missing required fields: farmId, animalTypeId, breedId');
      }

      const flock = await prisma.flock.create({
        data: {
          flockId: data.flockId,
          farmId: data.farmId,
          houseId: data.houseId || null,
          animalTypeId: data.animalTypeId,
          breedId: data.breedId,
          name: data.name,
          startDate: data.startDate || new Date(),
          endDate: data.expectedEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          population: data.initialCount || 1000,
          tenantId: 'default-tenant',
          meta: data.meta || {}
        }
      });

      // Publish to Kafka with correct payload shape
      await kafkaPublisher.publishFlockSnapshot('flock.snapshot.created', flock);

      return {
        success: true,
        data: flock,
        message: 'Flock created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create flock: ${(error as Error).message}`);
    }
  }

  async getAllFlocks(filters: FlockFilters = {}) {
    try {
      const where: any = {};

      if (filters.farmId) {
        where.farmId = filters.farmId;
      }

      if (filters.houseId) {
        where.houseId = filters.houseId;
      }

      if (filters.animalTypeId) {
        where.animalTypeId = filters.animalTypeId;
      }

      if (filters.breedId) {
        where.breedId = filters.breedId;
      }

      const [flocks, total] = await Promise.all([
        prisma.flock.findMany({
          where,
          take: filters.limit || 10,
          skip: filters.offset || 0,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.flock.count({ where })
      ]);

      return {
        success: true,
        data: flocks,
        pagination: {
          total,
          limit: filters.limit || 10,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 10) < total
        }
      };
    } catch (error) {
      throw new Error(`Failed to get flocks: ${(error as Error).message}`);
    }
  }

  async getFlockById(id: string) {
    try {
      const flock = await prisma.flock.findUnique({
        where: { id }
      });

      if (!flock) {
        throw new Error('Flock not found');
      }

      return {
        success: true,
        data: flock
      };
    } catch (error) {
      throw new Error(`Failed to get flock: ${(error as Error).message}`);
    }
  }

  async updateFlock(id: string, data: UpdateFlockData) {
    try {
      const updateData: any = { ...data };
      if (data.expectedEndDate) {
        updateData.endDate = data.expectedEndDate;
        delete updateData.expectedEndDate;
      }
      if (data.initialCount) {
        updateData.population = data.initialCount;
        delete updateData.initialCount;
      }
      delete updateData.currentCount;

      const flock = await prisma.flock.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      // Publish to Kafka with correct payload shape
      await kafkaPublisher.publishFlockSnapshot('flock.snapshot.updated', flock);

      return {
        success: true,
        data: flock,
        message: 'Flock updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update flock: ${(error as Error).message}`);
    }
  }

  async deleteFlock(id: string) {
    try {
      const flock = await prisma.flock.delete({
        where: { id }
      });

      // Publish a final snapshot payload (use updated event) so consumers receive required fields
      await kafkaPublisher.publishFlockSnapshot('flock.snapshot.updated', flock);

      return {
        success: true,
        message: 'Flock deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete flock: ${(error as Error).message}`);
    }
  }
}
