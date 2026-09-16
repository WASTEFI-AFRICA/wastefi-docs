# RecycleGraph Material Identification Standards

## Overview

RecycleGraph is an open standard for material identification, tracking, and verification in circular economy systems. This document defines the complete specification for implementing RecycleGraph-compliant systems.

**Version:** 1.0.0  
**Status:** Draft for Public Comment  
**Last Updated:** September 15, 2024

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Material Identification](#material-identification)
4. [Digital Product Passports](#digital-product-passports)
5. [Verification Protocol](#verification-protocol)
6. [Data Format Specifications](#data-format-specifications)
7. [API Specifications](#api-specifications)
8. [Interoperability](#interoperability)
9. [Implementation Guidelines](#implementation-guidelines)
10. [Compliance & Certification](#compliance--certification)

---

## Introduction

### Purpose

RecycleGraph aims to create a universal, open standard for:
- Identifying and classifying recyclable materials
- Tracking material lifecycle from production to recycling
- Verifying material authenticity and quality
- Enabling cross-platform data exchange
- Supporting Extended Producer Responsibility (EPR) compliance

### Principles

1. **Open & Accessible** - Free to implement, no licensing fees
2. **Interoperable** - Works across different platforms and systems
3. **Privacy-Preserving** - Minimal data collection, user control
4. **Blockchain-Agnostic** - Works with any blockchain or database
5. **Extensible** - Can be extended for specific use cases
6. **Verifiable** - Cryptographically secure and auditable

### Scope

This standard covers:
- Material classification taxonomy
- Unique material identification
- Quality grading systems
- Digital passport format
- Verification protocols
- API specifications

This standard does NOT cover:
- Specific blockchain implementations
- Payment processing
- User authentication
- Business logic

---

## Core Concepts

### Material Identity

Every material unit has a unique identifier called a **Material ID (MID)**:

```
Format: RG-{VERSION}-{MATERIAL_TYPE}-{UNIQUE_ID}
Example: RG-1-PET-X7K9M2N4P8

Components:
- RG: RecycleGraph prefix
- VERSION: Standard version (1)
- MATERIAL_TYPE: ISO material code
- UNIQUE_ID: Base32-encoded unique identifier
```

### Material Lifecycle States

```
PRODUCED → DISTRIBUTED → IN_USE → COLLECTED → SORTED → PROCESSED → RECYCLED

Each state transition is recorded with:
- Timestamp
- Location
- Actor (who performed the action)
- Verification proof
```

### Actors

```
PRODUCER     - Creates or manufactures products
DISTRIBUTOR  - Distributes products to consumers
CONSUMER     - Uses products
COLLECTOR    - Collects waste materials
SORTER       - Sorts and grades materials
PROCESSOR    - Processes materials for recycling
RECYCLER     - Converts materials into new products
VERIFIER     - Verifies material authenticity and quality
```

---

## Material Identification

### Material Classification Taxonomy

**Level 1: Material Family**

```
1. PLASTICS
2. METALS
3. GLASS
4. PAPER
5. TEXTILES
6. ELECTRONICS
7. ORGANICS
8. COMPOSITES
```

**Level 2: Material Type**

```
PLASTICS:
  1.1 PET  - Polyethylene Terephthalate
  1.2 HDPE - High-Density Polyethylene
  1.3 PVC  - Polyvinyl Chloride
  1.4 LDPE - Low-Density Polyethylene
  1.5 PP   - Polypropylene
  1.6 PS   - Polystyrene
  1.7 OTHER - Other plastics

METALS:
  2.1 ALUMINUM  - Aluminum and alloys
  2.2 STEEL     - Steel and iron
  2.3 COPPER    - Copper and alloys
  2.4 BRASS     - Brass
  2.5 MIXED     - Mixed metals

GLASS:
  3.1 CLEAR     - Clear glass
  3.2 GREEN     - Green glass
  3.3 BROWN     - Brown/amber glass
  3.4 MIXED     - Mixed colors

PAPER:
  4.1 CARDBOARD - Corrugated cardboard
  4.2 PAPER     - Office/newspaper
  4.3 MIXED     - Mixed paper
```

**Level 3: Product Category** (Optional)

```
Examples for PET (1.1):
  1.1.1 - Beverage bottles
  1.1.2 - Food containers
  1.1.3 - Personal care bottles
  1.1.4 - Other containers
```

### Quality Grading System

**Grade Scale: A to F**

```
Grade A (90-100%): Premium Quality
- Minimal contamination (< 1%)
- Clean, sorted correctly
- No damage or degradation
- Ready for high-value recycling

Grade B (75-89%): Good Quality
- Minor contamination (1-5%)
- Mostly clean
- Minor labels or residue
- Suitable for standard recycling

Grade C (60-74%): Acceptable Quality
- Moderate contamination (5-15%)
- Some cleaning required
- Labels, caps, or residue present
- Suitable for downcycling

Grade D (50-59%): Low Quality
- Significant contamination (15-30%)
- Requires extensive cleaning
- Mixed materials or damage
- Limited recycling options

Grade E (35-49%): Very Low Quality
- Heavy contamination (30-50%)
- Difficult to process
- May require special handling
- Low recovery value

Grade F (0-34%): Rejected
- Contamination > 50%
- Cannot be recycled economically
- Diverted to landfill/incineration
```

**Quality Factors:**

```json
{
  "contamination": {
    "type": ["food", "liquid", "other_materials"],
    "level": 0.05,  // 5%
    "impact": -10
  },
  "cleanliness": {
    "washed": true,
    "labels_removed": false,
    "caps_removed": true,
    "impact": -5
  },
  "condition": {
    "crushed": false,
    "broken": false,
    "degraded": false,
    "impact": 0
  },
  "sorting": {
    "correctly_sorted": true,
    "mixed_materials": false,
    "impact": 0
  }
}
```

### Material Properties

**Standard Properties:**

```json
{
  "materialId": "RG-1-PET-X7K9M2N4P8",
  "materialType": "PET",
  "materialFamily": "PLASTICS",
  "productCategory": "beverage_bottle",
  "weight": 0.025,  // kg
  "volume": 0.0005, // m³
  "color": "clear",
  "brand": "CocaCola",
  "origin": {
    "country": "KE",
    "manufacturer": "ACME Manufacturing",
    "productionDate": "2024-06-15"
  },
  "composition": {
    "primary": "PET",
    "additives": ["colorant", "UV_stabilizer"],
    "recyclability": 0.95  // 95% recyclable
  }
}
```

---

## Digital Product Passports

### Passport Structure

```json
{
  "passport": {
    "id": "DPP-2024-PET-X7K9M2N4P8",
    "version": "1.0",
    "materialId": "RG-1-PET-X7K9M2N4P8",
    "createdAt": "2024-06-15T08:00:00Z",
    "updatedAt": "2024-09-15T14:30:00Z",
    "status": "active"
  },
  
  "product": {
    "name": "Coca-Cola 500ml Bottle",
    "gtin": "5449000000996",
    "category": "beverage_container",
    "weight": 0.025,
    "dimensions": {
      "height": 0.20,
      "diameter": 0.06
    }
  },
  
  "material": {
    "type": "PET",
    "grade": "food_grade",
    "resinCode": "1",
    "recycledContent": 0.25,  // 25% recycled material
    "recyclability": 0.95,
    "co2Footprint": 0.082  // kg CO2e
  },
  
  "manufacturer": {
    "name": "ACME Manufacturing",
    "id": "MFG-KE-001234",
    "location": {
      "country": "KE",
      "city": "Nairobi",
      "coordinates": [-1.286389, 36.817223]
    },
    "certifications": ["ISO9001", "ISO14001"]
  },
  
  "lifecycle": [
    {
      "state": "PRODUCED",
      "timestamp": "2024-06-15T08:00:00Z",
      "actor": "ACME Manufacturing",
      "location": [-1.286389, 36.817223],
      "proof": "stellar:tx_hash_here"
    },
    {
      "state": "DISTRIBUTED",
      "timestamp": "2024-06-20T10:30:00Z",
      "actor": "Regional Distributor",
      "location": [-1.292066, 36.821946],
      "proof": "stellar:tx_hash_here"
    },
    {
      "state": "COLLECTED",
      "timestamp": "2024-09-15T14:30:00Z",
      "actor": "WasteFi Collector",
      "location": [-1.286389, 36.817223],
      "quality": "A",
      "weight": 0.023,  // slight weight loss
      "proof": "stellar:tx_hash_here"
    }
  ],
  
  "certificates": [
    {
      "type": "recycled_content",
      "issuer": "RecycleGraph Verifier",
      "issuedAt": "2024-06-15",
      "expiresAt": "2025-06-15",
      "proof": "ipfs:QmXXXXXXXXXX"
    }
  ],
  
  "epr": {
    "producerResponsible": "The Coca-Cola Company",
    "feesPaid": true,
    "complianceStatus": "compliant",
    "recoveryTarget": 0.70  // 70% recovery target
  },
  
  "cryptography": {
    "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    "signature": "304402201234567890abcdef...",
    "publicKey": "GXXXXXXXXXXXXXXXXXXXXX"
  }
}
```

### Passport Creation

**Required Steps:**

1. Generate unique Material ID
2. Create passport with product data
3. Calculate cryptographic hash
4. Sign with manufacturer's private key
5. Record on blockchain/database
6. Generate QR code or NFC tag
7. Attach to product

**Code Example:**

```javascript
import crypto from 'crypto';
import { StellarSdk } from 'stellar-sdk';

function createPassport(productData, manufacturerKeypair) {
  // 1. Generate Material ID
  const materialId = generateMaterialId(productData.materialType);
  
  // 2. Create passport
  const passport = {
    passport: {
      id: `DPP-${new Date().getFullYear()}-${productData.materialType}-${materialId}`,
      version: '1.0',
      materialId: materialId,
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    product: productData,
    lifecycle: [{
      state: 'PRODUCED',
      timestamp: new Date().toISOString(),
      actor: productData.manufacturer.name,
      location: productData.manufacturer.coordinates
    }]
  };
  
  // 3. Calculate hash
  const passportJson = JSON.stringify(passport);
  const hash = crypto.createHash('sha256').update(passportJson).digest('hex');
  
  // 4. Sign
  const signature = manufacturerKeypair.sign(Buffer.from(hash, 'hex'));
  
  // 5. Add cryptography
  passport.cryptography = {
    hash: hash,
    signature: signature.toString('base64'),
    publicKey: manufacturerKeypair.publicKey()
  };
  
  return passport;
}
```

---

## Verification Protocol

### Verification Levels

**Level 1: Basic Verification**
- Verify QR/NFC data integrity
- Check Material ID format
- Validate passport structure

**Level 2: Cryptographic Verification**
- Verify digital signature
- Check blockchain/ledger record
- Validate certificate chain

**Level 3: Physical Verification**
- AI-powered image recognition
- Material composition analysis
- Weight and dimension verification

### Verification Process

```
1. Scan QR/NFC
   ↓
2. Retrieve passport data
   ↓
3. Validate format
   ↓
4. Verify signature
   ↓
5. Check blockchain record
   ↓
6. Validate lifecycle events
   ↓
7. Optional: Physical verification
   ↓
8. Issue verification certificate
```

### Verification API

**POST /verify**

```json
{
  "materialId": "RG-1-PET-X7K9M2N4P8",
  "passport": { /* passport object */ },
  "verificationLevel": 2,
  "physicalChecks": {
    "image": "base64_image_data",
    "weight": 0.023,
    "location": [-1.286389, 36.817223]
  }
}

Response:
{
  "verified": true,
  "verificationLevel": 2,
  "confidence": 0.95,
  "checks": {
    "format": "passed",
    "signature": "passed",
    "blockchain": "passed",
    "lifecycle": "passed",
    "physical": "passed"
  },
  "quality": "A",
  "certificate": {
    "id": "CERT-2024-091500123",
    "issuedBy": "RecycleGraph Verifier",
    "issuedAt": "2024-09-15T14:30:00Z",
    "expiresAt": "2024-09-15T15:30:00Z",
    "proof": "stellar:tx_hash_here"
  }
}
```

---

## Data Format Specifications

### JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://recyclegraph.org/schemas/passport/v1.0.json",
  "title": "RecycleGraph Digital Product Passport",
  "type": "object",
  "required": ["passport", "product", "material", "lifecycle"],
  "properties": {
    "passport": {
      "type": "object",
      "required": ["id", "version", "materialId", "createdAt"],
      "properties": {
        "id": { "type": "string", "pattern": "^DPP-" },
        "version": { "type": "string", "enum": ["1.0"] },
        "materialId": { "type": "string", "pattern": "^RG-1-" },
        "createdAt": { "type": "string", "format": "date-time" },
        "status": { "type": "string", "enum": ["active", "inactive", "recycled"] }
      }
    }
  }
}
```

### QR Code Format

**Data Encoding:**

```
Type: QR Code (Version 10 or higher)
Error Correction: H (30%)
Encoding: UTF-8

Data Format:
https://rg.to/{MATERIAL_ID}

Example:
https://rg.to/RG-1-PET-X7K9M2N4P8

The URL resolves to full passport data via API
```

### NFC Tag Format

```
Type: NFC Type 2 (NTAG213/215/216)
Memory: Minimum 144 bytes

NDEF Record:
- Type: URI
- URI: https://rg.to/{MATERIAL_ID}
- Optional: Digital signature in separate record
```

---

## API Specifications

### Base Endpoints

```
Production:  https://api.recyclegraph.org/v1
Testnet:     https://testnet-api.recyclegraph.org/v1
```

### Authentication

```
Authorization: Bearer {API_KEY}

or

Authorization: Stellar {STELLAR_PUBLIC_KEY}:{SIGNATURE}
```

### Core Endpoints

**1. Create Passport**

```
POST /passports

Request:
{
  "product": { /* product data */ },
  "material": { /* material data */ },
  "manufacturer": { /* manufacturer data */ }
}

Response: 201 Created
{
  "passportId": "DPP-2024-PET-X7K9M2N4P8",
  "materialId": "RG-1-PET-X7K9M2N4P8",
  "qrCode": "base64_qr_code_image",
  "passport": { /* full passport object */ }
}
```

**2. Get Passport**

```
GET /passports/{materialId}

Response: 200 OK
{
  "passport": { /* full passport object */ }
}
```

**3. Update Lifecycle**

```
POST /passports/{materialId}/lifecycle

Request:
{
  "state": "COLLECTED",
  "actor": "WasteFi",
  "location": [-1.286389, 36.817223],
  "quality": "A",
  "weight": 0.023,
  "timestamp": "2024-09-15T14:30:00Z"
}

Response: 200 OK
{
  "updated": true,
  "proof": "stellar:tx_hash"
}
```

**4. Verify Passport**

```
POST /verify

Request:
{
  "materialId": "RG-1-PET-X7K9M2N4P8",
  "verificationLevel": 2
}

Response: 200 OK
{
  "verified": true,
  "confidence": 0.95,
  "checks": { /* verification checks */ }
}
```

**5. Search Passports**

```
GET /passports?materialType=PET&country=KE&status=active

Response: 200 OK
{
  "results": [ /* array of passports */ ],
  "pagination": {
    "page": 1,
    "perPage": 50,
    "total": 1250
  }
}
```

---

## Interoperability

### Cross-Platform Compatibility

RecycleGraph passports can be:
- Stored on any blockchain (Stellar, Ethereum, etc.)
- Stored in centralized databases
- Exchanged via APIs
- Embedded in QR codes or NFC tags
- Imported/exported as JSON

### Integration with Existing Standards

**Compatible with:**
- GS1 Digital Link
- ISO 14021 (Environmental Labels)
- ISO 15270 (Plastics Recycling)
- EU Digital Product Passport Regulation
- Extended Producer Responsibility (EPR) frameworks

---

## Implementation Guidelines

### For Platform Developers

1. Implement core data structures
2. Generate unique Material IDs
3. Create digital passports
4. Integrate verification API
5. Record lifecycle events
6. Ensure cryptographic security

### For Manufacturers

1. Obtain RecycleGraph certification
2. Generate passports at production
3. Attach QR/NFC to products
4. Record production data
5. Pay EPR fees (if applicable)

### For Collectors/Recyclers

1. Integrate RecycleGraph scanner
2. Verify materials at collection
3. Grade materials accurately
4. Update lifecycle events
5. Generate impact reports

---

## Compliance & Certification

### Certification Levels

**Level 1: Basic Compliance**
- Implements core data structures
- Generates valid Material IDs
- Creates valid passports

**Level 2: Full Compliance**
- Level 1 requirements
- Cryptographic verification
- Blockchain/ledger integration
- API interoperability

**Level 3: Premium Certification**
- Level 2 requirements
- Physical verification
- AI quality grading
- Real-time tracking
- Advanced analytics

### Certification Process

1. Submit implementation documentation
2. Technical review
3. API conformance testing
4. Security audit
5. Issue certificate
6. Annual recertification

### Certified Implementers

- WasteFi (Level 3)
- [Your platform here]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-09-15 | Initial public draft |

---

## Governance

**Standards Committee:**
- Technical working group
- Industry representatives
- Environmental organizations
- Government regulators

**Amendment Process:**
1. Propose change (GitHub issue)
2. Public comment period (30 days)
3. Committee review
4. Vote (2/3 majority)
5. Publish updated standard

---

## Contributing

RecycleGraph is an open standard. Contributions welcome!

**Repository:** https://github.com/recyclegraph/standards  
**Discussions:** https://github.com/recyclegraph/standards/discussions  
**Email:** standards@recyclegraph.org

---

## License

RecycleGraph Standards are licensed under **CC BY 4.0**

You are free to:
- Share - copy and redistribute
- Adapt - remix, transform, and build upon

Under the terms:
- Attribution - credit RecycleGraph
- No additional restrictions

---

**Published by WasteFi Foundation**  
**For the global circular economy community**
