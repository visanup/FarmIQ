/**
 * Corrected and reviewed entity models to match the `farms_master` schema and SQL definitions.
 * Changes:
 * 1. Updated schema to `farms_master` (instead of `farms`).
 * 2. Added `updated_at` columns with @UpdateDateColumn and mapped them.
 * 3. Ensured all column names/types/nullability match SQL.
 * 4. Imported necessary decorators.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Farm Entity
 */
@Entity({ schema: 'farms_master', name: 'farms' })
export class Farm {
  @PrimaryGeneratedColumn({ name: 'farm_id', type: 'int' })
  farm_id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'location', type: 'text', nullable: true })
  location?: string;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}