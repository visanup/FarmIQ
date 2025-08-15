// src/services/feedIntake.service.ts
/**
 * FeedIntakeService with Kafka pub-sub integration
 * Note: The FeedIntake entity defines id, customer_id, farm_id,
 * animal_id, feed_quantity, feed_batch_id, and created_at only.
 * No updated_at or batch_id (string) columns exist in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { FeedIntake } from '../models/feedIntake.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

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

  async findOneByCustomer(id: number, customerId: number): Promise<FeedIntake | null> {
    return this.repo.findOne({ where: { id, customer_id: customerId } });
  }

  async create(data: Partial<FeedIntake>): Promise<FeedIntake> {
    const intake = this.repo.create(data);
    const saved = await this.repo.save(intake);

    // Publish created event
    await publishEvent(
      topics.FEED_INTAKE_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        farm_id: saved.farm_id,
        animal_id: saved.animal_id,
        feed_quantity: saved.feed_quantity,
        feed_batch_id: saved.feed_batch_id,
        created_at: saved.created_at.toISOString(),
      },
      saved.id.toString()
    );

    return saved;
  }

  async update(id: number, data: Partial<FeedIntake>): Promise<FeedIntake | null> {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.FEED_INTAKE_UPDATED,
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
        topics.FEED_INTAKE_DELETED,
        {
          id: existing.id,
          customer_id: existing.customer_id,
          farm_id: existing.farm_id,
          animal_id: existing.animal_id,
          feed_batch_id: existing.feed_batch_id,
          deleted_at: new Date().toISOString(),
        },
        existing.id.toString()
      );
    }
    return success;
  }
}
