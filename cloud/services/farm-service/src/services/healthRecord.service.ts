// src/services/healthRecord.service.ts
import { AppDataSource } from '../utils/dataSource';
import { HealthRecord } from '../models/healthRecord.model';
import { Repository } from 'typeorm';

export class HealthRecordService {
  private repo: Repository<HealthRecord>;

  constructor() {
    this.repo = AppDataSource.getRepository(HealthRecord);
  }

  async findAll(): Promise<HealthRecord[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<HealthRecord | null> {
    return this.repo.findOne({ where: { id } });
  }

  // ← เพิ่มเมธอดนี้
  async findOneByCustomer(id: number, customerId: number): Promise<HealthRecord | null> {
    return this.repo.findOne({
      where: {
        id,
        customer_id: customerId
      }
    });
  }

  async create(data: Partial<HealthRecord>): Promise<HealthRecord> {
    const hr = this.repo.create(data);
    return this.repo.save(hr);
  }

  async update(id: number, data: Partial<HealthRecord>): Promise<HealthRecord | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}