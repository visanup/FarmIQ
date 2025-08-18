// /src/models/user.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'auth', name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column({ nullable: true })
  customer_id?: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password_hash!: string;

  @Column({ default: 'user' })
  role!: string;

  @Column({ nullable: true })
  email?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at!: Date;

  // ให้ตรงกับคอลัมน์ใน DB + trigger update_updated_at
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updated_at!: Date;
}

