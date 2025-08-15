// src/services/feedProgram.service.ts
/**
 * FeedProgramService with Kafka pub-sub integration
 * Note: The FeedProgram entity defines id, customer_id, farm_id,
 * name, description, effective_start, effective_end, and created_at only.
 * No batch_id or updated_at columns exist in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { FeedProgram } from '../models/feedProgram.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

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

  async findOneByCustomer(id: number, customerId: number): Promise<FeedProgram | null> {
    return this.repo.findOne({ where: { id, customer_id: customerId } });
  }

  async create(data: Partial<FeedProgram>): Promise<FeedProgram> {
    const program = this.repo.create(data);
    const saved = await this.repo.save(program);

    // Publish created event
    await publishEvent(
      topics.FEED_PROGRAMS_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        farm_id: saved.farm_id,
        name: saved.name,
        description: saved.description,
        effective_start: saved.effective_start.toISOString(),
        effective_end: saved.effective_end ? saved.effective_end.toISOString() : null,
        created_at: saved.created_at.toISOString(),
      },
      saved.id.toString()
    );

    return saved;
  }

  async update(id: number, data: Partial<FeedProgram>): Promise<FeedProgram | null> {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.FEED_PROGRAMS_UPDATED,
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
        topics.FEED_PROGRAMS_DELETED,
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
