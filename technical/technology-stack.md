# Technology Stack

## Overview

WasteFi's technology stack is carefully selected to meet the unique requirements of operating in emerging markets: offline capability, low bandwidth optimization, mobile-first design, and blockchain integration.

## Technology Selection Criteria

For each technology choice, we evaluated:
- **Cost** - Low transaction costs critical for micro-payments
- **Performance** - Works on basic smartphones and slow networks
- **Scalability** - Can grow from thousands to millions of users
- **Developer Experience** - Active community and good documentation
- **Ecosystem** - Integration capabilities with other tools
- **Reliability** - Battle-tested in production environments

---

## Frontend Stack

### Mobile Application

#### React Native (with Web Support)
**Version:** 0.72+  
**Purpose:** Cross-platform mobile application

**Why React Native?**
- ✅ Single codebase for iOS, Android, and Web (PWA)
- ✅ Large ecosystem of libraries and components
- ✅ Hot reload speeds up development
- ✅ Native performance for critical operations
- ✅ Strong community support in Africa

**Alternatives Considered:**
- Flutter: Excellent performance but smaller ecosystem
- Native (Swift/Kotlin): Best performance but 3x development time
- Ionic: Easier development but performance concerns

**Key Libraries:**
```json
{
  "react-native": "^0.72.0",
  "react-navigation": "^6.1.0",
  "redux": "^4.2.0",
  "redux-toolkit": "^1.9.0",
  "react-query": "^3.39.0",
  "formik": "^2.4.0",
  "yup": "^1.3.0"
}
```

#### TypeScript
**Version:** 5.0+  
**Purpose:** Type safety and better developer experience

**Benefits:**
- Catch errors at compile time
- Better IDE autocomplete and refactoring
- Self-documenting code
- Easier to maintain large codebase

#### Redux Toolkit
**Purpose:** State management

**Why Redux?**
- ✅ Predictable state updates
- ✅ Time-travel debugging
- ✅ Excellent developer tools
- ✅ Works well with offline-first architecture

**State Structure:**
```typescript
interface AppState {
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  };
  materials: {
    list: Material[];
    prices: Record<string, number>;
    loading: boolean;
  };
  transactions: {
    history: Transaction[];
    pending: Transaction[];
    syncQueue: QueuedTransaction[];
  };
  offline: {
    isConnected: boolean;
    lastSync: Date | null;
    queuedOperations: Operation[];
  };
}
```

#### React Query
**Purpose:** Server state management and caching

**Benefits:**
- Automatic caching and background refetching
- Optimistic updates for better UX
- Built-in retry logic
- Reduces boilerplate code

#### IndexedDB (via Dexie.js)
**Purpose:** Offline data storage

**Why IndexedDB?**
- ✅ Large storage capacity (50MB+ vs 5-10MB for LocalStorage)
- ✅ Structured data with indexing
- ✅ Asynchronous API (doesn't block UI)
- ✅ Transactional operations

**Schema:**
```javascript
const db = new Dexie('WasteFiDB');

db.version(1).stores({
  users: 'id, phone, syncStatus',
  transactions: 'id, userId, createdAt, status',
  materials: 'id, name, category',
  collectionPoints: 'id, location, [lat+lng]',
  syncQueue: '++id, operation, timestamp, retries'
});
```

### Admin Dashboard

#### React + Vite
**Purpose:** Fast, modern admin interface

**Why Vite?**
- ✅ Lightning-fast hot module replacement
- ✅ Optimized production builds
- ✅ Native ES modules support
- ✅ Better developer experience than Webpack

#### Material-UI (MUI)
**Purpose:** Component library

**Benefits:**
- Professional-looking components out of the box
- Comprehensive theming system
- Accessibility built-in
- Large ecosystem of extensions

#### Chart.js / Recharts
**Purpose:** Data visualization

**Features:**
- Transaction volume trends
- Material type distribution
- Geographic heat maps
- Impact metrics over time

---

## Backend Stack

### Runtime Environment

#### Node.js
**Version:** 18 LTS (Long Term Support)  
**Purpose:** Server-side JavaScript runtime

**Why Node.js?**
- ✅ Same language (JavaScript/TypeScript) for frontend and backend
- ✅ Excellent performance for I/O-heavy operations
- ✅ Large ecosystem (npm)
- ✅ Non-blocking architecture perfect for real-time features
- ✅ Strong community and hiring pool

**Performance Characteristics:**
- Handles 10,000+ concurrent connections
- Event loop ideal for microservices
- Efficient memory usage

### Web Framework

#### Express.js
**Version:** 4.18+  
**Purpose:** HTTP server and routing

**Why Express?**
- ✅ Minimalist and flexible
- ✅ Massive ecosystem of middleware
- ✅ Battle-tested in production
- ✅ Easy to learn and debug

**Alternatives Considered:**
- Fastify: Faster but smaller ecosystem
- NestJS: More opinionated, longer learning curve
- Koa: Cleaner async/await but less mature

**Middleware Stack:**
```javascript
app.use(helmet());                    // Security headers
app.use(compression());               // Response compression
app.use(express.json({ limit: '1mb' })); // Parse JSON
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(morgan('combined'));          // HTTP logging
app.use(rateLimiter);                 // Rate limiting
app.use(authenticateJWT);             // JWT validation
```

#### TypeScript
**Purpose:** Type safety in backend code

**Benefits:**
- Shared types between frontend and backend
- Fewer runtime errors
- Better refactoring tools
- OpenAPI/Swagger generation

### Database

#### PostgreSQL
**Version:** 15+  
**Purpose:** Primary relational database

**Why PostgreSQL?**
- ✅ ACID compliance (critical for financial transactions)
- ✅ JSON support for flexible schemas
- ✅ Excellent performance and scalability
- ✅ PostGIS extension for geospatial queries
- ✅ Strong data integrity guarantees
- ✅ Open source and free

**Key Features We Use:**
- **Transactions:** Ensure payment consistency
- **JSON/JSONB:** Store flexible metadata
- **Full-text search:** Search materials and users
- **Partitioning:** Manage large transaction tables
- **Replication:** High availability

**Extensions:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "postgis";       -- Geospatial queries
```

**Alternatives Considered:**
- MySQL: Good but weaker JSON support
- MongoDB: Great for flexibility but lacks ACID guarantees
- CockroachDB: Excellent but more expensive

#### Redis
**Version:** 7.0+  
**Purpose:** Caching and session storage

**Why Redis?**
- ✅ In-memory = extremely fast (sub-millisecond latency)
- ✅ Rich data structures (strings, hashes, sets, sorted sets)
- ✅ Built-in pub/sub for real-time features
- ✅ Persistence options for durability
- ✅ Clustering for high availability

**Use Cases:**
```javascript
// Session storage
await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session));

// API rate limiting
const requests = await redis.incr(`rate_limit:${ip}:${minute}`);
await redis.expire(`rate_limit:${ip}:${minute}`, 60);

// Cache frequently accessed data
const price = await redis.get(`material:${materialId}:price`);
if (!price) {
  const dbPrice = await db.materials.getPrice(materialId);
  await redis.setex(`material:${materialId}:price`, 300, dbPrice);
}

// Pub/Sub for real-time updates
await redis.publish('transactions', JSON.stringify(transaction));
```

### Object Storage

#### Amazon S3 (or Compatible)
**Purpose:** File storage (images, documents, backups)

**Why S3?**
- ✅ Highly durable (99.999999999%)
- ✅ Scalable and cost-effective
- ✅ CDN integration (CloudFront)
- ✅ Versioning and lifecycle policies
- ✅ Compatible alternatives (MinIO, DigitalOcean Spaces)

**Storage Strategy:**
```
/uploads/
  /materials/
    /{userId}/
      /{transactionId}/
        /original.jpg
        /thumbnail.jpg
        /compressed.jpg
  /profiles/
    /{userId}/
      /avatar.jpg
  /backups/
    /database/
      /daily/
      /weekly/
```

---

## Blockchain Stack

### Stellar Network

#### Stellar SDK
**Version:** 11.0+  
**Purpose:** Blockchain integration

**Why Stellar?**
- ✅ **Fast:** 3-5 second transaction finality
- ✅ **Cheap:** $0.00001 per transaction
- ✅ **Scalable:** 1,000+ transactions per second
- ✅ **Mobile-optimized:** Low computational requirements
- ✅ **Built-in DEX:** Currency conversion without exchanges
- ✅ **African adoption:** Partnerships with mobile money providers

**Alternatives Considered:**
- Ethereum: Too expensive ($1-50 per transaction)
- Solana: Fast but less stable network
- Polygon: Good option but less mobile money integration
- Bitcoin: Too slow and expensive for micro-payments

**Key Operations:**
```javascript
const StellarSdk = require('stellar-sdk');

// Initialize
const server = new StellarSdk.Server('https://horizon.stellar.org');

// Create account
const pair = StellarSdk.Keypair.random();

// Send payment
const transaction = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.PUBLIC
})
.addOperation(StellarSdk.Operation.payment({
  destination: recipientAddress,
  asset: StellarSdk.Asset.native(),
  amount: '5.25'
}))
.setTimeout(180)
.build();
```

#### Soroban (Stellar Smart Contracts)
**Purpose:** On-chain logic and verification

**Why Soroban?**
- ✅ WebAssembly-based (write in Rust)
- ✅ Low gas fees compared to Ethereum
- ✅ Integrated with Stellar network
- ✅ Formal verification possible

**Smart Contract Use Cases:**
- Multi-signature wallets for collection points
- Material verification and registry
- Impact credit tokenization
- Escrow for large transactions

### Stablecoins

**Supported Assets:**
- USDC (Circle's USD stablecoin)
- Custom KES/GHS/NGN tokens (pegged to local currencies)
- XLM (Stellar's native asset)

**Why Stablecoins?**
- Avoid cryptocurrency volatility
- Easier conversion to local currency
- Regulatory compliance

---

## Integration Stack

### Mobile Money APIs

#### M-Pesa (Safaricom)
**Region:** Kenya, Tanzania  
**API:** Daraja API

```javascript
// M-Pesa B2C payment
const mpesa = require('mpesa-node');

const payment = await mpesa.b2c({
  InitiatorName: 'WasteFi',
  Amount: 250,
  PartyB: '254712345678',
  Remarks: 'Waste collection payment',
  Occassion: 'Transaction TXN123'
});
```

#### MTN Mobile Money
**Region:** Ghana, Uganda, Nigeria  
**API:** MoMo API

#### Airtel Money
**Region:** Kenya, Ghana, Nigeria  
**API:** Airtel Money API

**Integration Pattern:**
- Abstraction layer for unified interface
- Webhooks for payment confirmation
- Retry logic with exponential backoff
- Transaction reconciliation

### SMS Gateway

#### Twilio
**Purpose:** SMS notifications and OTP verification

**Why Twilio?**
- ✅ Reliable global coverage
- ✅ Fallback to local providers
- ✅ Excellent API and documentation
- ✅ Reasonable pricing

**Use Cases:**
- OTP for registration/login
- Transaction confirmations
- Low balance alerts
- Collection point notifications

**Alternatives:**
- Africa's Talking (local, cheaper for Africa)
- AWS SNS (good for AWS-native stacks)

### Communication

#### WebSockets (Socket.io)
**Purpose:** Real-time updates

**Features:**
- Live transaction notifications
- Collection point status updates
- Price changes
- Admin dashboard real-time metrics

```javascript
// Server-side
io.on('connection', (socket) => {
  socket.on('subscribe:user', (userId) => {
    socket.join(`user:${userId}`);
  });
});

// Emit transaction update
io.to(`user:${userId}`).emit('transaction:completed', transaction);

// Client-side
socket.on('transaction:completed', (data) => {
  dispatch(addTransaction(data));
  showNotification('Payment received!');
});
```

---

## DevOps Stack

### Containerization

#### Docker
**Purpose:** Application packaging and deployment

**Benefits:**
- Consistent environments (dev, staging, prod)
- Easy dependency management
- Microservices isolation
- Simplified deployment

**Sample Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

#### Docker Compose
**Purpose:** Local development environment

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/wastefi
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=wastefi

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### Orchestration

#### AWS ECS (Elastic Container Service)
**Purpose:** Container orchestration

**Why ECS over Kubernetes?**
- ✅ Simpler to set up and manage
- ✅ Native AWS integration
- ✅ Lower operational overhead
- ✅ Cost-effective for our scale
- ✅ Good enough for microservices

**When we'd migrate to Kubernetes:**
- 100+ microservices
- Multi-cloud strategy
- Complex networking requirements

### CI/CD

#### GitHub Actions
**Purpose:** Automated testing and deployment

**Workflow:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: wastefi/api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-def.json
          service: wastefi-api
          cluster: wastefi-production
```

### Infrastructure as Code

#### Terraform
**Purpose:** Manage cloud infrastructure

**Why Terraform?**
- ✅ Multi-cloud support
- ✅ Declarative syntax
- ✅ State management
- ✅ Large provider ecosystem

**Resources Managed:**
- VPC and networking
- ECS clusters and services
- RDS databases
- S3 buckets
- Load balancers
- Security groups

```hcl
resource "aws_ecs_service" "api" {
  name            = "wastefi-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3
  
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }
}
```

### Monitoring

#### AWS CloudWatch
**Purpose:** Logs and metrics

**Metrics Collected:**
- CPU and memory usage
- Request latency
- Error rates
- Custom business metrics

#### Sentry
**Purpose:** Error tracking and monitoring

**Features:**
- Real-time error notifications
- Stack traces and context
- Performance monitoring
- Release tracking

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

// Automatic error capture
app.use(Sentry.Handlers.errorHandler());
```

#### Prometheus + Grafana
**Purpose:** Metrics and dashboards

**Metrics:**
- API request rates
- Transaction volume
- Payment success rates
- Blockchain confirmation times

---

## Testing Stack

### Unit Testing

#### Jest
**Purpose:** JavaScript testing framework

```javascript
describe('PaymentService', () => {
  it('should calculate correct payment amount', () => {
    const amount = paymentService.calculate({
      materialType: 'PET',
      weight: 5.5,
      quality: 'A'
    });
    
    expect(amount).toBe(1.65); // 5.5 kg * $0.25 * 1.2
  });
});
```

### Integration Testing

#### Supertest
**Purpose:** API endpoint testing

```javascript
describe('POST /transactions', () => {
  it('should create transaction and return 201', async () => {
    const response = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: 'usr_123',
        materialType: 'PET',
        weight: 5.5
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### End-to-End Testing

#### Playwright
**Purpose:** Browser automation testing

```javascript
test('collector can deposit material and receive payment', async ({ page }) => {
  await page.goto('https://app.wastefi.org');
  await page.click('text=Deposit Material');
  await page.fill('#material-type', 'PET');
  await page.fill('#weight', '5.5');
  await page.click('text=Submit');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## Security Stack

### Authentication

#### JWT (JSON Web Tokens)
**Library:** jsonwebtoken

```javascript
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);
```

### Encryption

#### bcrypt
**Purpose:** Password hashing

```javascript
const hash = await bcrypt.hash(pin, 10);
const isValid = await bcrypt.compare(inputPin, hash);
```

#### crypto (Node.js)
**Purpose:** Data encryption

```javascript
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
```

### SSL/TLS

#### Let's Encrypt
**Purpose:** Free SSL certificates

**Automation:**
- Certbot for certificate renewal
- Auto-renewal every 60 days

---

## Development Tools

### Code Quality

- **ESLint:** JavaScript linting
- **Prettier:** Code formatting
- **Husky:** Git hooks
- **lint-staged:** Run linters on staged files

### API Documentation

#### Swagger/OpenAPI
**Purpose:** Interactive API documentation

```typescript
/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 */
```

### Version Control

#### Git + GitHub
**Branching Strategy:**
- `main` - Production
- `develop` - Development
- `feature/*` - Feature branches
- `hotfix/*` - Urgent fixes

---

## Summary Matrix

| Layer | Technology | Why? |
|-------|-----------|------|
| Mobile Frontend | React Native + TypeScript | Cross-platform, strong ecosystem |
| Web Frontend | React + Vite | Fast development, modern tooling |
| Backend Runtime | Node.js 18 LTS | JavaScript everywhere, great for I/O |
| Web Framework | Express.js | Simple, flexible, proven |
| Primary Database | PostgreSQL 15 | ACID, reliable, feature-rich |
| Cache/Session | Redis 7 | Fast, versatile, battle-tested |
| File Storage | Amazon S3 | Durable, scalable, cost-effective |
| Blockchain | Stellar | Fast, cheap, mobile-optimized |
| Smart Contracts | Soroban (Rust/Wasm) | Low fees, Stellar integration |
| Mobile Money | M-Pesa, MTN, Airtel | Local providers, high penetration |
| SMS | Twilio | Reliable, global coverage |
| Containers | Docker | Consistency, portability |
| Orchestration | AWS ECS | Managed, simpler than K8s |
| CI/CD | GitHub Actions | Native GitHub integration |
| IaC | Terraform | Multi-cloud, declarative |
| Monitoring | CloudWatch, Sentry | AWS native + error tracking |
| Testing | Jest, Supertest, Playwright | Comprehensive test coverage |

---

## Next Steps

- [Design Decisions](/technical/design-decisions) - Why we chose these technologies
- [Architecture](/guide/architecture) - How they all fit together
- [Development Setup](/guide/local-setup) - Get started developing
- [Deployment](/guide/deployment) - Deploy to production