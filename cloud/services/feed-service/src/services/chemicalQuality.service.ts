// src/services/chemicalQuality.service.ts
import { Repository } from 'typeorm';
import { ChemicalQuality } from '../models/chemicalQuality.model';
import { publishEvent } from '../kafka/producer';
import { CHEMICAL_QUALITY_TOPIC, ChemicalQualityEvents } from '../kafka/topics';

export class ChemicalQualityService {
  constructor(private repo: Repository<ChemicalQuality>) {}

  async create(data: Partial<ChemicalQuality>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    // publish event
    await publishEvent(CHEMICAL_QUALITY_TOPIC, ChemicalQualityEvents.Added, saved);
    return saved;
  }

  async findAll() {
    return await this.repo.find();
  }

  async findById(id: number) {
    return await this.repo.findOneBy({ id });
  }

  async update(id: number, data: Partial<ChemicalQuality>) {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (updated) {
      await publishEvent(CHEMICAL_QUALITY_TOPIC, ChemicalQualityEvents.Updated, updated);
    }
    return updated;
  }

  async delete(id: number) {
    const toDelete = await this.findById(id);
    const result = await this.repo.delete(id);
    if (toDelete) {
      await publishEvent(CHEMICAL_QUALITY_TOPIC, ChemicalQualityEvents.Removed, toDelete);
    }
    return result;
  }
}

