/**
 * House Entity
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'farms_master', name: 'houses' })
export class House {
  @PrimaryGeneratedColumn({ name: 'house_id', type: 'int' })
  house_id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column({ name: 'farm_id', type: 'int' })
  farm_id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: true })
  name?: string;

  @Column({ name: 'area', type: 'numeric', nullable: true })
  area?: number;

  @Column({ name: 'capacity', type: 'int', nullable: true })
  capacity?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}

