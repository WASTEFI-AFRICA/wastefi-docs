# Smart Contracts Documentation

## Overview

WasteFi uses Stellar Soroban smart contracts for secure, transparent, and automated operations on the blockchain. All contracts are written in Rust and compiled to WebAssembly (Wasm) for execution on the Stellar network.

## Contract Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  WasteFi Smart Contracts                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │           Payment Contract                       │ │
│  │  • Process collector payments                    │ │
│  │  • Multi-signature authorization                 │ │
│  │  • Escrow for disputed transactions              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │           Material Registry Contract             │ │
│  │  • Register material types                       │ │
│  │  • Track material transactions                   │ │
│  │  • Digital product passports                     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │           Impact Credit Contract                 │ │
│  │  • Mint carbon credit tokens                     │ │
│  │  • Verify environmental impact                   │ │
│  │  • Distribute revenue to collectors              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │           Collection Point Contract              │ │
│  │  • Manage collection point wallets               │ │
│  │  • Operator permissions                          │ │
│  │  • Inventory tracking on-chain                   │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Payment Contract

### Purpose
Handles all payment operations between collectors, collection points, and the platform. Ensures secure, atomic transactions with multi-signature support.

### Contract Address
```
Mainnet: Coming Soon
Testnet: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### Data Structures

#### Payment
```rust
pub struct Payment {
    pub id: BytesN<32>,              // Unique payment ID
    pub collector: Address,           // Collector's Stellar address
    pub collection_point: Address,    // Collection point address
    pub amount: i128,                 // Amount in stroops
    pub material_type: String,        // Material type code (e.g., "PET")
    pub weight: i128,                 // Weight in grams
    pub quality_grade: String,        // Quality grade (A, B, C)
    pub timestamp: u64,               // Unix timestamp
    pub status: PaymentStatus,        // Current status
    pub metadata: Map<String, String> // Additional data
}

pub enum PaymentStatus {
    Pending,
    Authorized,
    Completed,
    Failed,
    Disputed
}
```

### Functions

#### initialize
Initializes the payment contract with configuration parameters.

```rust
pub fn initialize(
    env: Env,
    admin: Address,
    platform_fee_bps: u32,  // Basis points (e.g., 200 = 2%)
    fee_recipient: Address
) -> Result<(), Error>
```

**Parameters:**
- `admin` - Contract administrator address
- `platform_fee_bps` - Platform fee in basis points (1 bps = 0.01%)
- `fee_recipient` - Address to receive platform fees

**Returns:** Success or error

**Example:**
```rust
// Initialize with 2% platform fee
contract.initialize(
    env,
    admin_address,
    200,  // 2%
    fee_address
);
```

---

#### process_payment
Processes a payment to a collector for deposited materials.

```rust
pub fn process_payment(
    env: Env,
    collector: Address,
    amount: i128,
    material_type: String,
    weight: i128,
    quality_grade: String,
    metadata: Map<String, String>
) -> Result<BytesN<32>, Error>
```

**Parameters:**
- `collector` - Collector's Stellar address
- `amount` - Payment amount in stroops (1 XLM = 10,000,000 stroops)
- `material_type` - Material type identifier (e.g., "PET", "HDPE")
- `weight` - Weight in grams
- `quality_grade` - Quality grade (A, B, or C)
- `metadata` - Additional transaction data

**Returns:** Payment ID (32-byte hash)

**Errors:**
- `InvalidAmount` - Amount is zero or negative
- `InvalidAddress` - Collector address is invalid
- `InsufficientBalance` - Collection point lacks funds

**Example:**
```rust
let payment_id = contract.process_payment(
    env.clone(),
    collector_address,
    250_000,  // 0.025 XLM (2.5 cents if 1 XLM = $1)
    String::from_str(&env, "PET"),
    5500,     // 5.5 kg
    String::from_str(&env, "A"),
    metadata
)?;
```

**Events Emitted:**
```rust
env.events().publish((
    symbol_short!("payment"),
    symbol_short!("created")
), payment_id);
```

---

#### authorize_payment
Authorizes a pending payment (requires collection point signature).

```rust
pub fn authorize_payment(
    env: Env,
    payment_id: BytesN<32>,
    authorizer: Address
) -> Result<(), Error>
```

**Parameters:**
- `payment_id` - ID of the payment to authorize
- `authorizer` - Address authorizing the payment

**Returns:** Success or error

**Errors:**
- `PaymentNotFound` - Payment ID doesn't exist
- `UnauthorizedSigner` - Authorizer not permitted
- `InvalidStatus` - Payment not in pending state

**Example:**
```rust
// Collection point operator authorizes payment
contract.authorize_payment(
    env,
    payment_id,
    operator_address
)?;
```

---

#### complete_payment
Completes an authorized payment, transferring funds to the collector.

```rust
pub fn complete_payment(
    env: Env,
    payment_id: BytesN<32>
) -> Result<(), Error>
```

**Parameters:**
- `payment_id` - ID of the payment to complete

**Returns:** Success or error

**Emits:** Transfer event to Stellar network

**Example:**
```rust
contract.complete_payment(env, payment_id)?;
```

---

#### get_payment
Retrieves payment details by ID.

```rust
pub fn get_payment(
    env: Env,
    payment_id: BytesN<32>
) -> Result<Payment, Error>
```

**Parameters:**
- `payment_id` - Payment ID to query

**Returns:** Payment struct with all details

**Example:**
```rust
let payment = contract.get_payment(env, payment_id)?;
println!("Amount: {} stroops", payment.amount);
println!("Status: {:?}", payment.status);
```

---

#### dispute_payment
Creates a dispute for a payment, freezing funds until resolution.

```rust
pub fn dispute_payment(
    env: Env,
    payment_id: BytesN<32>,
    disputer: Address,
    reason: String
) -> Result<(), Error>
```

**Parameters:**
- `payment_id` - Payment to dispute
- `disputer` - Address of party creating dispute
- `reason` - Reason for dispute

**Returns:** Success or error

**Example:**
```rust
contract.dispute_payment(
    env,
    payment_id,
    collector_address,
    String::from_str(&env, "Material weight incorrect")
)?;
```

---

#### resolve_dispute
Resolves a disputed payment (admin only).

```rust
pub fn resolve_dispute(
    env: Env,
    payment_id: BytesN<32>,
    resolution: DisputeResolution,
    admin: Address
) -> Result<(), Error>

pub enum DisputeResolution {
    PayCollector,         // Release funds to collector
    RefundCollectionPoint, // Return to collection point
    SplitPayment(i128)    // Partial payment with amount
}
```

---

## 2. Material Registry Contract

### Purpose
Maintains an on-chain registry of material types, digital product passports, and material transaction history.

### Contract Address
```
Mainnet: Coming Soon
Testnet: CBYYD3YSFP5L7ZE3YYZQHPVSJXDJTQVKL5WUJZQ7UXLZ4YGWQHXE2QPM
```

### Data Structures

#### Material
```rust
pub struct Material {
    pub id: String,                  // Material type ID (e.g., "PET-001")
    pub name: String,                // Human-readable name
    pub category: MaterialCategory,  // Plastic, Metal, Paper, etc.
    pub recyclegraph_id: String,     // RecycleGraph protocol ID
    pub co2_per_kg: i128,           // CO2 saved per kg (in grams)
    pub base_price: i128,            // Base price in stroops per kg
    pub active: bool                 // Is material currently accepted
}

pub enum MaterialCategory {
    Plastic,
    Metal,
    Paper,
    Glass,
    Electronic,
    Organic
}
```

#### ProductPassport
```rust
pub struct ProductPassport {
    pub id: BytesN<32>,              // Unique passport ID
    pub material_id: String,          // Reference to material type
    pub manufacturer: Address,        // Manufacturer's address
    pub product_id: String,           // Manufacturer's product ID
    pub manufacture_date: u64,        // Unix timestamp
    pub origin: String,               // Country/region of origin
    pub composition: Vec<MaterialComposition>, // Material breakdown
    pub carbon_footprint: i128,      // Manufacturing CO2 (grams)
    pub recyclable: bool,             // Can be recycled
    pub metadata: Map<String, String> // Additional product data
}

pub struct MaterialComposition {
    pub material: String,  // Material type
    pub percentage: u32    // Percentage of total (0-100)
}
```

### Functions

#### register_material
Registers a new material type in the registry.

```rust
pub fn register_material(
    env: Env,
    id: String,
    name: String,
    category: MaterialCategory,
    recyclegraph_id: String,
    co2_per_kg: i128,
    base_price: i128,
    admin: Address
) -> Result<(), Error>
```

**Parameters:**
- `id` - Unique material identifier
- `name` - Display name (e.g., "PET Plastic Bottles")
- `category` - Material category enum
- `recyclegraph_id` - RecycleGraph protocol ID
- `co2_per_kg` - CO2 saved per kg in grams
- `base_price` - Base price per kg in stroops
- `admin` - Admin authorizing registration

**Example:**
```rust
contract.register_material(
    env.clone(),
    String::from_str(&env, "PET-001"),
    String::from_str(&env, "PET Plastic Bottles"),
    MaterialCategory::Plastic,
    String::from_str(&env, "RG-PLASTIC-PET-1"),
    2500,      // 2.5 kg CO2 saved per kg
    250_000,   // 0.025 XLM per kg base price
    admin_address
)?;
```

---

#### create_product_passport
Creates a digital product passport for a manufactured item.

```rust
pub fn create_product_passport(
    env: Env,
    material_id: String,
    manufacturer: Address,
    product_id: String,
    manufacture_date: u64,
    origin: String,
    composition: Vec<MaterialComposition>,
    carbon_footprint: i128,
    recyclable: bool
) -> Result<BytesN<32>, Error>
```

**Returns:** Passport ID (32-byte hash)

**Example:**
```rust
let composition = vec![
    &env,
    MaterialComposition {
        material: String::from_str(&env, "PET"),
        percentage: 95
    },
    MaterialComposition {
        material: String::from_str(&env, "PP"),
        percentage: 5
    }
];

let passport_id = contract.create_product_passport(
    env.clone(),
    String::from_str(&env, "PET-001"),
    brand_address,
    String::from_str(&env, "BRAND-BOTTLE-500ML"),
    1705276800,  // Jan 15, 2024
    String::from_str(&env, "Kenya"),
    composition,
    80,          // 80g CO2 footprint
    true
)?;
```

---

#### get_material
Retrieves material details by ID.

```rust
pub fn get_material(
    env: Env,
    material_id: String
) -> Result<Material, Error>
```

---

#### get_passport
Retrieves product passport by ID.

```rust
pub fn get_passport(
    env: Env,
    passport_id: BytesN<32>
) -> Result<ProductPassport, Error>
```

---

#### record_collection
Records when a product with a passport is collected.

```rust
pub fn record_collection(
    env: Env,
    passport_id: BytesN<32>,
    collector: Address,
    collection_point: Address,
    weight: i128,
    timestamp: u64
) -> Result<(), Error>
```

**Purpose:** Links collected materials back to original manufacturers for EPR compliance.

---

## 3. Impact Credit Contract

### Purpose
Mints and manages carbon credit tokens based on verified material collection impact.

### Contract Address
```
Mainnet: Coming Soon
Testnet: CCJFMTX4ZXVHXVNXTQRFHB45VWQYKUFNUSJGD6DQVUOBVQVUIWFMPACT
```

### Data Structures

#### ImpactCredit
```rust
pub struct ImpactCredit {
    pub id: BytesN<32>,              // Credit token ID
    pub co2_saved: i128,             // CO2 saved in grams
    pub materials: Vec<MaterialImpact>, // Materials contributing
    pub verification_date: u64,      // When verified
    pub verifier: Address,           // Third-party verifier
    pub status: CreditStatus,        // Current status
    pub collectors: Vec<Address>     // Collectors who contributed
}

pub struct MaterialImpact {
    pub material_type: String,
    pub weight: i128,
    pub co2_saved: i128
}

pub enum CreditStatus {
    Pending,      // Awaiting verification
    Verified,     // Verified by auditor
    Minted,       // Token minted
    Sold,         // Credit sold
    Retired       // Credit retired (used)
}
```

### Functions

#### calculate_impact
Calculates environmental impact from material collection.

```rust
pub fn calculate_impact(
    env: Env,
    materials: Vec<MaterialImpact>
) -> Result<i128, Error>
```

**Returns:** Total CO2 saved in grams

**Example:**
```rust
let materials = vec![
    &env,
    MaterialImpact {
        material_type: String::from_str(&env, "PET"),
        weight: 5500,  // 5.5 kg
        co2_saved: 13750  // 2.5 kg CO2 per kg * 5.5 kg
    }
];

let total_co2 = contract.calculate_impact(env, materials)?;
// Returns: 13750 grams (13.75 kg CO2)
```

---

#### mint_credit
Mints a carbon credit token after verification.

```rust
pub fn mint_credit(
    env: Env,
    co2_saved: i128,
    materials: Vec<MaterialImpact>,
    collectors: Vec<Address>,
    verifier: Address
) -> Result<BytesN<32>, Error>
```

**Returns:** Credit token ID

**Authorization:** Requires verifier signature

---

#### distribute_revenue
Distributes revenue from sold carbon credits to collectors.

```rust
pub fn distribute_revenue(
    env: Env,
    credit_id: BytesN<32>,
    sale_amount: i128,
    platform_share_bps: u32  // Basis points
) -> Result<(), Error>
```

**Example:**
```rust
// Sold credit for 100 XLM, platform takes 30%
contract.distribute_revenue(
    env,
    credit_id,
    1_000_000_000,  // 100 XLM in stroops
    3000            // 30% in basis points
)?;
// Each collector receives their proportional share of 70 XLM
```

---

#### retire_credit
Retires a carbon credit (marks as used).

```rust
pub fn retire_credit(
    env: Env,
    credit_id: BytesN<32>,
    buyer: Address,
    reason: String
) -> Result<(), Error>
```

---

## 4. Collection Point Contract

### Purpose
Manages multi-signature wallets for collection points and operator permissions.

### Data Structures

#### CollectionPoint
```rust
pub struct CollectionPoint {
    pub id: String,                  // Collection point ID
    pub name: String,                // Display name
    pub location: Location,          // Geographic coordinates
    pub wallet: Address,             // Multi-sig wallet address
    pub operators: Vec<Address>,     // Authorized operators
    pub required_signatures: u32,    // Number of sigs required
    pub status: PointStatus,         // Active/inactive status
    pub inventory: Map<String, i128> // Material inventory (type -> weight)
}

pub struct Location {
    pub latitude: i128,   // * 1e7 for precision
    pub longitude: i128   // * 1e7 for precision
}
```

### Functions

#### register_point
Registers a new collection point with multi-sig wallet.

```rust
pub fn register_point(
    env: Env,
    id: String,
    name: String,
    location: Location,
    operators: Vec<Address>,
    required_signatures: u32,
    admin: Address
) -> Result<Address, Error>
```

**Returns:** Multi-signature wallet address

---

#### add_operator
Adds an operator to a collection point.

```rust
pub fn add_operator(
    env: Env,
    point_id: String,
    operator: Address,
    admin: Address
) -> Result<(), Error>
```

---

#### update_inventory
Updates material inventory for a collection point.

```rust
pub fn update_inventory(
    env: Env,
    point_id: String,
    material_type: String,
    weight_delta: i128,  // Can be negative (material removed)
    operator: Address
) -> Result<(), Error>
```

---

## Security Considerations

### Access Control
All sensitive operations require appropriate authorization:
- **Admin Functions:** Contract initialization, material registration
- **Operator Functions:** Payment authorization, inventory updates
- **Collector Functions:** Payment disputes
- **Verifier Functions:** Impact credit minting

### Multi-Signature Requirements
Collection point wallets require N-of-M signatures:
```rust
// Example: 2-of-3 multi-sig
required_signatures: 2
operators: [operator1, operator2, operator3]
```

### Audit Trail
All state changes emit events for off-chain monitoring:
```rust
env.events().publish((
    symbol_short!("payment"),
    symbol_short!("completed")
), (payment_id, collector, amount));
```

### Rate Limiting
Contracts implement rate limits to prevent abuse:
- Max payments per collector per day: 50
- Max dispute creation per user per month: 5

---

## Testing Contracts

### Local Testing
```bash
# Run contract tests
cd wastefi-contracts
cargo test

# Specific test
cargo test test_payment_flow
```

### Testnet Deployment
```bash
# Build contract
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/payment_contract.wasm \
  --source ADMIN_SECRET_KEY \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Invoke Function
```bash
# Process a payment on testnet
soroban contract invoke \
  --id CONTRACT_ID \
  --source OPERATOR_SECRET_KEY \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  -- \
  process_payment \
  --collector COLLECTOR_ADDRESS \
  --amount 250000 \
  --material_type "PET" \
  --weight 5500 \
  --quality_grade "A"
```

---

## Gas Fees

Soroban operations are significantly cheaper than Ethereum:

| Operation | Gas Cost (stroops) | USD Equivalent* |
|-----------|-------------------|-----------------|
| Initialize Contract | ~100,000 | ~$0.01 |
| Process Payment | ~10,000 | ~$0.001 |
| Register Material | ~20,000 | ~$0.002 |
| Mint Impact Credit | ~30,000 | ~$0.003 |

*Assuming 1 XLM = $0.10

---

## Contract Upgrades

Contracts are upgradeable with multi-sig authorization:

```rust
pub fn upgrade(
    env: Env,
    new_wasm_hash: BytesN<32>,
    admin1: Address,
    admin2: Address,
    admin3: Address
) -> Result<(), Error>
```

Requires 3-of-5 admin signatures for production upgrades.

---

## Learn More

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Contract Source Code](https://github.com/wastefi/wastefi-contracts)
- [Audit Reports](/technical/audits)
- [Integration Guide](/guide/integrating-contracts)

---

**Contract Versions:**
- Payment Contract: v1.0.0
- Material Registry: v1.0.0
- Impact Credit: v1.0.0
- Collection Point: v1.0.0

**Last Updated:** 2024-09-15  
**Audit Status:** Pending (Q4 2024)