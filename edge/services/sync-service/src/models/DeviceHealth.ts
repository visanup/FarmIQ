// src/models/DeviceHealth.ts
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity({ name: "device_health", schema: "edge_sensor" })
@Index("idx_health_device_lastSeen", ["deviceId", "lastSeen"])
export class DeviceHealth {
  @PrimaryColumn({ type: "text", name: "id" })
  id!: string;

  @Column({ type: "text", name: "deviceId" })
  deviceId!: string;

  @Column({ type: "text", name: "tenantId" })
  tenantId!: string;

  @Column({ type: "text", name: "status" })
  status!: string;

  @Column({ type: "timestamp", name: "lastSeen" })
  lastSeen!: Date;

  @Column({ type: "int", name: "batteryLevel", nullable: true })
  batteryLevel?: number | null;

  @Column({ type: "int", name: "signalStrength", nullable: true })
  signalStrength?: number | null;

  @Column({ type: "double precision", name: "temperature", nullable: true })
  temperature?: number | null;

  @Column({ type: "text", array: true, name: "errors" })
  errors!: string[];

  @Column({ type: "text", array: true, name: "warnings" })
  warnings!: string[];

  @Column({ type: "jsonb", name: "metadata", nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ type: "timestamp", name: "createdAt" })
  createdAt!: Date;

  @Column({ type: "timestamp", name: "updatedAt" })
  updatedAt!: Date;
}
