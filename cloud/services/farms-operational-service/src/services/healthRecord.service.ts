// src/services/healthRecord.service.ts
/**
 * HealthRecordService with Kafka pub-sub integration
 * Note: The HealthRecord entity defines id, customer_id, animal_id,
 * health_status, disease, vaccine, recorded_date, and created_at only.
 * No batch_id or updated_at columns exist in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { HealthRecord } from '../models/healthRecord.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class HealthRecordService {
  private repo: Repository<HealthRecord>;

  constructor() {
    this.repo = AppDataSource.getRepository(HealthRecord);
  }

  async findAll(): Promise<HealthRecord[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<HealthRecord | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<HealthRecord | null> {
    return this.repo.findOne({ where: { id, customer_id: customerId } });
  }

  async create(data: Partial<HealthRecord>): Promise<HealthRecord> {
    const record = this.repo.create(data);
    const saved = await this.repo.save(record);

    // Publish created event
    await publishEvent(
      topics.HEALTH_RECORDS_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        animal_id: saved.animal_id,
        health_status: saved.health_status,
        disease: saved.disease,
        vaccine: saved.vaccine,
        recorded_date: saved.recorded_date,
        created_at: saved.created_at.toISOString(),
      },
      saved.id.toString()
    );

    return saved;
  }

  async update(id: number, data: Partial<HealthRecord>): Promise<HealthRecord | null> {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.HEALTH_RECORDS_UPDATED,
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
        topics.HEALTH_RECORDS_DELETED,
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
