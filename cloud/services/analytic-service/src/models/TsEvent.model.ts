// 1. TsEvent.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'ts_events' })
@Index(['ts', 'source'])
export class TsEvent {
  @PrimaryGeneratedColumn({ name: 'event_id' })
  eventId!: number;

  @Column({ type: 'timestamptz', name: 'ts' })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 50 })
  source!: string;

  @Column({ type: 'int', name: 'customer_id' })
  customerId!: number;

  @Column({ type: 'int', nullable: true, name: 'farm_id' })
  farmId?: number;

  @Column({ type: 'int', nullable: true, name: 'animal_id' })
  animalId?: number;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'batch_id' })
  batchId?: string;

  @Column({ type: 'int', nullable: true, name: 'feed_assignment_id' })
  feedAssignmentId?: number;

  @Column({ type: 'text', name: 'key' })
  key!: string;

  @Column({ type: 'numeric', nullable: true, name: 'value' })
  value?: number;

  @Column({ type: 'jsonb', name: 'raw_json', nullable: true })
  rawJson?: any;

  @Column({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt!: Date;
}