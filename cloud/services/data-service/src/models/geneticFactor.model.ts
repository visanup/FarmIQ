// src/models/geneticFactor.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'genetic_factors' })
export class GeneticFactor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  animal_id!: number;

  @Column({ length: 100 })
  test_type!: string;

  @Column('text')
  result!: string;

  @Column({ type: 'date', nullable: true })
  test_date?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
