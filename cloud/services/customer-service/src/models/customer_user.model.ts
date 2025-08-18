// src/models/customer_user.model.ts

import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Unique, Index
} from 'typeorm';
import { Customer } from './customer.model';

export type CustomerUserRole = 'owner' | 'admin' | 'member' | 'viewer';

@Entity({ schema: 'customers', name: 'customer_users' })
@Unique('uq_customer_users_customer_user', ['customer_id', 'user_id'])
export class CustomerUser {
  @PrimaryGeneratedColumn('increment')
  customer_user_id!: number;

  @Column()
  customer_id!: number;

  @ManyToOne(() => Customer, (c) => c.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'customer_id' })
  customer!: Customer;

  @Index()
  @Column({ length: 128 })
  user_id!: string; // อ้างถึง user จาก auth-service (sub)

  @Column({ length: 32, default: 'member' })
  role!: CustomerUserRole;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
