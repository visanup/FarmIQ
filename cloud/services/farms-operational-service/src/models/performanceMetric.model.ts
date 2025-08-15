// src/models/performanceMetrics.model.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'farms_operational', name: 'performance_metrics' })
export class PerformanceMetric {
  @PrimaryColumn('bigint')
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @PrimaryColumn({ type: 'date' })
  recorded_date!: string;

  @Column()
  animal_id!: number;

  @Column('numeric', { nullable: true })
  adg?: number;

  @Column('numeric', { nullable: true })
  fcr?: number;

  @Column('numeric', { nullable: true })
  survival_rate?: number;

  @Column('numeric', { nullable: true })
  pi_score?: number;

  @Column('numeric', { nullable: true })
  mortality_rate?: number;

  @Column('numeric', { nullable: true })
  health_score?: number;

  @Column('numeric', { nullable: true })
  behavior_score?: number;

  @Column('numeric', { nullable: true })
  body_condition_score?: number;

  @Column('numeric', { nullable: true })
  stress_level?: number;

  @Column('numeric', { nullable: true })
  disease_incidence_rate?: number;

  @Column({ length: 50, nullable: true })
  vaccination_status?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
