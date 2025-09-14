import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';

export interface CreateExternalDataSourceData {
  name: string;
  type?: string;
  apiUrl?: string;
  apiKey?: string;
  status?: 'active' | 'inactive' | 'error';
  description?: string;
  meta?: Record<string, any>;
}

export interface UpdateExternalDataSourceData {
  name?: string;
  type?: string;
  apiUrl?: string;
  apiKey?: string;
  status?: 'active' | 'inactive' | 'error';
  description?: string;
  meta?: Record<string, any>;
}

export interface ExternalDataSourceFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

export class ExternalDataSourceService {
  async getAllExternalDataSources(filters: ExternalDataSourceFilters = {}) {
    const { page = 1, limit = 10, type, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [externalDataSources, total] = await Promise.all([
      prisma.externalDataSource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.externalDataSource.count({ where })
    ]);

    return {
      success: true,
      data: externalDataSources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getExternalDataSourceById(id: string) {
    const externalDataSource = await prisma.externalDataSource.findUnique({
      where: { id }
    });

    if (!externalDataSource) {
      throw new Error('External data source not found');
    }

    return {
      success: true,
      data: externalDataSource
    };
  }

  async createExternalDataSource(data: CreateExternalDataSourceData) {
    // Check if external data source with this name already exists
    const existingExternalDataSource = await prisma.externalDataSource.findFirst({
      where: { name: data.name }
    });

    if (existingExternalDataSource) {
      throw new Error('An external data source with this name already exists');
    }

    const externalDataSource = await prisma.externalDataSource.create({
      data: {
        name: data.name,
        type: data.type,
        apiUrl: data.apiUrl,
        apiKey: data.apiKey,
        status: data.status || 'active',
        description: data.description,
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('externalDataSource.snapshot.created', {
        id: externalDataSource.id,
        name: externalDataSource.name,
        type: externalDataSource.type,
        apiUrl: externalDataSource.apiUrl,
        apiKey: externalDataSource.apiKey,
        status: externalDataSource.status,
        description: externalDataSource.description,
        meta: externalDataSource.meta,
        createdAt: externalDataSource.createdAt,
        updatedAt: externalDataSource.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish external data source event:', kafkaError);
    }

    return {
      success: true,
      data: externalDataSource,
      message: 'External data source created successfully'
    };
  }

  async updateExternalDataSource(id: string, data: UpdateExternalDataSourceData) {
    const existingExternalDataSource = await this.getExternalDataSourceById(id);
    if (!existingExternalDataSource.data) {
      throw new Error('External data source not found');
    }

    const externalDataSource = await prisma.externalDataSource.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('externalDataSource.snapshot.updated', {
        id: externalDataSource.id,
        name: externalDataSource.name,
        type: externalDataSource.type,
        apiUrl: externalDataSource.apiUrl,
        apiKey: externalDataSource.apiKey,
        status: externalDataSource.status,
        description: externalDataSource.description,
        meta: externalDataSource.meta,
        createdAt: externalDataSource.createdAt,
        updatedAt: externalDataSource.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish external data source event:', kafkaError);
    }

    return {
      success: true,
      data: externalDataSource,
      message: 'External data source updated successfully'
    };
  }

  async deleteExternalDataSource(id: string) {
    const existingExternalDataSource = await this.getExternalDataSourceById(id);
    if (!existingExternalDataSource.data) {
      throw new Error('External data source not found');
    }

    await prisma.externalDataSource.delete({
      where: { id }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('externalDataSource.snapshot.deleted', {
        id: existingExternalDataSource.data.id,
        name: existingExternalDataSource.data.name,
        type: existingExternalDataSource.data.type,
        apiUrl: existingExternalDataSource.data.apiUrl,
        apiKey: existingExternalDataSource.data.apiKey,
        status: existingExternalDataSource.data.status,
        description: existingExternalDataSource.data.description,
        meta: existingExternalDataSource.data.meta,
        createdAt: existingExternalDataSource.data.createdAt,
        updatedAt: existingExternalDataSource.data.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish external data source event:', kafkaError);
    }

    return {
      success: true,
      message: 'External data source deleted successfully'
    };
  }
}
