# Materials API

## Overview

The Materials API provides information about material types, pricing, and identification.

---

## List Materials

Get all available material types.

### Endpoint
```
GET /materials
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category (`plastic`, `metal`, `paper`, `glass`) |
| active | boolean | Show only active materials (default: `true`) |

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "PET",
      "name": "PET Plastic Bottles",
      "category": "plastic",
      "description": "Polyethylene Terephthalate bottles and containers",
      "recycleGraphId": "RG-PLASTIC-PET-1",
      "basePrice": 0.30,
      "priceUnit": "kg",
      "currency": "USD",
      "co2PerKg": 2.5,
      "qualityGrades": {
        "A": {
          "multiplier": 1.2,
          "description": "Clean, clear, labels removed"
        },
        "B": {
          "multiplier": 1.0,
          "description": "Clean, some labels present"
        },
        "C": {
          "multiplier": 0.8,
          "description": "Dirty, contaminated"
        }
      },
      "examples": [
        "Water bottles",
        "Soda bottles",
        "Juice containers"
      ],
      "acceptanceCriteria": {
        "minWeight": 0.1,
        "maxWeight": 100,
        "restrictions": [
          "No food residue",
          "No hazardous materials"
        ]
      },
      "active": true,
      "updatedAt": "2024-09-15T10:00:00Z"
    },
    // ... more materials
  ]
}
```

---

## Get Material Details

Retrieve detailed information about a specific material type.

### Endpoint
```
GET /materials/:id
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
    "id": "PET",
    "name": "PET Plastic Bottles",
    "category": "plastic",
    "description": "Polyethylene Terephthalate bottles and containers",
    "recycleGraphId": "RG-PLASTIC-PET-1",
    "basePrice": 0.30,
    "priceUnit": "kg",
    "currency": "USD",
    "co2PerKg": 2.5,
    "qualityGrades": {
      "A": { "multiplier": 1.2, "description": "Clean, clear, labels removed" },
      "B": { "multiplier": 1.0, "description": "Clean, some labels present" },
      "C": { "multiplier": 0.8, "description": "Dirty, contaminated" }
    },
    "priceHistory": [
      { "date": "2024-09-15", "price": 0.30 },
      { "date": "2024-09-01", "price": 0.28 },
      { "date": "2024-08-15", "price": 0.32 }
    ],
    "statistics": {
      "totalCollected": 125000,
      "averageQuality": "B",
      "topCollectors": 1250
    },
    "recyclingProcess": {
      "steps": [
        "Cleaning and sorting",
        "Shredding",
        "Washing",
        "Melting and pelletizing"
      ],
      "endProducts": [
        "New bottles",
        "Polyester fiber",
        "Containers"
      ]
    },
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-09-15T10:00:00Z"
  }
}
```

---

## Get Current Price

Get the current market price for a material type.

### Endpoint
```
GET /materials/:id/price
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| location | string | Collection point ID or coordinates |
| quality | string | Quality grade (`A`, `B`, or `C`) |

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "materialId": "PET",
    "basePrice": 0.30,
    "qualityMultiplier": 1.2,
    "locationMultiplier": 1.05,
    "effectivePrice": 0.378,
    "priceUnit": "kg",
    "currency": "USD",
    "breakdown": {
      "marketPrice": 0.30,
      "qualityAdjustment": 0.06,
      "locationAdjustment": 0.018
    },
    "validUntil": "2024-09-15T12:00:00Z",
    "lastUpdated": "2024-09-15T10:00:00Z"
  }
}
```

---

## Identify Material

Identify material type from an uploaded image using AI.

### Endpoint
```
POST /materials/identify
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data
```

### Request Body
```
Form data with 'image' field containing photo file
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "materialId": "PET",
        "materialName": "PET Plastic Bottles",
        "confidence": 0.95,
        "suggestedQuality": "B",
        "estimatedWeight": 5.5
      },
      {
        "materialId": "HDPE",
        "materialName": "HDPE Plastic",
        "confidence": 0.05,
        "suggestedQuality": "C",
        "estimatedWeight": null
      }
    ],
    "recommendation": {
      "materialId": "PET",
      "confidence": "high",
      "tips": [
        "Remove labels for Grade A",
        "Ensure bottles are clean inside"
      ]
    },
    "processedImageUrl": "https://storage.wastefi.org/processed/abc123.jpg"
  }
}
```

### Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Image must be JPEG or PNG format, max 5MB"
  }
}
```

---

## Calculate Payment

Calculate the payment amount for a material deposit.

### Endpoint
```
POST /materials/calculate-payment
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "materialId": "PET",
  "weight": 5.5,
  "qualityGrade": "A",
  "collectionPointId": "cp_1a2b3c4d"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "materialId": "PET",
    "weight": 5.5,
    "qualityGrade": "A",
    "calculation": {
      "basePrice": 0.30,
      "pricePerKg": 0.378,
      "grossAmount": 2.079,
      "platformFee": 0.042,
      "blockchainFee": 0.00001,
      "netAmount": 2.037,
      "currency": "USD"
    },
    "impact": {
      "co2Saved": 13.75,
      "unit": "kg",
      "carbonCreditValue": 0.041
    },
    "breakdown": [
      { "item": "Material value", "amount": 2.079 },
      { "item": "Platform fee (2%)", "amount": -0.042 },
      { "item": "Blockchain fee", "amount": -0.00001 },
      { "item": "You receive", "amount": 2.037 }
    ]
  }
}
```

---

## Get Material Categories

Get all material categories with counts.

### Endpoint
```
GET /materials/categories
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "plastic",
      "name": "Plastics",
      "description": "All types of plastic materials",
      "icon": "🥤",
      "materialCount": 8,
      "totalCollected": 450000,
      "avgPrice": 0.28
    },
    {
      "id": "metal",
      "name": "Metals",
      "description": "Aluminum, steel, and other metals",
      "icon": "🥫",
      "materialCount": 5,
      "totalCollected": 125000,
      "avgPrice": 0.65
    },
    {
      "id": "paper",
      "name": "Paper & Cardboard",
      "description": "Paper products and cardboard",
      "icon": "📦",
      "materialCount": 4,
      "totalCollected": 200000,
      "avgPrice": 0.15
    },
    {
      "id": "glass",
      "name": "Glass",
      "description": "Glass bottles and containers",
      "icon": "🍾",
      "materialCount": 3,
      "totalCollected": 75000,
      "avgPrice": 0.08
    }
  ]
}
```

---

## Search Materials

Search for materials by name or properties.

### Endpoint
```
GET /materials/search
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query |
| category | string | Filter by category |
| minPrice | number | Minimum price per kg |
| maxPrice | number | Maximum price per kg |

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "query": "bottle",
    "results": [
      {
        "id": "PET",
        "name": "PET Plastic Bottles",
        "category": "plastic",
        "basePrice": 0.30,
        "relevanceScore": 0.95
      },
      {
        "id": "GLASS",
        "name": "Glass Bottles",
        "category": "glass",
        "basePrice": 0.08,
        "relevanceScore": 0.82
      }
    ],
    "total": 2
  }
}
```

---

## Example Usage

### JavaScript
```javascript
// Get all materials
const materials = await fetch('https://api.wastefi.org/v1/materials', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data } = await materials.json();
console.log(`Found ${data.length} material types`);

// Identify material from photo
const formData = new FormData();
formData.append('image', photoFile);

const identification = await fetch('https://api.wastefi.org/v1/materials/identify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const { data: result } = await identification.json();
console.log(`Identified as: ${result.predictions[0].materialName}`);
console.log(`Confidence: ${result.predictions[0].confidence * 100}%`);
```

---

## Next Steps

- [Transactions API](/api/transactions) - Create transactions
- [Collection Points API](/api/collection-points) - Find collection points
- [Payments API](/api/payments) - Process payments