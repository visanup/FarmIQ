// src/services/mixingCondition.service.ts
import { Repository } from 'typeorm';
import { MixingCondition } from '../models/mixingCondition.model';
import { publishEvent } from '../kafka/producer';
import { MIXING_CONDITION_TOPIC, MixingConditionEvents } from '../kafka/topics';

export class MixingConditionService {
  constructor(private repo: Repository<MixingCondition>) {}

  async create(data: Partial<MixingCondition>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    // publish added event
    await publishEvent(
      MIXING_CONDITION_TOPIC,
      MixingConditionEvents.Added,
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

  async update(id: number, data: Partial<MixingCondition>) {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (updated) {
      // publish updated event
      await publishEvent(
        MIXING_CONDITION_TOPIC,
        MixingConditionEvents.Updated,
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
        MIXING_CONDITION_TOPIC,
        MixingConditionEvents.Removed,
        toDelete
      );
    }
    return result;
  }
}
