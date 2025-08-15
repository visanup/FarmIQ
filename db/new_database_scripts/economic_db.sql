
-- database: your_database_name;

CREATE SCHEMA IF NOT EXISTS economics;

-- 1. economic_data with tenant, batch, and feed linkage
CREATE TABLE economics.economic_data (
    id                  SERIAL PRIMARY KEY,
    customer_id         INT             NOT NULL,
    farm_id             INT             NOT NULL,
    batch_id            VARCHAR(50),
    feed_assignment_id  INT,
    cost_type           VARCHAR(100)    NOT NULL,
    amount              NUMERIC,
    animal_price        NUMERIC,
    feed_cost           NUMERIC,
    labor_cost          NUMERIC,
    utility_cost        NUMERIC,
    medication_cost     NUMERIC,
    maintenance_cost    NUMERIC,
    other_costs         NUMERIC,
    record_date         DATE            NOT NULL,
    created_at          TIMESTAMPTZ     DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMPTZ     DEFAULT NOW() NOT NULL,
    -- Foreign keys
    CONSTRAINT fk_econdata_batch
      FOREIGN KEY(batch_id)
      REFERENCES farms_master.batches(batch_id),
    CONSTRAINT fk_econdata_feed_assignment
      FOREIGN KEY(feed_assignment_id)
      REFERENCES feeds.feed_batch_assignments(assignment_id)
);

-- Composite index for tenant/farm/batch scoped queries
CREATE INDEX idx_econdata_cust_farm_batch_date
    ON economics.economic_data(customer_id, farm_id, batch_id, record_date);
-- Index on feed assignment for fast joins
CREATE INDEX idx_econdata_feed_assignment
    ON economics.economic_data(feed_assignment_id);

-- Trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION economics.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Install trigger for BEFORE UPDATE
DROP TRIGGER IF EXISTS update_economic_data_updated_at
    ON economics.economic_data;
CREATE TRIGGER update_economic_data_updated_at
  BEFORE UPDATE ON economics.economic_data
  FOR EACH ROW EXECUTE PROCEDURE economics.update_updated_at_column();