// File: src/services/analytics/ModelResult.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { ModelResult } from '../models/ModelResult.model';

export class ModelResultService {
  private repo: Repository<ModelResult>;

  constructor() {
    this.repo = AppDataSource.getRepository(ModelResult);
  }

  async findAll(): Promise<ModelResult[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<ModelResult | null> {
    return this.repo.findOneBy({ resultId: id });
  }

  async create(data: Partial<ModelResult>): Promise<ModelResult> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<ModelResult>): Promise<ModelResult | null> {
    const entity = await this.findById(id);
    if (!entity) return null;
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}