import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';

export interface CreateEconomicDataData {
  dataType: string;
  region?: string;
  value: number;
  unit?: string;
  currency?: string;
  timestamp?: string;
  meta?: Record<string, any>;
}

export interface UpdateEconomicDataData {
  dataType?: string;
  region?: string;
  value?: number;
  unit?: string;
  currency?: string;
  timestamp?: string;
  meta?: Record<string, any>;
}

export interface EconomicDataFilters {
  page?: number;
  limit?: number;
  dataType?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}

export class EconomicDataService {
  async getAllEconomicData(filters: EconomicDataFilters = {}) {
    const { page = 1, limit = 10, dataType, region, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (dataType) where.dataType = dataType;
    if (region) where.region = region;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [economicData, total] = await Promise.all([
      prisma.economicData.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.economicData.count({ where })
    ]);

    return {
      success: true,
      data: economicData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getEconomicDataById(id: string) {
    const economicData = await prisma.economicData.findUnique({
      where: { id }
    });

    if (!economicData) {
      throw new Error('Economic data not found');
    }

    return {
      success: true,
      data: economicData
    };
  }

  async createEconomicData(data: CreateEconomicDataData) {
    const economicData = await prisma.economicData.create({
      data: {
        dataType: data.dataType,
        region: data.region,
        value: data.value,
        unit: data.unit,
        currency: data.currency,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('economicData.snapshot.created', {
        id: economicData.id,
        dataType: economicData.dataType,
        region: economicData.region,
        value: economicData.value,
        unit: economicData.unit,
        currency: economicData.currency,
        timestamp: economicData.timestamp,
        meta: economicData.meta,
        createdAt: economicData.createdAt,
        updatedAt: economicData.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish economic data event:', kafkaError);
    }

    return {
      success: true,
      data: economicData,
      message: 'Economic data created successfully'
    };
  }

  async updateEconomicData(id: string, data: UpdateEconomicDataData) {
    const existingEconomicData = await this.getEconomicDataById(id);
    if (!existingEconomicData.data) {
      throw new Error('Economic data not found');
    }

    const updateData: any = { ...data };
    if (data.timestamp) {
      updateData.timestamp = new Date(data.timestamp);
    }

    const economicData = await prisma.economicData.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('economicData.snapshot.updated', {
        id: economicData.id,
        dataType: economicData.dataType,
        region: economicData.region,
        value: economicData.value,
        unit: economicData.unit,
        currency: economicData.currency,
        timestamp: economicData.timestamp,
        meta: economicData.meta,
        createdAt: economicData.createdAt,
        updatedAt: economicData.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish economic data event:', kafkaError);
    }

    return {
      success: true,
      data: economicData,
      message: 'Economic data updated successfully'
    };
  }

  async deleteEconomicData(id: string) {
    const existingEconomicData = await this.getEconomicDataById(id);
    if (!existingEconomicData.data) {
      throw new Error('Economic data not found');
    }

    await prisma.economicData.delete({
      where: { id }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('economicData.snapshot.deleted', {
        id: existingEconomicData.data.id,
        dataType: existingEconomicData.data.dataType,
        region: existingEconomicData.data.region,
        value: existingEconomicData.data.value,
        unit: existingEconomicData.data.unit,
        currency: existingEconomicData.data.currency,
        timestamp: existingEconomicData.data.timestamp,
        meta: existingEconomicData.data.meta,
        createdAt: existingEconomicData.data.createdAt,
        updatedAt: existingEconomicData.data.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish economic data event:', kafkaError);
    }

    return {
      success: true,
      message: 'Economic data deleted successfully'
    };
  }
}
