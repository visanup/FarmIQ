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

@Entity({ schema: 'devices', name: 'device_logs' })
export class DeviceLog {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  log_id!: number;

  /** Tenant isolation: reference to customer */
  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column()
  device_id!: number;

  // ความสัมพันธ์กับ Device (device_logs.device_id -> devices.device_id)
  @ManyToOne(() => Device, device => device.status_history, { onDelete: 'CASCADE' })
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

