// 5. PipelineMetadata.model.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'analytics', name: 'pipeline_metadata' })
export class PipelineMetadata {
  @PrimaryColumn({ type: 'uuid', name: 'run_id' })
  runId!: string;

  @Column({ type: 'text', name: 'pipeline_name' })
  pipelineName!: string;

  @Column({ type: 'text', name: 'version' })
  version!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'started_at' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', name: 'finished_at', nullable: true })
  finishedAt?: Date;

  @Column({ type: 'text', name: 'status' })
  status!: string;

  @Column({ type: 'jsonb', name: 'metrics', nullable: true })
  metrics?: any;
}