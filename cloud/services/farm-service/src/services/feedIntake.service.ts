// src/services/feedIntake.service.ts
import { AppDataSource } from '../utils/dataSource';
import { FeedIntake } from '../models/feedIntake.model';
import { Repository } from 'typeorm';

export class FeedIntakeService {
  private repo: Repository<FeedIntake>;

  constructor() {
    this.repo = AppDataSource.getRepository(FeedIntake);
  }

  async findAll(): Promise<FeedIntake[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<FeedIntake | null> {
    return this.repo.findOne({ where: { id } });
  }

  // ← เพิ่มเมธอดนี้
  async findOneByCustomer(id: number, customerId: number): Promise<FeedIntake | null> {
    return this.repo.findOne({
      where: {
        id: id,
        customer_id: customerId
      }
    });
  }

  async create(data: Partial<FeedIntake>): Promise<FeedIntake> {
    const intake = this.repo.create(data);
    return this.repo.save(intake);
  }

  async update(id: number, data: Partial<FeedIntake>): Promise<FeedIntake | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}