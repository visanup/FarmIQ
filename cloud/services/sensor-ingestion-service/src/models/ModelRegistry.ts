// src/models/ModelRegistry.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'model_registry' })
export class ModelRegistry {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column() model_name!: string;
  @Column() version!: string;
  @Column() artifact_s3!: string;

  @Column({ type: 'jsonb', default: {} }) metrics_json!: Record<string, any>;
  @Column({ default: false }) is_active!: boolean;

  @CreateDateColumn() created_at!: Date;
}
