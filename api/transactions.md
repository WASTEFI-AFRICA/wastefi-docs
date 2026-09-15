# Transactions API

## Overview

The Transactions API allows you to create, retrieve, and manage waste collection transactions.

---

## Create Transaction

Create a new transaction for material deposit.

### Endpoint
```
POST /transactions
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "collectionPointId": "cp_1a2b3c4d",
  "materialType": "PET",
  "weight": 5.5,
  "qualityGrade": "A",
  "photos": [
    "https://storage.wastefi.org/photos/abc123.jpg"
  ],
  "notes": "Clean bottles, labels removed"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| collectionPointId | string | Yes | Collection point ID |
| materialType | string | Yes | Material type code (PET, HDPE, etc.) |
| weight | number | Yes | Weight in kilograms |
| qualityGrade | string | Yes | A (excellent), B (good), or C (fair) |
| photos | array | No | URLs of material photos |
| notes | string | No | Additional notes |

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "txn_9z8y7x6w5v",
    "userId": "usr_2a1b3c4d5e6f",
    "collectionPointId": "cp_1a2b3c4d",
    "materialType": "PET",
    "weight": 5.5,
    "qualityGrade": "A",
    "payment": {
      "grossAmount": 1.89,
      "platformFee": 0.04,
      "netAmount": 1.85,
      "currency": "USD",
      "breakdown": {
        "basePrice": 0.30,
        "qualityMultiplier": 1.2,
        "locationMultiplier": 1.05
      }
    },
    "impact": {
      "co2Saved": 13.75,
      "unit": "kg"
    },
    "status": "pending",
    "createdAt": "2024-09-15T10:30:00Z",
    "estimatedPaymentTime": "2024-09-15T10:32:00Z"
  }
}
```

### Transaction Status Values

| Status | Description |
|--------|-------------|
| `pending` | Awaiting collection point authorization |
| `authorized` | Authorized by collection point |
| `processing` | Payment being processed |
| `completed` | Payment completed successfully |
| `failed` | Payment failed |
| `disputed` | Transaction disputed |
| `cancelled` | Transaction cancelled |

### Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_WEIGHT",
    "message": "Weight must be between 0.1 and 1000 kg",
    "field": "weight"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "COLLECTION_POINT_NOT_FOUND",
    "message": "Collection point does not exist"
  }
}
```

### Example
```javascript
const transaction = await fetch('https://api.wastefi.org/v1/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    collectionPointId: 'cp_1a2b3c4d',
    materialType: 'PET',
    weight: 5.5,
    qualityGrade: 'A'
  })
});

const { data } = await transaction.json();
console.log(`Transaction ID: ${data.id}`);
console.log(`You will receive: $${data.payment.netAmount}`);
```

---

## Get Transaction

Retrieve details of a specific transaction.

### Endpoint
```
GET /transactions/:id
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "txn_9z8y7x6w5v",
    "userId": "usr_2a1b3c4d5e6f",
    "user": {
      "id": "usr_2a1b3c4d5e6f",
      "name": "John Doe",
      "phone": "+254712345678"
    },
    "collectionPointId": "cp_1a2b3c4d",
    "collectionPoint": {
      "id": "cp_1a2b3c4d",
      "name": "Nairobi Central Collection",
      "location": {
        "latitude": -1.286389,
        "longitude": 36.817223,
        "address": "Tom Mboya St, Nairobi"
      }
    },
    "materialType": "PET",
    "weight": 5.5,
    "qualityGrade": "A",
    "payment": {
      "grossAmount": 1.89,
      "platformFee": 0.04,
      "netAmount": 1.85,
      "currency": "USD",
      "stellarTxHash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889"
    },
    "impact": {
      "co2Saved": 13.75,
      "unit": "kg"
    },
    "status": "completed",
    "photos": [
      "https://storage.wastefi.org/photos/abc123.jpg"
    ],
    "notes": "Clean bottles, labels removed",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2024-09-15T10:30:00Z"
      },
      {
        "status": "authorized",
        "timestamp": "2024-09-15T10:31:00Z",
        "authorizedBy": "op_5h4g3f2d"
      },
      {
        "status": "completed",
        "timestamp": "2024-09-15T10:31:30Z"
      }
    ],
    "createdAt": "2024-09-15T10:30:00Z",
    "updatedAt": "2024-09-15T10:31:30Z"
  }
}
```

---

## List Transactions

Get transaction history with filtering and pagination.

### Endpoint
```
GET /transactions/history
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| status | string | Filter by status |
| materialType | string | Filter by material type |
| startDate | string | Start date (ISO 8601) |
| endDate | string | End date (ISO 8601) |
| sort | string | Sort field (prefix with `-` for descending) |

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_9z8y7x6w5v",
      "materialType": "PET",
      "weight": 5.5,
      "payment": {
        "netAmount": 1.85,
        "currency": "USD"
      },
      "impact": {
        "co2Saved": 13.75
      },
      "status": "completed",
      "createdAt": "2024-09-15T10:30:00Z"
    },
    // ... more transactions
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalEarnings": 125.50,
    "totalWeight": 250.5,
    "totalCO2Saved": 626.25,
    "transactionCount": 45
  }
}
```

### Example Queries

```bash
# Get completed transactions
GET /transactions/history?status=completed

# Get PET transactions from last month
GET /transactions/history?materialType=PET&startDate=2024-08-01&endDate=2024-08-31

# Sort by date descending
GET /transactions/history?sort=-createdAt

# Get page 2 with 50 items
GET /transactions/history?page=2&limit=50
```

---

## Get User Statistics

Get summary statistics for a user's transactions.

### Endpoint
```
GET /transactions/stats
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalTransactions": 45,
    "totalEarnings": 125.50,
    "totalWeight": 250.5,
    "totalCO2Saved": 626.25,
    "currency": "USD",
    "byMaterial": [
      {
        "materialType": "PET",
        "count": 30,
        "weight": 165.0,
        "earnings": 82.50,
        "co2Saved": 412.5
      },
      {
        "materialType": "HDPE",
        "count": 10,
        "weight": 55.0,
        "earnings": 27.50,
        "co2Saved": 137.5
      },
      {
        "materialType": "Aluminum",
        "count": 5,
        "weight": 30.5,
        "earnings": 15.50,
        "co2Saved": 76.25
      }
    ],
    "byMonth": [
      {
        "month": "2024-09",
        "count": 12,
        "earnings": 35.20,
        "weight": 66.0,
        "co2Saved": 165.0
      },
      {
        "month": "2024-08",
        "count": 15,
        "earnings": 42.30,
        "weight": 82.5,
        "co2Saved": 206.25
      }
    ],
    "averageTransaction": {
      "weight": 5.57,
      "earnings": 2.79,
      "co2Saved": 13.92
    }
  }
}
```

---

## Cancel Transaction

Cancel a pending transaction.

### Endpoint
```
DELETE /transactions/:id
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "txn_9z8y7x6w5v",
    "status": "cancelled",
    "cancelledAt": "2024-09-15T10:35:00Z"
  }
}
```

### Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_CANCEL",
    "message": "Can only cancel transactions with status 'pending'"
  }
}
```

---

## Dispute Transaction

Create a dispute for a transaction.

### Endpoint
```
POST /transactions/:id/dispute
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Request Body
```json
{
  "reason": "weight_incorrect",
  "description": "The weight recorded was 5.5kg but I brought 7kg",
  "evidence": [
    "https://storage.wastefi.org/evidence/photo1.jpg"
  ]
}
```

### Dispute Reasons

| Reason | Description |
|--------|-------------|
| `weight_incorrect` | Weight measurement disputed |
| `quality_grade_wrong` | Quality grade assessment disputed |
| `payment_incorrect` | Payment amount incorrect |
| `material_rejected` | Material wrongly rejected |
| `other` | Other reason (provide description) |

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "disputeId": "dis_1a2b3c4d",
    "transactionId": "txn_9z8y7x6w5v",
    "reason": "weight_incorrect",
    "status": "under_review",
    "createdAt": "2024-09-15T10:40:00Z",
    "estimatedResolution": "2024-09-17T10:40:00Z"
  }
}
```

---

## Export Transactions

Export transaction history as CSV or PDF.

### Endpoint
```
GET /transactions/export
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | `csv` or `pdf` (default: csv) |
| startDate | string | Start date (ISO 8601) |
| endDate | string | End date (ISO 8601) |
| status | string | Filter by status |

### Response (200 OK)

Returns file download with appropriate Content-Type:
- CSV: `text/csv`
- PDF: `application/pdf`

### Example
```javascript
// Download CSV export
const response = await fetch(
  'https://api.wastefi.org/v1/transactions/export?format=csv&startDate=2024-01-01',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'transactions.csv';
a.click();
```

---

## Webhooks

Subscribe to transaction events via webhooks:

### Event Types
- `transaction.created` - New transaction created
- `transaction.authorized` - Transaction authorized
- `transaction.completed` - Payment completed
- `transaction.failed` - Payment failed
- `transaction.disputed` - Dispute created

### Webhook Payload Example
```json
{
  "event": "transaction.completed",
  "timestamp": "2024-09-15T10:31:30Z",
  "data": {
    "id": "txn_9z8y7x6w5v",
    "userId": "usr_2a1b3c4d5e6f",
    "payment": {
      "netAmount": 1.85,
      "stellarTxHash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889"
    }
  }
}
```

---

## Next Steps

- [Payments API](/api/payments) - Process payments and cashouts
- [Materials API](/api/materials) - Material types and pricing
- [Impact API](/api/impact) - Environmental impact tracking