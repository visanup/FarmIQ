// src/services/geneticFactor.service.ts
/**
 * GeneticFactorService with Kafka pub-sub integration
 * Note: The GeneticFactor entity defines id, customer_id, animal_id,
 * test_type, result, test_date, and created_at only.
 * No batch_id or updated_at columns exist in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { GeneticFactor } from '../models/geneticFactor.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class GeneticFactorService {
  private repo: Repository<GeneticFactor>;

  constructor() {
    this.repo = AppDataSource.getRepository(GeneticFactor);
  }

  async findAll(): Promise<GeneticFactor[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<GeneticFactor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<GeneticFactor | null> {
    return this.repo.findOne({ where: { id, customer_id: customerId } });
  }

  async create(data: Partial<GeneticFactor>): Promise<GeneticFactor> {
    const gf = this.repo.create(data);
    const saved = await this.repo.save(gf);

    // Publish created event
    await publishEvent(
      topics.GENETIC_FACTORS_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        animal_id: saved.animal_id,
        test_type: saved.test_type,
        result: saved.result,
        test_date: saved.test_date,
        created_at: saved.created_at.toISOString(),
      },
      saved.id.toString()
    );

    return saved;
  }

  async update(id: number, data: Partial<GeneticFactor>): Promise<GeneticFactor | null> {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.GENETIC_FACTORS_UPDATED,
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
        topics.GENETIC_FACTORS_DELETED,
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
