// services/economic-service/src/services/economicData.service.ts

import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { EconomicData } from '../models/economicData.model';
import { producer } from '../kafka/producer';
import { TOPICS, ECONOMIC_EVENTS } from '../kafka/topics';

export class EconomicDataService {
  private repo: Repository<EconomicData>;

  constructor() {
    this.repo = AppDataSource.getRepository(EconomicData);
  }

  /** Create and publish Kafka event */
  async create(data: Partial<EconomicData>): Promise<EconomicData> {
    const entity = await this.repo.save(data);

    const payload = {
      id: entity.id,
      customer_id: entity.customerId,
      farm_id: entity.farmId,
      batch_id: entity.batchId,
      feed_assignment_id: entity.feedAssignmentId,
      cost_type: entity.costType,
      amount: entity.amount,
      animal_price: entity.animalPrice,
      feed_cost: entity.feedCost,
      labor_cost: entity.laborCost,
      utility_cost: entity.utilityCost,
      medication_cost: entity.medicationCost,
      maintenance_cost: entity.maintenanceCost,
      other_costs: entity.otherCosts,
      record_date: entity.recordDate,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };

    await producer.send({
      topic: TOPICS.ECONOMIC_DATA,
      messages: [{
        key: `${entity.id}`,
        value: JSON.stringify(payload),
        headers: { event: ECONOMIC_EVENTS.CREATED },
      }],
    });

    return entity;
  }

  async findAll(): Promise<EconomicData[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<EconomicData | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIdAndCustomer(id: number, customerId: number): Promise<EconomicData | null> {
    return this.repo.findOneBy({ id, customerId });
  }

  async findByFarmAndBatch(farmId: number, batchId: string): Promise<EconomicData[]> {
    return this.repo.find({ where: { farmId, batchId } });
  }

  async findByFeedAssignment(feedAssignmentId: number): Promise<EconomicData[]> {
    return this.repo.find({ where: { feedAssignmentId } });
  }

  /** Update and publish Kafka event */
  async update(id: number, data: Partial<EconomicData>): Promise<EconomicData> {
    await this.repo.update(id, data);
    const entity = await this.findById(id);
    if (!entity) throw new Error('EconomicData not found');

    const payload = {
      id: entity.id,
      customer_id: entity.customerId,
      farm_id: entity.farmId,
      batch_id: entity.batchId,
      feed_assignment_id: entity.feedAssignmentId,
      cost_type: entity.costType,
      amount: entity.amount,
      animal_price: entity.animalPrice,
      feed_cost: entity.feedCost,
      labor_cost: entity.laborCost,
      utility_cost: entity.utilityCost,
      medication_cost: entity.medicationCost,
      maintenance_cost: entity.maintenanceCost,
      other_costs: entity.otherCosts,
      record_date: entity.recordDate,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };

    await producer.send({
      topic: TOPICS.ECONOMIC_DATA,
      messages: [{
        key: `${entity.id}`,
        value: JSON.stringify(payload),
        headers: { event: ECONOMIC_EVENTS.UPDATED },
      }],
    });

    return entity;
  }

  /** Delete and publish Kafka event */
  async delete(id: number): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) throw new Error('EconomicData not found');

    await this.repo.delete(id);

    const payload = {
      id: entity.id,
      customer_id: entity.customerId,
      farm_id: entity.farmId,
      batch_id: entity.batchId,
      feed_assignment_id: entity.feedAssignmentId,
      record_date: entity.recordDate,
      deleted_at: new Date().toISOString(),
    };

    await producer.send({
      topic: TOPICS.ECONOMIC_DATA,
      messages: [{
        key: `${id}`,
        value: JSON.stringify(payload),
        headers: { event: ECONOMIC_EVENTS.DELETED },
      }],
    });
  }
}

export default new EconomicDataService();
