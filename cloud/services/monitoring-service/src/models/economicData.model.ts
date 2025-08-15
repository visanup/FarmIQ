// services/economic-service/src/models/economicData.model.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'economics', name: 'economic_data' })
@Index('idx_economic_data_farm_id', ['farmId'])
@Index('idx_economic_data_record_date', ['recordDate'])
export class EconomicData {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column({ name: 'farm_id', type: 'integer', nullable: true })
  farmId?: number;

  @Column({ name: 'cost_type', type: 'varchar', length: 100 })
  costType!: string;

  @Column({ name: 'amount', type: 'numeric', nullable: true })
  amount?: number;

  @Column({ name: 'animal_price', type: 'numeric', nullable: true })
  animalPrice?: number;

  @Column({ name: 'feed_cost', type: 'numeric', nullable: true })
  feedCost?: number;

  @Column({ name: 'labor_cost', type: 'numeric', nullable: true })
  laborCost?: number;

  @Column({ name: 'utility_cost', type: 'numeric', nullable: true })
  utilityCost?: number;

  @Column({ name: 'medication_cost', type: 'numeric', nullable: true })
  medicationCost?: number;

  @Column({ name: 'maintenance_cost', type: 'numeric', nullable: true })
  maintenanceCost?: number;

  @Column({ name: 'other_costs', type: 'numeric', nullable: true })
  otherCosts?: number;

  @Column({ name: 'record_date', type: 'date' })
  recordDate!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
