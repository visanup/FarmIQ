// src/models/SweepReading.ts
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity({ name: "sweep_readings", schema: "edge_sensor" })
@Index("idx_sweep_device_sweep_timestamp", ["deviceId", "sweepId", "timestamp"])
export class SweepReading {
  @PrimaryColumn({ type: "text", name: "id" })
  id!: string;

  @Column({ type: "text", name: "deviceId" })
  deviceId!: string;

  @Column({ type: "text", name: "farmId", nullable: true })
  farmId?: string | null;

  @Column({ type: "text", name: "tenantId" })
  tenantId!: string;

  @Column({ type: "text", name: "sweepId" })
  sweepId!: string;

  @Column({ type: "jsonb", name: "data" })
  data!: Record<string, any>;

  @Column({ type: "jsonb", name: "metadata", nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ type: "timestamp", name: "timestamp" })
  timestamp!: Date;

  @Column({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;

  @Column({ type: "timestamp", name: "updatedAt" })
  updatedAt!: Date;
}
