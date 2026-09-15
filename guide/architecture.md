# System Architecture

## Overview

WasteFi uses a hybrid architecture that combines traditional web services with blockchain technology to create a scalable, reliable, and transparent waste-to-value platform. The system is designed to work in low-bandwidth environments while maintaining data integrity and security.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Mobile     │  │    Admin     │  │   Partner    │         │
│  │  PWA App     │  │  Dashboard   │  │  Integration │         │
│  │  (Offline)   │  │   (Web)      │  │    (API)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────┐          │
│  │  Load Balancer (NGINX) + Rate Limiting           │          │
│  │  Authentication (JWT) + API Versioning           │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │ Material │  │ Payment  │  │  Impact  │      │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   User   │  │Collection│  │  Market  │  │  Notify  │      │
│  │ Service  │  │  Point   │  │  Data    │  │ Service  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Integration Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Stellar  │  │  Mobile  │  │Recycle   │  │  SMS     │      │
│  │Blockchain│  │  Money   │  │ Graph    │  │ Gateway  │      │
│  │  SDK     │  │  APIs    │  │ Protocol │  │ (Twilio) │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │PostgreSQL│  │  Redis   │  │  Stellar │  │  S3      │      │
│  │   DB     │  │  Cache   │  │  Ledger  │  │ Storage  │      │
│  │(Primary) │  │(Sessions)│  │(Immut.)  │  │(Backup)  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Component Architecture

### 1. Client Layer

#### Mobile PWA Application

**Technology Stack:**
- React Native Web / Progressive Web App
- TypeScript for type safety
- Redux for state management
- IndexedDB for offline storage
- Service Workers for background sync

**Key Features:**
- **Offline-First**: Works without internet, syncs when connected
- **Low Bandwidth**: Optimized images, lazy loading, data compression
- **Multilingual**: i18n support for 5+ African languages
- **Responsive**: Works on devices from feature phones to tablets

**Architecture Pattern:**

```
┌─────────────────────────────────────────────┐
│           Mobile PWA App                    │
│  ┌─────────────────────────────────────┐   │
│  │       Presentation Layer            │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐│   │
│  │  │Collector│ │Operator│ │ Common ││   │
│  │  │  Views │ │ Views  │ │  Views ││   │
│  │  └────────┘  └────────┘  └────────┘│   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │       Business Logic Layer          │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐│   │
│  │  │ Actions│ │Reducers│ │Selectors││   │
│  │  └────────┘  └────────┘  └────────┘│   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │       Data Access Layer             │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐│   │
│  │  │  API   │ │IndexDB │ │  Cache ││   │
│  │  │ Client │ │ Store  │ │ Manager││   │
│  │  └────────┘  └────────┘  └────────┘│   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │      Service Worker                 │   │
│  │  • Background Sync                  │   │
│  │  • Offline Queue                    │   │
│  │  • Push Notifications               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### Admin Dashboard

**Technology Stack:**
- React + TypeScript
- Material-UI components
- Chart.js for analytics
- Real-time updates via WebSocket

**Capabilities:**
- User management (collectors, operators)
- Collection point administration
- Transaction monitoring and reconciliation
- Impact reporting and analytics
- System health monitoring

### 2. API Gateway Layer

**NGINX Configuration:**
```nginx
upstream api_backend {
    least_conn;
    server api1.wastefi.org:3000;
    server api2.wastefi.org:3000;
    server api3.wastefi.org:3000;
}

server {
    listen 443 ssl http2;
    server_name api.wastefi.org;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # API versioning
    location /v1/ {
        proxy_pass http://api_backend/;
        proxy_set_header X-API-Version "v1";
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Security Features:**
- TLS 1.3 encryption
- JWT authentication with refresh tokens
- API key management for partners
- DDoS protection via Cloudflare
- Input validation and sanitization

### 3. Application Layer (Microservices)

#### Auth Service

**Responsibilities:**
- User registration and authentication
- JWT token generation and validation
- Phone number verification (OTP via SMS)
- Role-based access control (RBAC)
- Session management

**Key Endpoints:**
```
POST   /auth/register          # Register new user
POST   /auth/login             # Login with phone + PIN
POST   /auth/verify-otp        # Verify OTP code
POST   /auth/refresh-token     # Refresh access token
POST   /auth/logout            # Invalidate session
GET    /auth/profile           # Get user profile
PUT    /auth/profile           # Update profile
```

**Database Schema:**
```sql
users (
    id UUID PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- collector, operator, admin
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
)
```

#### Material Service

**Responsibilities:**
- Material type management (plastic, metal, paper, etc.)
- Quality grading
- RecycleGraph protocol integration
- Material identification (QR/NFC/vision)
- Pricing calculation

**Key Endpoints:**
```
GET    /materials              # List material types
GET    /materials/:id          # Get material details
POST   /materials/identify     # Identify material from image
GET    /materials/:id/price    # Get current market price
POST   /materials/verify       # Verify material quality
```

**Material Classification:**
```javascript
{
  "material_id": "MAT-PET-001",
  "name": "PET Plastic Bottles",
  "category": "plastic",
  "subcategory": "PET",
  "recycleGraphId": "RG-PLASTIC-PET-1",
  "basePrice": 0.25,
  "priceUnit": "kg",
  "qualityGrades": {
    "A": { "multiplier": 1.2, "description": "Clean, clear, labels removed" },
    "B": { "multiplier": 1.0, "description": "Clean, some labels" },
    "C": { "multiplier": 0.8, "description": "Dirty, contaminated" }
  },
  "co2PerKg": 2.5,
  "minimumWeight": 0.1
}
```

#### Payment Service

**Responsibilities:**
- Calculate payment amounts
- Process Stellar blockchain transactions
- Mobile money integration (M-Pesa, MTN, Airtel)
- Transaction history and reconciliation
- Bonus payment distribution (carbon credits)

**Payment Flow:**

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│Collector │         │ Payment  │         │ Stellar  │
│ Deposits │────────>│ Service  │────────>│Blockchain│
│ Material │  1.Init │          │ 2.Send  │          │
└──────────┘         └──────────┘         └──────────┘
                            │                    │
                            │ 3.Confirm          │
                            │<───────────────────┘
                            │
                            ↓
                     ┌──────────┐
                     │  Mobile  │
                     │  Money   │────> 4.Cashout
                     │  API     │
                     └──────────┘
```

**Key Endpoints:**
```
POST   /payments/calculate     # Calculate payment for material
POST   /payments/process       # Process payment transaction
GET    /payments/:id           # Get payment details
GET    /payments/history       # Get payment history
POST   /payments/cashout       # Withdraw to mobile money
GET    /payments/balance       # Get wallet balance
```

**Database Schema:**
```sql
transactions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    collection_point_id UUID,
    material_id VARCHAR(50),
    weight DECIMAL(10,2),
    quality_grade VARCHAR(5),
    base_amount DECIMAL(10,2),
    bonus_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    currency VARCHAR(10),
    stellar_tx_hash VARCHAR(64),
    status VARCHAR(20), -- pending, completed, failed
    created_at TIMESTAMP
)

wallets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    stellar_address VARCHAR(56) UNIQUE,
    balance DECIMAL(10,2),
    locked_balance DECIMAL(10,2),
    updated_at TIMESTAMP
)
```

#### Impact Service

**Responsibilities:**
- Calculate environmental impact (CO2 saved)
- Aggregate data for carbon credit generation
- Impact certificate issuance
- EPR compliance reporting
- Third-party verification interface

**Impact Calculation:**

```javascript
// CO2 saved = (material weight) × (emission factor) × (diversion rate)
function calculateImpact(materialType, weight) {
  const emissionFactors = {
    'PET': 2.5,      // kg CO2 per kg material
    'HDPE': 1.8,
    'Aluminum': 9.0,
    'Cardboard': 1.3,
    'Glass': 0.5
  };
  
  const diversionRate = 0.85; // 85% would have gone to landfill
  const emissionFactor = emissionFactors[materialType];
  
  return weight * emissionFactor * diversionRate;
}
```

**Key Endpoints:**
```
GET    /impact/user/:id        # Get user's total impact
GET    /impact/collective      # Get platform-wide impact
POST   /impact/certify         # Generate impact certificate
GET    /impact/carbon-credits  # Get carbon credits available
POST   /impact/epr-report      # Generate EPR report
```

#### Collection Point Service

**Responsibilities:**
- Register and manage collection points
- Inventory management
- Operator assignment
- Capacity tracking
- Location-based services

**Key Endpoints:**
```
GET    /collection-points              # List nearby points
POST   /collection-points              # Register new point
GET    /collection-points/:id          # Get point details
PUT    /collection-points/:id          # Update point info
POST   /collection-points/:id/deposit  # Record material deposit
GET    /collection-points/:id/inventory # Get inventory levels
```

#### Market Data Service

**Responsibilities:**
- Fetch real-time commodity prices
- Price forecasting
- Market trend analysis
- Competitive pricing recommendations

**Data Sources:**
- COMEX (metals)
- ICIS (plastics)
- Local market data aggregation
- Historical price database

#### Notification Service

**Responsibilities:**
- Send SMS notifications (Twilio)
- Push notifications to mobile app
- Email notifications (admin users)
- Transaction alerts
- Impact milestones

### 4. Integration Layer

#### Stellar Blockchain Integration

**Stellar SDK Usage:**

```javascript
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org');

// Create payment transaction
async function sendPayment(fromAccount, toAddress, amount) {
  const account = await server.loadAccount(fromAccount.publicKey());
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC
  })
  .addOperation(StellarSdk.Operation.payment({
    destination: toAddress,
    asset: StellarSdk.Asset.native(), // XLM or custom asset
    amount: amount.toString()
  }))
  .setTimeout(180)
  .build();
  
  transaction.sign(fromAccount);
  
  return await server.submitTransaction(transaction);
}
```

**Smart Contract Architecture:**

```
┌─────────────────────────────────────────┐
│      Soroban Smart Contracts           │
│  ┌───────────────────────────────────┐ │
│  │   Payment Contract                │ │
│  │   • Multi-sig security            │ │
│  │   • Escrow functionality          │ │
│  │   • Atomic swaps                  │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │   Material Registry Contract      │ │
│  │   • Material verification         │ │
│  │   • Digital product passports     │ │
│  │   • Provenance tracking           │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │   Impact Credit Contract          │ │
│  │   • Carbon credit tokenization    │ │
│  │   • Impact certificate minting    │ │
│  │   • Revenue distribution          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Mobile Money Integration

**Supported Providers:**
- M-Pesa (Kenya, Tanzania)
- MTN Mobile Money (Ghana, Uganda, Nigeria)
- Airtel Money (Kenya, Ghana, Nigeria)
- Tigo Pesa (Tanzania)

**Integration Pattern:**

```javascript
// Abstraction layer for different providers
class MobileMoneyProvider {
  async initiate(phoneNumber, amount, reference) {}
  async checkStatus(transactionId) {}
  async callback(webhookData) {}
}

class MpesaProvider extends MobileMoneyProvider {
  async initiate(phoneNumber, amount, reference) {
    // M-Pesa B2C API call
    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
      {
        InitiatorName: process.env.MPESA_INITIATOR,
        SecurityCredential: this.getCredential(),
        CommandID: 'BusinessPayment',
        Amount: amount,
        PartyA: process.env.MPESA_SHORTCODE,
        PartyB: phoneNumber,
        Remarks: `WasteFi payment: ${reference}`,
        QueueTimeOutURL: `${API_URL}/callbacks/mpesa/timeout`,
        ResultURL: `${API_URL}/callbacks/mpesa/result`
      },
      { headers: this.getHeaders() }
    );
    
    return response.data;
  }
}
```

#### RecycleGraph Protocol Integration

**Material Identification:**

```javascript
// RecycleGraph standard format
{
  "version": "1.0",
  "id": "RG-MAT-2024-0001",
  "type": "plastic",
  "subtype": "PET",
  "resinCode": "1",
  "manufacturer": "BrandCo",
  "productId": "BC-BOTTLE-500ML",
  "weight": 15, // grams
  "recyclable": true,
  "composition": [
    { "material": "PET", "percentage": 95 },
    { "material": "PP", "percentage": 5 }
  ],
  "passport": {
    "manufactureDate": "2024-01-15",
    "origin": "Kenya",
    "carbonFootprint": 0.08 // kg CO2
  }
}
```

### 5. Data Layer

#### PostgreSQL Database Design

**Key Tables:**

```sql
-- Users and authentication
users, sessions, user_profiles, user_roles

-- Materials and transactions
materials, material_categories, quality_grades
transactions, transaction_items, payment_methods

-- Collection points
collection_points, point_operators, point_inventory

-- Impact tracking
impact_records, carbon_credits, impact_certificates

-- Market data
price_history, market_rates, commodity_prices

-- System
audit_logs, system_configs, api_keys
```

**Indexing Strategy:**
```sql
-- High-frequency queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_wallets_stellar ON wallets(stellar_address);

-- Geographic queries
CREATE INDEX idx_collection_points_location ON collection_points 
USING GIST(location); -- PostGIS extension
```

**Partitioning:**
```sql
-- Partition transactions by month
CREATE TABLE transactions (
    id UUID,
    created_at TIMESTAMP,
    ...
) PARTITION BY RANGE (created_at);

CREATE TABLE transactions_2024_01 PARTITION OF transactions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### Redis Caching Strategy

**Cache Keys:**
```
user:{userId}:profile          # User profile data (TTL: 1 hour)
material:{id}:price            # Current material price (TTL: 5 min)
collection_point:{id}:info     # Point details (TTL: 30 min)
session:{sessionId}            # User session (TTL: 24 hours)
rate_limit:{ip}:{endpoint}     # Rate limiting (TTL: 1 min)
```

**Cache Patterns:**
```javascript
// Cache-aside pattern
async function getUserProfile(userId) {
  const cacheKey = `user:${userId}:profile`;
  
  // Try cache first
  let profile = await redis.get(cacheKey);
  if (profile) return JSON.parse(profile);
  
  // Cache miss: fetch from DB
  profile = await db.users.findById(userId);
  
  // Update cache
  await redis.setex(cacheKey, 3600, JSON.stringify(profile));
  
  return profile;
}
```

## Deployment Architecture

### Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                   Production Environment                │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │         Cloudflare (CDN + DDoS)               │    │
│  └───────────────────────────────────────────────┘    │
│                        ↓                               │
│  ┌───────────────────────────────────────────────┐    │
│  │      AWS Load Balancer (ALB)                  │    │
│  └───────────────────────────────────────────────┘    │
│                        ↓                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │   API Server │  │   API Server │  │API Server│   │
│  │   (ECS/EC2)  │  │   (ECS/EC2)  │  │(ECS/EC2) │   │
│  │  Auto-scaled │  │  Auto-scaled │  │Auto-scale│   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
│                        ↓                               │
│  ┌──────────────┐                  ┌──────────────┐  │
│  │  PostgreSQL  │                  │    Redis     │  │
│  │     RDS      │                  │  ElastiCache │  │
│  │  Multi-AZ    │                  │   Cluster    │  │
│  └──────────────┘                  └──────────────┘  │
│                                                        │
│  ┌──────────────┐                  ┌──────────────┐  │
│  │      S3      │                  │  CloudWatch  │  │
│  │   (Backups)  │                  │  (Monitoring)│  │
│  └──────────────┘                  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│ Git  │───>│GitHub│───>│Build │───>│ Test │───>│Deploy│
│ Push │    │Action│    │Docker│    │ Suite│    │ ECS  │
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘
                          │
                          ↓
                    ┌──────────┐
                    │   ECR    │
                    │(Registry)│
                    └──────────┘
```

## Security Architecture

### Authentication Flow

```
1. User enters phone + PIN
2. Backend validates credentials
3. Generate JWT (access: 15min, refresh: 7 days)
4. Store refresh token in Redis
5. Return tokens to client
6. Client stores in secure storage
7. Include access token in API requests
8. Refresh when access token expires
```

### Data Encryption

- **In Transit**: TLS 1.3 for all API calls
- **At Rest**: AES-256 encryption for DB
- **Secrets**: AWS Secrets Manager / HashiCorp Vault
- **PII**: Field-level encryption for phone numbers

### Multi-Signature Wallets

```
Collection Point Wallet:
  - Requires 2 of 3 signatures
  - Operator + Regional Manager + Platform
  - Protects against single point of compromise
  - Audit trail for all transactions
```

## Monitoring & Observability

### Metrics

- API latency (p50, p95, p99)
- Transaction success rate
- Blockchain confirmation time
- Mobile money success rate
- Active users (DAU, MAU)
- Error rates by service

### Logging

```javascript
// Structured logging format
{
  "timestamp": "2024-09-15T10:30:00Z",
  "level": "info",
  "service": "payment-service",
  "traceId": "abc123",
  "userId": "user456",
  "event": "payment_processed",
  "metadata": {
    "amount": 5.25,
    "currency": "KES",
    "stellarTxHash": "def789"
  }
}
```

### Alerting

- PagerDuty for critical incidents
- Slack for warnings
- Email for daily reports

**Alert Rules:**
- Payment success rate < 95%
- API error rate > 1%
- Database connection failures
- Stellar network issues
- Mobile money API downtime

---

## Learn More

- [Smart Contract Documentation](/technical/smart-contracts) - Soroban contract details
- [API Reference](/api/overview) - Complete API documentation
- [Deployment Guide](/guide/deployment) - Infrastructure setup
- [Security Best Practices](/technical/security) - Security guidelines