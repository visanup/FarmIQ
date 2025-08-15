// src/models/deviceLogs.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from './device.model';

@Entity({ name: 'device_logs' })
export class DeviceLog {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  log_id!: number;

  @Column()
  device_id!: number;

  @ManyToOne(() => Device, device => device.sensor_data, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @Column({ length: 50 })
  event_type!: string;

  @Column('jsonb', { nullable: true })
  event_data?: any;

  @Column({ length: 100, nullable: true })
  performed_by?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at!: Date;
}
