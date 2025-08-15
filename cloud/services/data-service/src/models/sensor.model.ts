// src/models/sensor.model.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Device } from './device.model';

@Entity({ name: 'sensor_data' })
export class SensorData {
  @PrimaryColumn({ type: 'timestamptz' })
  time!: Date;

  @PrimaryColumn()
  device_id!: number;

  @ManyToOne(() => Device, device => device.sensor_data, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @PrimaryColumn('text')
  topic!: string;

  @Column('double precision')
  value!: number;

  @Column('jsonb', { nullable: true })
  raw_payload?: any;
}

