import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';

export interface CreateMasterEventData {
  eventType: string;
  entityType: string;
  entityId: string;
  tenantId: string;
  data?: Record<string, any>;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMasterEventData {
  eventType?: string;
  entityType?: string;
  entityId?: string;
  tenantId?: string;
  data?: Record<string, any>;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface MasterEventFilters {
  page?: number;
  limit?: number;
  eventType?: string;
  entityType?: string;
  entityId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
}

export class MasterEventService {
  async getAllMasterEvents(filters: MasterEventFilters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      eventType, 
      entityType, 
      entityId, 
      tenantId,
      startDate, 
      endDate 
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (eventType) where.eventType = eventType;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (tenantId) where.tenantId = tenantId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [masterEvents, total] = await Promise.all([
      prisma.masterEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.masterEvent.count({ where })
    ]);

    return {
      success: true,
      data: masterEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getMasterEventById(id: string) {
    const masterEvent = await prisma.masterEvent.findUnique({
      where: { id }
    });

    if (!masterEvent) {
      throw new Error('Master event not found');
    }

    return {
      success: true,
      data: masterEvent
    };
  }

  async createMasterEvent(data: CreateMasterEventData) {
    const masterEvent = await prisma.masterEvent.create({
      data: {
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        tenantId: data.tenantId,
        data: data.data,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        metadata: data.metadata || {}
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('masterEvent.snapshot.created', {
        id: masterEvent.id,
        eventType: masterEvent.eventType,
        entityType: masterEvent.entityType,
        entityId: masterEvent.entityId,
        tenantId: masterEvent.tenantId,
        data: masterEvent.data,
        timestamp: masterEvent.timestamp,
        metadata: masterEvent.metadata,
        createdAt: masterEvent.createdAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish master event event:', kafkaError);
    }

    return {
      success: true,
      data: masterEvent,
      message: 'Master event created successfully'
    };
  }

  async updateMasterEvent(id: string, data: UpdateMasterEventData) {
    const existingMasterEvent = await this.getMasterEventById(id);
    if (!existingMasterEvent.data) {
      throw new Error('Master event not found');
    }

    const updateData: any = { ...data };
    if (data.timestamp) {
      updateData.timestamp = new Date(data.timestamp);
    }

    const masterEvent = await prisma.masterEvent.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('masterEvent.snapshot.updated', {
        id: masterEvent.id,
        eventType: masterEvent.eventType,
        entityType: masterEvent.entityType,
        entityId: masterEvent.entityId,
        tenantId: masterEvent.tenantId,
        data: masterEvent.data,
        timestamp: masterEvent.timestamp,
        metadata: masterEvent.metadata,
        createdAt: masterEvent.createdAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish master event event:', kafkaError);
    }

    return {
      success: true,
      data: masterEvent,
      message: 'Master event updated successfully'
    };
  }

  async deleteMasterEvent(id: string) {
    const existingMasterEvent = await this.getMasterEventById(id);
    if (!existingMasterEvent.data) {
      throw new Error('Master event not found');
    }

    await prisma.masterEvent.delete({
      where: { id }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('masterEvent.snapshot.deleted', {
        id: existingMasterEvent.data.id,
        eventType: existingMasterEvent.data.eventType,
        entityType: existingMasterEvent.data.entityType,
        entityId: existingMasterEvent.data.entityId,
        tenantId: existingMasterEvent.data.tenantId,
        data: existingMasterEvent.data.data,
        timestamp: existingMasterEvent.data.timestamp,
        metadata: existingMasterEvent.data.metadata,
        createdAt: existingMasterEvent.data.createdAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish master event event:', kafkaError);
    }

    return {
      success: true,
      message: 'Master event deleted successfully'
    };
  }
}
