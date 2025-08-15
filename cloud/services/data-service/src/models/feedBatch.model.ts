// src/models/feedBatch.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'feed_batches' })
export class FeedBatch {
  @PrimaryGeneratedColumn()
  feed_batch_id!: number;

  @Column({ nullable: true })
  farm_id?: number;

  @Column({ nullable: true })
  formula_id?: number;

  @Column({ length: 50, nullable: true })
  batch_no?: string;

  @Column({ type: 'timestamptz', nullable: true })
  production_date?: Date;

  @Column({ length: 50, nullable: true })
  feed_type?: string;

  @Column('jsonb', { nullable: true })
  physical_quality?: any;

  @Column('jsonb', { nullable: true })
  chemical_quality?: any;

  @Column('jsonb', { nullable: true })
  pellet_mill_condition?: any;

  @Column('jsonb', { nullable: true })
  mixing_condition?: any;

  @Column('jsonb', { nullable: true })
  grinding_condition?: any;

  @Column('jsonb', { nullable: true })
  formula_info?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}