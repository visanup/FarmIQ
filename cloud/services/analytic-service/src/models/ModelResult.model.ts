// 3. ModelResult.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'model_results' })
@Index(['customerId', 'farmId', 'animalId', 'resultDate'])
export class ModelResult {
  @PrimaryGeneratedColumn({ name: 'result_id' })
  resultId!: number;

  @Column({ type: 'int', name: 'customer_id' })
  customerId!: number;

  @Column({ type: 'int', name: 'farm_id' })
  farmId!: number;

  @Column({ type: 'int', name: 'animal_id' })
  animalId!: number;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'batch_id' })
  batchId?: string;

  @Column({ type: 'int', nullable: true, name: 'feed_assignment_id' })
  feedAssignmentId?: number;

  @Column({ type: 'varchar', length: 100, name: 'model_name' })
  modelName!: string;

  @Column({ type: 'jsonb', name: 'prediction' })
  prediction!: any;

  @Column({ type: 'numeric', nullable: true, name: 'anomaly_score' })
  anomalyScore?: number;

  @Column({ type: 'timestamptz', name: 'result_date' })
  resultDate!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}