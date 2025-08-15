// src/services/farm.service.ts
/**
 * FarmService with Kafka pub-sub integration
 */
import { AppDataSource } from '../utils/dataSource';
import { Farm } from '../models/farm.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class FarmService {
  private repo: Repository<Farm>;

  constructor() {
    this.repo = AppDataSource.getRepository(Farm);
  }

  async findAll(customerId?: number): Promise<Farm[]> {
    const where = customerId !== undefined ? { customer_id: customerId } : {};
    return this.repo.find({ where });
  }

  async findOne(id: number): Promise<Farm | null> {
    return this.repo.findOne({ where: { farm_id: id } });
  }

  async findByCustomer(customerId: number): Promise<Farm[]> {
    return this.repo.find({ where: { customer_id: customerId } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<Farm | null> {
    return this.repo.findOne({ where: { farm_id: id, customer_id: customerId } });
  }

  async create(data: Partial<Farm>): Promise<Farm> {
    const farm = this.repo.create(data);
    const saved = await this.repo.save(farm);

    // Publish created event
    await publishEvent(
      topics.FARM_CREATED,
      {
        farm_id: saved.farm_id,
        customer_id: saved.customer_id,
        name: saved.name,
        location: saved.location,
        status: saved.status,
        created_at: (saved.created_at as unknown as Date).toISOString(),
        updated_at: (saved.updated_at as unknown as Date).toISOString(),
      },
      saved.farm_id.toString(),
    );

    return saved;
  }

  async update(id: number, data: Partial<Farm>): Promise<Farm | null> {
    const before = await this.findOne(id);
    await this.repo.update({ farm_id: id }, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.FARM_UPDATED,
        {
          farm_id: updated.farm_id,
          changed_fields: data,
          updated_at: (updated.updated_at as unknown as Date).toISOString(),
        },
        updated.farm_id.toString(),
      );
    }
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.findOne(id);
    const result = await this.repo.delete({ farm_id: id });
    const success = (result.affected ?? 0) > 0;

    if (success && existing) {
      // Publish deleted event
      await publishEvent(
        topics.FARM_DELETED,
        {
          farm_id: existing.farm_id,
          customer_id: existing.customer_id,
          deleted_at: new Date().toISOString(),
        },
        existing.farm_id.toString(),
      );
    }

    return success;
  }
}
