// src/models/DeviceHealth.ts
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ schema: "sensors", name: "device_health" })
export class DeviceHealth {
  @PrimaryColumn({ type: "timestamptz", name: "time" }) time!: Date;
  @PrimaryColumn({ type: "text", name: "tenant_id" })  tenantId!: string;
  @PrimaryColumn({ type: "text", name: "device_id" })  deviceId!: string;

  @Column({ type: "boolean", name: "online", nullable: true }) online?: boolean;
  @Column({ type: "text", name: "source", nullable: true })   source?: string;
  @Column({ type: "int", name: "rssi", nullable: true })      rssi?: number;
  @Column({ type: "bigint", name: "uptime_s", nullable: true }) uptimeS?: number;
  @Column({ type: "jsonb", name: "meta", nullable: true })    meta?: any;
}
