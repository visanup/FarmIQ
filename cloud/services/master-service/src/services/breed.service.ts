import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';
import { 
  Breed, 
  CreateBreedRequest,
  ApiResponse,
  PaginatedResponse 
} from '../types';

export class BreedService {
  async createBreed(data: CreateBreedRequest): Promise<ApiResponse<Breed>> {
    try {
      // Validate that animal type exists
      const animalType = await prisma.animalType.findUnique({
        where: { id: data.animalTypeId }
      });

      if (!animalType) {
        throw new Error('Animal type not found');
      }

      // Use upsert to handle existing breeds gracefully
      const breed = await prisma.breed.upsert({
        where: { 
          animalTypeId_name: {
            animalTypeId: data.animalTypeId,
            name: data.name
          }
        },
        update: {
          code: data.code || null,
          description: data.description || null,
          characteristics: data.characteristics || {},
          meta: data.meta || {},
          updatedAt: new Date()
        },
        create: {
          animalTypeId: data.animalTypeId,
          name: data.name,
          code: data.code || null,
          description: data.description || null,
          characteristics: data.characteristics || {},
          meta: data.meta || {}
        },
        include: {
          animalType: true
        }
      });

      // Publish Kafka event
      try {
        const eventType = breed.createdAt.getTime() === breed.updatedAt.getTime() 
          ? 'breed.snapshot.created' 
          : 'breed.snapshot.updated';
        await kafkaPublisher.publishBreedSnapshot(eventType, breed);
      } catch (kafkaError) {
        console.error('Failed to publish breed event:', kafkaError);
        // Don't fail the request if Kafka fails
      }

      const message = breed.createdAt.getTime() === breed.updatedAt.getTime() 
        ? 'Breed created successfully'
        : 'Breed updated successfully';

      return {
        success: true,
        data: breed,
        message
      };
    } catch (error) {
      throw error;
    }
  }

  async getBreedById(id: string): Promise<ApiResponse<Breed>> {
    try {
      const breed = await prisma.breed.findUnique({
        where: { id },
        include: {
          animalType: true,
          flocks: true
        }
      });

      if (!breed) {
        throw new Error('Breed not found');
      }

      return {
        success: true,
        data: breed
      };
    } catch (error) {
      throw error;
    }
  }

  async getBreedsByAnimalType(animalTypeId: string): Promise<ApiResponse<Breed[]>> {
    try {
      const breeds = await prisma.breed.findMany({
        where: { animalTypeId },
        include: {
          animalType: true
        },
        orderBy: { name: 'asc' }
      });

      return {
        success: true,
        data: breeds
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllBreeds(
    page: number = 1, 
    limit: number = 10,
    animalTypeId?: string
  ): Promise<PaginatedResponse<Breed>> {
    try {
      const skip = (page - 1) * limit;
      
      const where = animalTypeId ? { animalTypeId } : {};
      
      const [breeds, total] = await Promise.all([
        prisma.breed.findMany({
          where,
          skip,
          take: limit,
          include: {
            animalType: true
          },
          orderBy: { name: 'asc' }
        }),
        prisma.breed.count({ where })
      ]);

      return {
        success: true,
        data: breeds,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async updateBreed(
    id: string, 
    data: Partial<CreateBreedRequest>
  ): Promise<ApiResponse<Breed>> {
    try {
      const breed = await prisma.breed.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          animalType: true
        }
      });

      // Publish Kafka event
      try {
        await kafkaPublisher.publishBreedSnapshot('breed.snapshot.updated', breed);
      } catch (kafkaError) {
        console.error('Failed to publish breed update event:', kafkaError);
        // Don't fail the request if Kafka fails
      }

      return {
        success: true,
        data: breed,
        message: 'Breed updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteBreed(id: string): Promise<ApiResponse<null>> {
    try {
      // Check if breed is used by any flocks
      const flockCount = await prisma.flock.count({
        where: { breedId: id }
      });

      if (flockCount > 0) {
        throw new Error(`Cannot delete breed. It is used by ${flockCount} flock(s)`);
      }

      await prisma.breed.delete({
        where: { id }
      });

      return {
        success: true,
        data: null,
        message: 'Breed deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async searchBreeds(
    query: string,
    animalTypeId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Breed>> {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        AND: [
          animalTypeId ? { animalTypeId } : {},
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { code: { contains: query, mode: 'insensitive' as const } },
              { description: { contains: query, mode: 'insensitive' as const } }
            ]
          }
        ]
      };
      
      const [breeds, total] = await Promise.all([
        prisma.breed.findMany({
          where,
          skip,
          take: limit,
          include: {
            animalType: true
          },
          orderBy: { name: 'asc' }
        }),
        prisma.breed.count({ where })
      ]);

      return {
        success: true,
        data: breeds,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}
