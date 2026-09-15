# Design Decisions

This document explains the key architectural and technical decisions made in building WasteFi, along with the tradeoffs and reasoning behind each choice.

## Table of Contents

1. [Offline-First Architecture](#offline-first-architecture)
2. [Blockchain Selection](#blockchain-selection)
3. [Monorepo vs Multi-Repo](#monorepo-vs-multi-repo)
4. [Mobile Money Integration](#mobile-money-integration)
5. [Database Choice](#database-choice)
6. [Authentication Strategy](#authentication-strategy)
7. [Pricing Strategy](#pricing-strategy)
8. [Testing Approach](#testing-approach)
9. [Open Source Strategy](#open-source-strategy)

---

## 1. Offline-First Architecture

### Decision
Build the mobile app to work fully offline, with background synchronization when connectivity is restored.

### Context
Internet connectivity in target markets (Kenya, Ghana, Nigeria):
- 3G/4G coverage: 60-70% in urban areas, 20-30% in rural
- Network reliability: Frequent dropouts and congestion
- Data costs: $5-10 per GB (significant for $1-3/day workers)
- WiFi access: Limited, mostly in urban centers

### Options Considered

**Option A: Online-Only**
- ✅ Simpler architecture
- ✅ Real-time data consistency
- ❌ Unusable without internet
- ❌ Excludes rural collectors
- ❌ High data costs for users

**Option B: Offline-First (Chosen)**
- ✅ Works without internet
- ✅ Lower data usage
- ✅ Better user experience
- ✅ Inclusive of rural areas
- ❌ Complex sync logic
- ❌ Potential conflict resolution
- ❌ Larger app size (cached data)

**Option C: Hybrid (Some Features Offline)**
- ✅ Balanced complexity
- ✅ Critical features work offline
- ❌ Confusing user experience
- ❌ Still excludes users at times

### Decision Rationale

**We chose Offline-First (Option B) because:**

1. **Inclusion is Core Mission:** Can't exclude rural collectors due to connectivity
2. **User Experience:** Instant response times, no loading spinners
3. **Cost Savings:** Sync once daily vs constant data usage saves users $20-30/month
4. **Reliability:** App works regardless of network conditions
5. **Competitive Advantage:** Most competitors require constant connectivity

### Implementation Details

```javascript
// Queue operations when offline
class OfflineQueue {
  async add(operation) {
    await db.queue.add({
      id: uuid(),
      type: operation.type,
      data: operation.data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    });
  }

  // Sync when online
  async process() {
    const pending = await db.queue
      .where('status').equals('pending')
      .sortBy('timestamp');

    for (const op of pending) {
      try {
        await this.execute(op);
        await db.queue.update(op.id, { status: 'completed' });
      } catch (error) {
        // Retry with exponential backoff
        await this.handleFailure(op, error);
      }
    }
  }
}
```

### Tradeoffs Accepted

- **Complexity:** More code to handle sync, conflicts, and edge cases
- **Storage:** Larger app size (50-100MB vs 10-20MB)
- **Development Time:** 30-40% longer initial development
- **Testing Burden:** Must test offline scenarios extensively

### Future Considerations

- Add conflict resolution UI for rare edge cases
- Implement partial sync for large datasets
- Consider differential sync to reduce data transfer

**Status:** Implemented in MVP  
**Owner:** Mobile Team  
**Last Reviewed:** 2024-09-15

---

## 2. Blockchain Selection

### Decision
Use Stellar blockchain for payments and Soroban smart contracts for verification logic.

### Context
Requirements for blockchain:
- Sub-cent transaction fees (critical for micro-payments)
- Fast finality (under 10 seconds)
- Low computational requirements (mobile devices)
- Integration with mobile money
- Proven scalability

### Options Considered

**Option A: Ethereum**
- ✅ Largest ecosystem
- ✅ Most developer talent
- ✅ Robust smart contracts (Solidity)
- ❌ $1-50 transaction fees (prohibitive)
- ❌ 15+ second block times
- ❌ High computational requirements
- ❌ No mobile money integrations

**Option B: Polygon**
- ✅ Low fees ($0.01-0.10)
- ✅ Ethereum compatibility
- ✅ Good ecosystem
- ❌ Still too expensive for $0.25 transactions
- ❌ Requires ETH for gas
- ❌ Limited African partnerships

**Option C: Stellar (Chosen)**
- ✅ $0.00001 transaction fees
- ✅ 3-5 second finality
- ✅ Built-in DEX
- ✅ Mobile-optimized
- ✅ African mobile money partnerships
- ✅ Stablecoin ecosystem
- ❌ Smaller developer community
- ❌ Less mature smart contract platform (Soroban is new)

**Option D: Solana**
- ✅ Very fast (400ms finality)
- ✅ Low fees
- ✅ Growing ecosystem
- ❌ Network stability issues
- ❌ High hardware requirements
- ❌ No mobile money focus

**Option E: Private/Permissioned Blockchain**
- ✅ Full control
- ✅ Customizable
- ✅ No gas fees
- ❌ Centralization concerns
- ❌ Lose network effects
- ❌ Must operate nodes
- ❌ No existing ecosystem

### Decision Matrix

| Criterion | Weight | Ethereum | Polygon | Stellar | Solana |
|-----------|--------|----------|---------|---------|--------|
| Transaction Cost | 30% | 2/10 | 6/10 | **10/10** | 9/10 |
| Speed | 20% | 5/10 | 7/10 | **9/10** | 10/10 |
| Mobile Optimization | 20% | 3/10 | 5/10 | **10/10** | 4/10 |
| Africa Integration | 15% | 2/10 | 3/10 | **10/10** | 2/10 |
| Ecosystem Size | 10% | 10/10 | 8/10 | **5/10** | 7/10 |
| Reliability | 5% | 9/10 | 8/10 | **9/10** | 6/10 |
| **Total Score** | | 4.3 | 6.2 | **9.0** | 6.5 |

### Decision Rationale

**We chose Stellar because:**

1. **Economics Work:** $0.00001 per transaction means payment fees are negligible
   - Sending $0.25 payment costs 0.004% in fees
   - Compare to Ethereum: 200-20,000% fees
   - Compare to mobile money: 2-5% fees

2. **User Experience:** 3-5 second finality means instant confirmation
   - Collector sees payment in real-time
   - No waiting for block confirmations
   - Similar to mobile money speed

3. **Mobile-First Design:** Stellar SDK optimized for mobile devices
   - Light client capabilities
   - Low bandwidth requirements
   - Battery-efficient

4. **Strategic Partnerships:** Stellar has African mobile money integrations
   - Direct M-Pesa collaboration
   - Focus on financial inclusion
   - Aligned mission

5. **Stablecoin Ecosystem:** USDC and others available natively
   - Avoid volatility issues
   - Easy conversion to local currency
   - Regulatory clarity

### Implementation Example

```javascript
// Stellar transaction costs 0.00001 XLM (~$0.000001)
const transaction = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE, // 100 stroops = 0.00001 XLM
  networkPassphrase: StellarSdk.Networks.PUBLIC
})
.addOperation(StellarSdk.Operation.payment({
  destination: collectorAddress,
  asset: USDC, // Stablecoin
  amount: '0.25' // $0.25
}))
.setTimeout(180)
.build();

// Cost analysis:
// Payment: $0.25
// Blockchain fee: $0.000001
// Effective fee: 0.0004%
// 
// vs M-Pesa:
// Payment: $0.25
// M-Pesa fee: $0.01 (4%)
// 10,000x more expensive!
```

### Tradeoffs Accepted

- **Smaller Ecosystem:** Fewer developers familiar with Stellar
  - Mitigation: Comprehensive documentation and training
  
- **Soroban Maturity:** Smart contract platform is new (2023)
  - Mitigation: Keep critical logic off-chain initially
  - Plan: Migrate to Soroban as it matures

- **Exchange Liquidity:** Fewer fiat on-ramps than Ethereum
  - Mitigation: Direct mobile money integration
  - Not a blocker: Users never hold crypto directly

### Future Considerations

- Monitor Soroban maturity and migrate smart contracts
- Evaluate cross-chain bridges if needed
- Consider multi-chain if compelling use case emerges

**Status:** Implemented in MVP  
**Owner:** Blockchain Team  
**Last Reviewed:** 2024-09-15

---

## 3. Monorepo vs Multi-Repo

### Decision
Use separate repositories (multi-repo) for each major component.

### Options Considered

**Option A: Monorepo (Nx/Turborepo)**
- ✅ Single version of dependencies
- ✅ Atomic commits across projects
- ✅ Easier code sharing
- ✅ Unified CI/CD
- ❌ Large repository size
- ❌ Longer clone times
- ❌ All-or-nothing access control
- ❌ More complex tooling

**Option B: Multi-Repo (Chosen)**
- ✅ Independent versioning
- ✅ Team autonomy
- ✅ Granular access control
- ✅ Smaller, faster repositories
- ✅ Easier open-sourcing
- ❌ Dependency synchronization
- ❌ Cross-repo changes harder
- ❌ Multiple CI/CD pipelines

### Decision Rationale

**We chose Multi-Repo because:**

1. **Team Structure:** Separate teams for frontend, backend, contracts, docs
2. **Open Source Strategy:** Easier to open source components independently
3. **Access Control:** Grant partners access to SDK without exposing core code
4. **Deployment Independence:** Deploy mobile app without redeploying backend
5. **Simplicity:** Easier for new contributors to understand

### Repository Structure

```
wastefi-frontend      → Mobile PWA and admin dashboard
wastefi-backend       → API services and business logic
wastefi-contracts     → Stellar Soroban smart contracts
wastefi-docs          → Documentation site
wastefi-sdk           → Developer SDK (public)
recyclegraph-protocol → Open material standards (public)
```

### Tradeoffs Accepted

- **Dependency Management:** Must manually sync shared types
  - Mitigation: Publish shared package to npm
- **Cross-Repo Changes:** Requires multiple PRs
  - Mitigation: Use conventional commits and good documentation

**Status:** Implemented  
**Owner:** DevOps Team

---

## 4. Mobile Money Integration

### Decision
Integrate with multiple mobile money providers through abstraction layer, with M-Pesa as primary launch partner.

### Context
Mobile money landscape in Africa:
- **Kenya:** M-Pesa dominates (80%+ market share)
- **Ghana:** MTN Mobile Money leads (60%), followed by Vodafone Cash
- **Nigeria:** Fragmented (MTN, Airtel, 9Mobile, Etisalat)
- **Tanzania:** Multiple providers (M-Pesa, Tigo Pesa, Airtel Money)

### Options Considered

**Option A: Blockchain-Only (No Mobile Money)**
- ✅ Simpler integration
- ✅ Lower transaction fees
- ✅ Faster payments
- ❌ Users can't access funds easily
- ❌ Limited merchant acceptance
- ❌ Requires crypto literacy
- ❌ Misses the point of financial inclusion

**Option B: Single Provider (M-Pesa Only)**
- ✅ Simplest implementation
- ✅ Proven API
- ✅ Fastest time to market
- ❌ Kenya-only initially
- ❌ Vendor lock-in
- ❌ Can't expand easily

**Option C: Multi-Provider with Abstraction (Chosen)**
- ✅ Works across countries
- ✅ User choice
- ✅ Redundancy if one fails
- ✅ Better negotiating position
- ❌ Complex integration
- ❌ More testing required
- ❌ Longer initial development

**Option D: Third-Party Aggregator**
- ✅ Single integration point
- ✅ They handle provider complexity
- ✅ Faster to market
- ❌ Additional fees (2-3%)
- ❌ Dependency on aggregator
- ❌ Less control over UX
- ❌ Still need fallback

### Decision Rationale

**We chose Multi-Provider with Abstraction because:**

1. **Geographic Expansion:** Must support multiple countries
2. **User Choice:** Collectors use different providers
3. **Resilience:** If M-Pesa has downtime, Airtel still works
4. **Negotiating Power:** Multi-homing gives leverage on fees
5. **Control:** Direct integrations = better UX and lower costs

### Implementation Pattern

```javascript
// Abstract provider interface
interface MobileMoneyProvider {
  async initiate(phone: string, amount: number): Promise<TransactionId>;
  async checkStatus(txId: TransactionId): Promise<Status>;
  async handleCallback(data: any): Promise<void>;
}

// Concrete implementations
class MpesaProvider implements MobileMoneyProvider {
  async initiate(phone, amount) {
    return await this.apiClient.b2c({
      phoneNumber: phone,
      amount: amount,
      callbackUrl: `${API_URL}/callbacks/mpesa`
    });
  }
}

class MTNProvider implements MobileMoneyProvider {
  async initiate(phone, amount) {
    return await this.apiClient.transfer({
      msisdn: phone,
      amount: amount
    });
  }
}

// Factory pattern
function getProvider(userPhone: string): MobileMoneyProvider {
  const countryCode = userPhone.substring(0, 3);
  
  switch(countryCode) {
    case '254': return new MpesaProvider();      // Kenya
    case '233': return new MTNProvider();         // Ghana
    case '234': return new MTNProvider();         // Nigeria
    default: throw new Error('Unsupported country');
  }
}
```

### Launch Strategy

**Phase 1 (MVP - Q4 2024):**
- M-Pesa only (Kenya)
- Validate product-market fit
- 10,000 collectors

**Phase 2 (Q1 2025):**
- Add MTN Mobile Money (Ghana, Nigeria)
- Expand to 50,000 collectors

**Phase 3 (Q2 2025):**
- Add Airtel Money, Tigo Pesa
- Full multi-provider support
- 100,000+ collectors

### Tradeoffs Accepted

- **Complexity:** Each provider has unique API and requirements
- **Testing:** Must test with real money on each network
- **Maintenance:** Provider APIs change, must keep current
- **Support:** More support complexity when issues arise

**Mitigation Strategies:**
- Comprehensive error logging and monitoring
- Fallback to manual processing if API fails
- Partner success managers for each provider
- Automated API health checks

**Status:** Phase 1 implemented (M-Pesa)  
**Owner:** Integrations Team  
**Next Review:** After 10K user milestone

---

## 5. Database Choice

### Decision
Use PostgreSQL as primary database, Redis for caching/sessions, Stellar ledger for immutable records.

### Why PostgreSQL Over Alternatives?

**vs MySQL:**
- ✅ Better JSON support (critical for flexible schemas)
- ✅ PostGIS for geospatial queries
- ✅ More advanced indexing (GiST, GIN)
- ✅ Better handling of concurrent writes
- ✅ Full ACID compliance (InnoDB has limitations)

**vs MongoDB:**
- ✅ ACID transactions (critical for money)
- ✅ Data integrity constraints
- ✅ Mature replication and backup
- ✅ Better for relational data (users, transactions)
- ❌ MongoDB better for flexible schemas (not our primary need)

**vs CockroachDB:**
- ✅ Free and open source
- ✅ Mature ecosystem
- ✅ Lower operational complexity
- ❌ CockroachDB has better distributed capabilities (not needed at our scale)

### Schema Design Philosophy

**Normalized where appropriate:**
```sql
-- Users table (normalized)
users (
    id UUID PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(20)
)

-- Transactions reference users
transactions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2)
)
```

**Denormalized for performance:**
```sql
-- Transaction includes frequently accessed user data
transactions (
    id UUID,
    user_id UUID,
    user_phone VARCHAR(20),  -- Denormalized
    user_name VARCHAR(100),  -- Denormalized
    amount DECIMAL(10,2)
)
```

**JSON for flexible metadata:**
```sql
transactions (
    id UUID,
    metadata JSONB  -- Material details, location, etc.
)

-- Can query JSON fields
SELECT * FROM transactions 
WHERE metadata->>'materialType' = 'PET';
```

**Status:** Implemented  
**Owner:** Backend Team

---

## 6. Authentication Strategy

### Decision
Phone number + PIN authentication with OTP verification, no traditional passwords or email required.

### Context
Target users (waste collectors):
- 60-70% have smartphones
- 30-40% have basic phones
- 90%+ have mobile phone numbers
- 40-50% have email (often don't check)
- Low literacy rates in some regions
- Familiar with mobile money PIN patterns

### Options Considered

**Option A: Email + Password**
- ✅ Standard pattern
- ✅ Familiar to developers
- ❌ Many collectors don't have email
- ❌ Password reset requires email
- ❌ Complex passwords are burden

**Option B: Phone + Password**
- ✅ Everyone has phone
- ✅ SMS verification possible
- ❌ Password complexity still an issue
- ❌ Doesn't match mental model (mobile money uses PIN)

**Option C: Phone + PIN (Chosen)**
- ✅ Matches mobile money pattern
- ✅ Everyone has phone
- ✅ Simple 4-6 digit PIN
- ✅ Familiar UX
- ✅ Easy OTP verification
- ❌ Less secure than strong password
- ❌ Potential SIM swap attacks

**Option D: Biometric Only**
- ✅ Most secure
- ✅ Best UX
- ❌ Not all phones support
- ❌ Fails in dusty/dirty environments
- ❌ No fallback for device loss

### Decision Rationale

**We chose Phone + PIN because:**

1. **Familiarity:** Matches M-Pesa and mobile money UX
2. **Accessibility:** Works on basic phones via USSD
3. **Simplicity:** 4-digit PIN easier than complex password
4. **Universal:** Everyone has a phone number
5. **Backup:** Can reset via OTP to same number

### Security Measures

```javascript
// PIN requirements
const PIN_CONFIG = {
  length: 4,              // 4 digits
  minUnique: 3,           // At least 3 unique digits
  noSequences: true,      // No 1234 or 4321
  noRepeating: true,      // No 1111
  maxAttempts: 3,         // Lock after 3 failures
  lockDuration: 300       // 5 minute lockout
};

// OTP for sensitive operations
async function requireOTP(userId, action) {
  const otp = generateOTP(6);  // 6 digit code
  await sms.send(user.phone, `WasteFi OTP: ${otp}. Valid for 5 minutes.`);
  
  return await verifyOTP(userId, otp, 300); // 5 minute expiry
}
```

### Additional Security Layers

1. **Device Binding:** Recognize trusted devices
2. **Biometric as Option:** Use fingerprint/face when available
3. **Transaction Limits:** Require OTP for large withdrawals
4. **Geo-Fencing:** Alert if login from unusual location
5. **Rate Limiting:** Prevent brute force attacks

### Tradeoffs Accepted

- **SIM Swap Risk:** Attacker with SIM can reset PIN
  - Mitigation: Device binding and alerts
  
- **PIN Strength:** 4 digits = 10,000 combinations
  - Mitigation: Account lockout after 3 attempts
  - Mitigation: Disallow common patterns

**Status:** Implemented  
**Owner:** Auth Team  
**Next Review:** After security audit

---

## 7. Pricing Strategy

### Decision
Use real-time market data with transparent pricing, no hidden fees, collectors see exactly what they'll receive.

### Context
Traditional waste collection:
- Middlemen pay 40-60% below market rates
- Subjective quality grading
- No price transparency
- Regional monopolies

### Options Considered

**Option A: Fixed Pricing**
- ✅ Simple and predictable
- ✅ Easy to communicate
- ❌ Doesn't reflect market changes
- ❌ Unprofitable when prices drop
- ❌ Leave money on table when prices rise

**Option B: Negotiated Pricing**
- ✅ Flexible
- ✅ Can optimize per transaction
- ❌ Not scalable
- ❌ Recreates middleman problem
- ❌ No transparency

**Option C: Market-Based with Transparency (Chosen)**
- ✅ Fair to collectors and platform
- ✅ Adapts to market conditions
- ✅ Transparent and verifiable
- ✅ Competitive with alternatives
- ❌ Price volatility
- ❌ Requires data infrastructure

### Pricing Formula

```javascript
function calculatePayment(material, weight, quality) {
  // Base price from commodity market
  const basePrice = getMarketPrice(material.type);
  
  // Quality multiplier (standardized grading)
  const qualityMultiplier = QUALITY_GRADES[quality];
  
  // Location adjustment (transport costs)
  const locationMultiplier = getLocationMultiplier(collectionPoint);
  
  // Calculate gross payment
  const grossPayment = weight * basePrice * qualityMultiplier * locationMultiplier;
  
  // Platform fee (transparent)
  const platformFee = grossPayment * 0.02; // 2%
  
  // Blockchain fee (actual cost)
  const blockchainFee = 0.00001; // $0.00001 on Stellar
  
  // Net payment to collector
  const netPayment = grossPayment - platformFee - blockchainFee;
  
  return {
    gross: grossPayment,
    platformFee: platformFee,
    blockchainFee: blockchainFee,
    net: netPayment,
    breakdown: {
      basePrice,
      weight,
      quality,
      qualityMultiplier
    }
  };
}
```

### Price Transparency

**In-App Display:**
```
PET Plastic Bottles (Grade A)
Base price: $0.30/kg
Your quality: A (x1.2 bonus)
Your location: +5% (Nairobi)
────────────────────────
Gross: $1.89
Platform fee (2%): -$0.04
Blockchain: -$0.00
────────────────────────
You receive: $1.85

Market updated: 2 hours ago
```

### Benefits

1. **Trust:** Collectors see exactly how payment calculated
2. **Fairness:** Market-based = no exploitation
3. **Competition:** Can compare to other buyers
4. **Sustainability:** Platform profitable at scale

**Status:** Implemented  
**Owner:** Product Team

---

## 8. Testing Approach

### Decision
Implement comprehensive testing at unit, integration, and E2E levels with focus on financial transaction accuracy.

### Testing Pyramid

```
        /\
       /E2E\       ← 10% of tests (critical user flows)
      /──────\
     /Integration\  ← 30% of tests (API, services)
    /────────────\
   /    Unit      \  ← 60% of tests (functions, logic)
  /────────────────\
```

### Critical Test Areas

**Financial Transactions (100% Coverage Required):**
```javascript
describe('Payment Calculation', () => {
  it('should never pay more than deposited', () => {
    const payment = calculatePayment(material, weight, quality);
    expect(payment.net).toBeLessThanOrEqual(payment.gross);
  });

  it('should handle decimal precision correctly', () => {
    // Avoid floating point errors in money calculations
    const result = calculatePayment('PET', 1.11, 'A');
    expect(result.net).toBe(0.33); // Exact, not 0.3300000001
  });
});
```

**Offline Sync (Critical for UX):**
```javascript
describe('Offline Queue', () => {
  it('should not lose transactions when offline', async () => {
    await goOffline();
    await createTransaction(data);
    await goOnline();
    await sync();
    
    const tx = await api.getTransaction(data.id);
    expect(tx).toBeDefined();
  });
});
```

**Status:** Implemented  
**Coverage:** 85% overall, 100% for financial code

---

## 9. Open Source Strategy

### Decision
Open source the RecycleGraph protocol and SDKs immediately, core platform after reaching product-market fit.

### Reasoning

**What to Open Source:**
- ✅ RecycleGraph material identification standards
- ✅ Developer SDKs and APIs
- ✅ Documentation and guides
- ✅ Mobile app (post-security audit)
- ✅ Smart contracts (after audit)

**What to Keep Private (Initially):**
- ❌ Backend business logic (competitive advantage)
- ❌ Mobile money integrations (partner agreements)
- ❌ Machine learning models (training data value)

**Timeline:**
- Q4 2024: RecycleGraph protocol + SDK
- Q1 2025: Mobile app open sourced
- Q2 2025: Smart contracts open sourced
- Q3 2025: Backend API specification

### Benefits

1. **Network Effects:** Others implement RecycleGraph = more value
2. **Trust:** Open source = verifiable and auditable
3. **Community:** Contributors improve the platform
4. **Standards:** Can't be a standard if it's proprietary

**Status:** Protocol published, app in progress  
**Owner:** Open Source Team

---

## Review Process

These design decisions are living documents. We review them:
- **Quarterly:** Reassess major decisions
- **On Incidents:** If decision contributed to issue
- **On Scale:** When hitting growth milestones

**Last Updated:** 2024-09-15  
**Next Review:** 2024-12-15

---

## Learn More

- [Technology Stack](/technical/technology-stack) - Complete stack overview
- [Architecture](/guide/architecture) - System design
- [Contribution Guide](/CONTRIBUTING.md) - How to contribute
- [Roadmap](/about/roadmap) - Future plans