import { PrismaClient, Prisma } from '@prisma/client';
import { CreateSensorReadingInput, SensorReadingResponse } from '../types/sensor.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class SensorService {
  async createSensorReading(data: CreateSensorReadingInput): Promise<SensorReadingResponse> {
    const sensorReading = await prisma.deviceReading.create({
      data: {
        id: `sensor_${data.deviceId}_${data.sensorType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviceId: data.deviceId,
        tenantId: data.farmId || 'default',
        metric: data.sensorType,
        value: data.value,
        sensorId: data.houseId || null,
        payload: {
          unit: data.unit,
          location: data.location,
          metadata: data.metadata,
          farmId: data.farmId,
          houseId: data.houseId,
          sensorType: data.sensorType
        },
        time: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishSensorReading(data);
    } catch (error) {
      console.error('Failed to publish sensor reading to Kafka:', error);
    }

    return this.formatSensorReadingResponse(sensorReading);
  }

  async getSensorReadingById(id: string): Promise<SensorReadingResponse | null> {
    const sensorReading = await prisma.deviceReading.findFirst({
      where: { 
        time: new Date(id) // Using time as ID since it's the primary key
      },
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
    
    const where: Prisma.DeviceReadingWhereInput = {};
    
    if (deviceId) {
      where.deviceId = deviceId;
    }
    
    if (sensorType) {
      where.metric = sensorType;
    }
    
    if (startDate || endDate) {
      where.time = {};
      if (startDate) {
        where.time.gte = new Date(startDate);
      }
      if (endDate) {
        where.time.lte = new Date(endDate);
      }
    }

    const [readings, total] = await Promise.all([
      prisma.deviceReading.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { time: 'desc' },
      }),
      prisma.deviceReading.count({ where }),
    ]);

    return {
      readings: readings.map(reading => this.formatSensorReadingResponse(reading)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getLatestSensorReadings(deviceId: string, limit: number = 10): Promise<SensorReadingResponse[]> {
    const readings = await prisma.deviceReading.findMany({
      where: { deviceId },
      orderBy: { time: 'desc' },
      take: limit,
    });

    return readings.map(reading => this.formatSensorReadingResponse(reading));
  }

  async createManySensorReadings(data: CreateSensorReadingInput[]): Promise<{ inserted: number }> {
    const readings = data.map(item => ({
      deviceId: item.deviceId,
      tenantId: item.farmId || 'default',
      metric: item.sensorType,
      value: item.value,
      sensorId: item.houseId || null,
      payload: {
        unit: item.unit,
        location: item.location,
        metadata: item.metadata,
        farmId: item.farmId,
        houseId: item.houseId,
        sensorType: item.sensorType
      },
      time: item.timestamp ? new Date(item.timestamp) : new Date(),
    }));

    const result = await prisma.deviceReading.createMany({
      data: readings,
    });

    return { inserted: result.count };
  }

  async getLatestTimestamp(): Promise<Date | null> {
    const latest = await prisma.deviceReading.findFirst({
      orderBy: { time: 'desc' },
      select: { time: true },
    });

    return latest?.time || null;
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
    const payload = reading.payload || {};
    return {
      id: reading.time?.toISOString() || '',
      deviceId: reading.deviceId,
      farmId: payload.farmId || null,
      houseId: payload.houseId || null,
      sensorType: reading.metric,
      value: reading.value,
      unit: payload.unit || '',
      location: payload.location || null,
      metadata: payload.metadata || null,
      timestamp: reading.time,
      createdAt: reading.time,
    };
  }
}