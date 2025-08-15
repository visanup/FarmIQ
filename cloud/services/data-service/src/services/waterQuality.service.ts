// src/services/waterQuality.service.ts
import { AppDataSource } from '../utils/dataSource';
import { WaterQuality } from '../models/waterQuality.model';
import { Repository } from 'typeorm';

export class WaterQualityService {
  private repo: Repository<WaterQuality>;

  constructor() {
    this.repo = AppDataSource.getRepository(WaterQuality);
  }

  async findAll(): Promise<WaterQuality[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<WaterQuality | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<WaterQuality>): Promise<WaterQuality> {
    const wq = this.repo.create(data);
    return this.repo.save(wq);
  }

  async update(id: number, data: Partial<WaterQuality>): Promise<WaterQuality | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}