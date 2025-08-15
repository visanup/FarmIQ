// src/models/physicalQuality.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeedBatch } from './feedBatch.model';

@Entity({ schema: 'feeds', name: 'physical_quality' })
export class PhysicalQuality {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customerId!: number;

  @Column({ name: 'production_date', type: 'timestamptz' })
  productionDate!: Date;

  @Column({ name: 'feed_batch_id' })
  feedBatchId!: number;

  @Column({ name: 'property_name', length: 100 })
  propertyName!: string;

  @Column({ name: 'property_value', type: 'numeric' })
  propertyValue!: number;

  @Column({ length: 50, nullable: true })
  unit?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => FeedBatch, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'production_date', referencedColumnName: 'productionDate' },
    { name: 'feed_batch_id', referencedColumnName: 'feedBatchId' },
  ])
  feedBatch!: FeedBatch;
}


