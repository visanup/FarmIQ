// src/services/deviceLog.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { DeviceLog } from '../models/deviceLogs.model';

export class DeviceLogService {
  private repo: Repository<DeviceLog>;

  constructor() {
    this.repo = AppDataSource.getRepository(DeviceLog);
  }

  /**
   * Fetch all device logs, optionally filtered by device_id.
   * @param deviceId Optional device ID to filter logs.
   */
  async findAll(): Promise<DeviceLog[]> {
    return await this.repo.find({ order: { created_at: 'DESC' } });
  }

  /**
   * Fetch a single log by its ID.
   * @param id Log ID
   */
  async findOne(id: number): Promise<DeviceLog | null> {
    if (!this.isValidId(id)) return null;
    return await this.repo.findOne({ where: { log_id: id } });
  }

  /**
   * Create a new device log entry.
   * @param data Partial<DeviceLog> payload
   */
  async create(data: Partial<DeviceLog>): Promise<DeviceLog> {
    const log = this.repo.create(data);
    return await this.repo.save(log);
  }

  async findByDeviceAndCustomer(device_id: number, customer_id: number): Promise<DeviceLog[]> {
  return this.repo.find({
    where: { device_id, customer_id },
    order: { created_at: 'DESC' },
  });
}

  /**
   * Update an existing log entry by ID.
   * @param id Log ID
   * @param data Partial<DeviceLog> fields to update
   */
  async update(id: number, data: Partial<DeviceLog>): Promise<DeviceLog | null> {
    if (!this.isValidId(id)) return null;
    await this.repo.update(id, data);
    return await this.findOne(id);
  }

  /**
   * Delete a log entry by ID.
   * @param id Log ID
   */
  async delete(id: number): Promise<void> {
    if (!this.isValidId(id)) throw new Error('Invalid log id');
    await this.repo.delete(id);
  }

  /**
   * Utility method to validate ID.
   * @param id number
   * @returns boolean - true if valid id
   */
  private isValidId(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  }
}
