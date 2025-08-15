// src/services/deviceGroup.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { DeviceGroup } from '../models/deviceGroup.model';

export class DeviceGroupService {
  private repo: Repository<DeviceGroup>;

  constructor() {
    this.repo = AppDataSource.getRepository(DeviceGroup);
  }

  /**
   * Retrieve all device groups, including relations
   */
  async findAll(): Promise<DeviceGroup[]> {
    return this.repo.find({ relations: ['devices'] });
  }

  /**
   * Retrieve one device group by ID
   */
  async findOne(id: number): Promise<DeviceGroup | null> {
    return this.repo.findOne({
      where: { group_id: id },
      relations: ['devices', 'parent', 'children'],
    });
  }

  /**
   * Create a new device group, with optional parent hierarchy
   */
  async create(data: {
    name: string;
    note?: string;
    category?: string;
    parent_id?: number | null;
  }): Promise<DeviceGroup> {
    // Build new entity with possible parent reference
    const group = this.repo.create({
      name: data.name,
      note: data.note,
      category: data.category,
      parent: data.parent_id ? { group_id: data.parent_id } as DeviceGroup : undefined,
    });

    return this.repo.save(group);
  }

  /**
   * Update an existing device group, including changing its parent
   */
  async update(
    id: number,
    data: {
      name?: string;
      note?: string;
      category?: string;
      parent_id?: number | null;
    }
  ): Promise<DeviceGroup | null> {
    const group = await this.repo.findOne({
      where: { group_id: id },
      relations: ['devices', 'parent', 'children'],
    });
    if (!group) return null;

    if (data.name !== undefined) group.name = data.name;
    if (data.note !== undefined) group.note = data.note;
    if (data.category !== undefined) group.category = data.category;

    // Directly assign parent reference
    if (data.parent_id !== undefined) {
      group.parent = data.parent_id ? ({ group_id: data.parent_id } as any) : undefined;
    }

    return this.repo.save(group);
  }

  /**
   * Delete a device group by ID
   */
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
