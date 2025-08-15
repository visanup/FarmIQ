// src/services/deviceType.service.ts
import { AppDataSource } from '../utils/dataSource';
import { DeviceType } from '../models/deviceTypes.model';
import { Repository } from 'typeorm';

export class DeviceTypeService {
  private repo: Repository<DeviceType>;

  constructor() {
    this.repo = AppDataSource.getRepository(DeviceType);
  }

  findAll(): Promise<DeviceType[]> {
    return this.repo.find({ relations: ['devices'] });
  }

  findOne(id: number): Promise<DeviceType | null> {
    return this.repo.findOne({ where: { type_id: id }, relations: ['devices'] });
  }

  create(data: Partial<DeviceType>): Promise<DeviceType> {
    const dt = this.repo.create(data);
    return this.repo.save(dt);
  }

  async update(id: number, data: Partial<DeviceType>): Promise<DeviceType | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  delete(id: number): Promise<void> {
    return this.repo.delete(id).then(() => {});
  }

  async findByTypeIdAndCustomerId(type_id: number, customer_id: number): Promise<DeviceType | null> {
    const type = await this.repo.findOne({
      where: { type_id },
      relations: ['devices']
    });

    if (!type) return null;

    // กรอง devices ที่ตรงกับ customer_id โดยตรวจสอบว่า devices มีหรือไม่
    type.devices = type.devices?.filter(device => device.customer_id === customer_id) ?? [];

    return type;
  }
}
