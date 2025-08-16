// src/models/WeightMapping.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'weight_mappings' })
export class WeightMapping {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column('uuid') media_id!: string;
  @Column('float') weight_kg!: number;
  @Column({ default: 'ready' }) status!: 'ready' | 'used' | 'invalid';

  @CreateDateColumn() created_at!: Date;
}
