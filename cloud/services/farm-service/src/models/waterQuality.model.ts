// src/models/waterQuality.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'farms', name: 'water_quality' })
export class WaterQuality {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column()
  farm_id!: number;

  @Column('numeric', { nullable: true })
  fe?: number;

  @Column('numeric', { nullable: true })
  pb?: number;

  @Column('text', { nullable: true })
  note?: string;

  @Column({ type: 'date', nullable: true })
  measurement_date?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
