// src/kafka/topics.ts
/**
 * Centralized topic and event name constants
 */
export const TOPICS = {
  // Formula entity events
  FORMULA_CREATED: 'formulas.formula.created',
  FORMULA_UPDATED: 'formulas.formula.updated',
  FORMULA_DELETED: 'formulas.formula.deleted',

  // Composition sub-entity events
  COMPOSITION_CREATED: 'formulas.formula_composition.created',
  COMPOSITION_UPDATED: 'formulas.formula_composition.updated',
  COMPOSITION_DELETED: 'formulas.formula_composition.deleted',

  // Energy details events
  ENERGY_CREATED: 'formulas.formula_energy.created',
  ENERGY_UPDATED: 'formulas.formula_energy.updated',
  ENERGY_DELETED: 'formulas.formula_energy.deleted',

  // Nutrition details events
  NUTRITION_CREATED: 'formulas.formula_nutrition.created',
  NUTRITION_UPDATED: 'formulas.formula_nutrition.updated',
  NUTRITION_DELETED: 'formulas.formula_nutrition.deleted',

  // Additional items events
  ADDITIONAL_CREATED: 'formulas.formula_additional.created',
  ADDITIONAL_UPDATED: 'formulas.formula_additional.updated',
  ADDITIONAL_DELETED: 'formulas.formula_additional.deleted',
};