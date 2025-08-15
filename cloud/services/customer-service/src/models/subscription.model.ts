// src/models/subscription.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'customers', name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn()
  subscription_id!: number;

  @Column()
  customer_id!: number;

  @Column({ length: 100 })
  plan_type!: string;

  @Column({ type: 'date' })
  start_date!: string;

  @Column({ type: 'date', nullable: true })
  end_date?: string;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}