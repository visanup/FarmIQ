// src/models/chemicalQuality.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeedBatch } from './feedBatch.model';

@Entity({ schema: 'feeds', name: 'chemical_quality' })
export class ChemicalQuality {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'production_date', type: 'timestamptz' })
  productionDate!: Date;

  @Column({ name: 'feed_batch_id' })
  feedBatchId!: number;

  @Column({ name: 'nutrient_name', length: 100 })
  nutrientName!: string;

  @Column({ type: 'numeric' })
  amount!: number;

  @Column({ length: 50, nullable: true })
  unit?: string;

  @Column({ name: 'customer_id', type: 'int' })
  customerId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => FeedBatch, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'production_date', referencedColumnName: 'productionDate' },
    { name: 'feed_batch_id', referencedColumnName: 'feedBatchId' },
  ])
  feedBatch!: FeedBatch;
}