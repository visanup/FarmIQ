// src/models/deviceTypes.model.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Device } from './device.model';

@Entity({ name: 'device_types' })
export class DeviceType {
  @PrimaryGeneratedColumn()
  type_id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 50, nullable: true })
  icon_css_class?: string;

  @Column('text', { nullable: true })
  default_image_url?: string;

  @OneToMany(() => Device, device => device.type)
  devices?: Device[];
}