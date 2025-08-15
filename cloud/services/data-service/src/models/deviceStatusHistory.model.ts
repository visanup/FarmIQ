// src/models/deviceStatusHistory.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from './device.model';

@Entity({ name: 'device_status_history' })
export class DeviceStatusHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  device_id!: number;

  @ManyToOne(() => Device, device => device.status_history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @Column({ length: 100, nullable: true })
  performed_by?: string;

  @Column({ length: 50 })
  status!: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  changed_at!: Date;

  @Column('text', { nullable: true })
  note?: string;
}
