// src/services/waterQuality.service.ts
/**
 * WaterQualityService with Kafka pub-sub integration
 * Note: The WaterQuality entity defines id, customer_id, farm_id,
 * fe, pb, note, measurement_date, and created_at only.
 * No batch_id or updated_at columns exist in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { WaterQuality } from '../models/waterQuality.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class WaterQualityService {
  private repo: Repository<WaterQuality>;

  constructor() {
    this.repo = AppDataSource.getRepository(WaterQuality);
  }

  async findAll(): Promise<WaterQuality[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<WaterQuality | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<WaterQuality | null> {
    return this.repo.findOne({ where: { id, customer_id: customerId } });
  }

  async create(data: Partial<WaterQuality>): Promise<WaterQuality> {
    const wq = this.repo.create(data);
    const saved = await this.repo.save(wq);

    // Publish created event
    await publishEvent(
      topics.WATER_QUALITY_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        farm_id: saved.farm_id,
        fe: saved.fe,
        pb: saved.pb,
        note: saved.note,
        measurement_date: saved.measurement_date,
        created_at: saved.created_at.toISOString(),
      },
      saved.id.toString()
    );

    return saved;
  }

  async update(id: number, data: Partial<WaterQuality>): Promise<WaterQuality | null> {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.WATER_QUALITY_UPDATED,
        {
          id: updated.id,
          changed_fields: data,
          updated_at: new Date().toISOString(),
        },
        updated.id.toString()
      );
    }
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) return false;
    const result = await this.repo.delete(id);
    const success = (result.affected ?? 0) > 0;
    if (success) {
      // Publish deleted event
      await publishEvent(
        topics.WATER_QUALITY_DELETED,
        {
          id: existing.id,
          customer_id: existing.customer_id,
          farm_id: existing.farm_id,
          deleted_at: new Date().toISOString(),
        },
        existing.id.toString()
      );
    }
    return success;
  }
}
