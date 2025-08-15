// src/services/feedProgram.service.ts
import { AppDataSource } from '../utils/dataSource';
import { FeedProgram } from '../models/feedProgram.model';
import { Repository } from 'typeorm';

export class FeedProgramService {
  private repo: Repository<FeedProgram>;

  constructor() {
    this.repo = AppDataSource.getRepository(FeedProgram);
  }

  async findAll(): Promise<FeedProgram[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<FeedProgram | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<FeedProgram>): Promise<FeedProgram> {
    const program = this.repo.create(data);
    return this.repo.save(program);
  }

  // ← เพิ่มเมธอดนี้
  async findOneByCustomer(id: number, customerId: number): Promise<FeedProgram | null> {
    return this.repo.findOne({
      where: {
        id,
        customer_id: customerId
      }
    });
  }
  
  async update(id: number, data: Partial<FeedProgram>): Promise<FeedProgram | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
