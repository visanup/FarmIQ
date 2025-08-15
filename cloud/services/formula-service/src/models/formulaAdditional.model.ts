// services/formula-service/src/models/formulaAdditional.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Formula } from './formula.model';

@Entity({ schema: 'formulas', name: 'formula_additional' })
export class FormulaAdditional {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'formula_id' })
  formulaId!: number;

  @Column({ type: 'varchar', length: 100 })
  item!: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relation to Formula
  @ManyToOne(() => Formula, (formula: Formula) => formula.additionals, {
  onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'formula_id' })
  formula!: Formula;
}
