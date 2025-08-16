import { Entity, PrimaryColumn, Column, Index } from "typeorm";

@Entity({ schema: "sensors", name: "readings" })
@Index("idx_readings_device_time", ["tenant", "deviceId", "time"])
@Index("idx_readings_metric_time", ["tenant", "metric", "time"])
export class SensorReading {
  @PrimaryColumn({ type: "timestamptz", name: "time" })
  time!: Date;

  @PrimaryColumn({ type: "text", name: "tenant" })
  tenant!: string;

  @PrimaryColumn({ type: "text", name: "device_id" })
  deviceId!: string;      // <-- เปลี่ยนจาก int เป็น text

  @PrimaryColumn({ type: "text", name: "metric" })
  metric!: string;

  @Column({ type: "double precision", name: "value", nullable: false })
  value!: number;

  @Column({ type: "jsonb", name: "raw_payload", nullable: true })
  rawPayload?: any;
}
