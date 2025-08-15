// src/services/envFactor.service.ts
import { AppDataSource } from '../utils/dataSource';
import { EnvironmentalFactor } from '../models/envFactor.model';
import { Repository } from 'typeorm';

export class EnvFactorService {
  private repo: Repository<EnvironmentalFactor>;

  constructor() {
    this.repo = AppDataSource.getRepository(EnvironmentalFactor);
  }

  async findAll(): Promise<EnvironmentalFactor[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<EnvironmentalFactor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<EnvironmentalFactor>): Promise<EnvironmentalFactor> {
    const env = this.repo.create(data);
    return this.repo.save(env);
  }

  async update(id: number, data: Partial<EnvironmentalFactor>): Promise<EnvironmentalFactor | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}