// src/models/feedBatchAssignments.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeedBatch } from '../models/feedBatch.model';

@Entity({ schema: 'feeds', name: 'feed_batch_assignments' })
export class FeedBatchAssignment {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customerId!: number;

  @Column({ name: 'production_date', type: 'timestamptz' })
  productionDate!: Date;

  @Column({ name: 'feed_batch_id' })
  feedBatchId!: number;

  @Column({ name: 'farm_id', nullable: true })
  farmId?: number;

  @Column({ name: 'house_id', nullable: true })
  houseId?: number;

  @Column({ name: 'animal_id', nullable: true })
  animalId?: number;

  @Column({ name: 'assigned_start', type: 'timestamptz' })
  assignedStart!: Date;

  @Column({ name: 'assigned_end', type: 'timestamptz', nullable: true })
  assignedEnd?: Date;

  @Column({ name: 'feed_quantity', type: 'numeric', nullable: true })
  feedQuantity?: number;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => FeedBatch, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'production_date', referencedColumnName: 'productionDate' },
    { name: 'feed_batch_id', referencedColumnName: 'feedBatchId' },
  ])
  feedBatch!: FeedBatch;
}
