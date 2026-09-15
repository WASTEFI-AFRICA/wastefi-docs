# Database Schema

## Overview

WasteFi uses PostgreSQL 15+ as the primary relational database. The schema is designed for data integrity, scalability, and efficient querying.

## Database Design Principles

1. **Normalization**: Tables are normalized to 3NF to reduce redundancy
2. **Foreign Keys**: Referential integrity enforced at database level
3. **Indexing**: Strategic indexes for common query patterns
4. **Partitioning**: Large tables partitioned by date
5. **JSONB**: Flexible metadata storage where needed
6. **Audit Trail**: Timestamps and change tracking on all tables

---

## Entity Relationship Diagram

```
┌─────────────┐           ┌──────────────┐           ┌─────────────────┐
│   users     │           │ transactions │           │collection_points│
│─────────────│           │──────────────│           │─────────────────│
│ id (PK)     │───┐       │ id (PK)      │      ┌───│ id (PK)         │
│ phone       │   │   ┌───│ user_id (FK) │      │   │ name            │
│ pin_hash    │   │   │   │ cp_id (FK)   │──────┘   │ location        │
│ role        │   │   │   │ material_id  │          │ status          │
│ created_at  │   │   │   │ weight       │          │ capacity        │
└─────────────┘   │   │   │ amount       │          └─────────────────┘
                  │   │   │ status       │
                  │   │   │ created_at   │
                  │   │   └──────────────┘
                  │   │            │
                  │   │            │
┌─────────────┐   │   │   ┌────────────────┐
│   wallets   │   │   │   │transaction_items│
│─────────────│   │   │   │────────────────│
│ id (PK)     │   │   │   │ id (PK)        │
│ user_id(FK) │───┘   │   │ transaction_id │
│ stellar_addr│       │   │ material_id    │
│ balance     │       │   │ quantity       │
└─────────────┘       │   │ price          │
                      │   └────────────────┘
                      │
                      │   ┌──────────────┐
                      │   │  materials   │
                      │   │──────────────│
                      └───│ id (PK)      │
                          │ name         │
                          │ category     │
                          │ base_price   │
                          │ co2_per_kg   │
                          └──────────────┘
```

---

## Core Tables

### users

Stores user account information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    pin_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('collector', 'operator', 'admin')),
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

**Key Fields:**
- `id` - UUID primary key
- `phone` - E.164 format phone number (unique)
- `pin_hash` - Bcrypt hashed 4-6 digit PIN
- `role` - User role (collector, operator, admin)
- `status` - Account status (active, inactive, suspended)

---

### sessions

Manages user authentication sessions.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token_hash);

-- Auto-delete expired sessions
CREATE INDEX idx_sessions_expired ON sessions(expires_at) WHERE expires_at < CURRENT_TIMESTAMP;
```

**Key Fields:**
- `refresh_token_hash` - Hashed refresh token
- `device_info` - JSONB with device details
- `expires_at` - Session expiration timestamp

---

### wallets

Stellar blockchain wallet information.

```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stellar_address VARCHAR(56) UNIQUE NOT NULL,
    stellar_seed_encrypted TEXT NOT NULL, -- Encrypted with master key
    balance DECIMAL(20, 7) DEFAULT 0,
    locked_balance DECIMAL(20, 7) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_stellar_address ON wallets(stellar_address);
CREATE INDEX idx_wallets_balance ON wallets(balance DESC);
```

**Key Fields:**
- `stellar_address` - Public Stellar address (G...)
- `stellar_seed_encrypted` - AES-256 encrypted private key
- `balance` - Available balance
- `locked_balance` - Balance locked in pending transactions

---

### materials

Material type definitions and pricing.

```sql
CREATE TABLE materials (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'PET', 'HDPE'
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('plastic', 'metal', 'paper', 'glass', 'electronic', 'organic')),
    description TEXT,
    recyclegraph_id VARCHAR(100) UNIQUE,
    base_price DECIMAL(10, 2) NOT NULL,
    price_unit VARCHAR(20) DEFAULT 'kg',
    currency VARCHAR(10) DEFAULT 'USD',
    co2_per_kg DECIMAL(10, 2) NOT NULL, -- CO2 saved per kg
    quality_grades JSONB NOT NULL, -- Grade definitions
    min_weight DECIMAL(10, 2) DEFAULT 0.1,
    max_weight DECIMAL(10, 2) DEFAULT 1000,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_active ON materials(active) WHERE active = TRUE;
CREATE INDEX idx_materials_price ON materials(base_price DESC);

-- Quality grades structure example
-- {
--   "A": {"multiplier": 1.2, "description": "Clean, excellent condition"},
--   "B": {"multiplier": 1.0, "description": "Good condition"},
--   "C": {"multiplier": 0.8, "description": "Fair condition"}
-- }
```

---

### collection_points

Physical collection point locations.

```sql
CREATE TABLE collection_points (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    operating_hours JSONB NOT NULL, -- Weekly schedule
    capacity_max DECIMAL(10, 2), -- Maximum capacity in kg
    capacity_current DECIMAL(10, 2) DEFAULT 0,
    accepted_materials TEXT[] NOT NULL, -- Array of material IDs
    facilities TEXT[], -- Available facilities
    wallet_address VARCHAR(56), -- Multi-sig wallet
    required_signatures INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_collection_points_status ON collection_points(status);
CREATE INDEX idx_collection_points_location ON collection_points USING GIST(location);
CREATE INDEX idx_collection_points_city ON collection_points(city);

-- Spatial query function
CREATE OR REPLACE FUNCTION nearby_collection_points(
    lat DECIMAL,
    lng DECIMAL,
    radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE (
    id VARCHAR(50),
    name VARCHAR(200),
    distance_km DECIMAL
) AS $$
    SELECT 
        cp.id,
        cp.name,
        ST_Distance(
            cp.location::geography,
            ST_MakePoint(lng, lat)::geography
        ) / 1000 AS distance_km
    FROM collection_points cp
    WHERE cp.status = 'active'
      AND ST_DWithin(
          cp.location::geography,
          ST_MakePoint(lng, lat)::geography,
          radius_km * 1000
      )
    ORDER BY distance_km;
$$ LANGUAGE sql;
```

---

### transactions

Material deposit transactions (partitioned by month).

```sql
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    collection_point_id VARCHAR(50) NOT NULL REFERENCES collection_points(id),
    material_id VARCHAR(50) NOT NULL REFERENCES materials(id),
    weight DECIMAL(10, 2) NOT NULL CHECK (weight > 0),
    quality_grade VARCHAR(5) NOT NULL,
    gross_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    blockchain_fee DECIMAL(10, 7) NOT NULL,
    net_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    co2_saved DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'authorized', 'processing', 'completed', 'failed', 'cancelled', 'disputed')
    ),
    stellar_tx_hash VARCHAR(64),
    photos TEXT[],
    notes TEXT,
    metadata JSONB,
    authorized_by UUID REFERENCES users(id),
    authorized_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions (example for 2024)
CREATE TABLE transactions_2024_09 PARTITION OF transactions
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE transactions_2024_10 PARTITION OF transactions
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

-- Indexes on each partition
CREATE INDEX idx_transactions_user_id ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_collection_point ON transactions(collection_point_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_stellar_hash ON transactions(stellar_tx_hash) WHERE stellar_tx_hash IS NOT NULL;
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_transactions_user_status_date ON transactions(user_id, status, created_at DESC);
```

**Key Fields:**
- `weight` - Material weight in kg
- `net_amount` - Amount paid to collector after fees
- `co2_saved` - Environmental impact in kg
- `stellar_tx_hash` - Blockchain transaction hash
- Partitioned by `created_at` for performance

---

### payments

Payment processing records.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN ('stellar', 'mpesa', 'mtn_money', 'airtel_money')
    ),
    provider_reference VARCHAR(100),
    stellar_tx_hash VARCHAR(64),
    mobile_money_ref VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'refunded')
    ),
    error_code VARCHAR(50),
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_user_id ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stellar_hash ON payments(stellar_tx_hash) WHERE stellar_tx_hash IS NOT NULL;
CREATE INDEX idx_payments_provider_ref ON payments(provider_reference) WHERE provider_reference IS NOT NULL;
```

---

### impact_records

Environmental impact tracking.

```sql
CREATE TABLE impact_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    transaction_id UUID,
    material_id VARCHAR(50) NOT NULL REFERENCES materials(id),
    weight DECIMAL(10, 2) NOT NULL,
    co2_saved DECIMAL(10, 2) NOT NULL,
    calculation_method VARCHAR(50) DEFAULT 'standard',
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    carbon_credit_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_impact_records_user_id ON impact_records(user_id, created_at DESC);
CREATE INDEX idx_impact_records_verified ON impact_records(verified);
CREATE INDEX idx_impact_records_carbon_credit ON impact_records(carbon_credit_id) WHERE carbon_credit_id IS NOT NULL;

-- Materialized view for fast impact queries
CREATE MATERIALIZED VIEW user_impact_summary AS
SELECT 
    user_id,
    SUM(co2_saved) as total_co2_saved,
    SUM(weight) as total_weight,
    COUNT(*) as total_transactions,
    MAX(created_at) as last_transaction_at
FROM impact_records
WHERE verified = TRUE
GROUP BY user_id;

CREATE UNIQUE INDEX idx_user_impact_summary ON user_impact_summary(user_id);

-- Refresh schedule (every hour)
-- SELECT cron.schedule('refresh-impact-summary', '0 * * * *', 
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY user_impact_summary');
```

---

### carbon_credits

Carbon credit token records.

```sql
CREATE TABLE carbon_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    co2_amount DECIMAL(10, 2) NOT NULL, -- kg of CO2
    ton_equivalent DECIMAL(10, 4) NOT NULL, -- Tons CO2
    impact_record_ids UUID[] NOT NULL,
    collector_ids UUID[] NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'verified', 'minted', 'sold', 'retired')
    ),
    verification_date TIMESTAMP,
    verifier_id UUID REFERENCES users(id),
    verifier_notes TEXT,
    mint_date TIMESTAMP,
    stellar_asset_code VARCHAR(12),
    stellar_issuer VARCHAR(56),
    sale_price DECIMAL(10, 2),
    sale_date TIMESTAMP,
    buyer_info JSONB,
    retirement_date TIMESTAMP,
    retirement_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_carbon_credits_status ON carbon_credits(status);
CREATE INDEX idx_carbon_credits_verification_date ON carbon_credits(verification_date DESC);
CREATE INDEX idx_carbon_credits_verifier ON carbon_credits(verifier_id);
```

---

### price_history

Historical material pricing data.

```sql
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id VARCHAR(50) NOT NULL REFERENCES materials(id),
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    source VARCHAR(100), -- Price source (market, manual)
    location VARCHAR(100), -- Geographic region
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_price_history_material_date ON price_history(material_id, effective_date DESC);
CREATE INDEX idx_price_history_location ON price_history(location, material_id);

-- Unique constraint: one price per material per day per location
CREATE UNIQUE INDEX idx_price_history_unique ON price_history(
    material_id, effective_date, COALESCE(location, 'global')
);
```

---

### disputes

Transaction dispute records.

```sql
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    disputer_id UUID NOT NULL REFERENCES users(id),
    reason VARCHAR(50) NOT NULL CHECK (
        reason IN ('weight_incorrect', 'quality_grade_wrong', 'payment_incorrect', 
                   'material_rejected', 'other')
    ),
    description TEXT NOT NULL,
    evidence_urls TEXT[],
    status VARCHAR(20) DEFAULT 'open' CHECK (
        status IN ('open', 'under_review', 'resolved', 'closed')
    ),
    resolution VARCHAR(20) CHECK (
        resolution IN ('collector_favor', 'point_favor', 'partial', 'dismissed')
    ),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_disputes_transaction_id ON disputes(transaction_id);
CREATE INDEX idx_disputes_disputer_id ON disputes(disputer_id, created_at DESC);
CREATE INDEX idx_disputes_status ON disputes(status);
```

---

### audit_logs

System audit trail.

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
```

---

## Helper Functions

### update_updated_at_column()

Automatically update `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at 
    BEFORE UPDATE ON materials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to other tables)
```

---

## Queries and Views

### Active Collectors View

```sql
CREATE VIEW active_collectors AS
SELECT 
    u.id,
    u.name,
    u.phone,
    COUNT(t.id) as transaction_count,
    SUM(t.net_amount) as total_earnings,
    SUM(t.weight) as total_weight,
    SUM(t.co2_saved) as total_co2_saved,
    MAX(t.created_at) as last_transaction_at
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
WHERE u.role = 'collector' AND u.status = 'active'
GROUP BY u.id, u.name, u.phone;
```

### Collection Point Performance

```sql
CREATE VIEW collection_point_stats AS
SELECT 
    cp.id,
    cp.name,
    COUNT(DISTINCT t.user_id) as unique_collectors,
    COUNT(t.id) as total_transactions,
    SUM(t.weight) as total_weight,
    SUM(t.net_amount) as total_value,
    AVG(t.net_amount) as avg_transaction_value,
    cp.capacity_current,
    cp.capacity_max,
    (cp.capacity_current::DECIMAL / NULLIF(cp.capacity_max, 0) * 100) as capacity_percent
FROM collection_points cp
LEFT JOIN transactions t ON cp.id = t.collection_point_id 
    AND t.status = 'completed'
    AND t.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY cp.id, cp.name, cp.capacity_current, cp.capacity_max;
```

---

## Backup and Maintenance

### Backup Strategy

```sql
-- Daily full backup
pg_dump -Fc wastefi_production > backup_$(date +%Y%m%d).dump

-- Point-in-time recovery enabled
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

### Maintenance Tasks

```sql
-- Vacuum and analyze (scheduled weekly)
VACUUM ANALYZE;

-- Reindex (monthly)
REINDEX DATABASE wastefi_production;

-- Update statistics
ANALYZE;

-- Delete old audit logs (keep 1 year)
DELETE FROM audit_logs WHERE created_at < CURRENT_DATE - INTERVAL '1 year';

-- Delete expired sessions
DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
```

---

## Performance Considerations

1. **Partitioning**: `transactions` and `audit_logs` partitioned by month
2. **Indexing**: Strategic indexes on foreign keys and query patterns
3. **Materialized Views**: Pre-computed aggregations for dashboards
4. **Connection Pooling**: PgBouncer with max 20 connections
5. **Read Replicas**: Dedicated replica for reporting queries

---

## Migration Strategy

Use a migration tool like Flyway or db-migrate:

```sql
-- V001__initial_schema.sql
-- V002__add_disputes_table.sql
-- V003__add_carbon_credits.sql
```

---

## Learn More

- [API Documentation](/api/overview) - API that uses this schema
- [Architecture](/guide/architecture) - System architecture
- [Deployment](/guide/deployment) - Database deployment