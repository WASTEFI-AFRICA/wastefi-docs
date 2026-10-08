# Webhooks API

## Overview

Webhooks allow your application to receive real-time notifications when events occur in the WasteFi system. Instead of polling the API, webhooks push event data to your server as they happen.

---

## How Webhooks Work

1. **Register a webhook endpoint** in your dashboard or via API
2. **WasteFi sends HTTP POST requests** to your endpoint when events occur
3. **Your server processes the event** and returns a 200 status code
4. **Retry logic** automatically handles failed deliveries

```
┌─────────┐          ┌──────────┐          ┌──────────────┐
│ WasteFi │  Event   │ Webhook  │  POST    │ Your Server  │
│ System │─────────│ Service │─────────│ Endpoint │
└─────────┘          └──────────┘          └──────────────┘
                           │                       │
                           │      200 OK           │
                           │──────────────────────┘
```

---

## Webhook Setup

### 1. Create Webhook Endpoint

Your server must have a publicly accessible HTTPS endpoint that:
- Accepts POST requests
- Returns 200 status within 5 seconds
- Handles duplicate events idempotently

**Example Endpoint (Node.js/Express):**
```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhooks/wastefi', (req, res) => {
  const signature = req.headers['x-wastefi-signature'];
  const payload = JSON.stringify(req.body);

  // Verify signature (see Security section)
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Process the event
  const event = req.body;
  console.log(`Received event: ${event.type}`);

  switch (event.type) {
    case 'transaction.completed':
      handleTransactionCompleted(event.data);
      break;
    case 'payment.success':
      handlePaymentSuccess(event.data);
      break;
    // Handle other event types
  }

  // Return 200 to acknowledge receipt
  res.status(200).send('Webhook received');
});

app.listen(3000);
```

### 2. Register Webhook URL

**Via Dashboard:**
1. Go to Settings → Webhooks
2. Click "Add Webhook Endpoint"
3. Enter your URL (must be HTTPS)
4. Select events to subscribe to
5. Save and copy your signing secret

**Via API:**
```http
POST /webhooks
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

```json
{
  "url": "https://your-server.com/webhooks/wastefi",
  "events": [
    "transaction.completed",
    "payment.success",
    "payment.failed"
  ],
  "description": "Production webhook endpoint",
  "active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "wh_1a2b3c4d5e6f",
    "url": "https://your-server.com/webhooks/wastefi",
    "events": [
      "transaction.completed",
      "payment.success",
      "payment.failed"
    ],
    "signingSecret": "whsec_abc123def456...",
    "active": true,
    "createdAt": "2024-09-15T10:30:00Z"
  }
}
```

**Warning Important:**Store the `signingSecret` securely. You'll need it to verify webhook signatures.

---

## Webhook Events

### Transaction Events

#### transaction.created
Fired when a new transaction is created.

**Payload:**
```json
{
  "id": "evt_9z8y7x6w5v",
  "type": "transaction.created",
  "createdAt": "2024-09-15T10:30:00Z",
  "data": {
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "collectionPointId": "cp_xyz789",
    "materialType": "PET",
    "weight": 5.5,
    "qualityGrade": "A",
    "grossAmount": 1.89,
    "netAmount": 1.85,
    "currency": "USD",
    "status": "pending"
  }
}
```

#### transaction.authorized
Fired when a collection point operator authorizes a transaction.

**Payload:**
```json
{
  "id": "evt_8x7w6v5u4t",
  "type": "transaction.authorized",
  "createdAt": "2024-09-15T10:31:00Z",
  "data": {
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "authorizedBy": "op_ghi789",
    "authorizedAt": "2024-09-15T10:31:00Z",
    "status": "authorized"
  }
}
```

#### transaction.completed
Fired when a transaction is successfully completed and payment is processed.

**Payload:**
```json
{
  "id": "evt_7w6v5u4t3s",
  "type": "transaction.completed",
  "createdAt": "2024-09-15T10:31:30Z",
  "data": {
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "collectionPointId": "cp_xyz789",
    "materialType": "PET",
    "weight": 5.5,
    "netAmount": 1.85,
    "currency": "USD",
    "stellarTxHash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
    "co2Saved": 13.75,
    "status": "completed",
    "completedAt": "2024-09-15T10:31:30Z"
  }
}
```

#### transaction.failed
Fired when a transaction fails to process.

**Payload:**
```json
{
  "id": "evt_6v5u4t3s2r",
  "type": "transaction.failed",
  "createdAt": "2024-09-15T10:32:00Z",
  "data": {
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "status": "failed",
    "error": {
      "code": "INSUFFICIENT_BALANCE",
      "message": "Collection point has insufficient balance"
    },
    "failedAt": "2024-09-15T10:32:00Z"
  }
}
```

#### transaction.cancelled
Fired when a transaction is cancelled.

**Payload:**
```json
{
  "id": "evt_5u4t3s2r1q",
  "type": "transaction.cancelled",
  "createdAt": "2024-09-15T10:35:00Z",
  "data": {
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "cancelledBy": "usr_def456",
    "reason": "User cancelled",
    "status": "cancelled",
    "cancelledAt": "2024-09-15T10:35:00Z"
  }
}
```

---

### Payment Events

#### payment.success
Fired when a payment is successfully processed.

**Payload:**
```json
{
  "id": "evt_4t3s2r1q0p",
  "type": "payment.success",
  "createdAt": "2024-09-15T10:31:30Z",
  "data": {
    "paymentId": "pay_jkl012",
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "amount": 1.85,
    "currency": "USD",
    "paymentMethod": "stellar",
    "stellarTxHash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
    "status": "completed",
    "processedAt": "2024-09-15T10:31:30Z"
  }
}
```

#### payment.failed
Fired when a payment fails to process.

**Payload:**
```json
{
  "id": "evt_3s2r1q0p9o",
  "type": "payment.failed",
  "createdAt": "2024-09-15T10:32:00Z",
  "data": {
    "paymentId": "pay_mno345",
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "amount": 1.85,
    "currency": "USD",
    "paymentMethod": "stellar",
    "status": "failed",
    "error": {
      "code": "BLOCKCHAIN_ERROR",
      "message": "Transaction failed on Stellar network"
    },
    "failedAt": "2024-09-15T10:32:00Z"
  }
}
```

#### payment.refunded
Fired when a payment is refunded.

**Payload:**
```json
{
  "id": "evt_2r1q0p9o8n",
  "type": "payment.refunded",
  "createdAt": "2024-09-15T11:00:00Z",
  "data": {
    "paymentId": "pay_jkl012",
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "originalAmount": 1.85,
    "refundAmount": 1.85,
    "currency": "USD",
    "reason": "Dispute resolved in collector's favor",
    "status": "refunded",
    "refundedAt": "2024-09-15T11:00:00Z"
  }
}
```

---

### Dispute Events

#### dispute.created
Fired when a dispute is created on a transaction.

**Payload:**
```json
{
  "id": "evt_1q0p9o8n7m",
  "type": "dispute.created",
  "createdAt": "2024-09-15T10:40:00Z",
  "data": {
    "disputeId": "dis_pqr678",
    "transactionId": "txn_abc123",
    "disputerId": "usr_def456",
    "reason": "weight_incorrect",
    "description": "Weight was measured incorrectly",
    "status": "open",
    "createdAt": "2024-09-15T10:40:00Z"
  }
}
```

#### dispute.resolved
Fired when a dispute is resolved.

**Payload:**
```json
{
  "id": "evt_0p9o8n7m6l",
  "type": "dispute.resolved",
  "createdAt": "2024-09-17T10:00:00Z",
  "data": {
    "disputeId": "dis_pqr678",
    "transactionId": "txn_abc123",
    "resolution": "collector_favor",
    "resolutionNotes": "Evidence supports collector's claim",
    "resolvedBy": "admin_stu901",
    "status": "resolved",
    "resolvedAt": "2024-09-17T10:00:00Z"
  }
}
```

---

### Impact Events

#### impact.calculated
Fired when environmental impact is calculated for a transaction.

**Payload:**
```json
{
  "id": "evt_9o8n7m6l5k",
  "type": "impact.calculated",
  "createdAt": "2024-09-15T10:31:30Z",
  "data": {
    "impactRecordId": "imp_vwx234",
    "transactionId": "txn_abc123",
    "userId": "usr_def456",
    "materialType": "PET",
    "weight": 5.5,
    "co2Saved": 13.75,
    "calculationMethod": "standard",
    "verified": false
  }
}
```

#### carbon_credit.minted
Fired when carbon credits are minted.

**Payload:**
```json
{
  "id": "evt_8n7m6l5k4j",
  "type": "carbon_credit.minted",
  "createdAt": "2024-09-20T12:00:00Z",
  "data": {
    "carbonCreditId": "cc_yza567",
    "co2Amount": 1250.50,
    "tonEquivalent": 1.25,
    "collectorIds": ["usr_def456", "usr_ghi789"],
    "stellarAssetCode": "CARBON",
    "stellarIssuer": "GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "status": "minted",
    "mintedAt": "2024-09-20T12:00:00Z"
  }
}
```

---

### User Events

#### user.created
Fired when a new user registers.

**Payload:**
```json
{
  "id": "evt_7m6l5k4j3i",
  "type": "user.created",
  "createdAt": "2024-09-15T09:00:00Z",
  "data": {
    "userId": "usr_bcd890",
    "phone": "+254712345678",
    "role": "collector",
    "status": "active",
    "createdAt": "2024-09-15T09:00:00Z"
  }
}
```

#### user.verified
Fired when a user's phone number is verified.

**Payload:**
```json
{
  "id": "evt_6l5k4j3i2h",
  "type": "user.verified",
  "createdAt": "2024-09-15T09:05:00Z",
  "data": {
    "userId": "usr_bcd890",
    "phone": "+254712345678",
    "verifiedAt": "2024-09-15T09:05:00Z"
  }
}
```

---

## Security

### Signature Verification

Every webhook includes an `X-WasteFi-Signature` header for verification. Always verify this signature before processing events.

**Signature Format:**
```
X-WasteFi-Signature: t=1694776200,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

- `t` = Timestamp (Unix timestamp)
- `v1` = HMAC SHA-256 signature

**Verification Steps:**

1. Extract timestamp and signature from header
2. Concatenate timestamp, period (`.`), and raw request body
3. Compute HMAC SHA-256 hash using your signing secret
4. Compare computed signature with received signature
5. Verify timestamp is within 5 minutes to prevent replay attacks

**Implementation Example (Node.js):**

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, header, secret) {
  // Parse the header
  const items = header.split(',');
  const timestamp = items[0].split('=')[1];
  const signature = items[1].split('=')[1];

  // Check timestamp (prevent replay attacks)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) { // 5 minutes
    throw new Error('Webhook timestamp too old');
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Compare signatures (timing-safe)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Usage in Express
app.post('/webhooks/wastefi', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-wastefi-signature'];
  const payload = req.body.toString();

  try {
    verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET);
  } catch (err) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload);
  // Process event...

  res.status(200).send('OK');
});
```

**Python Example:**
```python
import hmac
import hashlib
import time

def verify_webhook_signature(payload, header, secret):
    # Parse header
    items = dict(item.split('=') for item in header.split(','))
    timestamp = items['t']
    signature = items['v1']

    # Check timestamp
    if abs(time.time() - int(timestamp)) > 300:
        raise ValueError('Webhook timestamp too old')

    # Compute expected signature
    signed_payload = f"{timestamp}.{payload}"
    expected_signature = hmac.new(
        secret.encode(),
        signed_payload.encode(),
        hashlib.sha256
    ).hexdigest()

    # Compare signatures
    return hmac.compare_digest(signature, expected_signature)
```

**PHP Example:**
```php
function verifyWebhookSignature($payload, $header, $secret) {
    // Parse header
    $items = [];
    foreach (explode(',', $header) as $item) {
        list($key, $value) = explode('=', $item);
        $items[$key] = $value;
    }

    $timestamp = $items['t'];
    $signature = $items['v1'];

    // Check timestamp
    if (abs(time() - $timestamp) > 300) {
        throw new Exception('Webhook timestamp too old');
    }

    // Compute expected signature
    $signedPayload = "$timestamp.$payload";
    $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

    // Compare signatures
    return hash_equals($signature, $expectedSignature);
}
```

---

## Testing Webhooks

### Testing with CLI

Use the webhook testing endpoint to trigger test events:

```bash
curl -X POST https://api.wastefi.org/v1/webhooks/wh_1a2b3c4d5e6f/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventType": "transaction.completed"}'
```

### Local Development

Use tools like [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Start ngrok
ngrok http 3000

# Use the HTTPS URL in your webhook configuration
# https://abc123.ngrok.io/webhooks/wastefi
```

### Webhook Testing Tools

- **RequestBin**: https://requestbin.com
- **Webhook.site**: https://webhook.site
- **ngrok**: https://ngrok.com

---

## Retry Logic

If webhook delivery fails (non-200 response or timeout), WasteFi automatically retries:

| Attempt | Delay | Total Time |
|---------|-------|------------|
| 1 | Immediate | 0s |
| 2 | 5 seconds | 5s |
| 3 | 30 seconds | 35s |
| 4 | 2 minutes | 2m 35s |
| 5 | 15 minutes | 17m 35s |
| 6 | 1 hour | 1h 17m 35s |
| 7 | 6 hours | 7h 17m 35s |
| 8 (final) | 24 hours | 31h 17m 35s |

After 8 failed attempts over 31 hours, the webhook is marked as failed and no further retries occur.

**Handling Retries:**
- Use the event `id` for idempotency
- Store processed event IDs to prevent duplicate processing
- Return 200 status even if event was already processed

---

## Best Practices

### 1. Respond Quickly
Return 200 status immediately, then process the event asynchronously:

```javascript
app.post('/webhooks/wastefi', async (req, res) => {
  // Verify signature
  verifySignature(req.body, req.headers['x-wastefi-signature']);

  // Acknowledge receipt immediately
  res.status(200).send('OK');

  // Process asynchronously
  processWebhookAsync(req.body).catch(err => {
    console.error('Webhook processing error:', err);
  });
});
```

### 2. Handle Duplicates
Events may be delivered multiple times. Use event IDs for idempotency:

```javascript
const processedEvents = new Set(); // Use Redis/database in production

function handleWebhook(event) {
  if (processedEvents.has(event.id)) {
    console.log('Event already processed:', event.id);
    return;
  }

  // Process event
  processEvent(event);

  // Mark as processed
  processedEvents.add(event.id);
}
```

### 3. Monitor Webhook Health
Track webhook failures and response times:

```javascript
app.post('/webhooks/wastefi', async (req, res) => {
  const startTime = Date.now();

  try {
    await processWebhook(req.body);
    res.status(200).send('OK');

    // Log success metrics
    metrics.recordWebhookSuccess(Date.now() - startTime);
  } catch (err) {
    res.status(500).send('Error');

    // Log failure
    metrics.recordWebhookFailure(err);
    alerts.sendAlert('Webhook processing failed');
  }
});
```

### 4. Use Event Types Strategically
Only subscribe to events you need to reduce noise:

```javascript
// Good: Subscribe only to relevant events
const relevantEvents = [
  'transaction.completed',
  'payment.success',
  'dispute.created'
];

// Bad: Subscribe to all events
const allEvents = ['*'];
```

### 5. Implement Logging
Log all webhook events for debugging and audit purposes:

```javascript
function logWebhookEvent(event) {
  console.log({
    eventId: event.id,
    eventType: event.type,
    timestamp: event.createdAt,
    data: event.data
  });
}
```

---

## Managing Webhooks

### List Webhooks
```http
GET /webhooks
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wh_1a2b3c4d5e6f",
      "url": "https://your-server.com/webhooks/wastefi",
      "events": ["transaction.completed", "payment.success"],
      "active": true,
      "createdAt": "2024-09-15T10:30:00Z",
      "statistics": {
        "totalDeliveries": 1250,
        "successfulDeliveries": 1248,
        "failedDeliveries": 2,
        "averageResponseTime": 145
      }
    }
  ]
}
```

### Update Webhook
```http
PUT /webhooks/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

```json
{
  "events": ["transaction.completed", "payment.success", "dispute.created"],
  "active": true
}
```

### Delete Webhook
```http
DELETE /webhooks/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Disable Webhook
```http
POST /webhooks/:id/disable
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### View Webhook Logs
```http
GET /webhooks/:id/logs?limit=50
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log_abc123",
      "eventId": "evt_7w6v5u4t3s",
      "eventType": "transaction.completed",
      "responseStatus": 200,
      "responseTime": 145,
      "attemptNumber": 1,
      "deliveredAt": "2024-09-15T10:31:30Z"
    }
  ]
}
```

---

## Troubleshooting

### Webhook Not Receiving Events

**Check List:**
1. Endpoint URL is publicly accessible via HTTPS
2. Webhook is marked as `active: true`
3. Events are configured for the webhook
4. Firewall allows incoming connections
5. Server responds within 5 seconds
6. Server returns 200 status code

### Signature Verification Failing

**Common Issues:**
- Using wrong signing secret
- Modifying request body before verification
- Not using raw request body
- Timestamp drift (clock skew)

**Debug Tips:**
```javascript
// Log the raw payload and signature for debugging
console.log('Raw payload:', req.body.toString());
console.log('Signature header:', req.headers['x-wastefi-signature']);
console.log('Expected signature:', computeExpectedSignature());
```

### Duplicate Events

This is expected behavior. Implement idempotency:

```javascript
// Store processed event IDs (use Redis in production)
const redis = require('redis').createClient();

async function isEventProcessed(eventId) {
  const exists = await redis.exists(`webhook:${eventId}`);
  return exists === 1;
}

async function markEventProcessed(eventId) {
  await redis.setex(`webhook:${eventId}`, 86400, '1'); // 24 hour TTL
}
```

---

## Rate Limits

Webhook endpoints should handle:
- Up to **100 events per second** during peak times
- Burst rates up to **500 events per second**

If your endpoint consistently fails due to load, consider:
- Implementing a queue (Redis, RabbitMQ, SQS)
- Horizontal scaling with load balancer
- Upgrading server resources

---

## Example Implementations

### Full Express.js Example

```javascript
const express = require('express');
const crypto = require('crypto');
const redis = require('redis').createClient();

const app = express();
const WEBHOOK_SECRET = process.env.WASTEFI_WEBHOOK_SECRET;

// Use raw body for signature verification
app.post('/webhooks/wastefi',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['x-wastefi-signature'];
    const payload = req.body.toString();

    // 1. Verify signature
    try {
      verifyWebhookSignature(payload, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('Signature verification failed:', err);
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(payload);

    // 2. Check for duplicates
    const processed = await redis.exists(`webhook:${event.id}`);
    if (processed) {
      console.log('Duplicate event:', event.id);
      return res.status(200).send('OK');
    }

    // 3. Acknowledge receipt immediately
    res.status(200).send('OK');

    // 4. Process asynchronously
    processWebhook(event).catch(err => {
      console.error('Processing error:', err);
    });
  }
);

async function processWebhook(event) {
  // Mark as processed
  await redis.setex(`webhook:${event.id}`, 86400, '1');

  // Handle event type
  switch (event.type) {
    case 'transaction.completed':
      await handleTransactionCompleted(event.data);
      break;
    case 'payment.success':
      await handlePaymentSuccess(event.data);
      break;
    case 'dispute.created':
      await handleDisputeCreated(event.data);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
}

function verifyWebhookSignature(payload, header, secret) {
  const items = header.split(',');
  const timestamp = items[0].split('=')[1];
  const signature = items[1].split('=')[1];

  // Check timestamp
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) {
    throw new Error('Webhook timestamp too old');
  }

  // Compute signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Compare
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Signature mismatch');
  }
}

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

---

## Support

Need help with webhooks?

- **Documentation**: https://docs.wastefi.org/api/webhooks
- **Email**: webhooks@wastefi.org
- **Discord**: https://discord.gg/wastefi

---

## Next Steps

- [Transactions API](/api/transactions) - Create and manage transactions
- [Payments API](/api/payments) - Process payments
- [Authentication](/api/authentication) - API authentication
