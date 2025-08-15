// src/models/externalFactors.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'external_factors' })
export class ExternalFactor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  farm_id!: number;

  @Column('jsonb', { nullable: true })
  weather?: any;

  @Column('jsonb', { nullable: true })
  disease_alert?: any;

  @Column('jsonb', { nullable: true })
  market_price?: any;

  @Column('jsonb', { nullable: true })
  feed_supply?: any;

  @Column('jsonb', { nullable: true })
  weather_forecast?: any;

  @Column('numeric', { nullable: true })
  disease_risk_score?: number;

  @Column('text', { nullable: true })
  regulatory_changes?: string;

  @Column({ type: 'date', nullable: true })
  record_date?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
