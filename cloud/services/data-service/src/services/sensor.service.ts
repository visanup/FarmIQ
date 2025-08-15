// src/services/sensor.service.ts
import { AppDataSource } from '../utils/dataSource';
import { SensorData } from '../models/sensor.model';
import { Repository } from 'typeorm';

export class SensorService {
  private repo: Repository<SensorData>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorData);
  }

  async findAll(): Promise<SensorData[]> {
    return this.repo.find();
  }

  async findOne(time: Date, device_id: number, topic: string): Promise<SensorData | null> {
    return this.repo.findOne({ where: { time, device_id, topic } });
  }

  async create(data: Partial<SensorData>): Promise<SensorData> {
    const sensor = this.repo.create(data);
    return this.repo.save(sensor);
  }

  async update(time: Date, device_id: number, topic: string, data: Partial<SensorData>): Promise<SensorData | null> {
    await this.repo.update({ time, device_id, topic }, data);
    return this.findOne(time, device_id, topic);
  }

  async delete(time: Date, device_id: number, topic: string): Promise<void> {
    await this.repo.delete({ time, device_id, topic });
  }
}