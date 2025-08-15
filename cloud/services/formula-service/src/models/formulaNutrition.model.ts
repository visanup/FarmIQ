// services/formula-service/src/models/formulaNutrition.model.ts
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

@Entity({ schema: 'formulas', name: 'formula_nutrition' })
export class FormulaNutrition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'formula_id' })
  formulaId!: number;

  @Column({ type: 'varchar', length: 100 })
  nutrient!: string;

  @Column({ type: 'numeric' })
  amount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relation to Formula
  @ManyToOne(() => Formula, (formula: Formula) => formula.nutritions, {
  onDelete: 'CASCADE',
  })
  
  @JoinColumn({ name: 'formula_id' })
  formula!: Formula;
}
