// src/services/housingCondition.service.ts
import { AppDataSource } from '../utils/dataSource';
import { HousingCondition } from '../models/housingCondition.model';
import { Repository } from 'typeorm';

export class HousingConditionService {
  private repo: Repository<HousingCondition>;

  constructor() {
    this.repo = AppDataSource.getRepository(HousingCondition);
  }

  async findAll(): Promise<HousingCondition[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<HousingCondition | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<HousingCondition>): Promise<HousingCondition> {
    const hc = this.repo.create(data);
    return this.repo.save(hc);
  }

  async update(id: number, data: Partial<HousingCondition>): Promise<HousingCondition | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}