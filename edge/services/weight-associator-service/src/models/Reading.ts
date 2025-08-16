// src/models/Reading.ts

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'readings', schema: 'sensors' })
export class Reading {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Index()
  @Column({ type: 'timestamptz' })
  time!: Date;

  @Index()
  @Column({ type: 'text' })
  tenant_id!: string;

  @Index()
  @Column({ type: 'text', nullable: true })
  station_id!: string | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  sensor_id!: string | null;

  @Index()
  @Column({ type: 'text' })
  metric!: string; // 'weight' | 'mass'

  @Column({ type: 'double precision', nullable: true })
  value_num!: number | null;

  @Column({ type: 'text', nullable: true })
  unit!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta!: Record<string, any> | null;
}
