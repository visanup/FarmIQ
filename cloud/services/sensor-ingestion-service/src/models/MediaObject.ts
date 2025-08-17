// src/models/MediaObject.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'media_objects' })
export class MediaObject {
  @PrimaryGeneratedColumn('uuid') media_id!: string;

  @CreateDateColumn() time!: Date;
  @Column() tenant_id!: string;
  @Column({ default: 'image' }) kind!: string;
  @Column() bucket!: string;
  @Column() object_key!: string;

  @Column({ nullable: true }) sha256?: string;
  @Column({ type: 'int', nullable: true }) width?: number;
  @Column({ type: 'int', nullable: true }) height?: number;

  @Column({ type: 'jsonb', nullable: true }) meta?: Record<string, any>;
}
