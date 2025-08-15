// src/services/operationRecord.service.ts
/**
 * OperationRecordService with Kafka pub-sub integration
 * Note: The OperationRecord entity defines id, customer_id, farm_id,
 * type, description, record_date, and created_at only.
 * No batch_id or updated_at columns exist in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { OperationRecord } from '../models/operationRecord.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class OperationRecordService {
  private repo: Repository<OperationRecord>;

  constructor() {
    this.repo = AppDataSource.getRepository(OperationRecord);
  }

  async findAll(): Promise<OperationRecord[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<OperationRecord | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<OperationRecord | null> {
    return this.repo.findOne({ where: { id, customer_id: customerId } });
  }

  async create(data: Partial<OperationRecord>): Promise<OperationRecord> {
    const record = this.repo.create(data);
    const saved = await this.repo.save(record);

    // Publish created event
    await publishEvent(
      topics.OPERATIONAL_RECORDS_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        farm_id: saved.farm_id,
        type: saved.type,
        description: saved.description,
        record_date: saved.record_date,
        created_at: saved.created_at.toISOString(),
      },
      saved.id.toString()
    );

    return saved;
  }

  async update(id: number, data: Partial<OperationRecord>): Promise<OperationRecord | null> {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.OPERATIONAL_RECORDS_UPDATED,
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
        topics.OPERATIONAL_RECORDS_DELETED,
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