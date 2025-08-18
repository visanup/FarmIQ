// src/models/DeviceReading.ts

import { Entity, Column, PrimaryColumn, Index } from "typeorm";
@Entity({ name: "device_readings", schema: "sensors" })
@Index(["tenant_id", "device_id", "metric", "time"])
export class DeviceReading {
  @PrimaryColumn("timestamptz") time!: Date;
  @PrimaryColumn("text") tenant_id!: string;
  @PrimaryColumn("text") device_id!: string;
  @PrimaryColumn("text") metric!: string;
  @Column("text", { nullable: true }) sensor_id?: string;
  @Column("double precision") value!: number;
  @Column("text", { default: "clean" }) quality!: string;
  @Column("jsonb", { nullable: true }) payload?: Record<string, any>;
}
