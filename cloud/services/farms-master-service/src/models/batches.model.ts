/**
 * Review:
 * - The SQL schema defines tables under the "farms_master" schema, so the Entity decorator must reference schema: 'farms_master'.
 * - The `batches` table uses a VARCHAR(50) `batch_id` as the primary key, so we use @PrimaryColumn rather than @PrimaryGeneratedColumn.
 * - We include @UpdateDateColumn for the `updated_at` column to match the trigger logic.
 * - All other columns are mapped with their correct types and nullability.
 */

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'farms_master', name: 'batches' })
export class Batch {
  @PrimaryColumn({ name: 'batch_id', type: 'varchar', length: 50 })
  batch_id!: string;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column({ name: 'farm_id', type: 'int' })
  farm_id!: number;

  @Column({ name: 'species', type: 'varchar', length: 50, nullable: true })
  species?: string;

  @Column({ name: 'breed', type: 'varchar', length: 50, nullable: true })
  breed?: string;

  @Column({ name: 'quantity_start', type: 'int', nullable: true })
  quantity_start?: number;

  @Column({ name: 'start_date', type: 'date' })
  start_date!: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}