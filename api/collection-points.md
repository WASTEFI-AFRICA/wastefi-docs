# Collection Points API

## Overview

The Collection Points API allows you to find and interact with waste collection locations.

---

## List Collection Points

Get all collection points with optional filtering.

### Endpoint
```
GET /collection-points
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (`active`, `inactive`) |
| page | number | Page number |
| limit | number | Items per page (max: 100) |

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "cp_1a2b3c4d",
      "name": "Nairobi Central Collection",
      "status": "active",
      "location": {
        "address": "Tom Mboya Street, Nairobi",
        "city": "Nairobi",
        "country": "Kenya",
        "coordinates": {
          "latitude": -1.286389,
          "longitude": 36.817223
        }
      },
      "operatingHours": {
        "monday": { "open": "08:00", "close": "18:00" },
        "tuesday": { "open": "08:00", "close": "18:00" },
        "wednesday": { "open": "08:00", "close": "18:00" },
        "thursday": { "open": "08:00", "close": "18:00" },
        "friday": { "open": "08:00", "close": "18:00" },
        "saturday": { "open": "09:00", "close": "14:00" },
        "sunday": null
      },
      "acceptedMaterials": ["PET", "HDPE", "Aluminum", "Cardboard"],
      "capacity": {
        "current": 2500,
        "maximum": 5000,
        "unit": "kg"
      },
      "stats": {
        "totalCollectors": 234,
        "monthlyVolume": 12500,
        "averageRating": 4.7
      },
      "contact": {
        "phone": "+254700123456",
        "email": "nairobi.central@wastefi.org"
      }
    }
    // ... more collection points
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

## Find Nearby Collection Points

Find collection points near a specific location.

### Endpoint
```
GET /collection-points/nearby
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | number | Yes | Latitude coordinate |
| longitude | number | Yes | Longitude coordinate |
| radius | number | No | Search radius in km (default: 10, max: 50) |
| limit | number | No | Max results (default: 20) |

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "cp_1a2b3c4d",
      "name": "Nairobi Central Collection",
      "distance": 1.2,
      "distanceUnit": "km",
      "location": {
        "address": "Tom Mboya Street, Nairobi",
        "coordinates": {
          "latitude": -1.286389,
          "longitude": 36.817223
        }
      },
      "status": "active",
      "isOpen": true,
      "acceptedMaterials": ["PET", "HDPE", "Aluminum"],
      "capacity": {
        "availableSpace": 2500,
        "percentFull": 50
      },
      "estimatedWaitTime": 5
    }
    // ... more points sorted by distance
  ],
  "searchCenter": {
    "latitude": -1.2921,
    "longitude": 36.8219
  },
  "radius": 10
}
```

### Example
```javascript
// Find collection points within 5km
const response = await fetch(
  'https://api.wastefi.org/v1/collection-points/nearby?latitude=-1.2921&longitude=36.8219&radius=5',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { data } = await response.json();
console.log(`Found ${data.length} collection points nearby`);
```

---

## Get Collection Point Details

Retrieve detailed information about a specific collection point.

### Endpoint
```
GET /collection-points/:id
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cp_1a2b3c4d",
    "name": "Nairobi Central Collection",
    "description": "Main collection center in downtown Nairobi",
    "status": "active",
    "location": {
      "address": "Tom Mboya Street, Nairobi",
      "city": "Nairobi",
      "region": "Nairobi County",
      "country": "Kenya",
      "postalCode": "00100",
      "coordinates": {
        "latitude": -1.286389,
        "longitude": 36.817223
      },
      "directions": "Next to the Central Post Office"
    },
    "operatingHours": {
      "monday": { "open": "08:00", "close": "18:00" },
      "tuesday": { "open": "08:00", "close": "18:00" },
      "wednesday": { "open": "08:00", "close": "18:00" },
      "thursday": { "open": "08:00", "close": "18:00" },
      "friday": { "open": "08:00", "close": "18:00" },
      "saturday": { "open": "09:00", "close": "14:00" },
      "sunday": null
    },
    "isCurrentlyOpen": true,
    "acceptedMaterials": [
      {
        "id": "PET",
        "name": "PET Plastic Bottles",
        "currentPrice": 0.30,
        "availability": true
      },
      {
        "id": "HDPE",
        "name": "HDPE Plastic",
        "currentPrice": 0.25,
        "availability": true
      },
      {
        "id": "Aluminum",
        "name": "Aluminum Cans",
        "currentPrice": 0.75,
        "availability": false
      }
    ],
    "capacity": {
      "current": 2500,
      "maximum": 5000,
      "available": 2500,
      "unit": "kg",
      "percentFull": 50
    },
    "stats": {
      "totalCollectors": 234,
      "activeToday": 18,
      "monthlyVolume": 12500,
      "monthlyTransactions": 1250,
      "averageRating": 4.7,
      "totalReviews": 456
    },
    "operators": [
      {
        "id": "op_5h4g3f2d",
        "name": "Jane Smith",
        "role": "Lead Operator",
        "languages": ["en", "sw"]
      }
    ],
    "facilities": [
      "Weighing scale",
      "Quality inspection",
      "Storage area",
      "Restrooms",
      "Drinking water"
    ],
    "contact": {
      "phone": "+254700123456",
      "email": "nairobi.central@wastefi.org",
      "whatsapp": "+254700123456"
    },
    "photos": [
      "https://storage.wastefi.org/collection-points/cp_1a2b3c4d/photo1.jpg",
      "https://storage.wastefi.org/collection-points/cp_1a2b3c4d/photo2.jpg"
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-09-15T10:00:00Z"
  }
}
```

---

## Check Point Availability

Check if a collection point can accept a deposit now.

### Endpoint
```
GET /collection-points/:id/availability
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| materialId | string | Material type to check |
| weight | number | Intended deposit weight (kg) |

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "collectionPointId": "cp_1a2b3c4d",
    "available": true,
    "isOpen": true,
    "acceptsMaterial": true,
    "hasCapacity": true,
    "estimatedWaitTime": 5,
    "nextOpenTime": null,
    "reasons": [],
    "recommendation": "Proceed with deposit"
  }
}
```

### Response when unavailable
```json
{
  "success": true,
  "data": {
    "collectionPointId": "cp_1a2b3c4d",
    "available": false,
    "isOpen": false,
    "acceptsMaterial": true,
    "hasCapacity": true,
    "estimatedWaitTime": null,
    "nextOpenTime": "2024-09-16T08:00:00Z",
    "reasons": [
      "Collection point is currently closed",
      "Opens tomorrow at 8:00 AM"
    ],
    "recommendation": "Visit during operating hours"
  }
}
```

---

## Get Point Statistics

Get performance statistics for a collection point.

### Endpoint
```
GET /collection-points/:id/stats
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| period | string | `day`, `week`, `month`, or `year` (default: `month`) |

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "collectionPointId": "cp_1a2b3c4d",
    "period": "month",
    "summary": {
      "totalCollectors": 234,
      "totalTransactions": 1250,
      "totalVolume": 12500,
      "totalValue": 3750.00,
      "averageTransaction": {
        "volume": 10.0,
        "value": 3.00
      }
    },
    "byMaterial": [
      {
        "materialId": "PET",
        "volume": 7500,
        "transactions": 750,
        "value": 2250.00
      }
    ],
    "timeline": [
      {
        "date": "2024-09-01",
        "transactions": 45,
        "volume": 450,
        "value": 135.00
      }
    ]
  }
}
```

---

## Rate Collection Point

Submit a rating and review for a collection point.

### Endpoint
```
POST /collection-points/:id/reviews
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "rating": 5,
  "review": "Excellent service! Staff was very helpful and the process was quick.",
  "categories": {
    "service": 5,
    "cleanliness": 5,
    "speed": 4,
    "accuracy": 5
  }
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "rev_8x7w6v5u",
    "collectionPointId": "cp_1a2b3c4d",
    "userId": "usr_2a1b3c4d5e6f",
    "rating": 5,
    "review": "Excellent service! Staff was very helpful and the process was quick.",
    "categories": {
      "service": 5,
      "cleanliness": 5,
      "speed": 4,
      "accuracy": 5
    },
    "createdAt": "2024-09-15T10:30:00Z"
  }
}
```

---

## Next Steps

- [Transactions API](/api/transactions) - Create deposits
- [Materials API](/api/materials) - Check accepted materials
- [Payments API](/api/payments) - Process payments