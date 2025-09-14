import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';
import { 
  AnimalType, 
  BreedWithAnimalType,
  CreateAnimalTypeRequest,
  CreateBreedRequest,
  ApiResponse,
  PaginatedResponse 
} from '../types';

export class AnimalTypeService {
  // Animal Type methods
  async createAnimalType(data: CreateAnimalTypeRequest): Promise<ApiResponse<AnimalType>> {
    try {
      const animalType = await prisma.animalType.create({
        data: {
          name: data.name,
          category: data.category || null,
          description: data.description || null,
          meta: data.meta || {}
        }
      });

      // Publish Kafka event
      try {
        await kafkaPublisher.publishAnimalTypeSnapshot('animal-type.snapshot.created', animalType);
      } catch (kafkaError) {
        console.error('Failed to publish animal type creation event:', kafkaError);
        // Don't fail the request if Kafka fails
      }

      return {
        success: true,
        data: animalType,
        message: 'Animal type created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllAnimalTypes(): Promise<ApiResponse<AnimalType[]>> {
    try {
      const animalTypes = await prisma.animalType.findMany({
        orderBy: { name: 'asc' }
      });

      return {
        success: true,
        data: animalTypes
      };
    } catch (error) {
      throw error;
    }
  }

  async getAnimalTypeById(id: string): Promise<ApiResponse<AnimalType>> {
    try {
      const animalType = await prisma.animalType.findUnique({
        where: { id },
        include: {
          breeds: true
        }
      });

      if (!animalType) {
        throw new Error('Animal type not found');
      }

      return {
        success: true,
        data: animalType
      };
    } catch (error) {
      throw error;
    }
  }

  async updateAnimalType(
    id: string, 
    data: Partial<CreateAnimalTypeRequest>
  ): Promise<ApiResponse<AnimalType>> {
    try {
      const animalType = await prisma.animalType.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: animalType,
        message: 'Animal type updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteAnimalType(id: string): Promise<ApiResponse<null>> {
    try {
      await prisma.animalType.delete({
        where: { id }
      });

      return {
        success: true,
        data: null,
        message: 'Animal type deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Breed methods
  async createBreed(data: CreateBreedRequest): Promise<ApiResponse<BreedWithAnimalType>> {
    try {
      const breed = await prisma.breed.create({
        data: {
          animalTypeId: data.animalTypeId,
          name: data.name,
          code: data.code || null,
          description: data.description || null,
          characteristics: data.characteristics || undefined,
          meta: data.meta || {}
        },
        include: {
          animalType: true
        }
      });

      // Publish Kafka event
      try {
        await kafkaPublisher.publishBreedSnapshot('breed.snapshot.created', breed);
      } catch (kafkaError) {
        console.error('Failed to publish breed creation event:', kafkaError);
        // Don't fail the request if Kafka fails
      }

      return {
        success: true,
        data: breed,
        message: 'Breed created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async getBreedsByAnimalType(animalTypeId: string): Promise<ApiResponse<BreedWithAnimalType[]>> {
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

  async getAllBreeds(): Promise<ApiResponse<BreedWithAnimalType[]>> {
    try {
      const breeds = await prisma.breed.findMany({
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

  async getBreedById(id: string): Promise<ApiResponse<BreedWithAnimalType>> {
    try {
      const breed = await prisma.breed.findUnique({
        where: { id },
        include: {
          animalType: true
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

  async updateBreed(
    id: string, 
    data: Partial<CreateBreedRequest>
  ): Promise<ApiResponse<BreedWithAnimalType>> {
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
}
