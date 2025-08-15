// src/services/physicalQuality.service.ts
import { Repository } from 'typeorm';
import { PhysicalQuality } from '../models/physicalQuality.model';
import { publishEvent } from '../kafka/producer';
import { PHYSICAL_QUALITY_TOPIC, PhysicalQualityEvents } from '../kafka/topics';

export class PhysicalQualityService {
  constructor(private repo: Repository<PhysicalQuality>) {}

  async create(data: Partial<PhysicalQuality>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    // publish added event
    await publishEvent(
      PHYSICAL_QUALITY_TOPIC,
      PhysicalQualityEvents.Added,
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

  async update(id: number, data: Partial<PhysicalQuality>) {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (updated) {
      // publish updated event
      await publishEvent(
        PHYSICAL_QUALITY_TOPIC,
        PhysicalQualityEvents.Updated,
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
        PHYSICAL_QUALITY_TOPIC,
        PhysicalQualityEvents.Removed,
        toDelete
      );
    }
    return result;
  }
}
