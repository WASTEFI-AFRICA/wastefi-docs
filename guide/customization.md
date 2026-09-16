# Extending and Customizing WasteFi

## Overview

WasteFi is designed to be extensible and customizable for different regions, use cases, and requirements. This guide covers how to extend and customize the platform.

## Customization Options

### 1. Regional Customization
### 2. Material Types & Pricing
### 3. Payment Methods
### 4. User Interface & Branding
### 5. Business Logic
### 6. Reporting & Analytics
### 7. Integrations

---

## Regional Customization

### Adding a New Country

**1. Configure country settings:**

```javascript
// backend/src/config/countries.js
export const countries = {
  // Existing countries...
  
  // Add new country
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    phoneCode: '+255',
    phoneFormat: /^\+255[67]\d{8}$/,
    locale: 'sw-TZ',
    timezone: 'Africa/Dar_es_Salaam',
    
    // Payment providers
    paymentProviders: ['mpesa', 'tigopesa', 'airtel'],
    
    // Regulations
    taxRate: 0.18, // 18% VAT
    kycRequired: true,
    minTransactionAmount: 1000, // TSh 1,000
    maxTransactionAmount: 5000000, // TSh 5,000,000
    
    // Language
    defaultLanguage: 'sw',
    supportedLanguages: ['sw', 'en']
  }
};
```

**2. Add country-specific validation:**

```javascript
// backend/src/validators/phone.validator.js
export function validatePhone(phone, countryCode) {
  const country = countries[countryCode];
  
  if (!country) {
    throw new Error('Unsupported country');
  }
  
  if (!country.phoneFormat.test(phone)) {
    throw new Error(`Invalid phone number format for ${country.name}`);
  }
  
  return true;
}
```

**3. Add translations:**

```javascript
// frontend/src/locales/sw-TZ.json
{
  "common": {
    "welcome": "Karibu WasteFi",
    "login": "Ingia",
    "register": "Jisajili"
  },
  "transaction": {
    "create": "Unda Muamala",
    "weight": "Uzito",
    "material": "Malighafi"
  }
}
```

**4. Configure payment provider:**

```javascript
// backend/src/integrations/tigopesa.js
export class TigoPesaIntegration {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl;
  }
  
  async sendMoney(phoneNumber, amount, reference) {
    // Implementation for Tigo Pesa
    const response = await axios.post(
      `${this.baseUrl}/v1/payments`,
      {
        phone: phoneNumber,
        amount: amount,
        reference: reference
      },
      {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }
  
  async getAccessToken() {
    // OAuth implementation
  }
}
```

---

## Material Types & Pricing

### Adding New Material Types

**1. Define material in database:**

```sql
-- migrations/add_glass_material.sql
INSERT INTO materials (
  type,
  name,
  description,
  base_price,
  unit,
  category,
  co2_per_kg,
  density,
  accepted_qualities
) VALUES (
  'GLASS',
  'Glass',
  'Clear and colored glass bottles and jars',
  0.10, -- $0.10 per kg
  'kg',
  'recyclable',
  0.31, -- CO2 saved per kg
  2.5,  -- density
  ARRAY['A', 'B', 'C']
);
```

**2. Update material enum:**

```typescript
// backend/src/types/material.types.ts
export enum MaterialType {
  PET = 'PET',
  HDPE = 'HDPE',
  LDPE = 'LDPE',
  PP = 'PP',
  PS = 'PS',
  PVC = 'PVC',
  GLASS = 'GLASS', // New material
  ALUMINUM = 'ALUMINUM',
  CARDBOARD = 'CARDBOARD',
  PAPER = 'PAPER'
}
```

**3. Add material icon and color:**

```javascript
// frontend/src/config/materials.js
export const materialConfig = {
  GLASS: {
    icon: '🍾',
    color: '#10b981',
    displayName: 'Glass',
    description: 'Bottles, jars, and containers',
    examples: ['Beer bottles', 'Wine bottles', 'Jam jars'],
    tips: [
      'Remove caps and lids',
      'Rinse thoroughly',
      'Sort by color if possible'
    ]
  }
};
```

**4. Add quality grading logic:**

```javascript
// backend/src/services/quality.service.js
export function gradeGlass(material) {
  let score = 100;
  
  // Check for contamination
  if (material.hasContamination) score -= 30;
  
  // Check for breakage
  if (material.isBroken) score -= 20;
  
  // Check for labels
  if (material.hasLabels) score -= 10;
  
  // Check for caps
  if (material.hasCaps) score -= 10;
  
  // Determine grade
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  return 'REJECTED';
}
```

### Dynamic Pricing

**Create pricing rules engine:**

```javascript
// backend/src/services/pricing.service.js
export class PricingService {
  constructor() {
    this.rules = [];
  }
  
  addRule(rule) {
    this.rules.push(rule);
  }
  
  calculatePrice(transaction) {
    let basePrice = transaction.material.basePrice;
    let finalPrice = basePrice;
    
    // Apply all rules
    for (const rule of this.rules) {
      if (rule.condition(transaction)) {
        finalPrice = rule.apply(finalPrice, transaction);
      }
    }
    
    return finalPrice * transaction.weight;
  }
}

// Example rules
pricingService.addRule({
  name: 'Quality Multiplier',
  condition: (tx) => true,
  apply: (price, tx) => {
    const multipliers = { A: 1.0, B: 0.9, C: 0.7 };
    return price * multipliers[tx.quality];
  }
});

pricingService.addRule({
  name: 'Bulk Discount',
  condition: (tx) => tx.weight > 50,
  apply: (price, tx) => price * 1.1 // 10% bonus for bulk
});

pricingService.addRule({
  name: 'Peak Hours Bonus',
  condition: (tx) => {
    const hour = new Date().getHours();
    return hour >= 6 && hour <= 9; // Morning peak
  },
  apply: (price, tx) => price * 1.05 // 5% bonus
});

pricingService.addRule({
  name: 'Seasonal Adjustment',
  condition: (tx) => {
    const month = new Date().getMonth();
    return month >= 11 || month <= 1; // Holiday season
  },
  apply: (price, tx) => price * 1.15 // 15% bonus
});
```

---

## Payment Methods

### Adding a Custom Payment Provider

**1. Create payment provider interface:**

```typescript
// backend/src/interfaces/payment-provider.interface.ts
export interface PaymentProvider {
  name: string;
  sendMoney(phoneNumber: string, amount: number, reference: string): Promise<PaymentResult>;
  checkStatus(transactionId: string): Promise<PaymentStatus>;
  handleWebhook(payload: any): Promise<WebhookResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  amount?: number;
}
```

**2. Implement custom provider:**

```typescript
// backend/src/integrations/custom-payment.ts
import { PaymentProvider, PaymentResult, PaymentStatus } from '../interfaces';

export class CustomPaymentProvider implements PaymentProvider {
  name = 'custom-payment';
  
  constructor(private config: any) {}
  
  async sendMoney(phoneNumber: string, amount: number, reference: string): Promise<PaymentResult> {
    try {
      // Your payment API integration here
      const response = await fetch(`${this.config.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: phoneNumber,
          amount: amount,
          currency: this.config.currency,
          reference: reference,
          metadata: {
            source: 'wastefi',
            type: 'recycling_payment'
          }
        })
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        transactionId: data.transactionId,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        message: error.message
      };
    }
  }
  
  async checkStatus(transactionId: string): Promise<PaymentStatus> {
    const response = await fetch(
      `${this.config.apiUrl}/payments/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      }
    );
    
    const data = await response.json();
    
    return {
      status: data.status,
      transactionId: data.id,
      amount: data.amount
    };
  }
  
  async handleWebhook(payload: any): Promise<WebhookResult> {
    // Verify webhook signature
    const isValid = this.verifySignature(payload);
    
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }
    
    return {
      event: payload.event,
      transactionId: payload.data.transactionId,
      status: payload.data.status
    };
  }
  
  private verifySignature(payload: any): boolean {
    // Implement signature verification
    return true;
  }
}
```

**3. Register provider:**

```typescript
// backend/src/config/payment-providers.ts
import { CustomPaymentProvider } from '../integrations/custom-payment';

export function getPaymentProvider(providerName: string) {
  switch (providerName) {
    case 'mpesa':
      return new MPesaProvider(config.mpesa);
    case 'custom-payment':
      return new CustomPaymentProvider(config.customPayment);
    default:
      throw new Error(`Unknown payment provider: ${providerName}`);
  }
}
```

---

## User Interface & Branding

### Custom Themes

**1. Create theme configuration:**

```javascript
// frontend/src/themes/custom-theme.js
export const customTheme = {
  name: 'custom',
  colors: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#f59e0b',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Backgrounds
    background: '#ffffff',
    surface: '#f9fafb',
    
    // Text
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textDisabled: '#9ca3af',
    
    // Borders
    border: '#e5e7eb',
    divider: '#f3f4f6'
  },
  
  fonts: {
    primary: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};
```

**2. Apply theme:**

```javascript
// frontend/src/App.vue
<script setup>
import { customTheme } from './themes/custom-theme';
import { useTheme } from './composables/useTheme';

const { setTheme } = useTheme();
setTheme(customTheme);
</script>

<style>
:root {
  --color-primary: v-bind('customTheme.colors.primary');
  --color-secondary: v-bind('customTheme.colors.secondary');
  /* ... other CSS variables */
}
</style>
```

### White-Label Configuration

**Create white-label config:**

```javascript
// frontend/src/config/whitelabel.js
export const whitelabelConfig = {
  // Branding
  appName: 'EcoPoints', // Custom app name
  companyName: 'EcoPoints Ltd',
  logo: '/custom-logo.svg',
  favicon: '/custom-favicon.ico',
  
  // Colors (override theme)
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  
  // Contact
  supportEmail: 'support@ecopoints.com',
  supportPhone: '+254700000000',
  website: 'https://ecopoints.com',
  
  // Features (enable/disable)
  features: {
    referrals: true,
    carbonCredits: false,
    leaderboard: true,
    achievements: true
  },
  
  // Terms & Privacy
  termsUrl: 'https://ecopoints.com/terms',
  privacyUrl: 'https://ecopoints.com/privacy',
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/ecopoints',
    twitter: 'https://twitter.com/ecopoints',
    instagram: 'https://instagram.com/ecopoints'
  }
};
```

---

## Business Logic Extensions

### Custom Transaction Workflow

**Create workflow engine:**

```typescript
// backend/src/workflows/transaction.workflow.ts
export class TransactionWorkflow {
  private steps: WorkflowStep[] = [];
  
  addStep(step: WorkflowStep) {
    this.steps.push(step);
  }
  
  async execute(transaction: Transaction) {
    for (const step of this.steps) {
      try {
        await step.execute(transaction);
        
        if (step.shouldStop && step.shouldStop(transaction)) {
          break;
        }
      } catch (error) {
        if (step.onError) {
          await step.onError(transaction, error);
        } else {
          throw error;
        }
      }
    }
    
    return transaction;
  }
}

// Define custom steps
const photoVerificationStep: WorkflowStep = {
  name: 'Photo Verification',
  execute: async (transaction) => {
    if (transaction.photoUrl) {
      const result = await verifyPhoto(transaction.photoUrl);
      
      if (!result.isValid) {
        transaction.status = 'rejected';
        transaction.rejectionReason = 'Photo verification failed';
      }
    }
  }
};

const fraudDetectionStep: WorkflowStep = {
  name: 'Fraud Detection',
  execute: async (transaction) => {
    const riskScore = await calculateRiskScore(transaction);
    
    if (riskScore > 0.8) {
      transaction.requiresManualReview = true;
      await notifyAdmins(transaction);
    }
  }
};

const loyaltyPointsStep: WorkflowStep = {
  name: 'Award Loyalty Points',
  execute: async (transaction) => {
    const points = Math.floor(transaction.netAmount * 10);
    await awardPoints(transaction.collectorId, points);
  }
};

// Configure workflow
const workflow = new TransactionWorkflow();
workflow.addStep(photoVerificationStep);
workflow.addStep(fraudDetectionStep);
workflow.addStep(loyaltyPointsStep);

// Use workflow
await workflow.execute(transaction);
```

### Custom Validators

```typescript
// backend/src/validators/custom.validator.ts
export class CustomTransactionValidator {
  private rules: ValidationRule[] = [];
  
  addRule(rule: ValidationRule) {
    this.rules.push(rule);
  }
  
  async validate(transaction: Transaction): Promise<ValidationResult> {
    const errors: string[] = [];
    
    for (const rule of this.rules) {
      const result = await rule.validate(transaction);
      
      if (!result.isValid) {
        errors.push(result.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Example: Minimum weight per material
validator.addRule({
  name: 'Minimum Weight',
  validate: async (tx) => {
    const minWeights = {
      PET: 0.5,  // 500g minimum
      HDPE: 1.0, // 1kg minimum
      GLASS: 2.0 // 2kg minimum
    };
    
    const minWeight = minWeights[tx.materialType] || 0.1;
    
    return {
      isValid: tx.weight >= minWeight,
      message: `Minimum weight for ${tx.materialType} is ${minWeight} kg`
    };
  }
});

// Example: Maximum daily transactions per user
validator.addRule({
  name: 'Daily Transaction Limit',
  validate: async (tx) => {
    const todayCount = await countTransactionsToday(tx.collectorId);
    const maxDaily = 10;
    
    return {
      isValid: todayCount < maxDaily,
      message: `Maximum ${maxDaily} transactions per day`
    };
  }
});
```

---

## Reporting & Analytics

### Custom Reports

**Create report generator:**

```typescript
// backend/src/reports/custom-report.ts
export class ReportGenerator {
  async generateMonthlyReport(month: number, year: number) {
    const transactions = await this.getTransactionsForMonth(month, year);
    
    const report = {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      summary: {
        totalTransactions: transactions.length,
        totalWeight: transactions.reduce((sum, tx) => sum + tx.weight, 0),
        totalAmount: transactions.reduce((sum, tx) => sum + tx.netAmount, 0),
        totalCO2Saved: transactions.reduce((sum, tx) => sum + tx.co2Saved, 0),
        uniqueCollectors: new Set(transactions.map(tx => tx.collectorId)).size,
        activeCollectionPoints: new Set(transactions.map(tx => tx.collectionPointId)).size
      },
      byMaterial: this.groupByMaterial(transactions),
      byCollectionPoint: this.groupByCollectionPoint(transactions),
      topCollectors: this.getTopCollectors(transactions, 10),
      dailyBreakdown: this.getDailyBreakdown(transactions),
      qualityDistribution: this.getQualityDistribution(transactions)
    };
    
    return report;
  }
  
  private groupByMaterial(transactions: Transaction[]) {
    const grouped = {};
    
    for (const tx of transactions) {
      if (!grouped[tx.materialType]) {
        grouped[tx.materialType] = {
          count: 0,
          weight: 0,
          amount: 0
        };
      }
      
      grouped[tx.materialType].count++;
      grouped[tx.materialType].weight += tx.weight;
      grouped[tx.materialType].amount += tx.netAmount;
    }
    
    return grouped;
  }
  
  async exportToPDF(report: any): Promise<Buffer> {
    // Use library like pdfkit or puppeteer
  }
  
  async exportToExcel(report: any): Promise<Buffer> {
    // Use library like exceljs
  }
}
```

### Custom Analytics Events

```typescript
// backend/src/analytics/custom-events.ts
export class AnalyticsService {
  track(event: string, properties: any) {
    // Send to analytics provider (Mixpanel, Google Analytics, etc.)
    
    // Also store in database for custom queries
    this.db.events.create({
      name: event,
      properties,
      timestamp: new Date()
    });
  }
}

// Track custom events
analytics.track('transaction_created', {
  materialType: transaction.materialType,
  weight: transaction.weight,
  collectionPointRegion: collectionPoint.region,
  userSegment: user.segment
});

analytics.track('milestone_reached', {
  userId: user.id,
  milestone: '100_kg_collected',
  totalWeight: user.totalWeight
});
```

---

## Plugin System

### Creating Plugins

**Define plugin interface:**

```typescript
// backend/src/plugins/plugin.interface.ts
export interface Plugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  install?(app: Application): Promise<void>;
  uninstall?(): Promise<void>;
  
  // Event hooks
  onTransactionCreated?(transaction: Transaction): Promise<void>;
  onTransactionCompleted?(transaction: Transaction): Promise<void>;
  onUserRegistered?(user: User): Promise<void>;
  
  // Custom routes
  routes?: Route[];
  
  // Custom migrations
  migrations?: string[];
}
```

**Example plugin:**

```typescript
// plugins/referral-system/index.ts
export const referralPlugin: Plugin = {
  name: 'referral-system',
  version: '1.0.0',
  
  async install(app) {
    console.log('Installing referral plugin...');
    
    // Run migrations
    await runMigrations(this.migrations);
    
    // Register routes
    this.routes.forEach(route => {
      app.use(route.path, route.handler);
    });
  },
  
  async onUserRegistered(user) {
    // Check if user was referred
    if (user.referralCode) {
      const referrer = await findUserByReferralCode(user.referralCode);
      
      if (referrer) {
        // Award bonus to referrer
        await awardBonus(referrer.id, 5.00);
        
        // Award bonus to new user
        await awardBonus(user.id, 2.00);
        
        // Track referral
        await createReferral({
          referrerId: referrer.id,
          referredId: user.id,
          bonusAwarded: true
        });
      }
    }
  },
  
  async onTransactionCompleted(transaction) {
    // Award referrer when referred user makes transactions
    const referral = await findReferral(transaction.collectorId);
    
    if (referral && referral.isActive) {
      const bonus = transaction.netAmount * 0.05; // 5% commission
      await awardBonus(referral.referrerId, bonus);
    }
  },
  
  routes: [
    {
      path: '/api/v1/referrals',
      handler: referralRoutes
    }
  ],
  
  migrations: [
    '001_create_referrals_table.sql',
    '002_add_referral_code_to_users.sql'
  ]
};
```

**Load plugins:**

```typescript
// backend/src/app.ts
import { referralPlugin } from './plugins/referral-system';
import { loyaltyPlugin } from './plugins/loyalty-program';

const plugins = [referralPlugin, loyaltyPlugin];

async function loadPlugins(app: Application) {
  for (const plugin of plugins) {
    await plugin.install(app);
    console.log(`Plugin ${plugin.name} v${plugin.version} installed`);
  }
}

await loadPlugins(app);
```

---

## Best Practices

### Extensibility Guidelines

1. **Use interfaces** - Define clear interfaces for custom implementations
2. **Event-driven architecture** - Emit events for extensibility points
3. **Configuration over code** - Use config files for customization
4. **Plugin system** - Separate custom logic into plugins
5. **Feature flags** - Enable/disable features via configuration
6. **Version control** - Version your customizations separately
7. **Documentation** - Document all extension points
8. **Testing** - Test custom code thoroughly

### Upgrade Safety

**Keep customizations separate:**

```
project/
├── wastefi-backend/          # Core (don't modify)
├── wastefi-frontend/         # Core (don't modify)
├── custom/
│   ├── plugins/              # Your plugins
│   ├── themes/               # Your themes
│   ├── integrations/         # Your integrations
│   └── config/               # Your config overrides
```

**Use version pinning:**

```json
{
  "dependencies": {
    "wastefi-backend": "1.2.3",  // Pin to specific version
    "wastefi-frontend": "1.2.3"
  }
}
```

---

## Examples Repository

Find more customization examples at:
https://github.com/wastefi/customization-examples

---

**Need help? Contact:** developers@wastefi.org
