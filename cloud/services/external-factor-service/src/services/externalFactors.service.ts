// services/external-factor-service/src/services/externalFactors.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { ExternalFactors } from '../models/externalFactors.model';
import { initProducer, publishEvent } from '../kafka/producer';
import { ExternalFactorTopics } from '../kafka/topics';

export class ExternalFactorsService {
  private repo: Repository<ExternalFactors>;

  constructor() {
    this.repo = AppDataSource.getRepository(ExternalFactors);
    // Initialize Kafka producer on service start
    initProducer().catch(err => console.error('Kafka init error:', err));
  }

  /**
   * Create a new ExternalFactors record and publish an event
   */
  async create(data: Partial<ExternalFactors>): Promise<ExternalFactors> {
    const saved = await this.repo.save(data);
    // Publish Kafka event
    await publishEvent(
      ExternalFactorTopics.TOPIC,
      {
        eventType: ExternalFactorTopics.CREATED,
        data: saved,
      },
      saved.customerId.toString()
    );
    return saved;
  }

  /**
   * Retrieve all records
   */
  async findAll(): Promise<ExternalFactors[]> {
    return this.repo.find();
  }

  /**
   * Find by primary ID
   */
  async findById(id: number): Promise<ExternalFactors | null> {
    return this.repo.findOneBy({ id });
  }

  /**
   * Find by ID and customer
   */
  async findByIdAndCustomer(id: number, customerId: number): Promise<ExternalFactors | null> {
    return this.repo.findOneBy({ id, customerId });
  }

  /**
   * Find all by farm and batch
   */
  async findByFarmAndBatch(farmId: number, batchId: string): Promise<ExternalFactors[]> {
    return this.repo.find({ where: { farmId, batchId } });
  }

  /**
   * Update a record and publish an event
   */
  async update(id: number, data: Partial<ExternalFactors>): Promise<ExternalFactors> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error('ExternalFactors not found');

    // Publish Kafka event
    await publishEvent(
      ExternalFactorTopics.TOPIC,
      {
        eventType: ExternalFactorTopics.UPDATED,
        data: updated,
      },
      updated.customerId.toString()
    );
    return updated;
  }

  /**
   * Delete a record and publish a deletion event
   */
  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('ExternalFactors not found');

    await this.repo.delete(id);
    // Publish Kafka event
    await publishEvent(
      ExternalFactorTopics.TOPIC,
      {
        eventType: ExternalFactorTopics.DELETED,
        data: { id },
      },
      existing.customerId.toString()
    );
  }
}

export default new ExternalFactorsService();