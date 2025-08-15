// src/models/envFactors.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'environmental_factors' })
export class EnvironmentalFactor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @Column('numeric', { nullable: true })
  ventilation_rate?: number;

  @Column('text', { nullable: true })
  note?: string;

  @Column({ type: 'date', nullable: true })
  measurement_date?: string;

  @Column({ type: 'timestamptz' })
  effective_start!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effective_end?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
