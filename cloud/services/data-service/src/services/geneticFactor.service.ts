// src/services/geneticFactor.service.ts
import { AppDataSource } from '../utils/dataSource';
import { GeneticFactor } from '../models/geneticFactor.model';
import { Repository } from 'typeorm';

export class GeneticFactorService {
  private repo: Repository<GeneticFactor>;

  constructor() {
    this.repo = AppDataSource.getRepository(GeneticFactor);
  }

  async findAll(): Promise<GeneticFactor[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<GeneticFactor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<GeneticFactor>): Promise<GeneticFactor> {
    const gf = this.repo.create(data);
    return this.repo.save(gf);
  }

  async update(id: number, data: Partial<GeneticFactor>): Promise<GeneticFactor | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
