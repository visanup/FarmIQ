// src/services/performanceMetric.service.ts
import { AppDataSource } from '../utils/dataSource';
import { PerformanceMetric } from '../models/performanceMetric.model';
import { Repository } from 'typeorm';

export class PerformanceMetricService {
  private repo: Repository<PerformanceMetric>;

  constructor() {
    this.repo = AppDataSource.getRepository(PerformanceMetric);
  }

  async findAll(): Promise<PerformanceMetric[]> {
    return this.repo.find();
  }

  async findOne(id: number, recorded_date: string): Promise<PerformanceMetric | null> {
    return this.repo.findOne({ where: { id, recorded_date } });
  }

  // ← เพิ่มเมธอดนี้ รับ id, recordDate, customerId
  async findOneByDateAndCustomer(
    id: number,
    recordDate: string,
    customerId: number
  ): Promise<PerformanceMetric | null> {
    return this.repo.findOne({
      where: {
        id,
        recorded_date: recordDate,
        customer_id: customerId
      }
    });
  }

  async create(data: Partial<PerformanceMetric>): Promise<PerformanceMetric> {
    const pm = this.repo.create(data);
    return this.repo.save(pm);
  }

  async update(id: number, recorded_date: string, data: Partial<PerformanceMetric>): Promise<PerformanceMetric | null> {
    await this.repo.update({ id, recorded_date }, data);
    return this.findOne(id, recorded_date);
  }

  async delete(id: number, recorded_date: string): Promise<void> {
    await this.repo.delete({ id, recorded_date });
  }
}