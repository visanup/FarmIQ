// src/models/house.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ schema: 'farms', name: 'houses' })
export class House {
  @PrimaryGeneratedColumn()
  house_id!: number;

  @Column({ name: 'customer_id', type: 'int' })
  customer_id!: number;

  @Column()
  farm_id!: number;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column('numeric', { nullable: true })
  area?: number;

  @Column('int', { nullable: true })
  capacity?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
