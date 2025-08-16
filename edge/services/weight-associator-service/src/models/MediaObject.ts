// src/models/MediaObject.ts

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'media_objects', schema: 'sensors' })
export class MediaObject {
  @PrimaryGeneratedColumn({ name: 'media_id', type: 'bigint' })
  mediaId!: string;

  @Index()
  @Column({ type: 'timestamptz' })
  time!: Date;

  @Index()
  @Column({ type: 'text' })
  tenant_id!: string;

  @Column({ type: 'text' })
  kind!: string; // 'image'

  @Column({ type: 'text' })
  bucket!: string;

  @Index()
  @Column({ type: 'text' })
  object_key!: string;

  @Column({ type: 'text', nullable: true })
  sensor_id!: string | null;

  @Column({ type: 'text', nullable: true })
  station_id!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta!: Record<string, any> | null;
}
