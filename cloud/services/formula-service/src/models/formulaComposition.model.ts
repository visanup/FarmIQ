// services/formula-service/src/models/formulaComposition.model.ts
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

@Entity({ schema: 'formulas', name: 'formula_composition' })
export class FormulaComposition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'formula_id' })
  formulaId!: number;

  @Column({ type: 'varchar', length: 255 })
  ingredient!: string;

  @Column({ type: 'numeric' })
  percentage!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relation to Formula
  @ManyToOne(() => Formula, (formula: Formula) => formula.compositions, {
  onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'formula_id' })
  formula!: Formula;
}
