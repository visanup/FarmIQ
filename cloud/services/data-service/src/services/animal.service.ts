// src/services/animal.service.ts
import { AppDataSource } from '../utils/dataSource';
import { Animal } from '../models/animal.model';
import { Repository } from 'typeorm';

export class AnimalService {
  private repo: Repository<Animal>;

  constructor() {
    this.repo = AppDataSource.getRepository(Animal);
  }

  async findAll(): Promise<Animal[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Animal | null> {
    return this.repo.findOne({ where: { animal_id: id } });
  }

  async create(data: Partial<Animal>): Promise<Animal> {
    const animal = this.repo.create(data);
    return this.repo.save(animal);
  }

  async update(id: number, data: Partial<Animal>): Promise<Animal | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
