import { PrismaClient } from '@prisma/client';
import { publishToKafka, kafkaPublisher } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateDeviceData {
  deviceId: string;
  houseId: string;
  name: string;
  type?: string;
  status?: string;
  meta?: Record<string, any>;
}

export interface UpdateDeviceData {
  deviceId?: string;
  houseId?: string;
  name?: string;
  type?: string;
  status?: string;
  meta?: Record<string, any>;
}

export interface DeviceFilters {
  houseId?: string;
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export class DeviceService {
  async createDevice(data: CreateDeviceData) {
    try {
      const device = await prisma.device.create({
        data: {
          deviceId: data.deviceId,
          houseId: data.houseId,
          name: data.name,
          type: data.type || 'sensor',
          status: data.status || 'active',
          tenantId: 'default-tenant',
          farmId: 'default-farm',
          meta: data.meta || {}
        }
      });

      // Publish to Kafka with correct payload
      await kafkaPublisher.publishDeviceSnapshot('device.snapshot.created', device);

      return {
        success: true,
        data: device,
        message: 'Device created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create device: ${(error as Error).message}`);
    }
  }

  async getAllDevices(filters: DeviceFilters = {}) {
    try {
      const where: any = {};
      
      if (filters.houseId) {
        where.houseId = filters.houseId;
      }
      
      if (filters.type) {
        where.type = filters.type;
      }
      
      if (filters.status) {
        where.status = filters.status;
      }

      const [devices, total] = await Promise.all([
        prisma.device.findMany({
          where,
          take: filters.limit || 10,
          skip: filters.offset || 0,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.device.count({ where })
      ]);

      return {
        success: true,
        data: devices,
        pagination: {
          total,
          limit: filters.limit || 10,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 10) < total
        }
      };
    } catch (error) {
      throw new Error(`Failed to get devices: ${(error as Error).message}`);
    }
  }

  async getDeviceById(id: string) {
    try {
      const device = await prisma.device.findUnique({
        where: { id }
      });

      if (!device) {
        throw new Error('Device not found');
      }

      return {
        success: true,
        data: device
      };
    } catch (error) {
      throw new Error(`Failed to get device: ${(error as Error).message}`);
    }
  }

  async updateDevice(id: string, data: UpdateDeviceData) {
    try {
      const device = await prisma.device.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      // Publish to Kafka with correct payload
      await kafkaPublisher.publishDeviceSnapshot('device.snapshot.updated', device);

      return {
        success: true,
        data: device,
        message: 'Device updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update device: ${(error as Error).message}`);
    }
  }

  async deleteDevice(id: string) {
    try {
      const device = await prisma.device.delete({
        where: { id }
      });

      // Publish a final snapshot payload using the correct schema (snake_case)
      await kafkaPublisher.publishDeviceSnapshot('device.snapshot.updated', device);

      return {
        success: true,
        message: 'Device deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete device: ${(error as Error).message}`);
    }
  }
}
