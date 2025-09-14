import { PrismaClient, Prisma } from '@prisma/client';
import { CreateLabReadingInput, LabReadingResponse } from '../types/lab-reading.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class LabReadingService {
  async createLabReading(data: CreateLabReadingInput): Promise<LabReadingResponse> {
    const labReading = await prisma.labReading.create({
      data: {
        id: `lab_${data.sampleId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sampleId: data.sampleId,
        farmId: data.farmId || null,
        testType: data.testType,
        value: data.value,
        unit: data.unit,
        result: data.result || null,
        metadata: data.metadata ? data.metadata : Prisma.JsonNull,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishLabReading(labReading);
    } catch (error) {
      console.error('Failed to publish lab reading to Kafka:', error);
    }

    return this.formatLabReadingResponse(labReading);
  }

  async getLabReadingById(id: string): Promise<LabReadingResponse | null> {
    const labReading = await prisma.labReading.findUnique({
      where: { sampleId: id },
    });

    if (!labReading) {
      return null;
    }

    return this.formatLabReadingResponse(labReading);
  }

  async getLabReadings(
    page: number = 1,
    limit: number = 10,
    sampleId?: string,
    testType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ readings: LabReadingResponse[]; total: number; page: number; limit: number }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const where: Prisma.LabReadingWhereInput = {};
    
    if (sampleId) {
      where.sampleId = sampleId;
    }
    
    if (testType) {
      where.testType = testType;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const [readings, total] = await Promise.all([
      prisma.labReading.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.labReading.count({ where }),
    ]);

    return {
      readings: readings.map(reading => this.formatLabReadingResponse(reading)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getLatestLabReadings(sampleId: string, limit: number = 10): Promise<LabReadingResponse[]> {
    const readings = await prisma.labReading.findMany({
      where: { sampleId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return readings.map(reading => this.formatLabReadingResponse(reading));
  }

  async createManyLabReadings(data: CreateLabReadingInput[]): Promise<{ inserted: number }> {
    const readings = data.map(item => ({
      sampleId: item.sampleId,
      farmId: item.farmId || null,
      testType: item.testType,
      value: item.value,
      unit: item.unit,
      result: item.result || null,
      metadata: item.metadata ? item.metadata : Prisma.JsonNull,
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    }));

    const result = await prisma.labReading.createMany({
      data: readings,
    });

    return { inserted: result.count };
  }

  async getLatestTimestamp(): Promise<Date | null> {
    const latest = await prisma.labReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    return latest?.timestamp || null;
  }

  // Alias for createManyLabReadings
  async createMany(data: CreateLabReadingInput[]): Promise<{ inserted: number }> {
    return this.createManyLabReadings(data);
  }

  // Alias for getLatestLabReadings
  async getLabReadingsBySample(sampleId: string, limit: number = 10): Promise<LabReadingResponse[]> {
    return this.getLatestLabReadings(sampleId, limit);
  }

  // Alias for getLabReadings with testType filter
  async getLabReadingsByTestType(testType: string, page: number = 1, limit: number = 10): Promise<{ readings: LabReadingResponse[]; total: number; page: number; limit: number }> {
    return this.getLabReadings(page, limit, undefined, testType);
  }

  // Alias for getLabReadings with status filter
  async getPendingLabReadings(page: number = 1, limit: number = 10): Promise<{ readings: LabReadingResponse[]; total: number; page: number; limit: number }> {
    return this.getLabReadings(page, limit, undefined, undefined, undefined, undefined);
  }

  private formatLabReadingResponse(reading: any): LabReadingResponse {
    return {
      id: reading.id,
      sampleId: reading.sampleId,
      farmId: reading.farmId,
      testType: reading.testType,
      value: reading.value,
      unit: reading.unit,
      result: reading.result,
      metadata: reading.metadata,
      timestamp: reading.timestamp,
      createdAt: reading.createdAt,
    };
  }
}