// src/services/operationRecord.service.ts
import { AppDataSource } from '../utils/dataSource';
import { OperationRecord } from '../models/operationRecord.model';
import { Repository } from 'typeorm';

export class OperationRecordService {
  private repo: Repository<OperationRecord>;

  constructor() {
    this.repo = AppDataSource.getRepository(OperationRecord);
  }

  async findAll(): Promise<OperationRecord[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<OperationRecord | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<OperationRecord>): Promise<OperationRecord> {
    const record = this.repo.create(data);
    return this.repo.save(record);
  }

  async update(id: number, data: Partial<OperationRecord>): Promise<OperationRecord | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}