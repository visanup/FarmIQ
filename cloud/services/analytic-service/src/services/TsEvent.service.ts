// File: src/services/analytics/TsEvent.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { TsEvent } from '../models/TsEvent.model';

export class TsEventService {
  private repo: Repository<TsEvent>;

  constructor() {
    this.repo = AppDataSource.getRepository(TsEvent);
  }

  async findAll(): Promise<TsEvent[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<TsEvent | null> {
    return this.repo.findOneBy({ eventId: id });
  }

  async create(data: Partial<TsEvent>): Promise<TsEvent> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<TsEvent>): Promise<TsEvent | null> {
    const entity = await this.findById(id);
    if (!entity) return null;
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}