import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class AlertService {
  // Create a new alert
  async createAlert(data: Prisma.alertsCreateInput) {
    return prisma.alerts.create({
      data
    });
  }

  // Get all alerts for a tenant
  async getAlerts(tenantId: string) {
    return prisma.alerts.findMany({
      where: {
        tenant_id: tenantId
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  // Get alert by ID
  async getAlertById(tenantId: string, alertId: string) {
    return prisma.alerts.findUnique({
      where: {
        tenant_id_alert_id: {
          tenant_id: tenantId,
          alert_id: alertId
        }
      }
    });
  }

  // Update alert
  async updateAlert(tenantId: string, alertId: string, data: Prisma.alertsUpdateInput) {
    return prisma.alerts.update({
      where: {
        tenant_id_alert_id: {
          tenant_id: tenantId,
          alert_id: alertId
        }
      },
      data
    });
  }

  // Delete alert
  async deleteAlert(tenantId: string, alertId: string) {
    return prisma.alerts.delete({
      where: {
        tenant_id_alert_id: {
          tenant_id: tenantId,
          alert_id: alertId
        }
      }
    });
  }

  // Get alerts by status
  async getAlertsByStatus(tenantId: string, status: string) {
    return prisma.alerts.findMany({
      where: {
        tenant_id: tenantId,
        status
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}

export default new AlertService();