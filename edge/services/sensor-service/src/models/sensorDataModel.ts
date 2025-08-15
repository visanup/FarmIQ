// services/sensor-service/src/models/sensorDataModel.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
} from "typeorm";

@Entity({ schema: "sensors", name: "sensor_data" })
@Index("idx_sensor_data_device_time", ["deviceId", "time"], { unique: false })
@Index("idx_sensor_data_topic_time", ["topic", "time"], { unique: false })
export class SensorData {
  @PrimaryColumn({ type: "timestamptz", name: "time" })
  time!: Date;

  @PrimaryColumn({ type: "int", name: "device_id" })
  deviceId!: number;

  @PrimaryColumn({ type: "text", name: "topic" })
  topic!: string;

  @Column({ type: "double precision", nullable: false })
  value!: number;

  @Column({ type: "jsonb", nullable: true, name: "raw_payload" })
  rawPayload?: any;
}

