// File: src/services/analytics/DataQualityLog.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { DataQualityLog } from '../models/DataQualityLog.model';

export class DataQualityLogService {
  private repo: Repository<DataQualityLog>;

  constructor() {
    this.repo = AppDataSource.getRepository(DataQualityLog);
  }

  async findAll(): Promise<DataQualityLog[]> {
    return this.repo.find();
  }

  async findByRun(runId: string): Promise<DataQualityLog[]> {
    return this.repo.findBy({ runId });
  }

  async log(issue: Partial<DataQualityLog>): Promise<DataQualityLog> {
    const entry = this.repo.create(issue);
    return this.repo.save(entry);
  }
}