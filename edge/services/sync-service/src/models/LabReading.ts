// src/models/LabReading.ts
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity({ name: "lab_readings", schema: "sensors" })
@Index(["tenant_id", "station_id", "metric", "time"])
export class LabReading {
  @PrimaryColumn("timestamptz") time!: Date;
  @PrimaryColumn("text") tenant_id!: string;
  @PrimaryColumn("text") station_id!: string;
  @PrimaryColumn("text") sensor_id!: string;
  @PrimaryColumn("text") metric!: string;

  @Column("double precision") value!: number;
  @Column("text", { default: "clean" }) quality!: string;
  @Column("jsonb", { nullable: true }) payload?: Record<string, any>;
}
