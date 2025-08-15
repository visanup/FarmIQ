// src/models/farm.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'farms', name: 'farms' })
export class Farm {
  @PrimaryGeneratedColumn()
  farm_id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  location?: string;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
