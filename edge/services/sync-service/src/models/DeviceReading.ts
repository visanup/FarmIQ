// src/models/DeviceReading.ts
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity({ name: "device_readings", schema: "edge_sensor" })
@Index("idx_device_tenant_robot_device_timestamp", ["tenantId", "robotId", "deviceId", "timestamp"])
export class DeviceReading {
  @PrimaryColumn({ type: "text", name: "id" })
  id!: string;

  @Column({ type: "text", name: "tenantId" })
  tenantId!: string;

  @Column({ type: "text", name: "robotId" })
  robotId!: string;

  @Column({ type: "text", name: "deviceId" })
  deviceId!: string;

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
