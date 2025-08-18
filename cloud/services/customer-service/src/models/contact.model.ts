// src/models/contact.model.ts

import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn
} from 'typeorm';
import { Customer } from './customer.model';

@Entity({ schema: 'customers', name: 'contacts' })
export class Contact {
  @PrimaryGeneratedColumn('increment')
  contact_id!: number;

  @Column()
  customer_id!: number;

  @ManyToOne(() => Customer, (c) => c.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'customer_id' })
  customer!: Customer;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column({ length: 64, nullable: true }) // owner|ops|billing ฯลฯ
  role?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
