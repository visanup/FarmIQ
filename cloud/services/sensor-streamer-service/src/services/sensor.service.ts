import { PrismaClient, Prisma } from '@prisma/client';
import { CreateSensorReadingInput, SensorReadingResponse } from '../types/sensor.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class SensorService {
  async createSensorReading(data: CreateSensorReadingInput): Promise<SensorReadingResponse> {
    const sensorReading = await prisma.sensorReading.create({
      data: {
        deviceId: data.deviceId,
        farmId: data.farmId || null,
        houseId: data.houseId || null,
        sensorType: data.sensorType,
        value: data.value,
        unit: data.unit,
        location: data.location ? data.location : Prisma.JsonNull,
        metadata: data.metadata ? data.metadata : Prisma.JsonNull,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishSensorReading(sensorReading);
    } catch (error) {
      console.error('Failed to publish sensor reading to Kafka:', error);
    }

    return this.formatSensorReadingResponse(sensorReading);
  }

  async getSensorReadingById(id: string): Promise<SensorReadingResponse | null> {
    const sensorReading = await prisma.sensorReading.findUnique({
      where: { id },
    });

    if (!sensorReading) {
      return null;
    }

    return this.formatSensorReadingResponse(sensorReading);
  }

  async getSensorReadings(
    page: number = 1,
    limit: number = 10,
    deviceId?: string,
    sensorType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ readings: SensorReadingResponse[]; total: number; page: number; limit: number }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const where: Prisma.SensorReadingWhereInput = {};
    
    if (deviceId) {
      where.deviceId = deviceId;
    }
    
    if (sensorType) {
      where.sensorType = sensorType;
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
      prisma.sensorReading.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.sensorReading.count({ where }),
    ]);

    return {
      readings: readings.map(reading => this.formatSensorReadingResponse(reading)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getLatestSensorReadings(deviceId: string, limit: number = 10): Promise<SensorReadingResponse[]> {
    const readings = await prisma.sensorReading.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return readings.map(reading => this.formatSensorReadingResponse(reading));
  }

  async createManySensorReadings(data: CreateSensorReadingInput[]): Promise<{ inserted: number }> {
    const readings = data.map(item => ({
      deviceId: item.deviceId,
      farmId: item.farmId || null,
      houseId: item.houseId || null,
      sensorType: item.sensorType,
      value: item.value,
      unit: item.unit,
      location: item.location ? item.location : Prisma.JsonNull,
      metadata: item.metadata ? item.metadata : Prisma.JsonNull,
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    }));

    const result = await prisma.sensorReading.createMany({
      data: readings,
    });

    return { inserted: result.count };
  }

  async getLatestTimestamp(): Promise<Date | null> {
    const latest = await prisma.sensorReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    return latest?.timestamp || null;
  }

  // Alias for createManySensorReadings
  async createMany(data: CreateSensorReadingInput[]): Promise<{ inserted: number }> {
    return this.createManySensorReadings(data);
  }

  // Alias for getSensorReadings with sensorType filter
  async getSensorReadingsByType(sensorType: string, page: number = 1, limit: number = 10): Promise<{ readings: SensorReadingResponse[]; total: number; page: number; limit: number }> {
    return this.getSensorReadings(page, limit, undefined, sensorType);
  }

  private formatSensorReadingResponse(reading: any): SensorReadingResponse {
    return {
      id: reading.id,
      deviceId: reading.deviceId,
      farmId: reading.farmId,
      houseId: reading.houseId,
      sensorType: reading.sensorType,
      value: reading.value,
      unit: reading.unit,
      location: reading.location,
      metadata: reading.metadata,
      timestamp: reading.timestamp,
      createdAt: reading.createdAt,
    };
  }
}