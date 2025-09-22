import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class DeviceHealthLogService {
  // Create a new device health log
  async createDeviceHealthLog(data: Prisma.device_health_logCreateInput) {
    return prisma.device_health_log.create({
      data
    });
  }

  // Get all device health logs for a tenant
  async getDeviceHealthLogs(tenantId: string) {
    return prisma.device_health_log.findMany({
      where: {
        tenant_id: tenantId
      },
      orderBy: {
        time: 'desc'
      }
    });
  }

  // Get device health log by ID
  async getDeviceHealthLogById(tenantId: string, id: number) {
    // Composite unique is not defined; use findFirst with both conditions
    return prisma.device_health_log.findFirst({
      where: {
        tenant_id: tenantId,
        id: id,
      },
    });
  }

  // Get device health logs by device ID
  async getDeviceHealthLogsByDeviceId(tenantId: string, deviceId: string) {
    return prisma.device_health_log.findMany({
      where: {
        tenant_id: tenantId,
        device_id: deviceId
      },
      orderBy: {
        time: 'desc'
      }
    });
  }

  // Delete device health log
  async deleteDeviceHealthLog(tenantId: string, id: number) {
    // Use deleteMany to enforce tenant filter
    await prisma.device_health_log.deleteMany({
      where: { tenant_id: tenantId, id: id },
    });
    return { success: true } as any;
  }
}

export default new DeviceHealthLogService();
