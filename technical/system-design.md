# System Design Principles

## Design Philosophy

WasteFi is designed with the following core principles:

1. **Offline-First** - Work without internet, sync when available
2. **Mobile-First** - Optimized for smartphones with limited resources
3. **Security-First** - Blockchain provides immutability and trust
4. **Simplicity-First** - Complex technology, simple user experience
5. **Resilience-First** - Graceful degradation when services fail

## Architectural Patterns

### 1. Microservices Architecture

**Why Microservices?**
- **Independent Scaling** - Payment service needs more resources than auth
- **Technology Flexibility** - Choose best tool for each service
- **Fault Isolation** - One service failure doesn't crash entire system
- **Team Autonomy** - Different teams can work on different services

**Service Boundaries:**

```
Auth Service          → User identity and access
Material Service      → Material types and identification
Payment Service       → Blockchain and mobile money
Impact Service        → Environmental calculations
Collection Point      → Physical location management
Market Data Service   → Pricing and trends
Notification Service  → Communications
```

**Inter-Service Communication:**
- **Synchronous**: REST APIs for immediate requests
- **Asynchronous**: Message queue (RabbitMQ) for background tasks
- **Events**: Pub/Sub pattern for service-to-service events

### 2. Event-Driven Architecture

**Key Events:**

```javascript
// Material deposited event
{
  "event": "material.deposited",
  "timestamp": "2024-09-15T10:30:00Z",
  "data": {
    "userId": "usr_123",
    "collectionPointId": "cp_456",
    "materialType": "PET",
    "weight": 5.5,
    "quality": "A"
  }
}

// Subscribed services:
// - Payment Service → Process payment
// - Impact Service → Calculate CO2 saved
// - Notification Service → Send confirmation SMS
// - Analytics Service → Update statistics
```

**Benefits:**
- Loose coupling between services
- Easy to add new functionality
- Audit trail of all events
- Can replay events for debugging

### 3. CQRS (Command Query Responsibility Segregation)

**Write Model (Commands):**
```
POST   /transactions      → Create transaction
PUT    /users/:id         → Update user
POST   /collection-points → Register point
```

**Read Model (Queries):**
```
GET    /transactions/history      → Optimized for display
GET    /users/:id/dashboard       → Aggregated data
GET    /analytics/impact          → Pre-calculated stats
```

**Why CQRS?**
- Optimize reads and writes independently
- Complex queries don't slow down writes
- Can use different databases for reads (e.g., Elasticsearch)

### 4. Database Per Service Pattern

Each microservice has its own database to ensure:
- **Data Encapsulation** - No direct DB access between services
- **Independent Scaling** - Different storage needs
- **Technology Choice** - PostgreSQL, MongoDB, or Redis as needed

**Service Data Ownership:**

```
Auth Service         → users, sessions, roles
Material Service     → materials, categories, prices
Payment Service      → transactions, wallets
Collection Point     → points, operators, inventory
Impact Service       → impact_records, carbon_credits
```

**Cross-Service Queries:**
- Use API calls (not DB joins)
- Implement data replication where needed
- Consider eventual consistency

### 5. API Gateway Pattern

**Responsibilities:**
- Single entry point for all clients
- Request routing to appropriate service
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- Caching of common responses

**Benefits:**
- Clients don't need to know about microservices
- Reduces client-side complexity
- Centralized security enforcement
- Easy to add cross-cutting concerns

## Data Management Strategies

### 1. Caching Strategy

**Multi-Level Caching:**

```
┌─────────┐
│ Client  │ ← IndexedDB cache (offline)
└────┬────┘
     ↓
┌─────────┐
│   CDN   │ ← Edge caching (static assets)
└────┬────┘
     ↓
┌─────────┐
│  Redis  │ ← Application cache (hot data)
└────┬────┘
     ↓
┌─────────┐
│   DB    │ ← Source of truth
└─────────┘
```

**Cache Invalidation:**
- Time-based (TTL) for most data
- Event-based for critical updates
- Cache-aside pattern for flexibility

### 2. Data Synchronization

**Offline Queue:**

```javascript
// Client-side queue for offline operations
class OfflineQueue {
  async addOperation(operation) {
    await this.db.operations.add({
      id: uuid(),
      type: operation.type,
      data: operation.data,
      timestamp: Date.now(),
      status: 'pending'
    });
  }
  
  async syncWhenOnline() {
    const pending = await this.db.operations
      .where('status').equals('pending')
      .toArray();
    
    for (const op of pending) {
      try {
        await this.executeOperation(op);
        await this.db.operations.update(op.id, { status: 'completed' });
      } catch (error) {
        await this.db.operations.update(op.id, { 
          status: 'failed',
          error: error.message 
        });
      }
    }
  }
}
```

**Conflict Resolution:**
- Last-write-wins for most data
- Server version wins for critical data (balances)
- Manual resolution for complex conflicts

### 3. Database Replication

**PostgreSQL Setup:**

```
┌──────────────┐         ┌──────────────┐
│   Primary    │────────>│   Replica 1  │
│   (writes)   │         │   (reads)    │
└──────────────┘         └──────────────┘
       │                          
       └────────────>┌──────────────┐
                     │   Replica 2  │
                     │   (reads)    │
                     └──────────────┘
```

**Benefits:**
- High availability
- Read scaling
- Geographic distribution
- Backup and disaster recovery

## Scalability Strategies

### 1. Horizontal Scaling

**Application Servers:**
- Stateless design enables easy scaling
- Auto-scaling based on CPU/memory
- Load balancer distributes requests

**Database Scaling:**
- Read replicas for query load
- Sharding for write load (if needed)
- Connection pooling (PgBouncer)

### 2. Vertical Scaling

**When to Scale Up:**
- Database primary (before sharding)
- Redis cache (in-memory performance)
- Resource-intensive services (image processing)

### 3. Async Processing

**Background Jobs:**

```javascript
// Use job queue for non-critical tasks
queue.add('send-notification', {
  userId: 'usr_123',
  message: 'Payment received',
  channel: 'sms'
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});

// Process in background worker
queue.process('send-notification', async (job) => {
  await notificationService.send(job.data);
});
```

**Benefits:**
- Faster API responses
- Better resource utilization
- Retry logic for failures

## Resilience Patterns

### 1. Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(service, threshold = 5, timeout = 60000) {
    this.service = service;
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      setTimeout(() => this.state = 'HALF_OPEN', this.timeout);
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
}
```

### 2. Retry Logic with Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await sleep(delay);
    }
  }
}
```

### 3. Graceful Degradation

**Example: Payment Service Down**

```javascript
async function processPayment(transaction) {
  try {
    // Try blockchain payment
    return await stellarService.sendPayment(transaction);
  } catch (error) {
    // Fallback: Queue for later processing
    await paymentQueue.add(transaction);
    
    // Still provide user feedback
    return {
      status: 'queued',
      message: 'Payment is being processed and will complete shortly',
      estimatedTime: '5 minutes'
    };
  }
}
```

### 4. Health Checks

```javascript
// Liveness check - is service running?
app.get('/health/live', (req, res) => {
  res.json({ status: 'ok' });
});

// Readiness check - can service handle requests?
app.get('/health/ready', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStellar(),
    checkMobileMoney()
  ]);
  
  const healthy = checks.every(c => c.status === 'ok');
  res.status(healthy ? 200 : 503).json({ checks });
});
```

## Performance Optimization

### 1. Database Query Optimization

**Indexing:**
```sql
-- Compound index for common query
CREATE INDEX idx_transactions_user_date 
ON transactions(user_id, created_at DESC);

-- Partial index for active records
CREATE INDEX idx_active_users 
ON users(status) 
WHERE status = 'active';
```

**Query Optimization:**
```sql
-- Use EXPLAIN ANALYZE to identify slow queries
EXPLAIN ANALYZE
SELECT t.*, u.phone, m.name
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN materials m ON t.material_id = m.id
WHERE t.created_at > NOW() - INTERVAL '30 days'
  AND t.status = 'completed';

-- Add covering index to avoid table lookups
CREATE INDEX idx_transactions_covering 
ON transactions(created_at, status, user_id, material_id);
```

### 2. API Response Optimization

**Pagination:**
```javascript
// Cursor-based pagination for large datasets
GET /transactions?limit=20&cursor=txn_abc123

// Response includes next cursor
{
  "data": [...],
  "pagination": {
    "next": "txn_def456",
    "hasMore": true
  }
}
```

**Field Selection:**
```javascript
// Allow clients to request only needed fields
GET /users/123?fields=id,phone,balance

// Reduces payload size and DB load
```

### 3. Image Optimization

**Material Photo Processing:**
```javascript
// Resize and compress images
const sharp = require('sharp');

await sharp(inputBuffer)
  .resize(800, 600, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toFile(outputPath);

// Store multiple sizes for responsive images
const sizes = [
  { width: 320, quality: 60 },  // Mobile
  { width: 640, quality: 70 },  // Tablet
  { width: 1024, quality: 80 }  // Desktop
];
```

### 4. Connection Pooling

```javascript
// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle after 30s
  connectionTimeoutMillis: 2000
});

// Redis connection pool
const redis = new Redis({
  host: process.env.REDIS_HOST,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false
});
```

## Security Design

### 1. Defense in Depth

**Multiple Security Layers:**
- Network: VPC, security groups, WAF
- Application: Input validation, CSRF protection
- Data: Encryption at rest and in transit
- Authentication: MFA for sensitive operations
- Authorization: RBAC with principle of least privilege

### 2. Secure API Design

**Input Validation:**
```javascript
const { body, validationResult } = require('express-validator');

app.post('/transactions',
  body('userId').isUUID(),
  body('amount').isFloat({ min: 0.01, max: 10000 }),
  body('materialType').isIn(['PET', 'HDPE', 'Aluminum']),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process valid request
  }
);
```

**Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', apiLimiter);
```

### 3. Secrets Management

```javascript
// Never hardcode secrets
// Use environment variables or secret manager

const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager
    .getSecretValue({ SecretId: secretName })
    .promise();
  
  return JSON.parse(data.SecretString);
}

// Usage
const dbCreds = await getSecret('wastefi/production/db');
```

## Observability

### 1. Distributed Tracing

```javascript
const opentelemetry = require('@opentelemetry/api');

// Add trace ID to all logs and requests
function middleware(req, res, next) {
  const traceId = req.headers['x-trace-id'] || uuid();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
}

// Trace across services
async function processPayment(transaction) {
  const span = tracer.startSpan('payment.process');
  span.setAttribute('user.id', transaction.userId);
  span.setAttribute('amount', transaction.amount);
  
  try {
    const result = await stellarService.sendPayment(transaction);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error.message 
    });
    throw error;
  } finally {
    span.end();
  }
}
```

### 2. Metrics Collection

```javascript
const prometheus = require('prom-client');

// Counter for total transactions
const transactionCounter = new prometheus.Counter({
  name: 'wastefi_transactions_total',
  help: 'Total number of transactions',
  labelNames: ['status', 'material_type']
});

// Histogram for API latency
const httpDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

// Usage
transactionCounter.inc({ status: 'completed', material_type: 'PET' });
```

---

## Learn More

- [Architecture Overview](/guide/architecture) - High-level system architecture
- [API Documentation](/api/overview) - RESTful API reference
- [Deployment Guide](/guide/deployment) - Production deployment
- [Performance Tuning](/technical/performance) - Optimization strategies