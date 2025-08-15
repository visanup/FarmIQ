// services/formula-service/src/services/formulaAdditional.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { FormulaAdditional } from '../models/formulaAdditional.model';
import { publishEvent } from '../kafka/producer';
import { TOPICS } from '../kafka/topics';

export class FormulaAdditionalService {
  private repo: Repository<FormulaAdditional>;

  constructor() {
    this.repo = AppDataSource.getRepository(FormulaAdditional);
  }

  /**
   * Create a new additional item and publish CREATED event
   */
  async create(data: Partial<FormulaAdditional>): Promise<FormulaAdditional> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    const payload = {
      id: saved.id,
      formula_id: saved.formulaId,
      item: saved.item,
      details: saved.details,
      created_at: saved.createdAt.toISOString(),
    };
    await publishEvent(TOPICS.ADDITIONAL_CREATED, payload, saved.id.toString());
    return saved;
  }

  /**
   * Retrieve all additional items for a given formula (or all)
   */
  async findAll(formulaId?: number): Promise<FormulaAdditional[]> {
    const options = formulaId ? { where: { formulaId } } : {};
    return this.repo.find(options);
  }

  /**
   * Get one additional item by ID
   */
  async findOneById(id: number): Promise<FormulaAdditional | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Update an additional item and publish UPDATED event
   */
  async update(id: number, data: Partial<FormulaAdditional>): Promise<FormulaAdditional | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;

    this.repo.merge(entity, data);
    const updated = await this.repo.save(entity);

    const payload = {
      id: updated.id,
      formula_id: updated.formulaId,
      item: updated.item,
      details: updated.details,
      updated_at: updated.updatedAt.toISOString(),
    };
    await publishEvent(TOPICS.ADDITIONAL_UPDATED, payload, updated.id.toString());
    return updated;
  }

  /**
   * Delete an additional item and publish DELETED event
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    const success = result.affected !== 0;
    if (success) {
      const payload = { id };
      await publishEvent(TOPICS.ADDITIONAL_DELETED, payload, id.toString());
    }
    return success;
  }
}


