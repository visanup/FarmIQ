-- database: your_database_name;

CREATE SCHEMA IF NOT EXISTS farms;

-- 1. Trigger function to update updated_at
CREATE OR REPLACE FUNCTION farms.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Core tables without batch dependency
CREATE TABLE farms.farms (
    farm_id      SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    name         VARCHAR(255) NOT NULL,
    location     TEXT,
    status       VARCHAR(50) DEFAULT 'active',
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_farms_customer_id ON farms.farms(customer_id);
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON farms.farms
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.houses (
    house_id     SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    farm_id      INT NOT NULL,
    name         VARCHAR(100),
    area         NUMERIC,
    capacity     INTEGER,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_houses_cust_farm ON farms.houses(customer_id, farm_id);
CREATE TRIGGER update_houses_updated_at
  BEFORE UPDATE ON farms.houses
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.animals (
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
CREATE INDEX idx_animals_cust_farm_house ON farms.animals(customer_id, farm_id, house_id);
CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON farms.animals
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.genetic_factors (
    id           SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    animal_id    INT NOT NULL,
    test_type    VARCHAR(100),
    result       TEXT,
    test_date    DATE,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_genetic_factors_cust_animal ON farms.genetic_factors(customer_id, animal_id);
CREATE TRIGGER update_genetic_factors_updated_at
  BEFORE UPDATE ON farms.genetic_factors
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.feed_programs (
    id              SERIAL PRIMARY KEY,
    customer_id     INT NOT NULL,
    farm_id         INT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    effective_start TIMESTAMPTZ NOT NULL,
    effective_end   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_feed_programs_cust_farm ON farms.feed_programs(customer_id, farm_id);
CREATE TRIGGER update_feed_programs_updated_at
  BEFORE UPDATE ON farms.feed_programs
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.environmental_factors (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    farm_id          INT NOT NULL,
    ventilation_rate NUMERIC,
    note             TEXT,
    measurement_date DATE,
    effective_start  TIMESTAMPTZ NOT NULL,
    effective_end    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_env_factors_cust_farm ON farms.environmental_factors(customer_id, farm_id);
CREATE TRIGGER update_environmental_factors_updated_at
  BEFORE UPDATE ON farms.environmental_factors
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.housing_conditions (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    farm_id          INT NOT NULL,
    flooring_humidity NUMERIC,
    animal_density    INTEGER,
    area              NUMERIC,
    effective_start   TIMESTAMPTZ NOT NULL,
    effective_end     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_housing_conds_cust_farm ON farms.housing_conditions(customer_id, farm_id);
CREATE TRIGGER update_housing_conditions_updated_at
  BEFORE UPDATE ON farms.housing_conditions
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.water_quality (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    farm_id          INT NOT NULL,
    fe               NUMERIC,
    pb               NUMERIC,
    note             TEXT,
    measurement_date DATE,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_water_quality_cust_farm ON farms.water_quality(customer_id, farm_id);
CREATE TRIGGER update_water_quality_updated_at
  BEFORE UPDATE ON farms.water_quality
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

-- 3. Batches table
CREATE TABLE farms.batches (
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
CREATE INDEX idx_batches_cust_farm ON farms.batches(customer_id, farm_id);
CREATE TRIGGER update_farms_updated_at_on_batches
  BEFORE UPDATE ON farms.batches
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

-- 4. Tables referencing batch_id
CREATE TABLE farms.feed_intake (
    id             SERIAL PRIMARY KEY,
    customer_id    INT NOT NULL,
    farm_id        INT NOT NULL,
    animal_id      INT,
    batch_id       VARCHAR(50),
    feed_quantity  NUMERIC,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_feed_intake_batch FOREIGN KEY(batch_id) REFERENCES farms.batches(batch_id)
);
CREATE INDEX idx_feed_intake_cust_farm_batch ON farms.feed_intake(customer_id, farm_id, batch_id);
CREATE TRIGGER update_feed_intake_updated_at
  BEFORE UPDATE ON farms.feed_intake
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.health_records (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    animal_id        INT NOT NULL,
    batch_id         VARCHAR(50),
    health_status    TEXT,
    disease          VARCHAR(100),
    vaccine          TEXT,
    recorded_date    DATE,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_health_records_batch FOREIGN KEY(batch_id) REFERENCES farms.batches(batch_id)
);
CREATE INDEX idx_health_records_cust_animal_batch ON farms.health_records(customer_id, animal_id, batch_id);
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON farms.health_records
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.welfare_indicators (
    id                 SERIAL PRIMARY KEY,
    customer_id        INT NOT NULL,
    animal_id          INT NOT NULL,
    batch_id           VARCHAR(50),
    footpad_lesion     BOOLEAN,
    stress_hormone     NUMERIC,
    recorded_date      DATE,
    created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_welfare_inds_batch FOREIGN KEY(batch_id) REFERENCES farms.batches(batch_id)
);
CREATE INDEX idx_welfare_inds_cust_animal_batch ON farms.welfare_indicators(customer_id, animal_id, batch_id);
CREATE TRIGGER update_welfare_indicators_updated_at
  BEFORE UPDATE ON farms.welfare_indicators
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

CREATE TABLE farms.operational_records (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    farm_id          INT NOT NULL,
    batch_id         VARCHAR(50),
    type             VARCHAR(100),
    description      TEXT,
    record_date      DATE,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_operational_records_batch FOREIGN KEY(batch_id) REFERENCES farms.batches(batch_id)
);
CREATE INDEX idx_operational_records_cust_farm_batch ON farms.operational_records(customer_id, farm_id, batch_id);
CREATE TRIGGER update_operational_records_updated_at
  BEFORE UPDATE ON farms.operational_records
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

-- 5. Partitioned performance_metrics referencing batch_id
CREATE TABLE farms.performance_metrics (
    id                   BIGSERIAL NOT NULL,
    customer_id          INT NOT NULL,
    animal_id            INT NOT NULL,
    batch_id             VARCHAR(50),
    adg                  NUMERIC,
    fcr                  NUMERIC,
    survival_rate        NUMERIC,
    pi_score             NUMERIC,
    mortality_rate       NUMERIC,
    health_score         NUMERIC,
    behavior_score       NUMERIC,
    body_condition_score NUMERIC,
    stress_level         NUMERIC,
    disease_incidence_rate NUMERIC,
    vaccination_status   VARCHAR(50),
    recorded_date        DATE NOT NULL,
    created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id, recorded_date),
    CONSTRAINT fk_perf_metrics_batch FOREIGN KEY(batch_id) REFERENCES farms.batches(batch_id)
) PARTITION BY RANGE (recorded_date);

CREATE TABLE farms.performance_metrics_2024 PARTITION OF farms.performance_metrics
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE farms.performance_metrics_2025 PARTITION OF farms.performance_metrics
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE INDEX idx_perf_metrics_cust_animal_batch_date ON farms.performance_metrics(customer_id, animal_id, batch_id, recorded_date);
CREATE TRIGGER update_perf_metrics_updated_at
  BEFORE UPDATE ON farms.performance_metrics
  FOR EACH ROW EXECUTE PROCEDURE farms.update_updated_at_column();

