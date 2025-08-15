// src/services/grindingCondition.service.ts
import { Repository } from 'typeorm';
import { GrindingCondition } from '../models/grindingCondition.model';
import { publishEvent } from '../kafka/producer';
import { GRINDING_CONDITION_TOPIC, GrindingConditionEvents } from '../kafka/topics';

export class GrindingConditionService {
  constructor(private repo: Repository<GrindingCondition>) {}

  async create(data: Partial<GrindingCondition>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    // publish added event
    await publishEvent(
      GRINDING_CONDITION_TOPIC,
      GrindingConditionEvents.Added,
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

  async update(id: number, data: Partial<GrindingCondition>) {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (updated) {
      // publish updated event
      await publishEvent(
        GRINDING_CONDITION_TOPIC,
        GrindingConditionEvents.Updated,
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
        GRINDING_CONDITION_TOPIC,
        GrindingConditionEvents.Removed,
        toDelete
      );
    }
    return result;
  }
}

