import { PrismaClient } from '@prisma/client';
import { kafkaPublisher } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateStationData {
  tenantId: string;
  farmId: string;
  houseId?: string;
  name: string;
  location?: any;
  type?: string;
  status?: string;
  meta?: any;
}

export interface UpdateStationData {
  name?: string;
  location?: any;
  type?: string;
  status?: string;
  meta?: any;
}

export class StationService {
  async getAllStations() {
    return await prisma.station.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getStationById(id: string) {
    return await prisma.station.findUnique({
      where: { id }
    });
  }

  async getStationsByTenantId(tenantId: string) {
    return await prisma.station.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getStationsByFarmId(farmId: string) {
    return await prisma.station.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createStation(data: CreateStationData) {
    // Check if station with this name already exists in the same farm
    const existingStation = await prisma.station.findUnique({
      where: {
        tenantId_farmId_name: {
          tenantId: data.tenantId,
          farmId: data.farmId,
          name: data.name
        }
      }
    });

    if (existingStation) {
      throw new Error('A station with this name already exists in this farm');
    }

    const station = await prisma.station.create({
      data: {
        tenantId: data.tenantId,
        farmId: data.farmId,
        houseId: data.houseId,
        name: data.name,
        location: data.location || {},
        type: data.type,
        status: data.status || 'active',
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('station.snapshot.created', {
      id: station.id,
      tenantId: station.tenantId,
      farmId: station.farmId,
      houseId: station.houseId,
      name: station.name,
      location: station.location,
      type: station.type,
      status: station.status,
      meta: station.meta,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt
    });

    return station;
  }

  async updateStation(id: string, data: UpdateStationData) {
    const existingStation = await this.getStationById(id);
    if (!existingStation) {
      throw new Error('Station not found');
    }

    // Check if name is being changed and if new name already exists in the same farm
    if (data.name && data.name !== existingStation.name) {
      const nameExists = await prisma.station.findUnique({
        where: {
          tenantId_farmId_name: {
            tenantId: existingStation.tenantId,
            farmId: existingStation.farmId,
            name: data.name
          }
        }
      });
      if (nameExists) {
        throw new Error('A station with this name already exists in this farm');
      }
    }

    const station = await prisma.station.update({
      where: { id },
      data: {
        ...data,
        meta: data.meta || existingStation.meta
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('station.snapshot.updated', {
      id: station.id,
      tenantId: station.tenantId,
      farmId: station.farmId,
      houseId: station.houseId,
      name: station.name,
      location: station.location,
      type: station.type,
      status: station.status,
      meta: station.meta,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt
    });

    return station;
  }

  async deleteStation(id: string) {
    const existingStation = await this.getStationById(id);
    if (!existingStation) {
      throw new Error('Station not found');
    }

    await prisma.station.delete({
      where: { id }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('station.snapshot.deleted', {
      id: existingStation.id,
      tenantId: existingStation.tenantId,
      farmId: existingStation.farmId,
      houseId: existingStation.houseId,
      name: existingStation.name,
      location: existingStation.location,
      type: existingStation.type,
      status: existingStation.status,
      meta: existingStation.meta,
      createdAt: existingStation.createdAt,
      updatedAt: existingStation.updatedAt
    });

    return { success: true, message: 'Station deleted successfully' };
  }

  async clearAllStations() {
    const count = await prisma.station.count();
    await prisma.station.deleteMany();
    return { success: true, message: `Deleted ${count} stations` };
  }
}


