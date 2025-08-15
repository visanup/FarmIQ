// src/services/pelletMillCondition.service.ts
import { Repository } from 'typeorm';
import { PelletMillCondition } from '../models/pelletMillCondition.model';
import { publishEvent } from '../kafka/producer';
import { PELLET_MILL_CONDITION_TOPIC, PelletMillConditionEvents } from '../kafka/topics';

export class PelletMillConditionService {
  constructor(private repo: Repository<PelletMillCondition>) {}

  async create(data: Partial<PelletMillCondition>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    // publish added event
    await publishEvent(
      PELLET_MILL_CONDITION_TOPIC,
      PelletMillConditionEvents.Added,
      saved
    );
    return saved;
  }

  async findAll() {
    return await this.repo.find();
  }

  async findById(id: number) {
    return await this.repo.findOneBy({ id });
  }

  async update(id: number, data: Partial<PelletMillCondition>) {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (updated) {
      // publish updated event
      await publishEvent(
        PELLET_MILL_CONDITION_TOPIC,
        PelletMillConditionEvents.Updated,
        updated
      );
    }
    return updated;
  }

  async delete(id: number) {
    const toDelete = await this.findById(id);
    const result = await this.repo.delete(id);
    if (toDelete) {
      // publish removed event
      await publishEvent(
        PELLET_MILL_CONDITION_TOPIC,
        PelletMillConditionEvents.Removed,
        toDelete
      );
    }
    return result;
  }
}
