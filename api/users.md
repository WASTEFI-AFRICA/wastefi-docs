# Users API

## Overview

The Users API manages user accounts, profiles, and statistics.

---

## Get Current User

Retrieve the authenticated user's profile.

### Endpoint
```
GET /users/me
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
    "id": "usr_2a1b3c4d5e6f",
    "phone": "+254712345678",
    "phoneVerified": true,
    "name": "John Doe",
    "role": "collector",
    "language": "en",
    "wallet": {
      "stellarAddress": "GCXKG6RN4ONIEPCMNFB732A436Z5PNDSRLGWK7GBLCMQLIFO4S7EYWVU",
      "balance": 15.75,
      "lockedBalance": 0.00,
      "currency": "USD"
    },
    "stats": {
      "totalTransactions": 45,
      "totalEarnings": 125.50,
      "totalWeight": 250.5,
      "totalCO2Saved": 626.25,
      "averageRating": 4.8
    },
    "preferences": {
      "notifications": {
        "sms": true,
        "push": true,
        "email": false
      },
      "defaultCollectionPoint": "cp_1a2b3c4d"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-09-15T09:00:00Z"
  }
}
```

---

## Update User Profile

Update the current user's profile information.

### Endpoint
```
PUT /users/me
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "name": "John Doe Updated",
  "language": "sw",
  "preferences": {
    "notifications": {
      "sms": true,
      "push": false
    },
    "defaultCollectionPoint": "cp_5h4g3f2d"
  }
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "usr_2a1b3c4d5e6f",
    "name": "John Doe Updated",
    "language": "sw",
    "preferences": {
      "notifications": {
        "sms": true,
        "push": false
      },
      "defaultCollectionPoint": "cp_5h4g3f2d"
    },
    "updatedAt": "2024-09-15T10:30:00Z"
  }
}
```

---

## Get User Statistics

Retrieve detailed statistics for a user.

### Endpoint
```
GET /users/:id/stats
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| period | string | `week`, `month`, `year`, or `all` (default: `all`) |

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "userId": "usr_2a1b3c4d5e6f",
    "period": "month",
    "summary": {
      "totalTransactions": 12,
      "totalEarnings": 35.20,
      "totalWeight": 66.0,
      "totalCO2Saved": 165.0,
      "currency": "USD"
    },
    "byMaterial": [
      {
        "materialType": "PET",
        "count": 8,
        "weight": 44.0,
        "earnings": 22.00,
        "co2Saved": 110.0
      },
      {
        "materialType": "Aluminum",
        "count": 4,
        "weight": 22.0,
        "earnings": 13.20,
        "co2Saved": 55.0
      }
    ],
    "timeline": [
      {
        "date": "2024-09-01",
        "transactions": 3,
        "earnings": 8.75,
        "weight": 16.5,
        "co2Saved": 41.25
      },
      // ... more days
    ],
    "milestones": [
      {
        "type": "co2_saved",
        "value": 1000,
        "achievedAt": "2024-08-20T14:30:00Z",
        "description": "Saved 1 ton of CO2"
      }
    ]
  }
}
```

---

## Get User Impact

Retrieve environmental impact data for a user.

### Endpoint
```
GET /users/:id/impact
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "userId": "usr_2a1b3c4d5e6f",
    "totalImpact": {
      "co2Saved": 626.25,
      "unit": "kg",
      "equivalent": {
        "treesPlanted": 28,
        "milesNotDriven": 1562,
        "phonesCharged": 75093
      }
    },
    "byMaterial": [
      {
        "materialType": "PET",
        "weight": 165.0,
        "co2Saved": 412.5,
        "percentage": 65.9
      },
      {
        "materialType": "HDPE",
        "weight": 55.0,
        "co2Saved": 137.5,
        "percentage": 22.0
      },
      {
        "materialType": "Aluminum",
        "weight": 30.5,
        "co2Saved": 76.25,
        "percentage": 12.1
      }
    ],
    "carbonCredits": {
      "pending": 2.5,
      "minted": 18.75,
      "sold": 15.25,
      "revenue": 45.75
    },
    "ranking": {
      "local": 12,
      "national": 456,
      "global": 12890
    }
  }
}
```

---

## Upload Profile Photo

Upload or update user's profile photo.

### Endpoint
```
POST /users/me/photo
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data
```

### Request Body
```
Form data with 'photo' field containing image file
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "photoUrl": "https://storage.wastefi.org/profiles/usr_2a1b3c4d5e6f/avatar.jpg",
    "updatedAt": "2024-09-15T10:30:00Z"
  }
}
```

---

## Get User Wallet

Retrieve user's wallet details and balance.

### Endpoint
```
GET /users/me/wallet
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
    "stellarAddress": "GCXKG6RN4ONIEPCMNFB732A436Z5PNDSRLGWK7GBLCMQLIFO4S7EYWVU",
    "balance": 15.75,
    "lockedBalance": 0.00,
    "currency": "USD",
    "assets": [
      {
        "code": "USDC",
        "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        "balance": 15.75
      }
    ],
    "recentActivity": [
      {
        "type": "deposit",
        "amount": 1.85,
        "transactionId": "txn_9z8y7x6w5v",
        "timestamp": "2024-09-15T10:31:30Z"
      }
    ]
  }
}
```

---

## Delete User Account

Permanently delete a user account (requires OTP verification).

### Endpoint
```
DELETE /users/me
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "otp": "123456",
  "reason": "no_longer_needed"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "message": "Account deleted successfully",
    "deletedAt": "2024-09-15T10:30:00Z"
  }
}
```

---

## Next Steps

- [Transactions API](/api/transactions) - Manage transactions
- [Payments API](/api/payments) - Process payments
- [Impact API](/api/impact) - Track environmental impact