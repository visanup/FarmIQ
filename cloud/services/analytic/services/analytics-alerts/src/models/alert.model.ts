// src/models/alert.model.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Alert entity for analytics-alerts service
 * Represents an alert in the system
 */
@Entity({ name: 'analytics_alerts', schema: 'analytics' })
export class Alert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  type!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'jsonb' })
  metadata!: any;

  @Column({ type: 'boolean', default: false })
  is_resolved!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at?: Date;

  @Column({ type: 'text' })
  tenant_id!: string;

  @Column({ type: 'text' })
  factory_id!: string;

  @Column({ type: 'text' })
  device_id!: string;

  @Column({ type: 'text' })
  metric!: string;

  @Column({ type: 'double precision' })
  value!: number;

  @Column({ type: 'timestamp' })
  alert_time!: Date;

  @Column({ type: 'text' })
  severity!: string;

  @Column({ type: 'text' })
  alert_type!: string;

  @Column({ type: 'jsonb', nullable: true })
  additional_info?: any;
}