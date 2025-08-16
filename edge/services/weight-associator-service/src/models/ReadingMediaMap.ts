// src/models/ReadingMediaMap.ts

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'reading_media_map', schema: 'sensors' })
export class ReadingMediaMap {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Index()
  @Column({ type: 'bigint' })
  media_id!: string;

  @Index()
  @Column({ type: 'bigint' })
  reading_id!: string;

  @Column({ type: 'integer' })
  delta_ms!: number;

  @Column({ type: 'text' })
  method!: string; // 'nearest' | 'window' | 'exact'

  @Column({ type: 'real', nullable: true })
  confidence!: number | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at!: Date;
}
