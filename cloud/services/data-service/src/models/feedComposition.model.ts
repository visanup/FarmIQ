// src/models/feedComposition.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'feed_composition' })
export class FeedComposition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @Column({ length: 13 })
  feed_no!: string;

  @Column({ length: 100 })
  feed_composition!: string;

  @Column({ type: 'timestamptz' })
  effective_start!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effective_end?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}