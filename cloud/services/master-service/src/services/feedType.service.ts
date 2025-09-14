import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';

export interface CreateFeedTypeData {
  name: string;
  category?: string;
  description?: string;
  composition?: Record<string, any>;
  energy?: number;
  meta?: Record<string, any>;
}

export interface UpdateFeedTypeData {
  name?: string;
  category?: string;
  description?: string;
  composition?: Record<string, any>;
  energy?: number;
  meta?: Record<string, any>;
}

export interface FeedTypeFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export class FeedTypeService {
  async getAllFeedTypes(filters: FeedTypeFilters = {}) {
    const { page = 1, limit = 10, category, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [feedTypes, total] = await Promise.all([
      prisma.feedType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feedType.count({ where })
    ]);

    return {
      success: true,
      data: feedTypes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getFeedTypeById(id: string) {
    const feedType = await prisma.feedType.findUnique({
      where: { id }
    });

    if (!feedType) {
      throw new Error('Feed type not found');
    }

    return {
      success: true,
      data: feedType
    };
  }

  async createFeedType(data: CreateFeedTypeData) {
    // Check if feed type with this name already exists
    const existingFeedType = await prisma.feedType.findFirst({
      where: { name: data.name }
    });

    if (existingFeedType) {
      throw new Error('A feed type with this name already exists');
    }

    const feedType = await prisma.feedType.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        composition: data.composition || {},
        energy: data.energy,
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('feedType.snapshot.created', {
        id: feedType.id,
        name: feedType.name,
        category: feedType.category,
        description: feedType.description,
        composition: feedType.composition,
        energy: feedType.energy,
        meta: feedType.meta,
        createdAt: feedType.createdAt,
        updatedAt: feedType.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish feed type event:', kafkaError);
    }

    return {
      success: true,
      data: feedType,
      message: 'Feed type created successfully'
    };
  }

  async updateFeedType(id: string, data: UpdateFeedTypeData) {
    const existingFeedType = await this.getFeedTypeById(id);
    if (!existingFeedType.data) {
      throw new Error('Feed type not found');
    }

    const feedType = await prisma.feedType.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('feedType.snapshot.updated', {
        id: feedType.id,
        name: feedType.name,
        category: feedType.category,
        description: feedType.description,
        composition: feedType.composition,
        energy: feedType.energy,
        meta: feedType.meta,
        createdAt: feedType.createdAt,
        updatedAt: feedType.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish feed type event:', kafkaError);
    }

    return {
      success: true,
      data: feedType,
      message: 'Feed type updated successfully'
    };
  }

  async deleteFeedType(id: string) {
    const existingFeedType = await this.getFeedTypeById(id);
    if (!existingFeedType.data) {
      throw new Error('Feed type not found');
    }

    await prisma.feedType.delete({
      where: { id }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('feedType.snapshot.deleted', {
        id: existingFeedType.data.id,
        name: existingFeedType.data.name,
        category: existingFeedType.data.category,
        description: existingFeedType.data.description,
        composition: existingFeedType.data.composition,
        energy: existingFeedType.data.energy,
        meta: existingFeedType.data.meta,
        createdAt: existingFeedType.data.createdAt,
        updatedAt: existingFeedType.data.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish feed type event:', kafkaError);
    }

    return {
      success: true,
      message: 'Feed type deleted successfully'
    };
  }
}
