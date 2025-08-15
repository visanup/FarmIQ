// src/models/animal.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'farms', name: 'animals' })
export class Animal {
  @PrimaryGeneratedColumn()
  animal_id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column()
  farm_id!: number;

  @Column({ nullable: true })
  house_id?: number;

  @Column({ length: 50, nullable: true })
  species?: string;

  @Column({ length: 50, nullable: true })
  breed?: string;

  @Column({ type: 'date', nullable: true })
  birth_date?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}