import { PrismaClient } from '@prisma/client';
import { kafkaPublisher } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateDeviceHealthData {
  deviceId: string;
  status: string;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
  errors?: string[];
  warnings?: string[];
  meta?: any;
}

export interface UpdateDeviceHealthData {
  status?: string;
  lastSeen?: Date;
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
  errors?: string[];
  warnings?: string[];
  meta?: any;
}

export class DeviceHealthService {
  async getAllDeviceHealth() {
    return await prisma.deviceHealth.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDeviceHealthById(id: string) {
    return await prisma.deviceHealth.findUnique({
      where: { id }
    });
  }

  async getDeviceHealthByDeviceId(deviceId: string) {
    return await prisma.deviceHealth.findUnique({
      where: { deviceId }
    });
  }

  async createDeviceHealth(data: CreateDeviceHealthData) {
    // Check if device health record for this device already exists
    const existingDeviceHealth = await this.getDeviceHealthByDeviceId(data.deviceId);
    if (existingDeviceHealth) {
      throw new Error('A device health record for this device already exists');
    }

    const deviceHealth = await prisma.deviceHealth.create({
      data: {
        deviceId: data.deviceId,
        status: data.status,
        lastSeen: data.lastSeen,
        batteryLevel: data.batteryLevel,
        signalStrength: data.signalStrength,
        temperature: data.temperature,
        errors: data.errors || [],
        warnings: data.warnings || [],
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('deviceHealth.snapshot.created', {
      id: deviceHealth.id,
      deviceId: deviceHealth.deviceId,
      status: deviceHealth.status,
      lastSeen: deviceHealth.lastSeen,
      batteryLevel: deviceHealth.batteryLevel,
      signalStrength: deviceHealth.signalStrength,
      temperature: deviceHealth.temperature,
      errors: deviceHealth.errors,
      warnings: deviceHealth.warnings,
      meta: deviceHealth.meta,
      createdAt: deviceHealth.createdAt,
      updatedAt: deviceHealth.updatedAt
    });

    return deviceHealth;
  }

  async updateDeviceHealth(id: string, data: UpdateDeviceHealthData) {
    const existingDeviceHealth = await this.getDeviceHealthById(id);
    if (!existingDeviceHealth) {
      throw new Error('Device health record not found');
    }

    const deviceHealth = await prisma.deviceHealth.update({
      where: { id },
      data: {
        ...data,
        meta: data.meta || existingDeviceHealth.meta
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('deviceHealth.snapshot.updated', {
      id: deviceHealth.id,
      deviceId: deviceHealth.deviceId,
      status: deviceHealth.status,
      lastSeen: deviceHealth.lastSeen,
      batteryLevel: deviceHealth.batteryLevel,
      signalStrength: deviceHealth.signalStrength,
      temperature: deviceHealth.temperature,
      errors: deviceHealth.errors,
      warnings: deviceHealth.warnings,
      meta: deviceHealth.meta,
      createdAt: deviceHealth.createdAt,
      updatedAt: deviceHealth.updatedAt
    });

    return deviceHealth;
  }

  async updateDeviceHealthByDeviceId(deviceId: string, data: UpdateDeviceHealthData) {
    const existingDeviceHealth = await this.getDeviceHealthByDeviceId(deviceId);
    if (!existingDeviceHealth) {
      throw new Error('Device health record not found');
    }

    return await this.updateDeviceHealth(existingDeviceHealth.id, data);
  }

  async deleteDeviceHealth(id: string) {
    const existingDeviceHealth = await this.getDeviceHealthById(id);
    if (!existingDeviceHealth) {
      throw new Error('Device health record not found');
    }

    await prisma.deviceHealth.delete({
      where: { id }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('deviceHealth.snapshot.deleted', {
      id: existingDeviceHealth.id,
      deviceId: existingDeviceHealth.deviceId,
      status: existingDeviceHealth.status,
      lastSeen: existingDeviceHealth.lastSeen,
      batteryLevel: existingDeviceHealth.batteryLevel,
      signalStrength: existingDeviceHealth.signalStrength,
      temperature: existingDeviceHealth.temperature,
      errors: existingDeviceHealth.errors,
      warnings: existingDeviceHealth.warnings,
      meta: existingDeviceHealth.meta,
      createdAt: existingDeviceHealth.createdAt,
      updatedAt: existingDeviceHealth.updatedAt
    });

    return { success: true, message: 'Device health record deleted successfully' };
  }

  async clearAllDeviceHealth() {
    const count = await prisma.deviceHealth.count();
    await prisma.deviceHealth.deleteMany();
    return { success: true, message: `Deleted ${count} device health records` };
  }
}


