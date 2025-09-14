import { PrismaClient, Prisma } from '@prisma/client';
import { CreateSensorAlertInput, UpdateSensorAlertInput, SensorAlertResponse } from '../types/sensor-alert.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class SensorAlertService {
  async createSensorAlert(data: CreateSensorAlertInput): Promise<SensorAlertResponse> {
    const sensorAlert = await prisma.sensorAlert.create({
      data: {
        deviceId: data.deviceId,
        farmId: data.farmId || null,
        houseId: data.houseId || null,
        alertType: data.alertType,
        severity: data.severity as any,
        message: data.message,
        value: data.value,
        threshold: data.threshold,
        isResolved: data.isResolved || false,
        resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null,
        metadata: data.metadata ? data.metadata : Prisma.JsonNull,
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishSensorAlert(sensorAlert);
    } catch (error) {
      console.error('Failed to publish sensor alert to Kafka:', error);
    }

    return this.formatSensorAlertResponse(sensorAlert);
  }

  async getSensorAlertById(id: string): Promise<SensorAlertResponse | null> {
    const sensorAlert = await prisma.sensorAlert.findUnique({
      where: { id },
    });

    if (!sensorAlert) {
      return null;
    }

    return this.formatSensorAlertResponse(sensorAlert);
  }

  async getSensorAlerts(
    page: number = 1,
    limit: number = 10,
    deviceId?: string,
    alertType?: string,
    severity?: string,
    isResolved?: boolean
  ): Promise<{ alerts: SensorAlertResponse[]; total: number; page: number; limit: number }> {
    const where: Prisma.SensorAlertWhereInput = {};
    
    if (deviceId) where.deviceId = deviceId;
    if (alertType) where.alertType = alertType;
    if (severity) where.severity = severity as any;
    if (isResolved !== undefined) where.isResolved = isResolved;

    const [alerts, total] = await Promise.all([
      prisma.sensorAlert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sensorAlert.count({ where }),
    ]);

    return {
      alerts: alerts.map(this.formatSensorAlertResponse),
      total,
      page,
      limit,
    };
  }

  async updateSensorAlert(id: string, data: UpdateSensorAlertInput): Promise<SensorAlertResponse> {
    const sensorAlert = await prisma.sensorAlert.update({
      where: { id },
      data: {
        ...(data.isResolved !== undefined && { isResolved: data.isResolved }),
        ...(data.resolvedAt !== undefined && { resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null }),
        ...(data.message !== undefined && { message: data.message }),
        ...(data.metadata !== undefined && { metadata: data.metadata ? data.metadata : Prisma.JsonNull }),
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishSensorAlert(sensorAlert);
    } catch (error) {
      console.error('Failed to publish sensor alert to Kafka:', error);
    }

    return this.formatSensorAlertResponse(sensorAlert);
  }

  async deleteSensorAlert(id: string): Promise<void> {
    await prisma.sensorAlert.delete({
      where: { id },
    });
  }

  async getAlertsByDevice(deviceId: string): Promise<SensorAlertResponse[]> {
    const alerts = await prisma.sensorAlert.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map(this.formatSensorAlertResponse);
  }

  async getUnresolvedAlerts(): Promise<SensorAlertResponse[]> {
    const alerts = await prisma.sensorAlert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map(this.formatSensorAlertResponse);
  }

  private formatSensorAlertResponse(alert: any): SensorAlertResponse {
    return {
      id: alert.id,
      deviceId: alert.deviceId,
      farmId: alert.farmId,
      houseId: alert.houseId,
      alertType: alert.alertType,
      severity: alert.severity,
      message: alert.message,
      value: alert.value,
      threshold: alert.threshold,
      isResolved: alert.isResolved,
      resolvedAt: alert.resolvedAt,
      metadata: alert.metadata,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };
  }
}
