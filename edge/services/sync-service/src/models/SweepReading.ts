// src/models/SweepReading.ts
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity({ name: "sweep_readings", schema: "sensors" })
@Index(["run_id", "metric", "time"])
@Index(["zone_id", "time"])
export class SweepReading {
  @PrimaryColumn("timestamptz") time!: Date;
  @PrimaryColumn("text") tenant_id!: string;
  @PrimaryColumn("text") robot_id!: string;
  @PrimaryColumn("bigint") run_id!: string;              // bigint -> string ใน JS
  @PrimaryColumn("text") sensor_id!: string;
  @PrimaryColumn("text") metric!: string;

  @Column("text", { nullable: true }) zone_id?: string;
  @Column("double precision", { nullable: true }) x?: number;
  @Column("double precision", { nullable: true }) y?: number;
  @Column("double precision") value!: number;
  @Column("text", { default: "clean" }) quality!: string; // sensors.quality_enum
  @Column("jsonb", { nullable: true }) payload?: Record<string, any>;
}
