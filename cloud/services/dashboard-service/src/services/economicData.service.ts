// services/economic-service/src/services/economicData.service.ts

import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { EconomicData } from '../models/economicData.model';

export class EconomicDataService {
  private repo: Repository<EconomicData>;

  constructor() {
    this.repo = AppDataSource.getRepository(EconomicData);
  }

  async create(data: Partial<EconomicData>): Promise<EconomicData> {
    return this.repo.save(data);
  }

  async findAll(): Promise<EconomicData[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<EconomicData | null> {
    return this.repo.findOneBy({ id });
  }

    // เพิ่มเมธอดนี้
  async findByIdAndCustomer(id: number, customerId: number): Promise<EconomicData | null> {
    return this.repo.findOneBy({ id, customer_id: customerId });
  }

  async update(id: number, data: Partial<EconomicData>): Promise<EconomicData> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error('EconomicData not found');
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

export default new EconomicDataService();