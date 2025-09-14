import { PrismaClient } from '@prisma/client';
import { kafkaPublisher } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateDeviceTypeData {
  name: string;
  category?: string;
  description?: string;
  specifications?: any;
  meta?: any;
}

export interface UpdateDeviceTypeData {
  name?: string;
  category?: string;
  description?: string;
  specifications?: any;
  meta?: any;
}

export class DeviceTypeService {
  async getAllDeviceTypes() {
    return await prisma.deviceType.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDeviceTypeById(id: string) {
    return await prisma.deviceType.findUnique({
      where: { id }
    });
  }

  async getDeviceTypeByName(name: string) {
    return await prisma.deviceType.findUnique({
      where: { name }
    });
  }

  async createDeviceType(data: CreateDeviceTypeData) {
    // Check if device type with this name already exists
    const existingDeviceType = await this.getDeviceTypeByName(data.name);
    if (existingDeviceType) {
      throw new Error('A device type with this name already exists');
    }

    const deviceType = await prisma.deviceType.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        specifications: data.specifications || {},
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('deviceType.snapshot.created', {
      id: deviceType.id,
      name: deviceType.name,
      category: deviceType.category,
      description: deviceType.description,
      specifications: deviceType.specifications,
      meta: deviceType.meta,
      createdAt: deviceType.createdAt,
      updatedAt: deviceType.updatedAt
    });

    return deviceType;
  }

  async updateDeviceType(id: string, data: UpdateDeviceTypeData) {
    const existingDeviceType = await this.getDeviceTypeById(id);
    if (!existingDeviceType) {
      throw new Error('Device type not found');
    }

    // Check if name is being changed and if new name already exists
    if (data.name && data.name !== existingDeviceType.name) {
      const nameExists = await this.getDeviceTypeByName(data.name);
      if (nameExists) {
        throw new Error('A device type with this name already exists');
      }
    }

    const deviceType = await prisma.deviceType.update({
      where: { id },
      data: {
        ...data,
        meta: data.meta || existingDeviceType.meta
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('deviceType.snapshot.updated', {
      id: deviceType.id,
      name: deviceType.name,
      category: deviceType.category,
      description: deviceType.description,
      specifications: deviceType.specifications,
      meta: deviceType.meta,
      createdAt: deviceType.createdAt,
      updatedAt: deviceType.updatedAt
    });

    return deviceType;
  }

  async deleteDeviceType(id: string) {
    const existingDeviceType = await this.getDeviceTypeById(id);
    if (!existingDeviceType) {
      throw new Error('Device type not found');
    }

    await prisma.deviceType.delete({
      where: { id }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('deviceType.snapshot.deleted', {
      id: existingDeviceType.id,
      name: existingDeviceType.name,
      category: existingDeviceType.category,
      description: existingDeviceType.description,
      specifications: existingDeviceType.specifications,
      meta: existingDeviceType.meta,
      createdAt: existingDeviceType.createdAt,
      updatedAt: existingDeviceType.updatedAt
    });

    return { success: true, message: 'Device type deleted successfully' };
  }

  async clearAllDeviceTypes() {
    const count = await prisma.deviceType.count();
    await prisma.deviceType.deleteMany();
    return { success: true, message: `Deleted ${count} device types` };
  }
}


