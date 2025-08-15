// src/services/economicData.service.ts
import { AppDataSource } from '../utils/dataSource';
import { EconomicData } from '../models/economic.model';
import { Repository } from 'typeorm';

export class EconomicDataService {
  private repo: Repository<EconomicData>;

  constructor() {
    this.repo = AppDataSource.getRepository(EconomicData);
  }

  async findAll(): Promise<EconomicData[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<EconomicData | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<EconomicData>): Promise<EconomicData> {
    const econ = this.repo.create(data);
    return this.repo.save(econ);
  }

  async update(id: number, data: Partial<EconomicData>): Promise<EconomicData | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
