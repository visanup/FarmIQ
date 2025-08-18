// src/models/customer.model.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, Index
} from 'typeorm';
import { Contact } from './contact.model';
import { Subscription } from './subscription.model';
import { CustomerUser } from './customer_user.model';

export type CustomerStatus = 'active' | 'suspended' | 'deleted';

@Entity({ schema: 'customers', name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn('increment')
  customer_id!: number;

  @Column({ length: 64 })
  tenant_id!: string;

  @Column({ length: 128, nullable: true })
  external_id?: string;

  @Column({ length: 255 })
  name!: string;

  @Index('idx_customers_email')
  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'jsonb', nullable: true })
  billing_info?: Record<string, unknown>;

  @Column({ length: 32, default: 'active' })
  status!: CustomerStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at?: Date | null;

  // Relations
  @OneToMany(() => Contact, (c) => c.customer)
  contacts!: Contact[];

  @OneToMany(() => Subscription, (s) => s.customer)
  subscriptions!: Subscription[];

  @OneToMany(() => CustomerUser, (m) => m.customer)
  memberships!: CustomerUser[];
}

