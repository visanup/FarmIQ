CREATE SCHEMA IF NOT EXISTS formulas;

-- ตารางหลักสูตรอาหาร
CREATE TABLE formulas.formula (
  formula_id SERIAL PRIMARY KEY,
  formula_no VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ตารางสูตรส่วนประกอบ composition
CREATE TABLE formulas.formula_composition (
  id SERIAL PRIMARY KEY,
  formula_id INTEGER NOT NULL,
    -- REFERENCES formulas.formula(formula_id) ON DELETE CASCADE,
  ingredient VARCHAR(255) NOT NULL,
  percentage NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ตารางสูตรข้อมูลพลังงาน
CREATE TABLE formulas.formula_energy (
  id SERIAL PRIMARY KEY,
  formula_id INTEGER NOT NULL, 
    -- REFERENCES formulas.formula(formula_id) ON DELETE CASCADE,
  energy_type VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ตารางสูตรข้อมูลโภชนาการ
CREATE TABLE formulas.formula_nutrition (
  id SERIAL PRIMARY KEY,
  formula_id INTEGER NOT NULL, 
    -- REFERENCES formulas.formula(formula_id) ON DELETE CASCADE,
  nutrient VARCHAR(100) NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ตารางสูตรข้อมูลเพิ่มเติม (วิตามิน, แร่ธาตุ ฯลฯ)
CREATE TABLE formulas.formula_additional (
  id SERIAL PRIMARY KEY,
  formula_id INTEGER NOT NULL,
    -- REFERENCES formulas.formula(formula_id) ON DELETE CASCADE,
  item VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger function สำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION formulas.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers ถ้ามีอยู่แล้ว
DROP TRIGGER IF EXISTS update_formula_updated_at ON formulas.formula;
DROP TRIGGER IF EXISTS update_formula_composition_updated_at ON formulas.formula_composition;
DROP TRIGGER IF EXISTS update_formula_energy_updated_at ON formulas.formula_energy;
DROP TRIGGER IF EXISTS update_formula_nutrition_updated_at ON formulas.formula_nutrition;
DROP TRIGGER IF EXISTS update_formula_additional_updated_at ON formulas.formula_additional;

-- สร้าง triggers ใหม่
CREATE TRIGGER update_formula_updated_at
BEFORE UPDATE ON formulas.formula
FOR EACH ROW EXECUTE PROCEDURE formulas.update_updated_at_column();

CREATE TRIGGER update_formula_composition_updated_at
BEFORE UPDATE ON formulas.formula_composition
FOR EACH ROW EXECUTE PROCEDURE formulas.update_updated_at_column();

CREATE TRIGGER update_formula_energy_updated_at
BEFORE UPDATE ON formulas.formula_energy
FOR EACH ROW EXECUTE PROCEDURE formulas.update_updated_at_column();

CREATE TRIGGER update_formula_nutrition_updated_at
BEFORE UPDATE ON formulas.formula_nutrition
FOR EACH ROW EXECUTE PROCEDURE formulas.update_updated_at_column();

CREATE TRIGGER update_formula_additional_updated_at
BEFORE UPDATE ON formulas.formula_additional
FOR EACH ROW EXECUTE PROCEDURE formulas.update_updated_at_column();
