// src/services/house.service.ts
/**
 * HouseService with Kafka pub-sub integration
 * Provides CRUD operations and publishes events to Kafka topics.
 */
import { AppDataSource } from '../utils/dataSource';
import { House } from '../models/house.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class HouseService {
  private repo: Repository<House>;

  constructor() {
    this.repo = AppDataSource.getRepository(House);
  }

  async findAll(filters?: { customerId?: number; farmId?: number }): Promise<House[]> {
    const where: Partial<House> = {};
    if (filters?.customerId !== undefined) where.customer_id = filters.customerId;
    if (filters?.farmId !== undefined) where.farm_id = filters.farmId;
    return this.repo.find({ where });
  }

  async findOne(id: number): Promise<House | null> {
    return this.repo.findOne({ where: { house_id: id } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<House | null> {
    return this.repo.findOne({ where: { house_id: id, customer_id: customerId } });
  }

  async create(data: Partial<House>): Promise<House> {
    const house = this.repo.create(data);
    const saved = await this.repo.save(house);

    // Publish created event
    await publishEvent(
      topics.HOUSE_CREATED,
      {
        house_id: saved.house_id,
        customer_id: saved.customer_id,
        farm_id: saved.farm_id,
        name: saved.name,
        area: saved.area,
        capacity: saved.capacity,
        created_at: (saved.created_at as unknown as Date).toISOString(),
        updated_at: (saved.updated_at as unknown as Date).toISOString(),
      },
      saved.house_id.toString(),
    );

    return saved;
  }

  async update(id: number, data: Partial<House>): Promise<House | null> {
    const before = await this.findOne(id);
    await this.repo.update({ house_id: id }, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.HOUSE_UPDATED,
        {
          house_id: updated.house_id,
          changed_fields: data,
          updated_at: (updated.updated_at as unknown as Date).toISOString(),
        },
        updated.house_id.toString(),
      );
    }

    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.findOne(id);
    const result = await this.repo.delete({ house_id: id });
    const success = (result.affected ?? 0) > 0;

    if (success && existing) {
      // Publish deleted event
      await publishEvent(
        topics.HOUSE_DELETED,
        {
          house_id: existing.house_id,
          customer_id: existing.customer_id,
          farm_id: existing.farm_id,
          deleted_at: new Date().toISOString(),
        },
        existing.house_id.toString(),
      );
    }

    return success;
  }
}
