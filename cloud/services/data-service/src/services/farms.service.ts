// src/services/farm.service.ts
import { AppDataSource } from '../utils/dataSource';
import { Farm } from '../models/farm.model';
import { Repository } from 'typeorm';

export class FarmService {
  private repo: Repository<Farm>;

  constructor() {
    this.repo = AppDataSource.getRepository(Farm);
  }

  async findAll(): Promise<Farm[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Farm | null> {
    return this.repo.findOne({ where: { farm_id: id } });
  }

  async create(data: Partial<Farm>): Promise<Farm> {
    const farm = this.repo.create(data);
    return this.repo.save(farm);
  }

  async update(id: number, data: Partial<Farm>): Promise<Farm | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}