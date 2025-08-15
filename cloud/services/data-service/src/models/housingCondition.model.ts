// src/models/housingCondition.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'housing_conditions' })
export class HousingCondition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @Column('numeric', { nullable: true })
  flooring_humidity?: number;

  @Column('int', { nullable: true })
  animal_density?: number;

  @Column('numeric', { nullable: true })
  area?: number;

  @Column({ type: 'timestamptz' })
  effective_start!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effective_end?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
