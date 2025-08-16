// src/models/DeviceReading.ts
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ schema: "sensors", name: "device_readings" })
export class DeviceReading {
  @PrimaryColumn({ type: "timestamptz", name: "time" }) time!: Date;
  @PrimaryColumn({ type: "text", name: "tenant_id" })  tenantId!: string;
  @PrimaryColumn({ type: "text", name: "device_id" })  deviceId!: string;
  @PrimaryColumn({ type: "text", name: "metric" })     metric!: string;

  // คอลัมน์ PK ที่ generate โดย DB
  @PrimaryColumn({ type: "text", name: "sensor_id_norm" })
  sensorIdNorm!: string; // ไม่ต้องเซ็ตตอน insert (DB จะคำนวณเอง)

  // ตัวจริง (nullable)
  @Column({ type: "text", name: "sensor_id", nullable: true })
  sensorId?: string | null;

  @Column({ type: "double precision", name: "value" }) value!: number;

  @Column({
    type: "enum", enumName: "quality_enum", name: "quality", default: "clean"
  })
  quality!: "raw"|"clean"|"anomaly"|"dlq"|"invalid"|"calibrating"|"stale";

  @Column({ type: "jsonb", name: "payload", nullable: true })
  payload?: any;
}
