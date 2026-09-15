# Authentication API

## Overview

WasteFi uses phone number + PIN authentication with JWT tokens for API access. OTP verification via SMS ensures security.

## Authentication Flow

```
1. Register → Get user account
2. Login → Get access + refresh tokens
3. Use access token for API calls
4. Refresh when access token expires
5. Logout → Invalidate tokens
```

---

## Register User

Create a new user account with phone number and PIN.

### Endpoint
```
POST /auth/register
```

### Request Body
```json
{
  "phone": "+254712345678",
  "pin": "1234",
  "name": "John Doe",
  "role": "collector",
  "language": "en"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | Yes | Phone number in E.164 format |
| pin | string | Yes | 4-6 digit PIN |
| name | string | Yes | User's full name |
| role | string | Yes | `collector`, `operator`, or `admin` |
| language | string | No | Preferred language (default: `en`) |

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "userId": "usr_2a1b3c4d5e6f",
    "phone": "+254712345678",
    "phoneVerified": false,
    "message": "OTP sent to your phone"
  }
}
```

### Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PHONE",
    "message": "Phone number format is invalid"
  }
}
```

**409 Conflict**
```json
{
  "success": false,
  "error": {
    "code": "PHONE_EXISTS",
    "message": "Phone number already registered"
  }
}
```

### Example
```bash
curl -X POST https://api.wastefi.org/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "pin": "1234",
    "name": "John Doe",
    "role": "collector"
  }'
```

---

## Verify OTP

Verify the OTP code sent via SMS during registration or sensitive operations.

### Endpoint
```
POST /auth/verify-otp
```

### Request Body
```json
{
  "phone": "+254712345678",
  "otp": "123456"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "phoneVerified": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "8f7e6d5c4b3a2918273645...",
    "expiresIn": 900
  }
}
```

### Token Details

| Field | Description |
|-------|-------------|
| accessToken | Short-lived token (15 minutes) for API calls |
| refreshToken | Long-lived token (7 days) to get new access tokens |
| expiresIn | Access token expiry in seconds |

### Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OTP",
    "message": "OTP is incorrect or expired"
  }
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Too many OTP attempts. Try again in 5 minutes"
  }
}
```

---

## Login

Authenticate with phone number and PIN to get access tokens.

### Endpoint
```
POST /auth/login
```

### Request Body
```json
{
  "phone": "+254712345678",
  "pin": "1234"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_2a1b3c4d5e6f",
      "phone": "+254712345678",
      "name": "John Doe",
      "role": "collector",
      "phoneVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "8f7e6d5c4b3a2918273645...",
    "expiresIn": 900
  }
}
```

### Errors

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Phone number or PIN is incorrect"
  }
}
```

**403 Forbidden** (Account Locked)
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account locked due to multiple failed attempts. Try again in 5 minutes"
  }
}
```

### Example
```javascript
// JavaScript/Node.js
const response = await fetch('https://api.wastefi.org/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+254712345678',
    pin: '1234'
  })
});

const { data } = await response.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

---

## Refresh Token

Get a new access token using the refresh token.

### Endpoint
```
POST /auth/refresh-token
```

### Request Body
```json
{
  "refreshToken": "8f7e6d5c4b3a2918273645..."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### Errors

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired"
  }
}
```

### Example
```javascript
// Automatically refresh token before it expires
async function getValidToken() {
  const token = localStorage.getItem('accessToken');
  const decoded = jwtDecode(token);
  
  // Refresh if token expires in less than 2 minutes
  if (decoded.exp * 1000 - Date.now() < 120000) {
    const response = await fetch('https://api.wastefi.org/v1/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refreshToken')
      })
    });
    
    const { data } = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  }
  
  return token;
}
```

---

## Logout

Invalidate the current session and tokens.

### Endpoint
```
POST /auth/logout
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Request Body
```json
{
  "refreshToken": "8f7e6d5c4b3a2918273645..."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Example
```javascript
await fetch('https://api.wastefi.org/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});

// Clear local storage
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

---

## Get Current User

Get the profile of the currently authenticated user.

### Endpoint
```
GET /auth/profile
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
    "name": "John Doe",
    "role": "collector",
    "phoneVerified": true,
    "language": "en",
    "createdAt": "2024-01-15T10:30:00Z",
    "stats": {
      "totalTransactions": 45,
      "totalEarnings": 125.50,
      "co2Saved": 112.5
    }
  }
}
```

---

## Update Profile

Update the current user's profile information.

### Endpoint
```
PUT /auth/profile
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Request Body
```json
{
  "name": "John Doe Updated",
  "language": "sw"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "usr_2a1b3c4d5e6f",
    "phone": "+254712345678",
    "name": "John Doe Updated",
    "language": "sw",
    "updatedAt": "2024-09-15T10:30:00Z"
  }
}
```

---

## Change PIN

Change the user's PIN (requires OTP verification).

### Endpoint
```
POST /auth/change-pin
```

### Headers
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Request Body
```json
{
  "currentPin": "1234",
  "newPin": "5678",
  "otp": "123456"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "message": "PIN changed successfully"
  }
}
```

---

## JWT Token Structure

Access tokens are JWT tokens with the following payload:

```json
{
  "userId": "usr_2a1b3c4d5e6f",
  "phone": "+254712345678",
  "role": "collector",
  "iat": 1694781000,
  "exp": 1694781900
}
```

### Using JWT Tokens

Include the access token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.wastefi.org/v1/users/me
```

---

## Security Best Practices

### PIN Requirements
- 4-6 digits only
- No sequential patterns (e.g., 1234, 9876)
- No repeating digits (e.g., 1111, 2222)
- At least 3 unique digits

### Token Storage
- **Web:** Store tokens in memory or httpOnly cookies (not localStorage for production)
- **Mobile:** Use secure storage (Keychain on iOS, Keystore on Android)
- **Never:** Expose tokens in URLs or logs

### Rate Limiting
- 3 failed login attempts → 5 minute lockout
- 5 failed OTP attempts → 15 minute lockout
- 10 failed attempts → Account temporarily suspended

### Session Management
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are single-use (rotated on refresh)
- Logout invalidates all tokens

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PHONE` | Phone number format invalid |
| `PHONE_EXISTS` | Phone already registered |
| `INVALID_PIN` | PIN doesn't meet requirements |
| `INVALID_CREDENTIALS` | Phone or PIN incorrect |
| `INVALID_OTP` | OTP incorrect or expired |
| `ACCOUNT_LOCKED` | Too many failed attempts |
| `PHONE_NOT_VERIFIED` | Phone verification required |
| `INVALID_REFRESH_TOKEN` | Refresh token invalid/expired |
| `TOKEN_EXPIRED` | Access token expired |

---

## Next Steps

- [Users API](/api/users) - Manage user profiles
- [Transactions API](/api/transactions) - Create and manage transactions
- [SDK Documentation](/guide/sdk) - Use official SDKs