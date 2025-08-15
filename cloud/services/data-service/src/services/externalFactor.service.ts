// src/services/externalFactor.service.ts
import { AppDataSource } from '../utils/dataSource';
import { ExternalFactor } from '../models/externalFactor.model';
import { Repository } from 'typeorm';

export class ExternalFactorService {
  private repo: Repository<ExternalFactor>;

  constructor() {
    this.repo = AppDataSource.getRepository(ExternalFactor);
  }

  async findAll(): Promise<ExternalFactor[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<ExternalFactor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<ExternalFactor>): Promise<ExternalFactor> {
    const ext = this.repo.create(data);
    return this.repo.save(ext);
  }

  async update(id: number, data: Partial<ExternalFactor>): Promise<ExternalFactor | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}