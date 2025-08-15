-- database: your_database_name;

CREATE SCHEMA IF NOT EXISTS external_factors;

-- Table: external_factors with tenant, batch, and feed linkage
CREATE TABLE external_factors.external_factors (
    id                  SERIAL PRIMARY KEY,
    customer_id         INT             NOT NULL,
    farm_id             INT             NOT NULL,
    batch_id            VARCHAR(50),
    feed_assignment_id  INT,
    weather             JSONB,
    disease_alert       JSONB,
    market_price        JSONB,
    feed_supply         JSONB,
    weather_forecast    JSONB,
    disease_risk_score  NUMERIC,
    regulatory_changes  TEXT,
    record_date         DATE            NOT NULL,
    created_at          TIMESTAMPTZ     DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMPTZ     DEFAULT NOW() NOT NULL,
    -- Foreign keys
    CONSTRAINT fk_ext_batch
      FOREIGN KEY(batch_id)
      REFERENCES farms_master.batches(batch_id),
    CONSTRAINT fk_ext_feed_assignment
      FOREIGN KEY(feed_assignment_id)
      REFERENCES feeds.feed_batch_assignments(assignment_id)
);

-- Composite index for tenant/farm/batch scoped queries
CREATE INDEX idx_extfactors_cust_farm_batch_date
    ON external_factors.external_factors(customer_id, farm_id, batch_id, record_date);

-- Index on weather/disease JSONB for efficient querying
CREATE INDEX idx_extfactors_weather_gin
    ON external_factors.external_factors USING GIN(weather);
CREATE INDEX idx_extfactors_disease_alert_gin
    ON external_factors.external_factors USING GIN(disease_alert);

-- Trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION external_factors.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Install trigger for BEFORE UPDATE
DROP TRIGGER IF EXISTS update_external_factors_updated_at
    ON external_factors.external_factors;
CREATE TRIGGER update_external_factors_updated_at
  BEFORE UPDATE ON external_factors.external_factors
  FOR EACH ROW EXECUTE PROCEDURE external_factors.update_updated_at_column();

