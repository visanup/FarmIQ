// src/models/ReadingMediaMap.ts

import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'reading_media_map', schema: process.env.DB_SCHEMA || 'sensors' })
@Index('uq_reading_media_map_norm', ['time', 'tenant_id', 'robot_id', 'station_id', 'sensor_id', 'metric', 'media_id'], {
  unique: true,
})
export class ReadingMediaMap {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  map_id!: string;

  @Column({ type: 'timestamptz' })
  time!: Date;

  @Column('text')
  tenant_id!: string;

  @Column('text', { nullable: true })
  robot_id?: string | null;

  @Column({ type: 'bigint', nullable: true })
  run_id?: string | null;

  @Column('text', { nullable: true })
  station_id?: string | null;

  @Column('text', { nullable: true })
  sensor_id?: string | null;

  @Column('text')
  metric!: string;

  @Column({ type: 'bigint' })
  media_id!: string; // FK to media_objects.media_id
}