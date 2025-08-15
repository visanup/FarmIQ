-- database: your_database_name;

-- Schema for master data
CREATE SCHEMA IF NOT EXISTS farms_master;

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION farms_master.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: farms
CREATE TABLE farms_master.farms (
    farm_id      SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    name         VARCHAR(255) NOT NULL,
    location     TEXT,
    status       VARCHAR(50) DEFAULT 'active',
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_master_farms_customer_id ON farms_master.farms(customer_id);
CREATE TRIGGER update_master_farms_updated_at
  BEFORE UPDATE ON farms_master.farms
  FOR EACH ROW EXECUTE PROCEDURE farms_master.update_updated_at_column();

-- Table: houses
CREATE TABLE farms_master.houses (
    house_id     SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    farm_id      INT NOT NULL,
    name         VARCHAR(100),
    area         NUMERIC,
    capacity     INTEGER,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_master_houses_cust_farm ON farms_master.houses(customer_id, farm_id);
CREATE TRIGGER update_master_houses_updated_at
  BEFORE UPDATE ON farms_master.houses
  FOR EACH ROW EXECUTE PROCEDURE farms_master.update_updated_at_column();

-- Table: animals
CREATE TABLE farms_master.animals (
    animal_id    SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    farm_id      INT NOT NULL,
    house_id     INT,
    species      VARCHAR(50),
    breed        VARCHAR(50),
    birth_date   DATE,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_master_animals_cust_farm_house ON farms_master.animals(customer_id, farm_id, house_id);
CREATE TRIGGER update_master_animals_updated_at
  BEFORE UPDATE ON farms_master.animals
  FOR EACH ROW EXECUTE PROCEDURE farms_master.update_updated_at_column();

-- Table: batches
CREATE TABLE farms_master.batches (
    batch_id       VARCHAR(50) PRIMARY KEY,
    customer_id    INT NOT NULL,
    farm_id        INT NOT NULL,
    species        VARCHAR(50),
    breed          VARCHAR(50),
    quantity_start INT,
    start_date     DATE NOT NULL,
    end_date       DATE,
    notes          TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_master_batches_cust_farm ON farms_master.batches(customer_id, farm_id);
CREATE TRIGGER update_master_batches_updated_at
  BEFORE UPDATE ON farms_master.batches
  FOR EACH ROW EXECUTE PROCEDURE farms_master.update_updated_at_column();
