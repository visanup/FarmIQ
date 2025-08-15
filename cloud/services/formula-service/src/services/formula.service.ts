// services/formula-service/src/services/formula.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { Formula } from '../models/formula.model';
import { publishEvent } from '../kafka/producer';
import { TOPICS } from '../kafka/topics';

export class FormulaService {
  private formulaRepository: Repository<Formula>;

  constructor() {
    this.formulaRepository = AppDataSource.getRepository(Formula);
  }

  /**
   * Create a new formula and publish a CREATED event
   */
  async create(data: Partial<Formula>): Promise<Formula> {
    const formula = this.formulaRepository.create(data);
    const saved = await this.formulaRepository.save(formula);

    // Build payload for Kafka
    const payload = {
      formula_id: saved.formulaId,
      formula_no: saved.formulaNo,
      name: saved.name,
      description: saved.description,
      created_at: saved.createdAt.toISOString(),
    };

    // Publish event
    await publishEvent(TOPICS.FORMULA_CREATED, payload, saved.formulaId.toString());
    return saved;
  }

  /**
   * Get all formulas
   */
  async findAll(): Promise<Formula[]> {
    return this.formulaRepository.find({
      relations: ['compositions', 'energies', 'nutritions', 'additionals'],
    });
  }

  /**
   * Get one formula by ID
   */
  async findOneById(id: number): Promise<Formula | null> {
    return this.formulaRepository.findOne({
      where: { formulaId: id },
      relations: ['compositions', 'energies', 'nutritions', 'additionals'],
    });
  }

  /**
   * Update a formula and publish an UPDATED event
   */
  async update(id: number, data: Partial<Formula>): Promise<Formula | null> {
    const formula = await this.formulaRepository.findOneBy({ formulaId: id });
    if (!formula) return null;

    this.formulaRepository.merge(formula, data);
    const updated = await this.formulaRepository.save(formula);

    const payload = {
      formula_id: updated.formulaId,
      name: updated.name,
      description: updated.description,
      updated_at: updated.updatedAt.toISOString(),
    };

    await publishEvent(TOPICS.FORMULA_UPDATED, payload, updated.formulaId.toString());
    return updated;
  }

  /**
   * Delete a formula and publish a DELETED event
   */
  async delete(id: number): Promise<boolean> {
    const deleted = await this.formulaRepository.delete(id);
    const success = deleted.affected !== 0;

    if (success) {
      const payload = { formula_id: id };
      await publishEvent(TOPICS.FORMULA_DELETED, payload, id.toString());
    }

    return success;
  }
}
