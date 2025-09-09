// src/services/alert.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { Alert } from '../models/alert.model';

/**
 * Service class for handling alerts
 */
export class AlertService {
  private alertRepository: Repository<Alert>;

  constructor() {
    this.alertRepository = AppDataSource.getRepository(Alert);
  }

  /**
   * Create a new alert
   * @param alert Alert data to create
   * @returns Promise<Alert> created alert
   */
  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    const newAlert = this.alertRepository.create(alert);
    return await this.alertRepository.save(newAlert);
  }

  /**
   * Get all alerts with pagination
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 50)
   * @returns Promise<{alerts: Alert[], total: number, page: number, limit: number}> paginated alerts
   */
  async getAllAlerts(page: number = 1, limit: number = 50): Promise<{alerts: Alert[], total: number, page: number, limit: number}> {
    const [alerts, total] = await this.alertRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' }
    });
    
    return {
      alerts,
      total,
      page,
      limit
    };
  }

  /**
   * Get alerts by tenant with pagination
   * @param tenantId Tenant ID
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 50)
   * @returns Promise<{alerts: Alert[], total: number, page: number, limit: number}> paginated alerts
   */
  async getAlertsByTenant(tenantId: string, page: number = 1, limit: number = 50): Promise<{alerts: Alert[], total: number, page: number, limit: number}> {
    const [alerts, total] = await this.alertRepository.findAndCount({
      where: { tenant_id: tenantId },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' }
    });
    
    return {
      alerts,
      total,
      page,
      limit
    };
  }

  /**
   * Get alerts by tenant and factory with pagination
   * @param tenantId Tenant ID
   * @param factoryId Factory ID
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 50)
   * @returns Promise<{alerts: Alert[], total: number, page: number, limit: number}> paginated alerts
   */
  async getAlertsByTenantAndFactory(tenantId: string, factoryId: string, page: number = 1, limit: number = 50): Promise<{alerts: Alert[], total: number, page: number, limit: number}> {
    const [alerts, total] = await this.alertRepository.findAndCount({
      where: { 
        tenant_id: tenantId,
        factory_id: factoryId
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' }
    });
    
    return {
      alerts,
      total,
      page,
      limit
    };
  }

  /**
   * Get alert by ID
   * @param id Alert ID
   * @returns Promise<Alert | null> alert or null if not found
   */
  async getAlertById(id: number): Promise<Alert | null> {
    return await this.alertRepository.findOne({ where: { id } });
  }

  /**
   * Resolve an alert
   * @param id Alert ID
   * @returns Promise<Alert> updated alert
   */
  async resolveAlert(id: number): Promise<Alert> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    alert.is_resolved = true;
    alert.resolved_at = new Date();
    
    return await this.alertRepository.save(alert);
  }

  /**
   * Get unresolved alerts with pagination
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 50)
   * @returns Promise<{alerts: Alert[], total: number, page: number, limit: number}> paginated alerts
   */
  async getUnresolvedAlerts(page: number = 1, limit: number = 50): Promise<{alerts: Alert[], total: number, page: number, limit: number}> {
    const [alerts, total] = await this.alertRepository.findAndCount({
      where: { is_resolved: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' }
    });
    
    return {
      alerts,
      total,
      page,
      limit
    };
  }
}