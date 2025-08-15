// src/models/economicData.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'economic_data' })
export class EconomicData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @Column({ length: 100 })
  cost_type!: string;

  @Column('numeric', { nullable: true })
  amount?: number;

  @Column('numeric', { nullable: true })
  animal_price?: number;

  @Column('numeric', { nullable: true })
  feed_cost?: number;

  @Column('numeric', { nullable: true })
  labor_cost?: number;

  @Column('numeric', { nullable: true })
  utility_cost?: number;

  @Column('numeric', { nullable: true })
  medication_cost?: number;

  @Column('numeric', { nullable: true })
  maintenance_cost?: number;

  @Column('numeric', { nullable: true })
  other_costs?: number;

  @Column({ type: 'date', nullable: true })
  record_date?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
