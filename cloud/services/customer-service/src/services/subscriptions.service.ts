// src/services/subscription.service.ts
import { AppDataSource } from '../utils/dataSource';
import { Subscription } from '../models/subscription.model';
import { Repository } from 'typeorm';

export class SubscriptionService {
  private repo: Repository<Subscription>;

  constructor() {
    this.repo = AppDataSource.getRepository(Subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Subscription | null> {
    return this.repo.findOne({ where: { subscription_id: id } });
  }

  async create(data: Partial<Subscription>): Promise<Subscription> {
    const sub = this.repo.create(data);
    return this.repo.save(sub);
  }

  async update(id: number, data: Partial<Subscription>): Promise<Subscription | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}