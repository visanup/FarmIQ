// =============================
// File: src/services/breed.service.ts (REPLACEMENT)
// =============================
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
      // 1) Validate animal type exists
      const animalType = await prisma.animalType.findUnique({ where: { id: data.animalTypeId } });
      if (!animalType) throw new Error('Animal type not found');

      // 2) Detect if this (animalTypeId,name) already exists — so we can set eventType reliably
      const existed = await prisma.breed.findUnique({
        where: { animalTypeId_name: { animalTypeId: data.animalTypeId, name: data.name } },
        select: { id: true },
      });

      // 3) Upsert
      const breed = await prisma.breed.upsert({
        where: { animalTypeId_name: { animalTypeId: data.animalTypeId, name: data.name } },
        update: {
          code: data.code ?? null,
          description: data.description ?? null,
          characteristics: data.characteristics ?? {},
          meta: data.meta ?? {},
          updatedAt: new Date(),
        },
        create: {
          animalTypeId: data.animalTypeId,
          name: data.name,
          code: data.code ?? null,
          description: data.description ?? null,
          characteristics: data.characteristics ?? {},
          meta: data.meta ?? {},
        },
        include: { animalType: true },
      });

      // 4) Publish Kafka snapshot (created/updated decided by `existed`)
      try {
        const eventType = existed ? 'breed.snapshot.updated' : 'breed.snapshot.created';
        console.log('[BREED:publish] eventType =', eventType, 'id =', breed.id, 'animalTypeId =', breed.animalTypeId);
        await kafkaPublisher.publishBreedSnapshot(eventType, breed);
      } catch (kafkaError) {
        console.error('Failed to publish breed event:', kafkaError);
        // do not throw — REST call success should not depend on Kafka
      }

      return {
        success: true,
        data: breed,
        message: existed ? 'Breed updated successfully' : 'Breed created successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async getBreedById(id: string): Promise<ApiResponse<Breed>> {
    try {
      const breed = await prisma.breed.findUnique({ where: { id }, include: { animalType: true, flocks: true } });
      if (!breed) throw new Error('Breed not found');
      return { success: true, data: breed };
    } catch (error) {
      throw error;
    }
  }

  async getBreedsByAnimalType(animalTypeId: string): Promise<ApiResponse<Breed[]>> {
    try {
      const breeds = await prisma.breed.findMany({ where: { animalTypeId }, include: { animalType: true }, orderBy: { name: 'asc' } });
      return { success: true, data: breeds };
    } catch (error) { throw error; }
  }

  async getAllBreeds(page = 1, limit = 10, animalTypeId?: string): Promise<PaginatedResponse<Breed>> {
    try {
      const skip = (page - 1) * limit;
      const where = animalTypeId ? { animalTypeId } : {};
      const [breeds, total] = await Promise.all([
        prisma.breed.findMany({ where, skip, take: limit, include: { animalType: true }, orderBy: { name: 'asc' } }),
        prisma.breed.count({ where }),
      ]);
      return { success: true, data: breeds, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    } catch (error) { throw error; }
  }

  async updateBreed(id: string, data: Partial<CreateBreedRequest>): Promise<ApiResponse<Breed>> {
    try {
      const breed = await prisma.breed.update({ where: { id }, data: { ...data, updatedAt: new Date() }, include: { animalType: true } });
      try {
        console.log('[BREED:publish] eventType = breed.snapshot.updated id =', breed.id);
        await kafkaPublisher.publishBreedSnapshot('breed.snapshot.updated', breed);
      } catch (kafkaError) { console.error('Failed to publish breed update event:', kafkaError); }
      return { success: true, data: breed, message: 'Breed updated successfully' };
    } catch (error) { throw error; }
  }

  async deleteBreed(id: string): Promise<ApiResponse<null>> {
    try {
      const flockCount = await prisma.flock.count({ where: { breedId: id } });
      if (flockCount > 0) throw new Error(`Cannot delete breed. It is used by ${flockCount} flock(s)`);
      await prisma.breed.delete({ where: { id } });
      return { success: true, data: null, message: 'Breed deleted successfully' };
    } catch (error) { throw error; }
  }

  async searchBreeds(query: string, animalTypeId?: string, page = 1, limit = 10): Promise<PaginatedResponse<Breed>> {
    try {
      const skip = (page - 1) * limit;
      const where = { AND: [ animalTypeId ? { animalTypeId } : {}, { OR: [ { name: { contains: query, mode: 'insensitive' as const } }, { code: { contains: query, mode: 'insensitive' as const } }, { description: { contains: query, mode: 'insensitive' as const } } ] } ] };
      const [breeds, total] = await Promise.all([
        prisma.breed.findMany({ where, skip, take: limit, include: { animalType: true }, orderBy: { name: 'asc' } }),
        prisma.breed.count({ where }),
      ]);
      return { success: true, data: breeds, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    } catch (error) { throw error; }
  }
}
