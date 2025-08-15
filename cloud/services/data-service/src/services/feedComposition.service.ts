// src/services/feedComposition.service.ts
import { AppDataSource } from '../utils/dataSource';
import { FeedComposition } from '../models/feedComposition.model';
import { Repository } from 'typeorm';

export class FeedCompositionService {
  private repo: Repository<FeedComposition>;

  constructor() {
    this.repo = AppDataSource.getRepository(FeedComposition);
  }

  async findAll(): Promise<FeedComposition[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<FeedComposition | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<FeedComposition>): Promise<FeedComposition> {
    const comp = this.repo.create(data);
    return this.repo.save(comp);
  }

  async update(id: number, data: Partial<FeedComposition>): Promise<FeedComposition | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}