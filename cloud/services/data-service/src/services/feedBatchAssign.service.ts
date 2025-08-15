// src/services/feedBatchAssign.service.ts
import { AppDataSource } from '../utils/dataSource';
import { FeedBatchAssignment } from '../models/feedBatchAssign.model';
import { Repository } from 'typeorm';

export class FeedBatchAssignService {
  private repo: Repository<FeedBatchAssignment>;

  constructor() {
    this.repo = AppDataSource.getRepository(FeedBatchAssignment);
  }

  async findAll(): Promise<FeedBatchAssignment[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<FeedBatchAssignment | null> {
    return this.repo.findOne({ where: { assignment_id: id } });
  }

  async create(data: Partial<FeedBatchAssignment>): Promise<FeedBatchAssignment> {
    const assign = this.repo.create(data);
    return this.repo.save(assign);
  }

  async update(id: number, data: Partial<FeedBatchAssignment>): Promise<FeedBatchAssignment | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}