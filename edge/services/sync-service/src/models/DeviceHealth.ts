// src/models/DeviceHealth.ts
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity({ name: "device_health", schema: "sensors" })
@Index(["tenant_id", "device_id", "time"])
export class DeviceHealth {
  @PrimaryColumn("timestamptz") time!: Date;
  @PrimaryColumn("text") tenant_id!: string;
  @PrimaryColumn("text") device_id!: string;

  @Column("boolean", { nullable: true }) online?: boolean;
  @Column("text", { nullable: true }) source?: string;
  @Column("int", { nullable: true }) rssi?: number;
  @Column("bigint", { nullable: true }) uptime_s?: string; // bigint -> string
  @Column("jsonb", { nullable: true }) meta?: Record<string, any>;
}
