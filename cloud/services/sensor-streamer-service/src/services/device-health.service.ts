import { prisma } from '../lib/prisma';
import {
  CreateDeviceHealthInput,
  UpdateDeviceHealthInput,
  DeviceHealthResponse,
} from '../schemas/sensor.schemas';
import { KafkaService } from './kafka.service';

const kafkaService = new KafkaService();

export class DeviceHealthService {
  async createOrUpdateDeviceHealth(data: CreateDeviceHealthInput): Promise<DeviceHealthResponse> {
    const deviceHealth = await prisma.deviceHealth.upsert({
      where: { deviceId: data.deviceId },
      update: {
        status: data.status,
        lastSeen: new Date(data.lastSeen),
        batteryLevel: data.batteryLevel || null,
        signalStrength: data.signalStrength || null,
        temperature: data.temperature || null,
        errors: data.errors,
        warnings: data.warnings,
      },
      create: {
        deviceId: data.deviceId,
        status: data.status,
        lastSeen: new Date(data.lastSeen),
        batteryLevel: data.batteryLevel || null,
        signalStrength: data.signalStrength || null,
        temperature: data.temperature || null,
        errors: data.errors,
        warnings: data.warnings,
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishDeviceHealth(deviceHealth);
    } catch (error) {
      console.error('Failed to publish device health to Kafka:', error);
    }

    return this.formatDeviceHealthResponse(deviceHealth);
  }

  async updateDeviceHealth(deviceId: string, data: UpdateDeviceHealthInput): Promise<DeviceHealthResponse> {
    const deviceHealth = await prisma.deviceHealth.update({
      where: { deviceId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.lastSeen && { lastSeen: new Date(data.lastSeen) }),
        ...(data.batteryLevel !== undefined && { batteryLevel: data.batteryLevel }),
        ...(data.signalStrength !== undefined && { signalStrength: data.signalStrength }),
        ...(data.temperature !== undefined && { temperature: data.temperature }),
        ...(data.errors && { errors: data.errors }),
        ...(data.warnings && { warnings: data.warnings }),
      },
    });

    return this.formatDeviceHealthResponse(deviceHealth);
  }

  async getDeviceHealth(deviceId: string): Promise<DeviceHealthResponse | null> {
    const deviceHealth = await prisma.deviceHealth.findUnique({
      where: { deviceId },
    });

    return deviceHealth ? this.formatDeviceHealthResponse(deviceHealth) : null;
  }

  async getAllDeviceHealth(): Promise<DeviceHealthResponse[]> {
    const deviceHealths = await prisma.deviceHealth.findMany({
      orderBy: { lastSeen: 'desc' },
    });

    return deviceHealths.map(this.formatDeviceHealthResponse);
  }

  async getOfflineDevices(thresholdMinutes: number = 30): Promise<DeviceHealthResponse[]> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    
    const offlineDevices = await prisma.deviceHealth.findMany({
      where: {
        OR: [
          { status: 'OFFLINE' },
          { lastSeen: { lt: threshold } },
        ],
      },
      orderBy: { lastSeen: 'asc' },
    });

    return offlineDevices.map(this.formatDeviceHealthResponse);
  }

  async getDevicesWithErrors(): Promise<DeviceHealthResponse[]> {
    const devicesWithErrors = await prisma.deviceHealth.findMany({
      where: {
        OR: [
          { status: 'ERROR' },
          { errors: { isEmpty: false } },
        ],
      },
      orderBy: { lastSeen: 'desc' },
    });

    return devicesWithErrors.map(this.formatDeviceHealthResponse);
  }

  async createMany(data: CreateDeviceHealthInput[]): Promise<{ upserted: number }> {
    if (!data?.length) return { upserted: 0 };

    try {
      const result = await prisma.$transaction(async (tx: any) => {
        let count = 0;
        for (const d of data) {
          await tx.deviceHealth.upsert({
            where: { deviceId: d.deviceId },
            update: {
              status: d.status,
              lastSeen: new Date(d.lastSeen),
              batteryLevel: d.batteryLevel || null,
              signalStrength: d.signalStrength || null,
              temperature: d.temperature || null,
              errors: d.errors,
              warnings: d.warnings,
            },
            create: {
              deviceId: d.deviceId,
              status: d.status,
              lastSeen: new Date(d.lastSeen),
              batteryLevel: d.batteryLevel || null,
              signalStrength: d.signalStrength || null,
              temperature: d.temperature || null,
              errors: d.errors,
              warnings: d.warnings,
            },
          });
          count++;
        }
        return count;
      });

      return { upserted: result };
    } catch (error) {
      console.error('Error creating device health records:', error);
      throw new Error('Failed to create device health records');
    }
  }

  async getLatestTimestamp(deviceId: string): Promise<{ last_ts: Date }> {
    const latestReading = await prisma.deviceHealth.findFirst({
      where: { deviceId },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        updatedAt: true,
      },
    });

    return { last_ts: latestReading?.updatedAt ?? new Date(0) };
  }

  private formatDeviceHealthResponse(deviceHealth: any): DeviceHealthResponse {
    return {
      id: deviceHealth.id,
      deviceId: deviceHealth.deviceId,
      status: deviceHealth.status,
      lastSeen: deviceHealth.lastSeen,
      batteryLevel: deviceHealth.batteryLevel,
      signalStrength: deviceHealth.signalStrength,
      temperature: deviceHealth.temperature,
      errors: deviceHealth.errors,
      warnings: deviceHealth.warnings,
      createdAt: deviceHealth.createdAt,
      updatedAt: deviceHealth.updatedAt,
    };
  }
}

