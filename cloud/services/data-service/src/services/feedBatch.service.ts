// src/services/feedBatch.service.ts
import { AppDataSource } from '../utils/dataSource';
import { FeedBatch } from '../models/feedBatch.model';
import { Repository } from 'typeorm';

export class FeedBatchService {
  private repo: Repository<FeedBatch>;

  constructor() {
    this.repo = AppDataSource.getRepository(FeedBatch);
  }

  async findAll(): Promise<FeedBatch[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<FeedBatch | null> {
    return this.repo.findOne({ where: { feed_batch_id: id } });
  }

  async create(data: Partial<FeedBatch>): Promise<FeedBatch> {
    const batch = this.repo.create(data);
    return this.repo.save(batch);
  }

  async update(id: number, data: Partial<FeedBatch>): Promise<FeedBatch | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
