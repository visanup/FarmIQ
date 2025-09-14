import { PrismaClient } from '@prisma/client';
import { kafkaPublisher } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateZoneData {
  tenantId: string;
  farmId: string;
  houseId?: string;
  name: string;
  geometry?: any;
  type?: string;
  capacity?: number;
  meta?: any;
}

export interface UpdateZoneData {
  name?: string;
  geometry?: any;
  type?: string;
  capacity?: number;
  meta?: any;
}

export class ZoneService {
  async getAllZones() {
    return await prisma.zone.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getZoneById(id: string) {
    return await prisma.zone.findUnique({
      where: { id }
    });
  }

  async getZonesByTenantId(tenantId: string) {
    return await prisma.zone.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getZonesByFarmId(farmId: string) {
    return await prisma.zone.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createZone(data: CreateZoneData) {
    // Check if zone with this name already exists in the same farm
    const existingZone = await prisma.zone.findUnique({
      where: {
        tenantId_farmId_name: {
          tenantId: data.tenantId,
          farmId: data.farmId,
          name: data.name
        }
      }
    });

    if (existingZone) {
      throw new Error('A zone with this name already exists in this farm');
    }

    const zone = await prisma.zone.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        name: data.name,
        geometry: data.geometry || {},
        type: data.type,
        capacity: data.capacity,
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('zone.snapshot.created', {
      id: zone.id,
      tenantId: zone.tenantId,
      farmId: zone.farmId,
      houseId: zone.houseId,
      name: zone.name,
      geometry: zone.geometry,
      type: zone.type,
      capacity: zone.capacity,
      meta: zone.meta,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt
    });

    return zone;
  }

  async updateZone(id: string, data: UpdateZoneData) {
    const existingZone = await this.getZoneById(id);
    if (!existingZone) {
      throw new Error('Zone not found');
    }

    // Check if name is being changed and if new name already exists in the same farm
    if (data.name && data.name !== existingZone.name) {
      const nameExists = await prisma.zone.findUnique({
        where: {
          tenantId_farmId_name: {
            tenantId: existingZone.tenantId,
            farmId: existingZone.farmId,
            name: data.name
          }
        }
      });
      if (nameExists) {
        throw new Error('A zone with this name already exists in this farm');
      }
    }

    const zone = await prisma.zone.update({
      where: { id },
      data: {
        ...data,
        meta: data.meta || existingZone.meta
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('zone.snapshot.updated', {
      id: zone.id,
      tenantId: zone.tenantId,
      farmId: zone.farmId,
      houseId: zone.houseId,
      name: zone.name,
      geometry: zone.geometry,
      type: zone.type,
      capacity: zone.capacity,
      meta: zone.meta,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt
    });

    return zone;
  }

  async deleteZone(id: string) {
    const existingZone = await this.getZoneById(id);
    if (!existingZone) {
      throw new Error('Zone not found');
    }

    await prisma.zone.delete({
      where: { id }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('zone.snapshot.deleted', {
      id: existingZone.id,
      tenantId: existingZone.tenantId,
      farmId: existingZone.farmId,
      houseId: existingZone.houseId,
      name: existingZone.name,
      geometry: existingZone.geometry,
      type: existingZone.type,
      capacity: existingZone.capacity,
      meta: existingZone.meta,
      createdAt: existingZone.createdAt,
      updatedAt: existingZone.updatedAt
    });

    return { success: true, message: 'Zone deleted successfully' };
  }

  async clearAllZones() {
    const count = await prisma.zone.count();
    await prisma.zone.deleteMany();
    return { success: true, message: `Deleted ${count} zones` };
  }
}


