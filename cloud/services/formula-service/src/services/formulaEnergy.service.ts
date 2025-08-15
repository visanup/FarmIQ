// services/formula-service/src/services/formulaEnergy.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { FormulaEnergy } from '../models/formulaEnergy.model';
import { publishEvent } from '../kafka/producer';
import { TOPICS } from '../kafka/topics';

export class FormulaEnergyService {
  private repo: Repository<FormulaEnergy>;

  constructor() {
    this.repo = AppDataSource.getRepository(FormulaEnergy);
  }

  /**
   * Create a new energy entry and publish CREATED event
   */
  async create(data: Partial<FormulaEnergy>): Promise<FormulaEnergy> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);

    const payload = {
      id: saved.id,
      formula_id: saved.formulaId,
      energy_type: saved.energyType,
      value: saved.value,
      created_at: saved.createdAt.toISOString(),
    };
    await publishEvent(TOPICS.ENERGY_CREATED, payload, saved.id.toString());
    return saved;
  }

  /**
   * Get all energy entries with their parent formula
   */
  async findAll(): Promise<FormulaEnergy[]> {
    return this.repo.find({ relations: ['formula'] });
  }

  /**
   * Get one energy entry by ID
   */
  async findOneById(id: number): Promise<FormulaEnergy | null> {
    return this.repo.findOne({ where: { id }, relations: ['formula'] });
  }

  /**
   * Update an energy entry and publish UPDATED event
   */
  async update(id: number, data: Partial<FormulaEnergy>): Promise<FormulaEnergy | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;

    this.repo.merge(entity, data);
    const updated = await this.repo.save(entity);

    const payload = {
      id: updated.id,
      formula_id: updated.formulaId,
      energy_type: updated.energyType,
      value: updated.value,
      updated_at: updated.updatedAt.toISOString(),
    };
    await publishEvent(TOPICS.ENERGY_UPDATED, payload, updated.id.toString());
    return updated;
  }

  /**
   * Delete an energy entry and publish DELETED event
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    const success = result.affected !== 0;
    if (success) {
      const payload = { id };
      await publishEvent(TOPICS.ENERGY_DELETED, payload, id.toString());
    }
    return success;
  }
}
