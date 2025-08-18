// src/models/StreamState.ts

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'stream_state', schema: "sensors" })              // จะไปอยู่ในสคีมาที่ตั้งใน DataSource (เช่น sensors)
@Index(['name'], { unique: true })
export class StreamState {
  @PrimaryColumn({ type: 'text' })
  name!: string;                               // เช่น 'sweep' | 'device' | 'lab' ฯลฯ

  @Column({ type: 'timestamptz', nullable: true })
  last_time!: Date | null;

  @Column({ type: 'text', nullable: true })
  tenant_id!: string | null;

  @Column({ type: 'text', nullable: true })
  robot_id!: string | null;

  @Column({ type: 'text', nullable: true })
  run_id!: string | null;

  @Column({ type: 'text', nullable: true })
  sensor_id!: string | null;

  @Column({ type: 'text', nullable: true })
  metric!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  last_key!: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
