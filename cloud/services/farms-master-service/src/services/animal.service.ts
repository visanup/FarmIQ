// src/services/animal.service.ts
/**
 * AnimalService with Kafka pub-sub integration
 */
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { Animal } from '../models/animal.model';
import { publishEvent } from '../kafka/producer';
import { topics } from '../kafka/topics';

export class AnimalService {
  private repo: Repository<Animal>;

  constructor() {
    this.repo = AppDataSource.getRepository(Animal);
  }

  async findAll(filters?: { customerId?: number; farmId?: number }): Promise<Animal[]> {
    const where: Partial<Animal> = {};
    if (filters?.customerId !== undefined) where.customer_id = filters.customerId;
    if (filters?.farmId !== undefined) where.farm_id = filters.farmId;
    return this.repo.find({ where });
  }

  async findOne(id: number): Promise<Animal | null> {
    return this.repo.findOne({ where: { animal_id: id } });
  }

  async findOneByCustomer(id: number, customerId: number): Promise<Animal | null> {
    return this.repo.findOne({ where: { animal_id: id, customer_id: customerId } });
  }

  async create(data: Partial<Animal>): Promise<Animal> {
    const animal = this.repo.create(data);
    const saved = await this.repo.save(animal);

    // Publish created event
    await publishEvent(
      topics.ANIMAL_CREATED,
      {
        animal_id: saved.animal_id,
        customer_id: saved.customer_id,
        farm_id: saved.farm_id,
        house_id: saved.house_id,
        species: saved.species,
        breed: saved.breed,
        birth_date: saved.birth_date,        // Use raw value (string or Date)
        created_at: (saved.created_at as Date).toISOString(),
        updated_at: (saved.updated_at as Date).toISOString(),
      },
      saved.animal_id.toString(),
    );

    return saved;
  }

  async update(id: number, data: Partial<Animal>): Promise<Animal | null> {
    const before = await this.findOne(id);
    await this.repo.update({ animal_id: id }, data);
    const updated = await this.findOne(id);
    if (updated) {
      // Publish updated event
      await publishEvent(
        topics.ANIMAL_UPDATED,
        {
          animal_id: updated.animal_id,
          changed_fields: data,
          updated_at: (updated.updated_at as Date).toISOString(),
        },
        updated.animal_id.toString(),
      );
    }
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.findOne(id);
    const result = await this.repo.delete({ animal_id: id });
    const success = (result.affected ?? 0) > 0;

    if (success && existing) {
      // Publish deleted event
      await publishEvent(
        topics.ANIMAL_DELETED,
        {
          animal_id: existing.animal_id,
          customer_id: existing.customer_id,
          farm_id: existing.farm_id,
          house_id: existing.house_id,
          deleted_at: new Date().toISOString(),
        },
        existing.animal_id.toString(),
      );
    }

    return success;
  }
}