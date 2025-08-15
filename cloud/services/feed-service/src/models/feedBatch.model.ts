// services\feed-service\src\models\feedBatch.model.ts
import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'feeds', name: 'feed_batches' })
@Index(['productionDate', 'feedBatchId'], { unique: true })
export class FeedBatch {
  @PrimaryColumn({ name: 'production_date', type: 'timestamptz' })
  productionDate!: Date;

  @PrimaryGeneratedColumn({ name: 'feed_batch_id' })
  feedBatchId!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customerId!: number;

  @Column({ name: 'farm_id', nullable: true })
  farmId?: number;

  @Column({ name: 'formula_id', nullable: true })
  formulaId?: number;

  @Column({ name: 'formula_no', nullable: true })
  formulaNo?: number;

  @Column({ name: 'line_no', length: 50, nullable: true })
  lineNo?: string;

  @Column({ name: 'batch_no', length: 50, nullable: true })
  batchNo?: string;

  @Column({ name: 'feed_type', length: 50, nullable: true })
  feedType?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

