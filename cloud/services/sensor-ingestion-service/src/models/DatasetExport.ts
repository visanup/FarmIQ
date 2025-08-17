// src/models/DatasetExport.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'dataset_exports' })
export class DatasetExport {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column() dataset_s3!: string;
  @Column('int') rows!: number;
  @Column({ type: 'jsonb', default: {} }) meta_json!: Record<string, any>;

  @CreateDateColumn() created_at!: Date;
}
