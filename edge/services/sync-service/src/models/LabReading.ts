// src/models/LabReading.ts
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity({ name: "lab_readings", schema: "edge_sensor" })
@Index("idx_lab_tenant_robot_timestamp", ["tenantId", "robotId", "timestamp"])
export class LabReading {
  @PrimaryColumn({ type: "text", name: "id" })
  id!: string;

  @Column({ type: "text", name: "tenantId" })
  tenantId!: string;

  @Column({ type: "text", name: "robotId" })
  robotId!: string;

  @Column({ type: "text", name: "runId" })
  runId!: string;

  @Column({ type: "text", name: "sampleId" })
  sampleId!: string;

  @Column({ type: "text", name: "metric" })
  metric!: string;

  @Column({ type: "double precision", name: "value" })
  value!: number;

  @Column({ type: "text", name: "quality" })
  quality!: string;

  @Column({ type: "jsonb", name: "payload", nullable: true })
  payload?: Record<string, any> | null;

  @Column({ type: "timestamp", name: "timestamp" })
  timestamp!: Date;

  @Column({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;

  @Column({ type: "timestamp", name: "updatedAt" })
  updatedAt!: Date;
}
