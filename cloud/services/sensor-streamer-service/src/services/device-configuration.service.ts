import { PrismaClient, Prisma } from '@prisma/client';
import { CreateDeviceConfigurationInput, UpdateDeviceConfigurationInput, DeviceConfigurationResponse } from '../types/device-configuration.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class DeviceConfigurationService {
  async createDeviceConfiguration(data: CreateDeviceConfigurationInput): Promise<DeviceConfigurationResponse> {
    const deviceConfiguration = await prisma.deviceConfiguration.create({
      data: {
        deviceId: data.deviceId,
        configType: data.configType as any,
        configData: data.configData,
        version: data.version,
        isActive: data.isActive || true,
        appliedAt: data.appliedAt ? new Date(data.appliedAt) : null,
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishDeviceConfiguration(deviceConfiguration);
    } catch (error) {
      console.error('Failed to publish device configuration to Kafka:', error);
    }

    return this.formatDeviceConfigurationResponse(deviceConfiguration);
  }

  async getDeviceConfigurationById(id: string): Promise<DeviceConfigurationResponse | null> {
    const deviceConfiguration = await prisma.deviceConfiguration.findUnique({
      where: { id },
    });

    if (!deviceConfiguration) {
      return null;
    }

    return this.formatDeviceConfigurationResponse(deviceConfiguration);
  }

  async getDeviceConfigurations(
    page: number = 1,
    limit: number = 10,
    deviceId?: string,
    configType?: string,
    isActive?: boolean
  ): Promise<{ configurations: DeviceConfigurationResponse[]; total: number; page: number; limit: number }> {
    const where: Prisma.DeviceConfigurationWhereInput = {};
    
    if (deviceId) where.deviceId = deviceId;
    if (configType) where.configType = configType as any;
    if (isActive !== undefined) where.isActive = isActive;

    const [configurations, total] = await Promise.all([
      prisma.deviceConfiguration.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deviceConfiguration.count({ where }),
    ]);

    return {
      configurations: configurations.map(this.formatDeviceConfigurationResponse),
      total,
      page,
      limit,
    };
  }

  async updateDeviceConfiguration(id: string, data: UpdateDeviceConfigurationInput): Promise<DeviceConfigurationResponse> {
    const deviceConfiguration = await prisma.deviceConfiguration.update({
      where: { id },
      data: {
        ...(data.configData !== undefined && { configData: data.configData }),
        ...(data.version !== undefined && { version: data.version }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.appliedAt !== undefined && { appliedAt: data.appliedAt ? new Date(data.appliedAt) : null }),
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishDeviceConfiguration(deviceConfiguration);
    } catch (error) {
      console.error('Failed to publish device configuration to Kafka:', error);
    }

    return this.formatDeviceConfigurationResponse(deviceConfiguration);
  }

  async deleteDeviceConfiguration(id: string): Promise<void> {
    await prisma.deviceConfiguration.delete({
      where: { id },
    });
  }

  async getConfigurationsByDevice(deviceId: string): Promise<DeviceConfigurationResponse[]> {
    const configurations = await prisma.deviceConfiguration.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
    });

    return configurations.map(this.formatDeviceConfigurationResponse);
  }

  async getActiveConfigurations(): Promise<DeviceConfigurationResponse[]> {
    const configurations = await prisma.deviceConfiguration.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return configurations.map(this.formatDeviceConfigurationResponse);
  }

  private formatDeviceConfigurationResponse(config: any): DeviceConfigurationResponse {
    return {
      id: config.id,
      deviceId: config.deviceId,
      configType: config.configType,
      configData: config.configData,
      version: config.version,
      isActive: config.isActive,
      appliedAt: config.appliedAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}
