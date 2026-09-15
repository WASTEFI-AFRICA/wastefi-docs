# Testing Documentation

## Overview

WasteFi uses comprehensive testing to ensure reliability and quality. This guide covers testing strategies, frameworks, and best practices for all components.

## Testing Philosophy

### Testing Pyramid

```
           ┌─────────────┐
          ╱   E2E Tests   ╲    Fewer, slower, expensive
         ╱   (Selenium)    ╲   Full system integration
        ╱─────────────────╲
       ╱  Integration Tests ╲   Medium quantity
      ╱   (API, Database)   ╲  Component interaction
     ╱───────────────────────╲
    ╱      Unit Tests         ╲  Many, fast, cheap
   ╱  (Functions, Classes)     ╲ Individual units
  ╱───────────────────────────╲
```

### Coverage Targets

| Component | Unit | Integration | E2E | Total |
|-----------|------|-------------|-----|-------|
| Backend API | 85% | 75% | - | 80% |
| Smart Contracts | 100% | 90% | - | 95% |
| Frontend | 70% | 60% | 50% | 65% |
| Overall Target | 80% | 70% | 50% | 75% |

---

## Backend Testing

### Unit Tests

**Framework:** Jest + Supertest

**Location:** `wastefi-backend/tests/unit/`

**Example Test:**

```javascript
// tests/unit/services/transaction.service.test.js
import { TransactionService } from '../../src/services/transaction.service';
import { Material } from '../../src/models';

describe('TransactionService', () => {
  let transactionService;
  let mockMaterialRepo;

  beforeEach(() => {
    mockMaterialRepo = {
      findByType: jest.fn(),
      getPricing: jest.fn()
    };
    transactionService = new TransactionService(mockMaterialRepo);
  });

  describe('calculateAmount', () => {
    it('should calculate correct amount for Grade A material', async () => {
      // Arrange
      const material = { type: 'PET', basePrice: 0.36 };
      mockMaterialRepo.findByType.mockResolvedValue(material);

      // Act
      const result = await transactionService.calculateAmount({
        materialType: 'PET',
        weight: 5.5,
        quality: 'A'
      });

      // Assert
      expect(result.grossAmount).toBe(1.98); // 5.5 * 0.36
      expect(result.platformFee).toBe(0.04); // 2% of 1.98
      expect(result.netAmount).toBe(1.94);
    });

    it('should apply quality multiplier for Grade B material', async () => {
      // Arrange
      const material = { type: 'PET', basePrice: 0.36 };
      mockMaterialRepo.findByType.mockResolvedValue(material);

      // Act
      const result = await transactionService.calculateAmount({
        materialType: 'PET',
        weight: 5.5,
        quality: 'B'
      });

      // Assert
      expect(result.grossAmount).toBe(1.78); // 5.5 * 0.36 * 0.9
      expect(result.netAmount).toBeLessThan(1.94);
    });

    it('should throw error for invalid material type', async () => {
      // Arrange
      mockMaterialRepo.findByType.mockResolvedValue(null);

      // Act & Assert
      await expect(
        transactionService.calculateAmount({
          materialType: 'INVALID',
          weight: 5.5,
          quality: 'A'
        })
      ).rejects.toThrow('Invalid material type');
    });
  });

  describe('processPayout', () => {
    it('should process mobile money payout successfully', async () => {
      // Test implementation
    });

    it('should handle mobile money provider failure', async () => {
      // Test implementation
    });

    it('should retry failed payouts', async () => {
      // Test implementation
    });
  });
});
```

**Run Unit Tests:**

```bash
# All unit tests
npm run test:unit

# Watch mode
npm run test:unit:watch

# With coverage
npm run test:unit:coverage

# Specific file
npm test -- transaction.service.test.js
```

### Integration Tests

**Framework:** Jest + Supertest + Testcontainers

**Location:** `wastefi-backend/tests/integration/`

**Example Test:**

```javascript
// tests/integration/api/transactions.test.js
import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDatabase, teardownTestDatabase } from '../helpers/db';
import { createTestUser, createTestCollectionPoint } from '../helpers/fixtures';

describe('Transaction API Integration', () => {
  let authToken;
  let collectorId;
  let collectionPointId;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Create test user and authenticate
    const collector = await createTestUser({ role: 'collector' });
    collectorId = collector.id;

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: collector.phone, pin: '1234' });

    authToken = response.body.token;

    // Create test collection point
    const collectionPoint = await createTestCollectionPoint();
    collectionPointId = collectionPoint.id;
  });

  describe('POST /api/v1/transactions', () => {
    it('should create transaction successfully', async () => {
      // Arrange
      const transactionData = {
        collectionPointId,
        materialType: 'PET',
        weight: 5.5,
        quality: 'A'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(String),
        collectorId,
        collectionPointId,
        materialType: 'PET',
        weight: 5.5,
        quality: 'A',
        status: 'pending',
        grossAmount: 1.98,
        netAmount: 1.94
      });

      // Verify database
      const transaction = await Transaction.findById(response.body.id);
      expect(transaction).toBeDefined();
      expect(transaction.status).toBe('pending');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/transactions')
        .send({})
        .expect(401);
    });

    it('should return 400 for invalid weight', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          collectionPointId,
          materialType: 'PET',
          weight: -5, // Invalid
          quality: 'A'
        })
        .expect(400);

      expect(response.body.error).toContain('Weight must be positive');
    });

    it('should return 404 for non-existent collection point', async () => {
      await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          collectionPointId: 'non-existent-id',
          materialType: 'PET',
          weight: 5.5,
          quality: 'A'
        })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/transactions/:id/confirm', () => {
    it('should confirm transaction and process payment', async () => {
      // Create pending transaction
      const transaction = await createTestTransaction({
        collectorId,
        status: 'pending'
      });

      // Confirm transaction
      const response = await request(app)
        .patch(`/api/v1/transactions/${transaction.id}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.stellarTxHash).toBeDefined();

      // Verify payment was processed
      const updatedTransaction = await Transaction.findById(transaction.id);
      expect(updatedTransaction.status).toBe('completed');
      expect(updatedTransaction.paidAt).toBeDefined();
    });
  });
});
```

**Run Integration Tests:**

```bash
# All integration tests
npm run test:integration

# Specific suite
npm run test:integration -- transactions

# With database cleanup
npm run test:integration:clean
```

### E2E Tests

**Framework:** Jest + Supertest

**Location:** `wastefi-backend/tests/e2e/`

**Example Test:**

```javascript
// tests/e2e/workflows/transaction-flow.test.js
describe('Complete Transaction Flow E2E', () => {
  it('should complete full transaction from creation to payout', async () => {
    // 1. Collector registers
    const collector = await registerCollector({
      phone: '+254712345678',
      name: 'John Doe'
    });

    // 2. Collector logs in
    const { token } = await login(collector.phone, '1234');

    // 3. Find nearby collection point
    const collectionPoints = await findNearby({
      latitude: -1.286389,
      longitude: 36.817223
    });
    expect(collectionPoints.length).toBeGreaterThan(0);

    // 4. Create transaction
    const transaction = await createTransaction(token, {
      collectionPointId: collectionPoints[0].id,
      materialType: 'PET',
      weight: 5.5,
      quality: 'A'
    });
    expect(transaction.status).toBe('pending');

    // 5. Operator confirms transaction
    const operator = await loginOperator(collectionPoints[0].id);
    await confirmTransaction(operator.token, transaction.id);

    // 6. Wait for payment processing
    await waitFor(() => 
      getTransaction(transaction.id).then(t => t.status === 'completed'),
      { timeout: 30000 }
    );

    // 7. Verify transaction completed
    const completedTransaction = await getTransaction(transaction.id);
    expect(completedTransaction.status).toBe('completed');
    expect(completedTransaction.stellarTxHash).toBeDefined();
    expect(completedTransaction.paidAt).toBeDefined();

    // 8. Verify collector balance updated
    const balance = await getBalance(token);
    expect(balance).toBeGreaterThanOrEqual(transaction.netAmount);

    // 9. Verify impact metrics updated
    const impact = await getImpact(collector.id);
    expect(impact.totalWeight).toBe(5.5);
    expect(impact.co2Saved).toBeCloseTo(13.75, 2);
  });
});
```

**Run E2E Tests:**

```bash
# All E2E tests
npm run test:e2e

# Specific workflow
npm run test:e2e -- transaction-flow

# With video recording
npm run test:e2e:video
```

---

## Smart Contract Testing

### Unit Tests

**Framework:** Rust built-in testing + soroban-sdk

**Location:** `wastefi-contracts/src/`

**Example Test:**

```rust
// src/transaction.rs
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_create_transaction() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TransactionContract);
        let client = TransactionContractClient::new(&env, &contract_id);

        let collector = Address::random(&env);
        let collection_point = Address::random(&env);

        // Create transaction
        let tx_id = client.create_transaction(
            &collector,
            &collection_point,
            &"PET".into(),
            &5500, // Weight in grams
            &1,    // Quality grade A
        );

        // Verify transaction
        let tx = client.get_transaction(&tx_id);
        assert_eq!(tx.collector, collector);
        assert_eq!(tx.weight, 5500);
        assert_eq!(tx.status, TransactionStatus::Pending);
    }

    #[test]
    fn test_confirm_transaction_updates_status() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TransactionContract);
        let client = TransactionContractClient::new(&env, &contract_id);

        let collector = Address::random(&env);
        let collection_point = Address::random(&env);

        // Create and confirm transaction
        let tx_id = client.create_transaction(
            &collector,
            &collection_point,
            &"PET".into(),
            &5500,
            &1,
        );

        client.confirm_transaction(&tx_id);

        // Verify status changed
        let tx = client.get_transaction(&tx_id);
        assert_eq!(tx.status, TransactionStatus::Confirmed);
    }

    #[test]
    #[should_panic(expected = "Invalid weight")]
    fn test_create_transaction_with_invalid_weight() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TransactionContract);
        let client = TransactionContractClient::new(&env, &contract_id);

        let collector = Address::random(&env);
        let collection_point = Address::random(&env);

        // Should panic with negative weight
        client.create_transaction(
            &collector,
            &collection_point,
            &"PET".into(),
            &0, // Invalid weight
            &1,
        );
    }
}
```

**Run Contract Tests:**

```bash
# All contract tests
cd wastefi-contracts
cargo test

# With output
cargo test -- --nocapture

# Specific test
cargo test test_create_transaction

# With coverage
cargo tarpaulin --out Html
```

### Integration Tests

**Location:** `wastefi-contracts/tests/`

**Example Test:**

```rust
// tests/integration_test.rs
#[test]
fn test_transaction_workflow_integration() {
    let env = Env::default();
    
    // Deploy contracts
    let transaction_contract = deploy_transaction_contract(&env);
    let payment_contract = deploy_payment_contract(&env);
    let impact_contract = deploy_impact_contract(&env);

    // Initialize contracts with references to each other
    transaction_contract.initialize(&payment_contract.address, &impact_contract.address);

    // Create transaction
    let collector = create_test_address(&env);
    let tx_id = transaction_contract.create_transaction(
        &collector,
        &collection_point,
        &"PET".into(),
        &5500,
        &1,
    );

    // Confirm transaction - should trigger payment
    transaction_contract.confirm_transaction(&tx_id);

    // Verify payment was processed
    let payment = payment_contract.get_payment(&tx_id);
    assert!(payment.is_some());
    assert_eq!(payment.unwrap().amount, 1940000); // $1.94 in stroops

    // Verify impact was recorded
    let impact = impact_contract.get_impact(&collector);
    assert_eq!(impact.total_weight, 5500);
    assert_eq!(impact.co2_saved, 13750); // grams
}
```

---

## Frontend Testing

### Unit Tests

**Framework:** Vitest + Vue Test Utils

**Location:** `wastefi-frontend/src/__tests__/unit/`

**Example Test:**

```javascript
// src/__tests__/unit/components/TransactionCard.test.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TransactionCard from '@/components/TransactionCard.vue';

describe('TransactionCard', () => {
  it('renders transaction details correctly', () => {
    const transaction = {
      id: 'tx-123',
      materialType: 'PET',
      weight: 5.5,
      netAmount: 1.94,
      status: 'completed',
      createdAt: '2024-09-15T10:30:00Z'
    };

    const wrapper = mount(TransactionCard, {
      props: { transaction }
    });

    expect(wrapper.text()).toContain('PET');
    expect(wrapper.text()).toContain('5.5 kg');
    expect(wrapper.text()).toContain('$1.94');
    expect(wrapper.find('.status-badge').classes()).toContain('status-completed');
  });

  it('displays pending status correctly', () => {
    const transaction = {
      id: 'tx-124',
      status: 'pending'
    };

    const wrapper = mount(TransactionCard, {
      props: { transaction }
    });

    expect(wrapper.find('.status-badge').classes()).toContain('status-pending');
    expect(wrapper.text()).toContain('Pending');
  });

  it('emits click event when clicked', async () => {
    const transaction = { id: 'tx-123' };
    const wrapper = mount(TransactionCard, {
      props: { transaction }
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')[0]).toEqual([transaction]);
  });
});
```

**Run Frontend Unit Tests:**

```bash
# All unit tests
npm run test:unit

# Watch mode
npm run test:unit:watch

# Coverage
npm run test:unit:coverage

# UI mode
npm run test:unit:ui
```

### Component Tests

**Framework:** Playwright Component Testing

**Location:** `wastefi-frontend/src/__tests__/component/`

**Example Test:**

```javascript
// src/__tests__/component/TransactionForm.test.js
import { test, expect } from '@playwright/experimental-ct-vue';
import TransactionForm from '@/components/TransactionForm.vue';

test('should submit valid transaction', async ({ mount }) => {
  let submitted = false;
  const component = await mount(TransactionForm, {
    props: {
      collectionPointId: 'cp-123',
      onSubmit: () => { submitted = true; }
    }
  });

  // Fill form
  await component.locator('#material-type').selectOption('PET');
  await component.locator('#weight').fill('5.5');
  await component.locator('#quality').selectOption('A');

  // Submit
  await component.locator('button[type="submit"]').click();

  // Verify submission
  expect(submitted).toBe(true);
});

test('should show validation errors', async ({ mount }) => {
  const component = await mount(TransactionForm);

  // Try to submit empty form
  await component.locator('button[type="submit"]').click();

  // Check for validation errors
  await expect(component.locator('.error-message')).toContainText('Material type is required');
  await expect(component.locator('.error-message')).toContainText('Weight is required');
});
```

**Run Component Tests:**

```bash
# All component tests
npm run test:component

# Headed mode (see browser)
npm run test:component -- --headed

# Debug mode
npm run test:component -- --debug
```

### E2E Tests

**Framework:** Playwright

**Location:** `wastefi-frontend/tests/e2e/`

**Example Test:**

```javascript
// tests/e2e/transaction-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Transaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#phone', '+254712345678');
    await page.fill('#pin', '1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create transaction successfully', async ({ page }) => {
    // Navigate to map
    await page.click('text=Find Collection Point');
    await expect(page).toHaveURL('/map');

    // Select collection point
    await page.click('.collection-point-marker').first();
    await page.click('text=Start Transaction');

    // Fill transaction form
    await page.selectOption('#material-type', 'PET');
    await page.fill('#weight', '5.5');
    await page.selectOption('#quality', 'A');

    // Review and submit
    await page.click('text=Continue');
    await expect(page.locator('.preview-amount')).toContainText('$1.94');
    await page.click('text=Confirm Transaction');

    // Enter PIN
    await page.fill('#pin', '1234');
    await page.click('text=Submit');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Transaction created successfully');

    // Verify transaction appears in history
    await page.click('text=View History');
    await expect(page.locator('.transaction-item').first()).toContainText('PET');
    await expect(page.locator('.transaction-item').first()).toContainText('5.5 kg');
  });

  test('should handle transaction failure gracefully', async ({ page, context }) => {
    // Mock API failure
    await context.route('**/api/v1/transactions', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    // Try to create transaction
    await page.goto('/map');
    await page.click('.collection-point-marker').first();
    await page.click('text=Start Transaction');
    
    await page.selectOption('#material-type', 'PET');
    await page.fill('#weight', '5.5');
    await page.click('text=Continue');
    await page.click('text=Confirm Transaction');
    await page.fill('#pin', '1234');
    await page.click('text=Submit');

    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Failed to create transaction');

    // Verify retry option
    await expect(page.locator('text=Retry')).toBeVisible();
  });
});
```

**Run E2E Tests:**

```bash
# All E2E tests
npm run test:e2e

# Headed mode
npm run test:e2e -- --headed

# Debug mode
npm run test:e2e -- --debug

# Specific browser
npm run test:e2e -- --project=chromium

# UI mode
npm run test:e2e:ui
```

---

## Test Helpers & Utilities

### Database Fixtures

```javascript
// tests/helpers/fixtures.js
export async function createTestUser(overrides = {}) {
  return await User.create({
    phone: '+254712345678',
    name: 'Test User',
    role: 'collector',
    pin: await hashPin('1234'),
    ...overrides
  });
}

export async function createTestCollectionPoint(overrides = {}) {
  return await CollectionPoint.create({
    name: 'Test Collection Point',
    latitude: -1.286389,
    longitude: 36.817223,
    status: 'active',
    ...overrides
  });
}

export async function createTestTransaction(overrides = {}) {
  const collector = await createTestUser();
  const collectionPoint = await createTestCollectionPoint();

  return await Transaction.create({
    collectorId: collector.id,
    collectionPointId: collectionPoint.id,
    materialType: 'PET',
    weight: 5.5,
    quality: 'A',
    grossAmount: 1.98,
    netAmount: 1.94,
    status: 'pending',
    ...overrides
  });
}
```

### API Mocks

```javascript
// tests/helpers/mocks.js
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-jwt-token',
        user: { id: '1', phone: '+254712345678', role: 'collector' }
      })
    );
  }),

  rest.get('/api/v1/collection-points', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'cp-1',
          name: 'Nairobi Central',
          latitude: -1.286389,
          longitude: 36.817223
        }
      ])
    );
  })
];

export const server = setupServer(...handlers);
```

---

## Test Configuration

### Jest Configuration

**jest.config.js:**

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.interface.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Playwright Configuration

**playwright.config.ts:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Continuous Testing

### Pre-commit Hooks

**`.husky/pre-commit`:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linter
npm run lint

# Run unit tests
npm run test:unit

# Run type check
npm run type-check
```

### Pre-push Hooks

**`.husky/pre-push`:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run all tests
npm run test

# Check coverage
npm run test:coverage -- --check-coverage
```

---

## Best Practices

### Writing Good Tests

**DO:**
- ✅ Write descriptive test names
- ✅ Use AAA pattern (Arrange, Act, Assert)
- ✅ Test one thing per test
- ✅ Keep tests independent
- ✅ Mock external dependencies
- ✅ Use realistic test data
- ✅ Clean up after tests

**DON'T:**
- ❌ Test implementation details
- ❌ Make tests dependent on order
- ❌ Use real API calls in unit tests
- ❌ Ignore failing tests
- ❌ Write overly complex tests
- ❌ Skip error cases

### Test Naming Conventions

```
✅ Good:
- should calculate correct amount for Grade A material
- should throw error for invalid material type
- should process mobile money payout successfully

❌ Bad:
- test1
- it works
- transaction test
```

### Coverage Guidelines

**Focus on:**
- Critical business logic
- Error handling
- Edge cases
- Security features
- Payment processing
- Data validation

**Less critical:**
- Simple getters/setters
- Configuration files
- Type definitions
- Third-party library wrappers

---

## Running Tests in CI/CD

See [CI/CD Documentation](./ci-cd.md) for pipeline configuration.

---

**Happy testing! 🧪**
