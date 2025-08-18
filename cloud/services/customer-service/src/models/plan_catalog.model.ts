// src/models/plan_catalog.model.ts

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './subscription.model';

@Entity({ schema: 'customers', name: 'plan_catalog' })
export class PlanCatalog {
  @PrimaryColumn({ length: 64 })
  plan_code!: string; // PRO/TEAM/ENTERPRISE

  @Column({ length: 128 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  entitlements?: Record<string, unknown>; // { max_devices: 50, ... }

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => Subscription, (s) => s.plan)
  subscriptions!: Subscription[];
}
