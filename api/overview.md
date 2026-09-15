# API Overview

The WasteFi API provides programmatic access to the platform's core functionality. This RESTful API enables developers to integrate waste collection, payment processing, and impact tracking into their applications.

## Base URL

```
Production:  https://api.wastefi.org/v1
Testnet:     https://api-testnet.wastefi.org/v1
```

## API Principles

### RESTful Design
- **Resources**: Nouns represent entities (users, transactions, materials)
- **Methods**: HTTP verbs indicate actions (GET, POST, PUT, DELETE)
- **Stateless**: Each request contains all necessary information
- **HATEOAS**: Responses include links to related resources

### Response Format
All responses are JSON with consistent structure:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2024-09-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: phone",
    "details": {
      "field": "phone",
      "expected": "string"
    }
  },
  "meta": {
    "timestamp": "2024-09-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

## Authentication

All API requests require authentication using JWT tokens. See [Authentication](/api/authentication) for details.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

API requests are rate-limited to ensure fair usage:

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| Free | 60 | 1,000 | 10,000 |
| Basic | 300 | 10,000 | 100,000 |
| Pro | 1,000 | 50,000 | 500,000 |
| Enterprise | Custom | Custom | Custom |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1694776200
```

When rate limit is exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 30 seconds.",
    "retryAfter": 30
  }
}
```

## Pagination

List endpoints support cursor-based pagination:

```http
GET /v1/transactions?limit=20&cursor=txn_abc123
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 20,
    "nextCursor": "txn_def456",
    "prevCursor": "txn_xyz789",
    "hasMore": true
  }
}
```

## Filtering & Sorting

Use query parameters for filtering and sorting:

```http
GET /v1/transactions?status=completed&startDate=2024-01-01&sort=-createdAt
```

**Common Parameters:**
- `limit` - Number of results (default: 20, max: 100)
- `cursor` - Pagination cursor
- `sort` - Sort field (prefix with `-` for descending)
- `fields` - Comma-separated list of fields to include

## Versioning

The API is versioned via URL path:
```
/v1/  → Current stable version
/v2/  → Next version (beta)
```

Breaking changes will increment the major version. We maintain backward compatibility for at least 6 months after releasing a new version.

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SUCCESS` | 200 | Request succeeded |
| `CREATED` | 201 | Resource created |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Idempotency

POST and PUT requests support idempotency keys to prevent duplicate operations:

```http
POST /v1/transactions
Idempotency-Key: unique-key-123
Content-Type: application/json

{
  "userId": "usr_123",
  "amount": 5.25
}
```

If the same key is used within 24 hours, the original response is returned without creating a duplicate.

## Webhooks

Subscribe to real-time events via webhooks. Configure webhook URLs in your dashboard.

**Event Types:**
- `transaction.created`
- `transaction.completed`
- `transaction.failed`
- `payment.processed`
- `impact.calculated`

**Webhook Payload:**
```json
{
  "id": "evt_abc123",
  "type": "transaction.completed",
  "createdAt": "2024-09-15T10:30:00Z",
  "data": {
    "transactionId": "txn_def456",
    "userId": "usr_123",
    "amount": 5.25
  }
}
```

## SDKs & Client Libraries

Official SDKs available for:
- JavaScript/TypeScript (npm: `@wastefi/sdk`)
- Python (pip: `wastefi`)
- PHP (composer: `wastefi/sdk`)
- Java (maven: `org.wastefi:wastefi-sdk`)

**Example (JavaScript):**
```javascript
import WasteFi from '@wastefi/sdk';

const client = new WasteFi({
  apiKey: 'your-api-key',
  environment: 'production'
});

const transaction = await client.transactions.create({
  userId: 'usr_123',
  materialType: 'PET',
  weight: 5.5
});
```

## Testing

Use testnet for development and testing:
- API: `https://api-testnet.wastefi.org/v1`
- No real money transactions
- Separate database from production
- Request testnet API keys from dashboard

## Support

- **Documentation**: https://docs.wastefi.org
- **API Status**: https://status.wastefi.org
- **Email**: api@wastefi.org
- **Discord**: https://discord.gg/wastefi

---

## Quick Start

1. [Create an account](https://app.wastefi.org/register)
2. [Generate API keys](https://app.wastefi.org/settings/api)
3. [Authenticate](/api/authentication) and get access token
4. Make your first request:

```bash
curl https://api.wastefi.org/v1/materials \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Endpoints

Explore detailed documentation for each endpoint:

- [Authentication](/api/authentication) - Login, register, and token management
- [Users](/api/users) - User profiles and management
- [Transactions](/api/transactions) - Material deposit transactions
- [Materials](/api/materials) - Material types and pricing
- [Collection Points](/api/collection-points) - Collection point management
- [Payments](/api/payments) - Payment processing and history
- [Impact](/api/impact) - Environmental impact tracking
