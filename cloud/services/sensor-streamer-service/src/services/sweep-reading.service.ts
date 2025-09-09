import { PrismaClient, Prisma } from '@prisma/client';
import { CreateSweepReadingInput, SweepReadingResponse } from '../types/sweep-reading.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class SweepReadingService {
  async createSweepReading(data: CreateSweepReadingInput): Promise<SweepReadingResponse> {
    const sweepReading = await prisma.sweepReading.create({
      data: {
        deviceId: data.deviceId,
        farmId: data.farmId || null,
        sweepId: data.sweepId,
        data: data.data,
        metadata: data.metadata ? data.metadata : Prisma.JsonNull,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishSweepReading(sweepReading);
    } catch (error) {
      console.error('Failed to publish sweep reading to Kafka:', error);
    }

    return this.formatSweepReadingResponse(sweepReading);
  }

  async getSweepReadingById(id: string): Promise<SweepReadingResponse | null> {
    const sweepReading = await prisma.sweepReading.findUnique({
      where: { id },
    });

    if (!sweepReading) {
      return null;
    }

    return this.formatSweepReadingResponse(sweepReading);
  }

  async getSweepReadings(
    page: number = 1,
    limit: number = 10,
    deviceId?: string,
    sweepId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ readings: SweepReadingResponse[]; total: number; page: number; limit: number }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const where: Prisma.SweepReadingWhereInput = {};
    
    if (deviceId) {
      where.deviceId = deviceId;
    }
    
    if (sweepId) {
      where.sweepId = sweepId;
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
      prisma.sweepReading.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.sweepReading.count({ where }),
    ]);

    return {
      readings: readings.map(reading => this.formatSweepReadingResponse(reading)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getLatestSweepReadings(deviceId: string, limit: number = 10): Promise<SweepReadingResponse[]> {
    const readings = await prisma.sweepReading.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return readings.map(reading => this.formatSweepReadingResponse(reading));
  }

  async createManySweepReadings(data: CreateSweepReadingInput[]): Promise<{ inserted: number }> {
    const readings = data.map(item => ({
      deviceId: item.deviceId,
      farmId: item.farmId || null,
      sweepId: item.sweepId,
      data: item.data,
      metadata: item.metadata ? item.metadata : Prisma.JsonNull,
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    }));

    const result = await prisma.sweepReading.createMany({
      data: readings,
    });

    return { inserted: result.count };
  }

  async getLatestTimestamp(): Promise<Date | null> {
    const latest = await prisma.sweepReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    return latest?.timestamp || null;
  }

  // Alias for createManySweepReadings
  async createMany(data: CreateSweepReadingInput[]): Promise<{ inserted: number }> {
    return this.createManySweepReadings(data);
  }

  // Alias for getLatestSweepReadings
  async getSweepReadingsByDevice(deviceId: string, limit: number = 10): Promise<SweepReadingResponse[]> {
    return this.getLatestSweepReadings(deviceId, limit);
  }

  // Alias for getSweepReadings with sweepId filter
  async getSweepReadingsBySweep(sweepId: string, page: number = 1, limit: number = 10): Promise<{ readings: SweepReadingResponse[]; total: number; page: number; limit: number }> {
    return this.getSweepReadings(page, limit, undefined, sweepId);
  }

  private formatSweepReadingResponse(reading: any): SweepReadingResponse {
    return {
      id: reading.id,
      deviceId: reading.deviceId,
      farmId: reading.farmId,
      sweepId: reading.sweepId,
      data: reading.data,
      metadata: reading.metadata,
      timestamp: reading.timestamp,
      createdAt: reading.createdAt,
    };
  }
}