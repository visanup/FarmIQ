// src/models/SweepReading.ts
import { Entity, PrimaryColumn, Column, Index } from "typeorm";

@Entity({ schema: "sensors", name: "sweep_readings" })
@Index("idx_swr_run_metric_time", ["runId", "metric", "time"])
@Index("idx_readings_latest", ["tenantId", "robotId", "metric", "time"])
export class SweepReading {
  @PrimaryColumn({ type: "timestamptz", name: "time" }) time!: Date;
  @PrimaryColumn({ type: "text", name: "robot_id" })    robotId!: string;
  @PrimaryColumn({ type: "bigint", name: "run_id" })    runId!: number;
  @PrimaryColumn({ type: "text", name: "sensor_id" })   sensorId!: string;
  @PrimaryColumn({ type: "text", name: "metric" })      metric!: string;

  @Column({ type: "text", name: "tenant_id" })          tenantId!: string;
  @Column({ type: "text", name: "zone_id", nullable: true }) zoneId?: string;
  @Column({ type: "double precision", name: "x", nullable: true }) x?: number;
  @Column({ type: "double precision", name: "y", nullable: true }) y?: number;
  @Column({ type: "double precision", name: "value" })  value!: number;

  // ใช้ enumName ที่มีอยู่ใน DB (quality_enum)
  @Column({ type: "enum", enumName: "quality_enum", name: "quality", default: "clean" })
  quality!: "raw" | "clean" | "anomaly" | "dlq" | "invalid" | "calibrating" | "stale";

  @Column({ type: "jsonb", name: "payload", nullable: true }) payload?: any;
}

