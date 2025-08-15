// src/services/device.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { Device } from '../models/device.model';

export class DeviceService {
  private repo: Repository<Device>;

  constructor() {
    this.repo = AppDataSource.getRepository(Device);
  }

  /**
   * Fetch all devices, including related type, group, status history,
   * feed assignments, and recent sensor data.
   */
  async findAll(): Promise<Device[]> {
    return this.repo.find({
      relations: [
        'type',
        'group',
        'status_history'
      ]
    });
  }

  /**
   * Fetch a single device by its ID, with all relations.
   * @param id Device ID
   */
  async findOne(id: number): Promise<Device | null> {
    return this.repo.findOne({
      where: { device_id: id },
      relations: [
        'type',
        'group',
        'status_history'
      ]
    });
  }

  /**
   * Create a new device record.
   * @param data Partial<Device> payload
   */
  async create(data: Partial<Device>): Promise<Device> {
    const device = this.repo.create(data);
    return this.repo.save(device);
  }

  /**
   * Fetch all devices by customer_id.
   * @param customer_id
   */
  async findByDeviceIdAndCustomerId(device_id: number, customer_id: number): Promise<Device | null> {
    return this.repo.findOne({
      where: { device_id, customer_id },
      relations: ['type', 'group', 'status_history']
    });
  }


  /**
   * Update an existing device by ID.
   * @param id Device ID
   * @param data Partial<Device> fields to update
   */
  async update(id: number, data: Partial<Device>): Promise<Device | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete a device by ID.
   * @param id Device ID
   */
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

