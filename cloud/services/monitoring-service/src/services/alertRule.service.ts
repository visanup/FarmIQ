import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class AlertRuleService {
  // Create a new alert rule
  async createAlertRule(data: Prisma.alert_rulesCreateInput) {
    return prisma.alert_rules.create({
      data
    });
  }

  // Get all alert rules for a tenant
  async getAlertRules(tenantId: string) {
    return prisma.alert_rules.findMany({
      where: {
        tenant_id: tenantId
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  // Get alert rule by ID
  async getAlertRuleById(tenantId: string, ruleId: string) {
    return prisma.alert_rules.findUnique({
      where: {
        tenant_id_rule_id: {
          tenant_id: tenantId,
          rule_id: ruleId
        }
      }
    });
  }

  // Update alert rule
  async updateAlertRule(tenantId: string, ruleId: string, data: Prisma.alert_rulesUpdateInput) {
    return prisma.alert_rules.update({
      where: {
        tenant_id_rule_id: {
          tenant_id: tenantId,
          rule_id: ruleId
        }
      },
      data
    });
  }

  // Delete alert rule
  async deleteAlertRule(tenantId: string, ruleId: string) {
    return prisma.alert_rules.delete({
      where: {
        tenant_id_rule_id: {
          tenant_id: tenantId,
          rule_id: ruleId
        }
      }
    });
  }

  // Get alert rules by metric name
  async getAlertRulesByMetricName(tenantId: string, metricName: string) {
    return prisma.alert_rules.findMany({
      where: {
        tenant_id: tenantId,
        metric_name: metricName
      }
    });
  }
}

export default new AlertRuleService();