// File: src/services/analytics/FeatureStore.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { FeatureStore } from '../models/FeatureStore.model';

export class FeatureStoreService {
  private repo: Repository<FeatureStore>;

  constructor() {
    this.repo = AppDataSource.getRepository(FeatureStore);
  }

  async findAll(): Promise<FeatureStore[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<FeatureStore | null> {
    return this.repo.findOneBy({ featureId: id });
  }

  async create(data: Partial<FeatureStore>): Promise<FeatureStore> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<FeatureStore>): Promise<FeatureStore | null> {
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