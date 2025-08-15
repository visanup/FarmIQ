// src/models/healthRecords.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'health_records' })
export class HealthRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  animal_id!: number;

  @Column('text')
  health_status!: string;

  @Column({ length: 100, nullable: true })
  disease?: string;

  @Column('text', { nullable: true })
  vaccine?: string;

  @Column({ type: 'date', nullable: true })
  recorded_date?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
