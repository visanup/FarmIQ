// src/services/welfareIndicator.service.ts
/**
 * WelfareIndicatorService with Kafka pub-sub integration
 * Note: The WelfareIndicator entity defines only id, customer_id, animal_id,
 * footpad_lesion, stress_hormone, recorded_date, created_at.
 * No batch_id or updated_at columns exist in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { WelfareIndicator } from '../models/welfareIndicator.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class WelfareIndicatorService {
  private repo: Repository<WelfareIndicator>;

  constructor() {
    this.repo = AppDataSource.getRepository(WelfareIndicator);
  }

  async findAll(): Promise<WelfareIndicator[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<WelfareIndicator | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<WelfareIndicator | null> {
    return this.repo.findOne({ where: { id, customer_id: customerId } });
  }

  async create(data: Partial<WelfareIndicator>): Promise<WelfareIndicator> {
    const wi = this.repo.create(data);
    const saved = await this.repo.save(wi);

    // Publish created event
    await publishEvent(
      topics.WELFARE_INDICATORS_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        animal_id: saved.animal_id,
        footpad_lesion: saved.footpad_lesion,
        stress_hormone: saved.stress_hormone,
        recorded_date: saved.recorded_date,
        created_at: saved.created_at.toISOString(),
      },
      saved.id.toString()
    );

    return saved;
  }

  async update(id: number, data: Partial<WelfareIndicator>): Promise<WelfareIndicator | null> {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event (using created_at as last-modified timestamp)
      await publishEvent(
        topics.WELFARE_INDICATORS_UPDATED,
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
        topics.WELFARE_INDICATORS_DELETED,
        {
          id: existing.id,
          customer_id: existing.customer_id,
          animal_id: existing.animal_id,
          deleted_at: new Date().toISOString(),
        },
        existing.id.toString()
      );
    }
    return success;
  }
}
