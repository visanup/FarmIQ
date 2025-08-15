-- database: your_database_name;

-- Schema for operational data with batch_id added
CREATE SCHEMA IF NOT EXISTS farms_operational;

-- 1. Trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION farms_operational.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Operational tables (all include batch_id)

-- feed_intake
CREATE TABLE farms_operational.feed_intake (
    id             SERIAL PRIMARY KEY,
    customer_id    INT NOT NULL,
    farm_id        INT NOT NULL,
    animal_id      INT,
    batch_id       VARCHAR(50),
    feed_quantity  NUMERIC,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_feed_intake_farm   FOREIGN KEY(farm_id)   REFERENCES farms_master.farms(farm_id),
    CONSTRAINT fk_feed_intake_animal FOREIGN KEY(animal_id) REFERENCES farms_master.animals(animal_id),
    CONSTRAINT fk_feed_intake_batch  FOREIGN KEY(batch_id)  REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_feed_intake_cust_farm_batch ON farms_operational.feed_intake(customer_id, farm_id, batch_id);
CREATE TRIGGER update_feed_intake_updated_at
  BEFORE UPDATE ON farms_operational.feed_intake
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- genetic_factors
CREATE TABLE farms_operational.genetic_factors (
    id           SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    animal_id    INT NOT NULL,
    batch_id     VARCHAR(50),
    test_type    VARCHAR(100),
    result       TEXT,
    test_date    DATE,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_genetic_factors_animal FOREIGN KEY(animal_id) REFERENCES farms_master.animals(animal_id),
    CONSTRAINT fk_genetic_factors_batch  FOREIGN KEY(batch_id)  REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_genetic_factors_cust_animal_batch ON farms_operational.genetic_factors(customer_id, animal_id, batch_id);
CREATE TRIGGER update_genetic_factors_updated_at
  BEFORE UPDATE ON farms_operational.genetic_factors
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- feed_programs
CREATE TABLE farms_operational.feed_programs (
    id              SERIAL PRIMARY KEY,
    customer_id     INT NOT NULL,
    farm_id         INT NOT NULL,
    batch_id        VARCHAR(50),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    effective_start TIMESTAMPTZ NOT NULL,
    effective_end   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_feed_programs_farm  FOREIGN KEY(farm_id)  REFERENCES farms_master.farms(farm_id),
    CONSTRAINT fk_feed_programs_batch FOREIGN KEY(batch_id) REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_feed_programs_cust_farm_batch ON farms_operational.feed_programs(customer_id, farm_id, batch_id);
CREATE TRIGGER update_feed_programs_updated_at
  BEFORE UPDATE ON farms_operational.feed_programs
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- environmental_factors
CREATE TABLE farms_operational.environmental_factors (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    farm_id          INT NOT NULL,
    batch_id         VARCHAR(50),
    ventilation_rate NUMERIC,
    note             TEXT,
    measurement_date DATE,
    effective_start  TIMESTAMPTZ NOT NULL,
    effective_end    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_env_factors_farm  FOREIGN KEY(farm_id)  REFERENCES farms_master.farms(farm_id),
    CONSTRAINT fk_env_factors_batch FOREIGN KEY(batch_id) REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_env_factors_cust_farm_batch ON farms_operational.environmental_factors(customer_id, farm_id, batch_id);
CREATE TRIGGER update_environmental_factors_updated_at
  BEFORE UPDATE ON farms_operational.environmental_factors
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- housing_conditions
CREATE TABLE farms_operational.housing_conditions (
    id                SERIAL PRIMARY KEY,
    customer_id       INT NOT NULL,
    farm_id           INT NOT NULL,
    batch_id          VARCHAR(50),
    flooring_humidity NUMERIC,
    animal_density    INTEGER,
    area              NUMERIC,
    effective_start   TIMESTAMPTZ NOT NULL,
    effective_end     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_housing_conds_farm  FOREIGN KEY(farm_id)   REFERENCES farms_master.farms(farm_id),
    CONSTRAINT fk_housing_conds_batch FOREIGN KEY(batch_id)  REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_housing_conds_cust_farm_batch ON farms_operational.housing_conditions(customer_id, farm_id, batch_id);
CREATE TRIGGER update_housing_conditions_updated_at
  BEFORE UPDATE ON farms_operational.housing_conditions
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- water_quality
CREATE TABLE farms_operational.water_quality (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    farm_id          INT NOT NULL,
    batch_id         VARCHAR(50),
    fe               NUMERIC,
    pb               NUMERIC,
    note             TEXT,
    measurement_date DATE,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_water_quality_farm  FOREIGN KEY(farm_id)   REFERENCES farms_master.farms(farm_id),
    CONSTRAINT fk_water_quality_batch FOREIGN KEY(batch_id)  REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_water_quality_cust_farm_batch ON farms_operational.water_quality(customer_id, farm_id, batch_id);
CREATE TRIGGER update_water_quality_updated_at
  BEFORE UPDATE ON farms_operational.water_quality
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- health_records
CREATE TABLE farms_operational.health_records (
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
    CONSTRAINT fk_health_records_animal FOREIGN KEY(animal_id)  REFERENCES farms_master.animals(animal_id),
    CONSTRAINT fk_health_records_batch  FOREIGN KEY(batch_id)   REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_health_records_cust_animal_batch ON farms_operational.health_records(customer_id, animal_id, batch_id);
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON farms_operational.health_records
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- welfare_indicators
CREATE TABLE farms_operational.welfare_indicators (
    id                SERIAL PRIMARY KEY,
    customer_id       INT NOT NULL,
    animal_id         INT NOT NULL,
    batch_id          VARCHAR(50),
    footpad_lesion    BOOLEAN,
    stress_hormone    NUMERIC,
    recorded_date     DATE,
    created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_welfare_inds_animal FOREIGN KEY(animal_id) REFERENCES farms_master.animals(animal_id),
    CONSTRAINT fk_welfare_inds_batch  FOREIGN KEY(batch_id)   REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_welfare_inds_cust_animal_batch ON farms_operational.welfare_indicators(customer_id, animal_id, batch_id);
CREATE TRIGGER update_welfare_indicators_updated_at
  BEFORE UPDATE ON farms_operational.welfare_indicators
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- operational_records
CREATE TABLE farms_operational.operational_records (
    id               SERIAL PRIMARY KEY,
    customer_id      INT NOT NULL,
    farm_id          INT NOT NULL,
    batch_id         VARCHAR(50),
    type             VARCHAR(100),
    description      TEXT,
    record_date      DATE,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_operational_records_farm  FOREIGN KEY(farm_id)  REFERENCES farms_master.farms(farm_id),
    CONSTRAINT fk_operational_records_batch FOREIGN KEY(batch_id) REFERENCES farms_master.batches(batch_id)
);
CREATE INDEX idx_operational_records_cust_farm_batch ON farms_operational.operational_records(customer_id, farm_id, batch_id);
CREATE TRIGGER update_operational_records_updated_at
  BEFORE UPDATE ON farms_operational.operational_records
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();

-- performance_metrics (partitioned)
CREATE TABLE farms_operational.performance_metrics (
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
    CONSTRAINT fk_perf_metrics_animal FOREIGN KEY(animal_id) REFERENCES farms_master.animals(animal_id),
    CONSTRAINT fk_perf_metrics_batch  FOREIGN KEY(batch_id)  REFERENCES farms_master.batches(batch_id)
) PARTITION BY RANGE (recorded_date);

CREATE TABLE farms_operational.performance_metrics_2025 PARTITION OF farms_operational.performance_metrics
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE INDEX idx_perf_metrics_cust_animal_batch_date ON farms_operational.performance_metrics(customer_id, animal_id, batch_id, recorded_date);
CREATE TRIGGER update_perf_metrics_updated_at
  BEFORE UPDATE ON farms_operational.performance_metrics
  FOR EACH ROW EXECUTE PROCEDURE farms_operational.update_updated_at_column();
