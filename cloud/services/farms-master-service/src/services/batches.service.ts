// src/services/batch.service.ts
/**
 * BatchService with Kafka pub-sub integration
 * Provides basic CRUD and publishes events to Kafka topics.
 */
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { Batch } from '../models/batches.model';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class BatchService {
  private repo: Repository<Batch>;

  constructor() {
    this.repo = AppDataSource.getRepository(Batch);
  }

  async findAll(filters?: { customerId?: number; farmId?: number }): Promise<Batch[]> {
    const where: Record<string, any> = {};
    if (filters?.customerId !== undefined) where.customer_id = filters.customerId;
    if (filters?.farmId !== undefined) where.farm_id = filters.farmId;
    return this.repo.find({ where, order: { start_date: 'DESC' } });
  }

  async findOne(batchId: string): Promise<Batch | null> {
    return this.repo.findOne({ where: { batch_id: batchId } });
  }

  async create(data: Partial<Batch>): Promise<Batch> {
    const batch = this.repo.create(data);
    const saved = await this.repo.save(batch);

    // Publish created event
    await publishEvent(
      topics.BATCH_CREATED,
      {
        batch_id: saved.batch_id,
        customer_id: saved.customer_id,
        farm_id: saved.farm_id,
        species: saved.species,
        breed: saved.breed,
        quantity_start: saved.quantity_start,
        start_date: (saved.start_date as unknown as Date).toISOString(),
        end_date: saved.end_date != null ? (saved.end_date as unknown as Date).toISOString() : null,
        notes: saved.notes,
        created_at: (saved.created_at as unknown as Date).toISOString(),
        updated_at: (saved.updated_at as unknown as Date).toISOString(),
      },
      saved.batch_id,
    );

    return saved;
  }

  async update(batchId: string, data: Partial<Batch>): Promise<Batch | null> {
    const batch = await this.findOne(batchId);
    if (!batch) return null;
    Object.assign(batch, data);
    const updated = await this.repo.save(batch);

    // Publish updated event
    await publishEvent(
      topics.BATCH_UPDATED,
      {
        batch_id: updated.batch_id,
        changed_fields: data,
        updated_at: (updated.updated_at as unknown as Date).toISOString(),
      },
      updated.batch_id,
    );

    return updated;
  }

  async remove(batchId: string): Promise<boolean> {
    const existing = await this.findOne(batchId);
    const result = await this.repo.delete({ batch_id: batchId });
    const success = (result.affected ?? 0) > 0;

    if (success && existing) {
      // Publish deleted event
      await publishEvent(
        topics.BATCH_DELETED,
        {
          batch_id: existing.batch_id,
          customer_id: existing.customer_id,
          farm_id: existing.farm_id,
          deleted_at: new Date().toISOString(),
        },
        existing.batch_id,
      );
    }

    return success;
  }
}
