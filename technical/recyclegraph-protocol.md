# RecycleGraph Protocol Specification

## Version 1.0.0

## Abstract

RecycleGraph is an open protocol for standardized material identification and tracking in the circular economy. It provides a common language for describing recyclable materials, their properties, and their journey through the recycling system.

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Material Identification](#material-identification)
4. [Digital Product Passports](#digital-product-passports)
5. [Data Formats](#data-formats)
6. [API Specification](#api-specification)
7. [Implementation Guide](#implementation-guide)

---

## Introduction

### Purpose

RecycleGraph aims to:
- **Standardize** material identification across the recycling industry
- **Enable** interoperability between different waste management systems
- **Facilitate** circular economy data flows
- **Support** Extended Producer Responsibility (EPR) compliance
- **Track** materials from production to recycling

### Design Principles

1. **Open and Free** - No licensing fees, anyone can implement
2. **Simple** - Easy to understand and adopt
3. **Extensible** - Can be adapted to local needs
4. **Technology Agnostic** - Works with QR codes, NFC, RFID, or visual recognition
5. **Privacy Preserving** - Minimal personal data collection

### Use Cases

- Material collection and payment
- EPR compliance reporting
- Supply chain traceability
- Carbon credit verification
- Waste auditing and analytics
- Product lifecycle tracking

---

## Core Concepts

### Material ID

A unique identifier for each material type following the format:

```
RG-[CATEGORY]-[SUBCATEGORY]-[VERSION]
```

**Examples:**
```
RG-PLASTIC-PET-1       (PET plastic bottles)
RG-METAL-ALUMINUM-1    (Aluminum cans)
RG-PAPER-CARDBOARD-1   (Cardboard boxes)
RG-GLASS-CLEAR-1       (Clear glass bottles)
```

### Material Categories

#### Level 1: Primary Categories

```
PLASTIC    - All plastic materials
METAL      - Ferrous and non-ferrous metals
PAPER      - Paper and cardboard
GLASS      - Glass containers and materials
ELECTRONIC - E-waste and electronics
ORGANIC    - Compostable organic materials
TEXTILE    - Fabric and clothing
COMPOSITE  - Multi-material items
```

#### Level 2: Subcategories (Example: Plastics)

```
PET        - Polyethylene Terephthalate (Resin code 1)
HDPE       - High-Density Polyethylene (Resin code 2)
PVC        - Polyvinyl Chloride (Resin code 3)
LDPE       - Low-Density Polyethylene (Resin code 4)
PP         - Polypropylene (Resin code 5)
PS         - Polystyrene (Resin code 6)
OTHER      - Other plastics (Resin code 7)
MIXED      - Mixed plastics
```

### Quality Grades

Standardized quality assessment:

```
A  - Excellent: Clean, sorted, minimal contamination
B  - Good: Clean, some contamination acceptable
C  - Fair: Contaminated, requires additional processing
D  - Poor: Heavily contaminated, low recyclability
X  - Rejected: Not recyclable in current condition
```

### Measurement Units

```
kg   - Kilograms (default for weight)
l    - Liters (for volume)
pcs  - Pieces (for countable items)
m²   - Square meters (for flat materials)
```

---

## Material Identification

### Standard Material Descriptor

```json
{
  "version": "1.0.0",
  "materialId": "RG-PLASTIC-PET-1",
  "type": "plastic",
  "subtype": "PET",
  "resinCode": "1",
  "name": {
    "en": "PET Plastic Bottles",
    "sw": "Chupa za Plastiki PET",
    "fr": "Bouteilles en plastique PET"
  },
  "description": "Polyethylene Terephthalate bottles and containers",
  "recyclable": true,
  "properties": {
    "density": "1.38 g/cm³",
    "meltingPoint": "260°C",
    "color": "clear",
    "transparency": "transparent"
  },
  "recyclingProcess": [
    "collection",
    "sorting",
    "cleaning",
    "shredding",
    "melting",
    "pelletizing"
  ],
  "endProducts": [
    "new bottles",
    "polyester fiber",
    "containers",
    "strapping"
  ],
  "environmentalImpact": {
    "co2SavedPerKg": 2.5,
    "energySavedPerKg": "25 MJ",
    "waterSavedPerKg": "40 L"
  },
  "economicData": {
    "estimatedValuePerKg": {
      "min": 0.20,
      "max": 0.40,
      "currency": "USD"
    },
    "marketVolatility": "medium"
  }
}
```

### QR Code Format

QR codes encode minimal information, with full data retrievable via API:

```
RG:PET:5.5:A:LOC-NBI-001:20240915T103000Z
│  │   │   │ │           │
│  │   │   │ │           └─ Timestamp
│  │   │   │ └─────────── Location ID
│  │   │   └─────────────── Quality Grade
│  │   └─────────────────── Weight (kg)
│  └─────────────────────── Material Subtype
└────────────────────────── Protocol Prefix
```

**Decoded:**
- Protocol: RecycleGraph
- Material: PET plastic
- Weight: 5.5 kg
- Quality: Grade A
- Location: Nairobi collection point 001
- Time: Sept 15, 2024 at 10:30 AM UTC

### NFC Tag Format

NFC tags can store more data:

```json
{
  "protocol": "RecycleGraph",
  "version": "1.0.0",
  "materialId": "RG-PLASTIC-PET-1",
  "weight": 5.5,
  "unit": "kg",
  "qualityGrade": "A",
  "collectionPoint": "LOC-NBI-001",
  "timestamp": "2024-09-15T10:30:00Z",
  "batchId": "BATCH-2024-0915-001",
  "signature": "a7f3d9e2..."  // Digital signature for verification
}
```

---

## Digital Product Passports

### Product Passport Schema

```json
{
  "passportId": "PP-2024-BRAND-BOTTLE-001",
  "version": "1.0.0",
  "productInfo": {
    "name": "500ml Water Bottle",
    "brand": "BrandCo",
    "productCode": "BC-WB-500",
    "gtin": "12345678901234",
    "category": "beverage_container"
  },
  "manufacturer": {
    "name": "BrandCo Manufacturing Ltd",
    "id": "MANU-BC-001",
    "country": "Kenya",
    "facility": "Nairobi Plant",
    "certification": ["ISO-9001", "ISO-14001"]
  },
  "materials": [
    {
      "materialId": "RG-PLASTIC-PET-1",
      "percentage": 95,
      "weight": 14.25,
      "unit": "g",
      "recyclable": true,
      "recycledContent": 25
    },
    {
      "materialId": "RG-PLASTIC-PP-1",
      "percentage": 5,
      "weight": 0.75,
      "unit": "g",
      "recyclable": true,
      "recycledContent": 0
    }
  ],
  "lifecycle": {
    "manufactureDate": "2024-09-01",
    "batchNumber": "BATCH-2024-09-001",
    "expiryDate": "2026-09-01",
    "carbonFootprint": {
      "manufacturing": 82,
      "transport": 18,
      "total": 100,
      "unit": "g CO2e"
    }
  },
  "recycling": {
    "instructions": {
      "en": "1. Empty contents 2. Remove cap 3. Rinse 4. Flatten 5. Recycle",
      "sw": "1. Toa maji 2. Ondoa kifuniko 3. Osha 4. Kandamiza 5. Rejea"
    },
    "recyclabilityScore": 9.5,
    "eprCompliance": {
      "scheme": "KE-EPR-2024",
      "feePerUnit": 0.05,
      "currency": "USD",
      "paid": true
    }
  },
  "blockchain": {
    "network": "stellar",
    "assetCode": "PASSPORT",
    "txHash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889"
  },
  "qrCode": "https://recyclegraph.org/passport/PP-2024-BRAND-BOTTLE-001",
  "createdAt": "2024-09-01T00:00:00Z",
  "updatedAt": "2024-09-01T00:00:00Z"
}
```

### Passport Lifecycle Events

Track events throughout product lifecycle:

```json
{
  "passportId": "PP-2024-BRAND-BOTTLE-001",
  "events": [
    {
      "type": "manufactured",
      "timestamp": "2024-09-01T08:00:00Z",
      "location": "Nairobi Plant",
      "data": {
        "batchNumber": "BATCH-2024-09-001",
        "quantity": 10000
      }
    },
    {
      "type": "distributed",
      "timestamp": "2024-09-05T10:00:00Z",
      "location": "Retail Distribution Center",
      "data": {
        "destination": "Supermarket Chain A"
      }
    },
    {
      "type": "sold",
      "timestamp": "2024-09-10T14:30:00Z",
      "location": "Store #123",
      "data": {
        "retailer": "Supermarket Chain A"
      }
    },
    {
      "type": "collected",
      "timestamp": "2024-09-15T10:30:00Z",
      "location": "Collection Point NBI-001",
      "data": {
        "collector": "usr_abc123",
        "weight": 0.015,
        "qualityGrade": "A"
      }
    },
    {
      "type": "recycled",
      "timestamp": "2024-09-20T09:00:00Z",
      "location": "Recycling Facility RF-001",
      "data": {
        "outputMaterial": "PET pellets",
        "weight": 0.014
      }
    }
  ]
}
```

---

## Data Formats

### JSON-LD (Linked Data)

For semantic web compatibility:

```json
{
  "@context": {
    "@vocab": "https://recyclegraph.org/vocab/",
    "schema": "https://schema.org/"
  },
  "@type": "RecyclableMaterial",
  "@id": "https://recyclegraph.org/material/RG-PLASTIC-PET-1",
  "identifier": "RG-PLASTIC-PET-1",
  "name": "PET Plastic Bottles",
  "category": "plastic",
  "subCategory": "PET",
  "schema:additionalType": "https://www.wikidata.org/wiki/Q145863",
  "recyclable": true,
  "environmentalImpact": {
    "@type": "EnvironmentalImpact",
    "co2Reduction": {
      "@type": "schema:QuantitativeValue",
      "value": 2.5,
      "unitCode": "KGM"
    }
  }
}
```

### CSV Export Format

For bulk data exchange:

```csv
materialId,type,subtype,name,recyclable,co2SavedPerKg,estimatedValueMin,estimatedValueMax,currency
RG-PLASTIC-PET-1,plastic,PET,PET Plastic Bottles,true,2.5,0.20,0.40,USD
RG-PLASTIC-HDPE-1,plastic,HDPE,HDPE Plastic,true,1.8,0.15,0.35,USD
RG-METAL-ALUMINUM-1,metal,aluminum,Aluminum Cans,true,9.0,0.60,0.90,USD
```

### XML Format

For legacy system integration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<material xmlns="https://recyclegraph.org/schema/1.0">
  <materialId>RG-PLASTIC-PET-1</materialId>
  <type>plastic</type>
  <subtype>PET</subtype>
  <name lang="en">PET Plastic Bottles</name>
  <recyclable>true</recyclable>
  <environmentalImpact>
    <co2SavedPerKg>2.5</co2SavedPerKg>
    <unit>kg</unit>
  </environmentalImpact>
</material>
```

---

## API Specification

### Base URL

```
Production: https://api.recyclegraph.org/v1
Testnet: https://api-testnet.recyclegraph.org/v1
```

### Authentication

```http
Authorization: Bearer YOUR_API_KEY
```

### Endpoints

#### Get Material Information

```http
GET /materials/{materialId}
```

**Response:**
```json
{
  "materialId": "RG-PLASTIC-PET-1",
  "type": "plastic",
  "subtype": "PET",
  "name": "PET Plastic Bottles",
  "recyclable": true,
  "properties": { ... },
  "environmentalImpact": { ... }
}
```

#### Search Materials

```http
GET /materials?type=plastic&recyclable=true
```

#### Register Product Passport

```http
POST /passports
Content-Type: application/json

{
  "productInfo": { ... },
  "manufacturer": { ... },
  "materials": [ ... ]
}
```

#### Get Passport

```http
GET /passports/{passportId}
```

#### Record Collection Event

```http
POST /passports/{passportId}/events
Content-Type: application/json

{
  "type": "collected",
  "location": "Collection Point NBI-001",
  "collector": "usr_abc123",
  "weight": 0.015,
  "qualityGrade": "A"
}
```

#### Verify Material

```http
POST /verify
Content-Type: application/json

{
  "qrCode": "RG:PET:5.5:A:LOC-NBI-001:20240915T103000Z",
  "signature": "optional_signature_for_verification"
}
```

---

## Implementation Guide

### For Material Collection Systems

```javascript
// 1. Scan QR code
const scannedData = "RG:PET:5.5:A:LOC-NBI-001:20240915T103000Z";

// 2. Parse data
const [protocol, material, weight, quality, location, timestamp] = scannedData.split(':');

// 3. Get full material data
const materialInfo = await fetch(
  `https://api.recyclegraph.org/v1/materials/RG-PLASTIC-${material}-1`
).then(r => r.json());

// 4. Calculate value
const basePrice = materialInfo.economicData.estimatedValuePerKg.min;
const qualityMultiplier = quality === 'A' ? 1.2 : quality === 'B' ? 1.0 : 0.8;
const value = parseFloat(weight) * basePrice * qualityMultiplier;

// 5. Process payment
await processPayment(collectorId, value);

// 6. Record environmental impact
const co2Saved = parseFloat(weight) * materialInfo.environmentalImpact.co2SavedPerKg;
await recordImpact(collectorId, material, weight, co2Saved);
```

### For Manufacturers (Creating Passports)

```javascript
// Create product passport
const passport = {
  productInfo: {
    name: "500ml Water Bottle",
    brand: "BrandCo",
    productCode: "BC-WB-500"
  },
  manufacturer: {
    name: "BrandCo Manufacturing Ltd",
    country: "Kenya"
  },
  materials: [
    {
      materialId: "RG-PLASTIC-PET-1",
      percentage: 95,
      weight: 14.25,
      unit: "g"
    }
  ]
};

// Register with RecycleGraph
const response = await fetch('https://api.recyclegraph.org/v1/passports', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(passport)
});

const { passportId, qrCode } = await response.json();

// Print QR code on product
printQRCode(qrCode);
```

### For Recyclers

```javascript
// Record recycling event
await fetch(
  `https://api.recyclegraph.org/v1/passports/${passportId}/events`,
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'recycled',
      location: 'Recycling Facility RF-001',
      outputMaterial: 'PET pellets',
      weight: 0.014
    })
  }
);
```

---

## Compliance and Certification

### RecycleGraph Certified

Systems can be certified as RecycleGraph compliant:

**Requirements:**
1. Correctly implement material identification
2. Support standard quality grades
3. Record environmental impact data
4. Provide API access (if applicable)
5. Use standard QR code format

**Certification Levels:**
- **Bronze:** Basic material identification
- **Silver:** Digital product passports
- **Gold:** Full lifecycle tracking
- **Platinum:** Blockchain integration

---

## Versioning

RecycleGraph follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR:** Breaking changes to core protocol
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes and clarifications

Current version: **1.0.0**

---

## Governance

RecycleGraph is governed by the RecycleGraph Foundation, a non-profit organization.

**Principles:**
- Open and transparent
- Community-driven
- Vendor-neutral
- Free to use

**Contribution:**
- Submit proposals via GitHub
- Community review period (30 days)
- Foundation approval

---

## Resources

- **Website:** https://recyclegraph.org
- **GitHub:** https://github.com/recyclegraph
- **API Docs:** https://api.recyclegraph.org/docs
- **Community Forum:** https://forum.recyclegraph.org
- **Specification:** https://recyclegraph.org/spec/v1.0.0

---

## License

RecycleGraph Protocol Specification is released under **CC BY 4.0**

You are free to:
- Share and adapt the specification
- Use for commercial purposes

Under the condition:
- Attribution to RecycleGraph Foundation

---

## Appendix A: Material Registry

Complete list of standard material IDs available at:
https://recyclegraph.org/registry

## Appendix B: Example Implementations

Reference implementations available in:
- JavaScript/TypeScript
- Python
- Java
- PHP
- Go

https://github.com/recyclegraph/implementations

## Appendix C: QR Code Generator

Online tool: https://recyclegraph.org/tools/qr-generator

## Appendix D: Validator

Validate your implementation:
https://recyclegraph.org/tools/validator