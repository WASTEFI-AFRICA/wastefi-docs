# Stellar Integration Guide

## Overview

WasteFi uses the Stellar blockchain for fast, low-cost payments. This guide covers how Stellar is integrated into the platform and how to work with Stellar wallets.

## Why Stellar?

- **Fast:** 3-5 second transaction finality
- **Cheap:** $0.00001 per transaction
- **Scalable:** 1,000+ transactions per second
- **Mobile-optimized:** Low computational requirements
- **Built-in DEX:** Currency conversion without exchanges

## Stellar Network Setup

### Network Configuration

```javascript
const StellarSdk = require('stellar-sdk');

// Testnet (for development)
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

// Mainnet (for production)
const server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();
```

### Environment Variables

```bash
# .env
STELLAR_NETWORK=PUBLIC  # or TESTNET
STELLAR_HORIZON_URL=https://horizon.stellar.org

# Platform accounts
PLATFORM_STELLAR_PUBLIC=GXXXXXXXXXXXXXXXXXXXXX
PLATFORM_STELLAR_SECRET=SXXXXXXXXXXXXXXXXXXXXX

# Collection point accounts
COLLECTION_POINT_PUBLIC=GXXXXXXXXXXXXXXXXXXXXX
COLLECTION_POINT_SECRET=SXXXXXXXXXXXXXXXXXXXXX
```

---

## Wallet Management

### Creating Wallets

#### For New Users

```javascript
async function createUserWallet(userId) {
  // Generate new keypair
  const pair = StellarSdk.Keypair.random();
  
  // Store in database (encrypted)
  const wallet = await db.wallets.create({
    userId: userId,
    stellarAddress: pair.publicKey(),
    stellarSeedEncrypted: encrypt(pair.secret())
  });
  
  // Fund the account (minimum 1 XLM for activation)
  await fundAccount(pair.publicKey());
  
  return wallet;
}

async function fundAccount(publicKey) {
  const platformAccount = await loadPlatformAccount();
  
  // Create account operation
  const transaction = new StellarSdk.TransactionBuilder(platformAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC
  })
  .addOperation(StellarSdk.Operation.createAccount({
    destination: publicKey,
    startingBalance: '2' // 2 XLM initial balance
  }))
  .setTimeout(180)
  .build();
  
  // Sign with platform account
  transaction.sign(getPlatformKeypair());
  
  // Submit to network
  return await server.submitTransaction(transaction);
}
```

### Key Management

#### Encryption

```javascript
const crypto = require('crypto');

// Encrypt private key before storing
function encryptSeed(seed) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(seed, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

// Decrypt when needed
function decryptSeed(encryptedData) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Multi-Signature Wallets

For collection points, use multi-signature wallets requiring multiple approvals:

```javascript
async function createMultiSigWallet(operatorKeys) {
  const masterKey = StellarSdk.Keypair.random();
  
  // Load the account
  const account = await server.loadAccount(masterKey.publicKey());
  
  // Build transaction to add signers and set thresholds
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC
  });
  
  // Add each operator as a signer (weight: 1)
  operatorKeys.forEach(key => {
    transaction.addOperation(
      StellarSdk.Operation.setOptions({
        signer: {
          ed25519PublicKey: key,
          weight: 1
        }
      })
    );
  });
  
  // Set thresholds (require 2 signatures for medium/high operations)
  transaction.addOperation(
    StellarSdk.Operation.setOptions({
      masterWeight: 1,
      lowThreshold: 1,
      medThreshold: 2,  // Payments require 2 sigs
      highThreshold: 3  // Account changes require 3 sigs
    })
  );
  
  const builtTx = transaction.setTimeout(180).build();
  builtTx.sign(masterKey);
  
  return await server.submitTransaction(builtTx);
}
```

---

## Payment Processing

### Simple Payment

```javascript
async function sendPayment(fromKeypair, toAddress, amount) {
  try {
    // Load sender account
    const account = await server.loadAccount(fromKeypair.publicKey());
    
    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC
    })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toAddress,
        asset: StellarSdk.Asset.native(), // XLM
        amount: amount.toString()
      })
    )
    .addMemo(StellarSdk.Memo.text('WasteFi payment'))
    .setTimeout(180)
    .build();
    
    // Sign transaction
    transaction.sign(fromKeypair);
    
    // Submit to network
    const result = await server.submitTransaction(transaction);
    
    return {
      success: true,
      hash: result.hash,
      ledger: result.ledger
    };
    
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

### Payment with Custom Asset (USDC)

```javascript
async function sendUSDCPayment(fromKeypair, toAddress, amount) {
  // USDC on Stellar
  const USDC = new StellarSdk.Asset(
    'USDC',
    'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
  );
  
  const account = await server.loadAccount(fromKeypair.publicKey());
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC
  })
  .addOperation(
    StellarSdk.Operation.payment({
      destination: toAddress,
      asset: USDC,
      amount: amount.toString()
    })
  )
  .setTimeout(180)
  .build();
  
  transaction.sign(fromKeypair);
  
  return await server.submitTransaction(transaction);
}
```

### Path Payment (Currency Conversion)

Convert between currencies automatically using Stellar DEX:

```javascript
async function sendPathPayment(fromKeypair, toAddress, sendAsset, destAsset, destAmount) {
  const account = await server.loadAccount(fromKeypair.publicKey());
  
  // Find payment path
  const paths = await server
    .strictReceivePaths(sendAsset, destAsset, destAmount)
    .call();
  
  if (paths.records.length === 0) {
    throw new Error('No payment path found');
  }
  
  const bestPath = paths.records[0];
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC
  })
  .addOperation(
    StellarSdk.Operation.pathPaymentStrictReceive({
      sendAsset: sendAsset,
      sendMax: bestPath.source_amount,
      destination: toAddress,
      destAsset: destAsset,
      destAmount: destAmount,
      path: bestPath.path
    })
  )
  .setTimeout(180)
  .build();
  
  transaction.sign(fromKeypair);
  
  return await server.submitTransaction(transaction);
}
```

---

## Transaction Monitoring

### Real-time Transaction Streaming

```javascript
function streamTransactions(publicKey, callback) {
  return server
    .transactions()
    .forAccount(publicKey)
    .cursor('now')
    .stream({
      onmessage: (transaction) => {
        console.log('New transaction:', transaction.hash);
        callback(transaction);
      },
      onerror: (error) => {
        console.error('Stream error:', error);
      }
    });
}

// Usage
const closeStream = streamTransactions(userPublicKey, async (tx) => {
  // Process incoming transaction
  await processTransaction(tx);
  
  // Notify user
  await sendNotification(userId, 'Payment received!');
});

// Close stream when done
// closeStream();
```

### Checking Transaction Status

```javascript
async function getTransactionStatus(txHash) {
  try {
    const transaction = await server.transactions().transaction(txHash).call();
    
    return {
      success: transaction.successful,
      ledger: transaction.ledger,
      createdAt: transaction.created_at,
      operations: transaction.operation_count,
      fee: transaction.fee_charged
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, error: 'Transaction not found' };
    }
    throw error;
  }
}
```

### Getting Account Balance

```javascript
async function getAccountBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    
    const balances = account.balances.map(balance => ({
      asset: balance.asset_type === 'native' ? 'XLM' : balance.asset_code,
      balance: balance.balance,
      limit: balance.limit || null
    }));
    
    return balances;
  } catch (error) {
    console.error('Failed to load account:', error);
    throw error;
  }
}
```

---

## Trust Lines

Before receiving custom assets, accounts must create trust lines:

```javascript
async function createTrustline(userKeypair, asset) {
  const account = await server.loadAccount(userKeypair.publicKey());
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC
  })
  .addOperation(
    StellarSdk.Operation.changeTrust({
      asset: asset,
      limit: '1000000' // Maximum amount willing to hold
    })
  )
  .setTimeout(180)
  .build();
  
  transaction.sign(userKeypair);
  
  return await server.submitTransaction(transaction);
}

// Create USDC trustline for a user
async function setupUSDCTrustline(userKeypair) {
  const USDC = new StellarSdk.Asset(
    'USDC',
    'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
  );
  
  return await createTrustline(userKeypair, USDC);
}
```

---

## Error Handling

### Common Errors

```javascript
async function sendPaymentWithErrorHandling(from, to, amount) {
  try {
    return await sendPayment(from, to, amount);
  } catch (error) {
    // Insufficient balance
    if (error.response?.data?.extras?.result_codes?.operations?.[0] === 'op_underfunded') {
      throw new Error('Insufficient balance');
    }
    
    // Account doesn't exist
    if (error.response?.status === 404) {
      throw new Error('Destination account not found');
    }
    
    // No trustline
    if (error.response?.data?.extras?.result_codes?.operations?.[0] === 'op_no_trust') {
      throw new Error('Recipient has not set up trustline for this asset');
    }
    
    // Transaction timeout
    if (error.response?.data?.extras?.result_codes?.transaction === 'tx_too_late') {
      throw new Error('Transaction expired, please try again');
    }
    
    // Generic error
    throw new Error(`Transaction failed: ${error.message}`);
  }
}
```

---

## Best Practices

### 1. Always Use Memos

```javascript
// Include transaction ID in memo
.addMemo(StellarSdk.Memo.text(`WASTEFI-TXN-${transactionId}`))
```

### 2. Set Appropriate Timeouts

```javascript
// 3 minutes is usually enough
.setTimeout(180)
```

### 3. Check Minimum Balance

Stellar accounts need minimum balance (base reserve × number of entries):

```javascript
function calculateMinimumBalance(account) {
  const BASE_RESERVE = 0.5; // XLM
  const numEntries = 2 + account.subentry_count; // Base + entries
  return BASE_RESERVE * numEntries;
}
```

### 4. Handle Network Failures

```javascript
async function sendPaymentWithRetry(from, to, amount, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendPayment(from, to, amount);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 5. Validate Addresses

```javascript
function isValidStellarAddress(address) {
  try {
    StellarSdk.StrKey.decodeEd25519PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}
```

---

## Testing

### Testnet Setup

```javascript
// Use testnet for development
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

// Create and fund test account
async function createTestAccount() {
  const pair = StellarSdk.Keypair.random();
  
  // Fund via Friendbot
  await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`
  );
  
  return pair;
}
```

### Integration Tests

```javascript
describe('Stellar Integration', () => {
  let platformAccount;
  let userAccount;
  
  beforeAll(async () => {
    platformAccount = await createTestAccount();
    userAccount = await createTestAccount();
  });
  
  test('should send payment successfully', async () => {
    const result = await sendPayment(
      platformAccount,
      userAccount.publicKey(),
      '10'
    );
    
    expect(result.success).toBe(true);
    expect(result.hash).toBeDefined();
  });
  
  test('should handle insufficient balance', async () => {
    await expect(
      sendPayment(userAccount, platformAccount.publicKey(), '100000')
    ).rejects.toThrow('Insufficient balance');
  });
});
```

---

## Monitoring and Logging

```javascript
// Log all transactions
async function logTransaction(tx, result) {
  await db.stellar_transactions.create({
    hash: result.hash,
    from: tx.source,
    to: tx.operations[0].destination,
    amount: tx.operations[0].amount,
    asset: tx.operations[0].asset.code || 'XLM',
    ledger: result.ledger,
    fee: result.fee_charged,
    successful: result.successful,
    created_at: new Date()
  });
}

// Monitor failed transactions
async function monitorFailedTransactions() {
  const failed = await db.stellar_transactions
    .where('successful', false)
    .where('created_at', '>', Date.now() - 86400000) // Last 24h
    .count();
  
  if (failed > 10) {
    await alertOps('High number of failed Stellar transactions');
  }
}
```

---

## Security Considerations

1. **Never log private keys**
2. **Encrypt seeds at rest**
3. **Use environment variables for secrets**
4. **Implement rate limiting**
5. **Validate all inputs**
6. **Use multi-sig for high-value accounts**
7. **Monitor for suspicious activity**
8. **Keep SDK updated**

---

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar SDK for JavaScript](https://github.com/stellar/js-stellar-sdk)
- [Horizon API Reference](https://developers.stellar.org/api)
- [Stellar Laboratory](https://laboratory.stellar.org/) - Testing tool

---

## Next Steps

- [Smart Contracts](/technical/smart-contracts) - Soroban integration
- [Mobile Money Integration](/technical/mobile-money) - Cash out options
- [API Documentation](/api/payments) - Payment endpoints