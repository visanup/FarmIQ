// src/services/deviceStatusHistory.service.ts
import { Repository, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { DeviceStatusHistory } from '../models/deviceStatusHistory.model';

export class DeviceStatusHistoryService {
  private repo: Repository<DeviceStatusHistory>;

  constructor() {
    this.repo = AppDataSource.getRepository(DeviceStatusHistory);
  }

  /**
   * Fetch all status history entries.
   * @param filter Optional filter object, e.g. { device_id: 123 }
   */
  findAll(filter?: { device_id?: number }): Promise<DeviceStatusHistory[]> {
    const where: FindOptionsWhere<DeviceStatusHistory> = {};
    if (filter?.device_id !== undefined) {
      where.device_id = filter.device_id;
    }
    return this.repo.find({
      where,
      order: { changed_at: 'DESC' },
    });
  }

  /**
   * Fetch a single status history entry by its ID.
   * @param id The record ID
   */
  findOne(id: number): Promise<DeviceStatusHistory | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Create a new status history record.
   * @param data Partial payload
   */
  create(data: Partial<DeviceStatusHistory>): Promise<DeviceStatusHistory> {
    const record = this.repo.create(data);
    return this.repo.save(record);
  }

  /**
   * Update an existing status history record.
   * @param id Record ID
   * @param data Partial fields to update
   */
  async update(
    id: number,
    data: Partial<DeviceStatusHistory>
  ): Promise<DeviceStatusHistory | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete a status history record by its ID.
   * @param id Record ID
   */
  delete(id: number): Promise<void> {
    return this.repo.delete(id).then(() => {});
  }
}

