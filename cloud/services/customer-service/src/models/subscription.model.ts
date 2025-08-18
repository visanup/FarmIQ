// src/models/subscription.model.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn
} from 'typeorm';
import { Customer } from './customer.model';
import { PlanCatalog } from './plan_catalog.model';

export type SubscriptionStatus = 'active' | 'paused' | 'canceled' | 'expired';

@Entity({ schema: 'customers', name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('increment')
  subscription_id!: number;

  @Column()
  customer_id!: number;

  @ManyToOne(() => Customer, (c) => c.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'customer_id' })
  customer!: Customer;

  @Column({ length: 64 })
  plan_code!: string;

  @ManyToOne(() => PlanCatalog, (p) => p.subscriptions, { eager: false })
  @JoinColumn({ name: 'plan_code', referencedColumnName: 'plan_code' })
  plan!: PlanCatalog;

  @Column({ type: 'date' })
  start_date!: string;

  @Column({ type: 'date', nullable: true })
  end_date?: string;

  @Column({ length: 32, default: 'active' })
  status!: SubscriptionStatus;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}

