// src/models/deviceGroup.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId
} from 'typeorm';
import { Device } from './device.model';

@Entity({ schema: 'devices', name: 'device_groups' })
export class DeviceGroup {
  @PrimaryGeneratedColumn({ name: 'group_id' })
  group_id!: number;

  /** Tenant isolation: reference to customer */
  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column('text', { nullable: true })
  note?: string;

  @Column({ nullable: true })
  category?: string;

  @ManyToOne(() => DeviceGroup, grp => grp.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })      // ← บรรทัดนี้สำคัญ
  parent?: DeviceGroup;

  @OneToMany(() => DeviceGroup, group => group.parent)
  children?: DeviceGroup[];

  @OneToMany(() => Device, device => device.group)
  devices?: Device[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;

  @RelationId((grp: DeviceGroup) => grp.parent)
  parent_id?: number;
}

