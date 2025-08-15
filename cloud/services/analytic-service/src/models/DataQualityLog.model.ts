// 4. DataQualityLog.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'data_quality_logs' })
@Index(['runId', 'tableName'])
export class DataQualityLog {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  logId!: number;

  @Column({ type: 'uuid', name: 'run_id' })
  runId!: string;

  @Column({ type: 'text', name: 'table_name' })
  tableName!: string;

  @Column({ type: 'text', name: 'record_id', nullable: true })
  recordId?: string;

  @Column({ type: 'text', name: 'issue_type' })
  issueType!: string;

  @Column({ type: 'jsonb', name: 'details', nullable: true })
  details?: any;

  @Column({ type: 'timestamptz', name: 'logged_at', default: () => 'NOW()' })
  loggedAt!: Date;
}