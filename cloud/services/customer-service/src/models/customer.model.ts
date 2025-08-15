// src/models/customer.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'customers', name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column('text', { nullable: true })
  address?: string;

  @Column('jsonb', { nullable: true })
  billing_info?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
