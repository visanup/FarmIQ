// src/models/MediaObject.ts

import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'media_objects', schema: process.env.DB_SCHEMA || 'sensors' })
export class MediaObject {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  media_id!: string; // keep as string to avoid bigint precision loss

  @Column({ type: 'timestamptz', default: () => 'now()' })
  time!: Date;

  @Column('text')
  tenant_id!: string;

  @Column('text')
  kind!: string; // e.g., 'image' | 'video'

  @Column('text')
  bucket!: string;

  @Column('text')
  @Index()
  object_key!: string;

  @Column('text', { nullable: true })
  sha256?: string | null;

  @Column('int', { nullable: true })
  width?: number | null;

  @Column('int', { nullable: true })
  height?: number | null;

  @Column('jsonb', { nullable: true })
  meta?: Record<string, any> | null;
}