// 2. FeatureStore.model.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'feature_store' })
@Index(['customerId', 'farmId', 'animalId', 'featureDate'])
export class FeatureStore {
  @PrimaryGeneratedColumn({ name: 'feature_id' })
  featureId!: number;

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

  @Column({ type: 'varchar', length: 100, name: 'feature_name' })
  featureName!: string;

  @Column({ type: 'numeric', name: 'feature_value' })
  featureValue!: number;

  @Column({ type: 'timestamptz', name: 'feature_date' })
  featureDate!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}