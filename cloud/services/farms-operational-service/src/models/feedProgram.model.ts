// src/models/feedProgram.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'farms_operational', name: 'feed_programs' })
export class FeedProgram {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column()
  farm_id!: number;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'timestamptz' })
  effective_start!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effective_end?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}