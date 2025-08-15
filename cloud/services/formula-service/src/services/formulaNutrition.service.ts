// services/formula-service/src/services/formulaNutrition.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { FormulaNutrition } from '../models/formulaNutrition.model';
import { publishEvent } from '../kafka/producer';
import { TOPICS } from '../kafka/topics';

export class FormulaNutritionService {
  private repo: Repository<FormulaNutrition>;

  constructor() {
    this.repo = AppDataSource.getRepository(FormulaNutrition);
  }

  /**
   * Create a new nutrition entry and publish CREATED event
   */
  async create(data: Partial<FormulaNutrition>): Promise<FormulaNutrition> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    const payload = {
      id: saved.id,
      formula_id: saved.formulaId,
      nutrient: saved.nutrient,
      amount: saved.amount,
      created_at: saved.createdAt.toISOString(),
    };
    await publishEvent(TOPICS.NUTRITION_CREATED, payload, saved.id.toString());
    return saved;
  }

  /**
   * Get all nutrition entries with their parent formula
   */
  async findAll(): Promise<FormulaNutrition[]> {
    return this.repo.find({ relations: ['formula'] });
  }

  /**
   * Get one nutrition entry by ID
   */
  async findOneById(id: number): Promise<FormulaNutrition | null> {
    return this.repo.findOne({ where: { id }, relations: ['formula'] });
  }

  /**
   * Update a nutrition entry and publish UPDATED event
   */
  async update(id: number, data: Partial<FormulaNutrition>): Promise<FormulaNutrition | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;

    this.repo.merge(entity, data);
    const updated = await this.repo.save(entity);

    const payload = {
      id: updated.id,
      formula_id: updated.formulaId,
      nutrient: updated.nutrient,
      amount: updated.amount,
      updated_at: updated.updatedAt.toISOString(),
    };
    await publishEvent(TOPICS.NUTRITION_UPDATED, payload, updated.id.toString());
    return updated;
  }

  /**
   * Delete a nutrition entry and publish DELETED event
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    const success = result.affected !== 0;
    if (success) {
      const payload = { id };
      await publishEvent(TOPICS.NUTRITION_DELETED, payload, id.toString());
    }
    return success;
  }
}

