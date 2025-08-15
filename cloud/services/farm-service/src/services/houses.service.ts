// src/services/house.service.ts
import { AppDataSource } from '../utils/dataSource';
import { House } from '../models/house.model';
import { Repository } from 'typeorm';

export class HouseService {
  private repo: Repository<House>;

  constructor() {
    this.repo = AppDataSource.getRepository(House);
  }

  async findAll(): Promise<House[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<House | null> {
    return this.repo.findOne({ where: { house_id: id } });
  }

   // ← เพิ่มเมธอดนี้
  async findOneByCustomer(id: number, customerId: number): Promise<House | null> {
    return this.repo.findOne({
      where: {
        house_id: id,
        customer_id: customerId
      }
    });
  }
   
  async create(data: Partial<House>): Promise<House> {
    const house = this.repo.create(data);
    return this.repo.save(house);
  }

  async update(id: number, data: Partial<House>): Promise<House | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}