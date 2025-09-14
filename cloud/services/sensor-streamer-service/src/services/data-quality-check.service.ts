import { PrismaClient, Prisma } from '@prisma/client';
import { CreateDataQualityCheckInput, DataQualityCheckResponse } from '../types/data-quality-check.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class DataQualityCheckService {
  async createDataQualityCheck(data: CreateDataQualityCheckInput): Promise<DataQualityCheckResponse> {
    const dataQualityCheck = await prisma.dataQualityCheck.create({
      data: {
        deviceId: data.deviceId,
        checkType: data.checkType,
        status: data.status,
        message: data.message,
        value: data.value,
        expectedMin: data.expectedMin,
        expectedMax: data.expectedMax,
        metadata: data.metadata ? data.metadata : Prisma.JsonNull,
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishDataQualityCheck(dataQualityCheck);
    } catch (error) {
      console.error('Failed to publish data quality check to Kafka:', error);
    }

    return this.formatDataQualityCheckResponse(dataQualityCheck);
  }

  async getDataQualityCheckById(id: string): Promise<DataQualityCheckResponse | null> {
    const dataQualityCheck = await prisma.dataQualityCheck.findUnique({
      where: { id },
    });

    if (!dataQualityCheck) {
      return null;
    }

    return this.formatDataQualityCheckResponse(dataQualityCheck);
  }

  async getDataQualityChecks(
    page: number = 1,
    limit: number = 10,
    deviceId?: string,
    checkType?: string,
    status?: string
  ): Promise<{ checks: DataQualityCheckResponse[]; total: number; page: number; limit: number }> {
    const where: Prisma.DataQualityCheckWhereInput = {};
    
    if (deviceId) where.deviceId = deviceId;
    if (checkType) where.checkType = checkType;
    if (status) where.status = status;

    const [checks, total] = await Promise.all([
      prisma.dataQualityCheck.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.dataQualityCheck.count({ where }),
    ]);

    return {
      checks: checks.map(this.formatDataQualityCheckResponse),
      total,
      page,
      limit,
    };
  }

  async deleteDataQualityCheck(id: string): Promise<void> {
    await prisma.dataQualityCheck.delete({
      where: { id },
    });
  }

  async getChecksByDevice(deviceId: string): Promise<DataQualityCheckResponse[]> {
    const checks = await prisma.dataQualityCheck.findMany({
      where: { deviceId },
      orderBy: { id: 'desc' },
    });

    return checks.map(this.formatDataQualityCheckResponse);
  }

  async getFailedChecks(): Promise<DataQualityCheckResponse[]> {
    const checks = await prisma.dataQualityCheck.findMany({
      where: { status: 'FAILED' },
      orderBy: { id: 'desc' },
    });

    return checks.map(this.formatDataQualityCheckResponse);
  }

  private formatDataQualityCheckResponse(check: any): DataQualityCheckResponse {
    return {
      id: check.id,
      deviceId: check.deviceId,
      checkType: check.checkType,
      status: check.status,
      message: check.message,
      value: check.value,
      expectedMin: check.expectedMin,
      expectedMax: check.expectedMax,
      metadata: check.metadata,
      createdAt: check.createdAt,
    };
  }
}
