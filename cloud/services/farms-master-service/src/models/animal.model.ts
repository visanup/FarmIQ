// src/models/animal.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Animal Entity
 */
@Entity({ schema: 'farms_master', name: 'animals' })
export class Animal {
  @PrimaryGeneratedColumn({ name: 'animal_id', type: 'int' })
  animal_id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column({ name: 'farm_id', type: 'int' })
  farm_id!: number;

  @Column({ name: 'house_id', type: 'int', nullable: true })
  house_id?: number;

  @Column({ name: 'species', type: 'varchar', length: 50, nullable: true })
  species?: string;

  @Column({ name: 'breed', type: 'varchar', length: 50, nullable: true })
  breed?: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birth_date?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}