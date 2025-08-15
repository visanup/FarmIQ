-- สร้าง Schema สำหรับระบบ auth
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
    user_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES smart_farming.customers(customer_id),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth.user_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(user_id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT FALSE,
    device_info TEXT
);

--------------------------------------------------------------------------------------------------

-- สร้าง Schema สำหรับระบบ Dashboard
CREATE SCHEMA IF NOT EXISTS dashboard;

-- ตารางเก็บข้อมูลสรุปสำหรับ Dashboard
CREATE TABLE dashboard.dashboard_cache (
    cache_id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES smart_farming.farms(farm_id),
    metric_name VARCHAR(100),
    metric_value NUMERIC,
    metric_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index ช่วยให้ค้นหาข้อมูล farm_id และ metric_date เร็วขึ้น
CREATE INDEX idx_dashboard_cache_farm_metric_date
    ON dashboard.dashboard_cache(farm_id, metric_name, metric_date);

-- ตารางเก็บการตั้งค่าการแสดงผล Dashboard ของผู้ใช้แต่ละคน
CREATE TABLE dashboard.user_dashboard_config (
    config_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(user_id),
    config JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_dashboard_config_user_id
    ON dashboard.user_dashboard_config(user_id);

--------------------------------------------------------------------------------------------------

-- สร้าง Schema สำหรับระบบ Monitoring
CREATE SCHEMA IF NOT EXISTS monitoring;

-- ตารางเก็บข้อมูลแจ้งเตือนเหตุการณ์ต่าง ๆ
CREATE TABLE monitoring.alerts (
    alert_id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES smart_farming.farms(farm_id),
    alert_type VARCHAR(100),
    description TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_farm_status
    ON monitoring.alerts(farm_id, status);

-- ตารางเก็บกฎการแจ้งเตือน เช่น threshold และเงื่อนไข
CREATE TABLE monitoring.alert_rules (
    rule_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    metric_name VARCHAR(100),
    threshold NUMERIC,
    condition VARCHAR(10),  -- e.g. '>', '<', '='
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------------------------

-- สร้าง Schema สำหรับระบบ Analytics / AI
CREATE SCHEMA IF NOT EXISTS analytics;

-- ตารางเก็บฟีเจอร์สำหรับใช้ฝึกและทำนายโมเดล AI
CREATE TABLE analytics.feature_store (
    feature_id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES smart_farming.animals(animal_id),
    feature_name VARCHAR(100),
    feature_value NUMERIC,
    feature_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_store_animal_feature_date
    ON analytics.feature_store(animal_id, feature_name, feature_date);

-- ตารางเก็บผลลัพธ์โมเดล AI เช่นการทำนายและคะแนน anomaly
CREATE TABLE analytics.model_results (
    result_id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES smart_farming.animals(animal_id),
    model_name VARCHAR(100),
    prediction JSONB,
    anomaly_score NUMERIC,
    result_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_model_results_animal_model_date
    ON analytics.model_results(animal_id, model_name, result_date);
