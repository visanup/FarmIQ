// src/models/feedBatchAssign.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,      // เพิ่มการ import
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from './device.model';

@Entity({ name: 'feed_batch_assignments' })
export class FeedBatchAssignment {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignment_id!: number;

  @Column()
  feed_batch_id!: number;

  @Column({ nullable: true })
  farm_id?: number;

  @Column({ nullable: true })
  house_id?: number;

  @Column({ nullable: true })
  animal_id?: number;

  @Column({ type: 'timestamptz' })
  assigned_start!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  assigned_end?: Date;

  @Column('numeric', { nullable: true })
  feed_quantity?: number;

  @Column('text', { nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @Column({ nullable: true })
  device_id?: number;

  @ManyToOne(() => Device, device => device.feed_assignments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'device_id' })
  device?: Device;
}
