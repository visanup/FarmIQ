// src/services/welfareIndicator.service.ts
import { AppDataSource } from '../utils/dataSource';
import { WelfareIndicator } from '../models/welfareIndicator.model';
import { Repository } from 'typeorm';

export class WelfareIndicatorService {
  private repo: Repository<WelfareIndicator>;

  constructor() {
    this.repo = AppDataSource.getRepository(WelfareIndicator);
  }

  async findAll(): Promise<WelfareIndicator[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<WelfareIndicator | null> {
    return this.repo.findOne({ where: { id } });
  }

  // ← เพิ่มเมธอดนี้
  async findOneByCustomer(id: number, customerId: number): Promise<WelfareIndicator | null> {
    return this.repo.findOne({
      where: {
        id,
        customer_id: customerId
      }
    });
  }  

  async create(data: Partial<WelfareIndicator>): Promise<WelfareIndicator> {
    const wi = this.repo.create(data);
    return this.repo.save(wi);
  }

  async update(id: number, data: Partial<WelfareIndicator>): Promise<WelfareIndicator | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}