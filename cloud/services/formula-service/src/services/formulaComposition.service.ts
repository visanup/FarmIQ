// services/formula-service/src/services/formulaComposition.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { FormulaComposition } from '../models/formulaComposition.model';
import { publishEvent } from '../kafka/producer';
import { TOPICS } from '../kafka/topics';

export class FormulaCompositionService {
  private repo: Repository<FormulaComposition>;

  constructor() {
    this.repo = AppDataSource.getRepository(FormulaComposition);
  }

  /**
   * Create a new composition entry and publish CREATED event
   */
  async create(data: Partial<FormulaComposition>): Promise<FormulaComposition> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    const payload = {
      id: saved.id,
      formula_id: saved.formulaId,
      ingredient: saved.ingredient,
      percentage: saved.percentage,
      created_at: saved.createdAt.toISOString(),
    };
    await publishEvent(TOPICS.COMPOSITION_CREATED, payload, saved.id.toString());
    return saved;
  }

  /**
   * Get all compositions with their parent formula
   */
  async findAll(): Promise<FormulaComposition[]> {
    return this.repo.find({ relations: ['formula'] });
  }

  /**
   * Get one composition by ID
   */
  async findOneById(id: number): Promise<FormulaComposition | null> {
    return this.repo.findOne({ where: { id }, relations: ['formula'] });
  }

  /**
   * Update a composition entry and publish UPDATED event
   */
  async update(id: number, data: Partial<FormulaComposition>): Promise<FormulaComposition | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;

    this.repo.merge(entity, data);
    const updated = await this.repo.save(entity);

    const payload = {
      id: updated.id,
      formula_id: updated.formulaId,
      ingredient: updated.ingredient,
      percentage: updated.percentage,
      updated_at: updated.updatedAt.toISOString(),
    };
    await publishEvent(TOPICS.COMPOSITION_UPDATED, payload, updated.id.toString());
    return updated;
  }

  /**
   * Delete a composition entry and publish DELETED event
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    const success = result.affected !== 0;
    if (success) {
      const payload = { id };
      await publishEvent(TOPICS.COMPOSITION_DELETED, payload, id.toString());
    }
    return success;
  }
}
