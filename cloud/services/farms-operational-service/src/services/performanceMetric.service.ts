// src/services/performanceMetric.service.ts
/**
 * PerformanceMetricService with Kafka pub-sub integration
 * Note: The PerformanceMetric entity defines id, customer_id, recorded_date,
 * animal_id, all metric fields, created_at, and updated_at.
 * No batch_id field exists in the model.
 */
import { AppDataSource } from '../utils/dataSource';
import { PerformanceMetric } from '../models/performanceMetric.model';
import { Repository } from 'typeorm';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class PerformanceMetricService {
  private repo: Repository<PerformanceMetric>;

  constructor() {
    this.repo = AppDataSource.getRepository(PerformanceMetric);
  }

  async findAll(): Promise<PerformanceMetric[]> {
    return this.repo.find();
  }

  async findOne(id: number, recorded_date: string): Promise<PerformanceMetric | null> {
    return this.repo.findOne({ where: { id, recorded_date } });
  }

  async findOneByDateAndCustomer(
    id: number,
    recordDate: string,
    customerId: number
  ): Promise<PerformanceMetric | null> {
    return this.repo.findOne({ where: { id, recorded_date: recordDate, customer_id: customerId } });
  }

  async create(data: Partial<PerformanceMetric>): Promise<PerformanceMetric> {
    const pm = this.repo.create(data);
    const saved = await this.repo.save(pm);

    // Publish created event
    await publishEvent(
      topics.PERFORMANCE_METRICS_CREATED,
      {
        id: saved.id,
        customer_id: saved.customer_id,
        animal_id: saved.animal_id,
        adg: saved.adg,
        fcr: saved.fcr,
        survival_rate: saved.survival_rate,
        pi_score: saved.pi_score,
        mortality_rate: saved.mortality_rate,
        health_score: saved.health_score,
        behavior_score: saved.behavior_score,
        body_condition_score: saved.body_condition_score,
        stress_level: saved.stress_level,
        disease_incidence_rate: saved.disease_incidence_rate,
        vaccination_status: saved.vaccination_status,
        recorded_date: saved.recorded_date,
        created_at: saved.created_at.toISOString(),
        updated_at: saved.updated_at.toISOString(),
      },
      `${saved.id}-${saved.recorded_date}`
    );

    return saved;
  }

  async update(id: number, recorded_date: string, data: Partial<PerformanceMetric>): Promise<PerformanceMetric | null> {
    await this.repo.update({ id, recorded_date }, data);
    const updated = await this.findOne(id, recorded_date);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.PERFORMANCE_METRICS_UPDATED,
        {
          id: updated.id,
          recorded_date: updated.recorded_date,
          changed_fields: data,
          updated_at: new Date().toISOString(),
        },
        `${updated.id}-${updated.recorded_date}`
      );
    }
    return updated;
  }

  async delete(id: number, recorded_date: string): Promise<boolean> {
    const existing = await this.findOne(id, recorded_date);
    if (!existing) return false;

    const result = await this.repo.delete({ id, recorded_date });
    const success = (result.affected ?? 0) > 0;
    if (success) {
      // Publish deleted event
      await publishEvent(
        topics.PERFORMANCE_METRICS_DELETED,
        {
          id: existing.id,
          customer_id: existing.customer_id,
          animal_id: existing.animal_id,
          deleted_at: new Date().toISOString(),
        },
        `${existing.id}-${existing.recorded_date}`
      );
    }

    return success;
  }
}