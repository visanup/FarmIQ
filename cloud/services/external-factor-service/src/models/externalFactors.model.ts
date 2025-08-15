// services/external-factor-service/src/models/externalFactors.model.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'external_factors', name: 'external_factors' })
@Index('idx_external_factors_farm_id', ['farmId'])
@Index('idx_external_factors_record_date', ['recordDate'])
export class ExternalFactors {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customerId!: number;

  @Column({ name: 'batch_id', type: 'varchar', length: 50, nullable: true })
  batchId?: string;

  @Column({ name: 'farm_id', type: 'int', nullable: true })
  farmId?: number;

  @Column({ name: 'weather', type: 'jsonb', nullable: true })
  weather?: Record<string, any>;

  @Column({ name: 'disease_alert', type: 'jsonb', nullable: true })
  diseaseAlert?: Record<string, any>;

  @Column({ name: 'market_price', type: 'jsonb', nullable: true })
  marketPrice?: Record<string, any>;

  @Column({ name: 'feed_supply', type: 'jsonb', nullable: true })
  feedSupply?: Record<string, any>;

  @Column({ name: 'weather_forecast', type: 'jsonb', nullable: true })
  weatherForecast?: Record<string, any>;

  @Column({ name: 'disease_risk_score', type: 'numeric', nullable: true })
  diseaseRiskScore?: number;

  @Column({ name: 'regulatory_changes', type: 'text', nullable: true })
  regulatoryChanges?: string;

  @Column({ name: 'record_date', type: 'date' })
  recordDate!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}