# Environment Variables and Configuration

## Overview

This guide documents all environment variables and configuration options for WasteFi components. Proper configuration is essential for security, performance, and functionality.

## Configuration Management

### Environment Files

Each component uses `.env` files for configuration:

```
wastefi-backend/
  ├── .env.example          # Template with all variables
  ├── .env.development      # Local development
  ├── .env.staging          # Staging environment
  └── .env.production       # Production (never commit!)

wastefi-frontend/
  ├── .env.example
  ├── .env.development
  ├── .env.staging
  └── .env.production
```

### Loading Environment Variables

**Backend (Node.js):**
```javascript
// src/config/env.js
import dotenv from 'dotenv';

// Load environment-specific file
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

export const config = {
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000'),
  // ... other config
};
```

**Frontend (Vite):**
```javascript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
});
```

---

## Backend Environment Variables

### Application Settings

```env
# Environment
NODE_ENV=development
# Options: development, staging, production
# Controls logging, error handling, optimizations

# Server
PORT=3000
# Port number for the API server
# Default: 3000

API_VERSION=v1
# API version for route prefixing
# Example: /api/v1/transactions

HOST=0.0.0.0
# Host to bind to
# Use 0.0.0.0 for Docker, localhost for local dev

# Base URL
API_BASE_URL=http://localhost:3000
# Full base URL for the API
# Used for generating links in emails, webhooks, etc.

# CORS
CORS_ORIGIN=http://localhost:5173,https://wastefi.org
# Comma-separated list of allowed origins
# Use * only in development (security risk)

CORS_CREDENTIALS=true
# Allow credentials in CORS requests
```

### Database Configuration

```env
# PostgreSQL
DATABASE_URL=postgresql://wastefi:password@localhost:5432/wastefi_dev
# Full connection string
# Format: postgresql://user:password@host:port/database

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=wastefi_dev
DATABASE_USER=wastefi
DATABASE_PASSWORD=secure_password_here
# Individual connection parameters (alternative to DATABASE_URL)

# Connection Pool
DATABASE_POOL_MIN=2
# Minimum connections in pool
# Recommended: 2-5

DATABASE_POOL_MAX=10
# Maximum connections in pool
# Recommended: 10-20 for moderate load, 50-100 for high load

DATABASE_POOL_IDLE_TIMEOUT=10000
# Idle connection timeout (ms)
# Default: 10000 (10 seconds)

DATABASE_SSL=false
# Enable SSL for database connections
# Set to true in production

# Migrations
RUN_MIGRATIONS_ON_START=true
# Automatically run migrations on startup
# Set to false in production (run manually)
```

### Redis Configuration

```env
# Redis
REDIS_URL=redis://localhost:6379
# Full Redis connection string

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Individual connection parameters

REDIS_PREFIX=wastefi:
# Key prefix for all Redis keys
# Helps avoid conflicts with other applications

REDIS_DB=0
# Redis database number (0-15)
# Use different numbers for different environments

# Caching
CACHE_TTL=3600
# Default cache time-to-live in seconds
# 3600 = 1 hour

SESSION_TTL=604800
# Session time-to-live in seconds
# 604800 = 7 days
```

### Authentication & Security

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
# Secret key for signing JWTs
# MUST be at least 32 characters
# Generate: openssl rand -base64 32

JWT_EXPIRES_IN=7d
# JWT expiration time
# Options: 1h, 7d, 30d, etc.

JWT_REFRESH_SECRET=your-refresh-token-secret-key
# Secret for refresh tokens (different from JWT_SECRET)

JWT_REFRESH_EXPIRES_IN=30d
# Refresh token expiration

# PIN Hashing
BCRYPT_ROUNDS=10
# Number of bcrypt rounds for PIN hashing
# Higher = more secure but slower
# Recommended: 10-12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
# Rate limit window in ms (15 minutes)

RATE_LIMIT_MAX_REQUESTS=100
# Max requests per window per IP

# API Keys
API_KEY_SALT=your-api-key-salt
# Salt for generating API keys

# 2FA
TWO_FACTOR_ENABLED=true
# Enable two-factor authentication

OTP_SECRET=your-otp-secret-key
# Secret for generating OTP codes
```

### Stellar Network

```env
# Network
STELLAR_NETWORK=testnet
# Options: testnet, public
# Use testnet for development, public for production

STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
# Horizon API endpoint
# Testnet: https://horizon-testnet.stellar.org
# Mainnet: https://horizon.stellar.org

STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
# Network passphrase for transaction signing
# Testnet: "Test SDF Network ; September 2015"
# Mainnet: "Public Global Stellar Network ; September 2015"

# Platform Account
STELLAR_PLATFORM_SECRET=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Platform's Stellar secret key
# CRITICAL: Never commit to version control!
# Store in secure secrets manager in production

STELLAR_PLATFORM_PUBLIC=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Platform's public address
# Can be derived from secret, but useful for verification

# Transaction Settings
STELLAR_BASE_FEE=100
# Base fee in stroops (1 stroop = 0.0000001 XLM)
# Default: 100 stroops

STELLAR_TIMEOUT=30
# Transaction timeout in seconds
```

### Mobile Money Integration

```env
# M-Pesa (Kenya)
MPESA_ENVIRONMENT=sandbox
# Options: sandbox, production

MPESA_CONSUMER_KEY=your_mpesa_consumer_key
# OAuth consumer key from Safaricom

MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
# OAuth consumer secret

MPESA_SHORTCODE=174379
# Business shortcode (paybill or till number)

MPESA_PASSKEY=your_mpesa_passkey
# Lipa Na M-Pesa Online passkey

MPESA_INITIATOR_NAME=testapi
# Initiator name for B2C transactions

MPESA_SECURITY_CREDENTIAL=encrypted_security_credential
# Encrypted initiator password

MPESA_CALLBACK_URL=https://api.wastefi.org/webhooks/mpesa
# URL for M-Pesa callbacks

MPESA_TIMEOUT_URL=https://api.wastefi.org/webhooks/mpesa/timeout
# URL for timeout callbacks

# MTN Mobile Money (Uganda, Rwanda, etc.)
MTN_ENVIRONMENT=sandbox
MTN_API_KEY=your_mtn_api_key
MTN_API_SECRET=your_mtn_api_secret
MTN_SUBSCRIPTION_KEY=your_subscription_key
MTN_CALLBACK_URL=https://api.wastefi.org/webhooks/mtn

# Airtel Money
AIRTEL_ENVIRONMENT=sandbox
AIRTEL_CLIENT_ID=your_airtel_client_id
AIRTEL_CLIENT_SECRET=your_airtel_client_secret
AIRTEL_CALLBACK_URL=https://api.wastefi.org/webhooks/airtel

# Chipper Cash
CHIPPER_API_KEY=your_chipper_api_key
CHIPPER_WEBHOOK_SECRET=your_webhook_secret
CHIPPER_CALLBACK_URL=https://api.wastefi.org/webhooks/chipper
```

### Email Configuration

```env
# SMTP
SMTP_HOST=smtp.gmail.com
# SMTP server hostname
# Gmail: smtp.gmail.com
# SendGrid: smtp.sendgrid.net
# Mailgun: smtp.mailgun.org

SMTP_PORT=587
# SMTP port
# 587 (TLS) or 465 (SSL)

SMTP_SECURE=false
# Use SSL/TLS
# true for port 465, false for port 587

SMTP_USER=your-email@gmail.com
# SMTP username (usually email address)

SMTP_PASSWORD=your-app-specific-password
# SMTP password or app-specific password

# Email Settings
EMAIL_FROM=noreply@wastefi.org
# Default sender email

EMAIL_FROM_NAME=WasteFi
# Default sender name

EMAIL_REPLY_TO=support@wastefi.org
# Reply-to address

# Templates
EMAIL_TEMPLATE_DIR=./src/templates/email
# Directory containing email templates
```

### SMS Configuration

```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
# Phone number for sending SMS

# Africa's Talking
AFRICAS_TALKING_USERNAME=your_username
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_SENDER_ID=WASTEFI
# Sender ID (max 11 characters)

# SMS Settings
SMS_ENABLED=true
# Enable/disable SMS notifications

SMS_PROVIDER=africas_talking
# Options: twilio, africas_talking
```

### Logging

```env
# Log Level
LOG_LEVEL=info
# Options: error, warn, info, http, verbose, debug, silly
# Development: debug or verbose
# Production: info or warn

LOG_FORMAT=json
# Options: json, pretty, simple
# Development: pretty
# Production: json (for log aggregation)

# Log Files
LOG_FILE_ENABLED=true
# Enable file logging

LOG_FILE_PATH=./logs
# Directory for log files

LOG_FILE_MAX_SIZE=10m
# Max size per log file

LOG_FILE_MAX_FILES=14d
# Keep logs for 14 days

# External Logging
SENTRY_DSN=https://xxx@sentry.io/xxx
# Sentry DSN for error tracking

DATADOG_API_KEY=your_datadog_api_key
# DataDog API key for APM
```

### Feature Flags

```env
# Features
ENABLE_REGISTRATION=true
# Allow new user registration

ENABLE_SMS=false
# Enable SMS notifications (costs money)

ENABLE_EMAIL=true
# Enable email notifications

ENABLE_CARBON_CREDITS=true
# Enable carbon credit generation

ENABLE_REFERRALS=true
# Enable referral program

ENABLE_REWARDS=true
# Enable rewards/gamification

ENABLE_KYC=false
# Require KYC verification

ENABLE_GEOLOCATION=true
# Enable GPS features

ENABLE_OFFLINE_MODE=true
# Enable offline transaction queue

# Maintenance
MAINTENANCE_MODE=false
# Enable maintenance mode (blocks all API access)

MAINTENANCE_MESSAGE=We'll be back soon!
# Message to show during maintenance
```

### Third-Party Integrations

```env
# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# For geocoding and maps

# Firebase Cloud Messaging
FCM_SERVER_KEY=your_fcm_server_key
# For push notifications

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=wastefi-uploads

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Analytics
MIXPANEL_TOKEN=your_mixpanel_token
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

### Performance & Optimization

```env
# Caching
ENABLE_CACHE=true
# Enable Redis caching

CACHE_CONTROL_MAX_AGE=3600
# Cache-Control header max-age

# Compression
ENABLE_COMPRESSION=true
# Enable gzip compression

# Request Limits
MAX_REQUEST_SIZE=10mb
# Maximum request body size

MAX_FILE_SIZE=5mb
# Maximum file upload size

# Timeouts
REQUEST_TIMEOUT=30000
# Request timeout in ms (30 seconds)

DATABASE_QUERY_TIMEOUT=10000
# Database query timeout (10 seconds)
```

---

## Frontend Environment Variables

### Application Settings

```env
# Environment
VITE_ENVIRONMENT=development
# Options: development, staging, production

# API
VITE_API_URL=http://localhost:3000/api/v1
# Backend API base URL

VITE_WS_URL=ws://localhost:3000
# WebSocket URL for real-time features

VITE_API_TIMEOUT=30000
# API request timeout (ms)
```

### Stellar Network

```env
# Stellar
VITE_STELLAR_NETWORK=testnet
# Options: testnet, public

VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
# Horizon API endpoint

VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
# Network passphrase
```

### Third-Party Services

```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# For maps and location services

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=wastefi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wastefi
VITE_FIREBASE_STORAGE_BUCKET=wastefi.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
# Firebase configuration for push notifications

# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
# Sentry DSN for frontend error tracking

VITE_SENTRY_ENVIRONMENT=development
# Environment name for Sentry

VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
# Percentage of transactions to track (0.0 to 1.0)
```

### Feature Flags

```env
# Features
VITE_ENABLE_PWA=true
# Enable Progressive Web App features

VITE_ENABLE_OFFLINE=true
# Enable offline mode

VITE_ENABLE_ANALYTICS=false
# Enable analytics tracking (disable in dev)

VITE_ENABLE_DEBUG=true
# Enable debug mode (console logs, Vue devtools)

VITE_ENABLE_SERVICE_WORKER=true
# Enable service worker for PWA

VITE_ENABLE_CAMERA=true
# Enable camera for QR code scanning

VITE_ENABLE_GEOLOCATION=true
# Enable GPS features
```

### App Settings

```env
# App Info
VITE_APP_NAME=WasteFi
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Financial Inclusion Through Waste Collection

# Branding
VITE_PRIMARY_COLOR=#10b981
VITE_SECONDARY_COLOR=#059669

# Limits
VITE_MAX_UPLOAD_SIZE=5242880
# Max file upload size in bytes (5MB)

VITE_MIN_TRANSACTION_WEIGHT=0.1
# Minimum weight for transactions (kg)

VITE_MAX_TRANSACTION_WEIGHT=100
# Maximum weight for transactions (kg)
```

---

## Smart Contracts Configuration

### Build Configuration

**Cargo.toml:**

```toml
[package]
name = "wastefi-contracts"
version = "1.0.0"
edition = "2021"

[dependencies]
soroban-sdk = "20.0.0"

[dev-dependencies]
soroban-sdk = { version = "20.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

[profile.release-with-logs]
inherits = "release"
debug-assertions = true
```

### Deployment Configuration

**.env.contracts:**

```env
# Network
SOROBAN_NETWORK=testnet
# Options: testnet, futurenet, mainnet

SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
# Soroban RPC endpoint

SOROBAN_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
# Network passphrase

# Deployer
STELLAR_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Secret key for contract deployment
# CRITICAL: Never commit to version control!

# Contract IDs (after deployment)
TRANSACTION_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PAYMENT_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
IMPACT_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MATERIAL_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Configuration Best Practices

### Security

**DO:**
- ✅ Use environment variables for secrets
- ✅ Never commit `.env` files to git
- ✅ Use different secrets for each environment
- ✅ Rotate secrets regularly
- ✅ Use strong, random values for secrets
- ✅ Store production secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
- ✅ Use `.env.example` as template (with fake values)

**DON'T:**
- ❌ Hardcode secrets in source code
- ❌ Use same secrets across environments
- ❌ Share secrets in chat or email
- ❌ Use weak or default values
- ❌ Commit `.env` files to version control

### Organization

```env
# Group related variables together
# Use comments to explain non-obvious values
# Use consistent naming (SCREAMING_SNAKE_CASE)
# Order: most important → least important

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgresql://...
DATABASE_POOL_MAX=10

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
JWT_SECRET=...
JWT_EXPIRES_IN=7d
```

### Validation

**Backend validation:**

```javascript
// src/config/validate.js
import Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .required(),
  
  PORT: Joi.number()
    .port()
    .default(3000),
  
  DATABASE_URL: Joi.string()
    .uri()
    .required(),
  
  JWT_SECRET: Joi.string()
    .min(32)
    .required(),
  
  STELLAR_PLATFORM_SECRET: Joi.string()
    .regex(/^S[A-Z2-7]{55}$/)
    .required(),
  
  // ... other validations
}).unknown();

const { error, value: validatedEnv } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default validatedEnv;
```

### Defaults

```javascript
// Provide sensible defaults
const config = {
  port: parseInt(process.env.PORT || '3000'),
  logLevel: process.env.LOG_LEVEL || 'info',
  cacheEnabled: process.env.ENABLE_CACHE !== 'false',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  }
};
```

---

## Environment-Specific Examples

### Development

**.env.development:**

```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

DATABASE_URL=postgresql://wastefi:wastefi@localhost:5432/wastefi_dev
REDIS_URL=redis://localhost:6379

JWT_SECRET=dev-secret-key-not-secure
JWT_EXPIRES_IN=7d

STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=http://localhost:8000

LOG_LEVEL=debug
LOG_FORMAT=pretty

ENABLE_CACHE=false
ENABLE_SMS=false
ENABLE_EMAIL=false

CORS_ORIGIN=*
```

### Staging

**.env.staging:**

```env
NODE_ENV=staging
PORT=3000
API_BASE_URL=https://api-staging.wastefi.org

DATABASE_URL=postgresql://wastefi:${DB_PASSWORD}@staging-db.wastefi.org:5432/wastefi_staging
REDIS_URL=redis://:${REDIS_PASSWORD}@staging-redis.wastefi.org:6379

JWT_SECRET=${JWT_SECRET_STAGING}
JWT_EXPIRES_IN=7d

STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_PLATFORM_SECRET=${STELLAR_SECRET_STAGING}

LOG_LEVEL=info
LOG_FORMAT=json
SENTRY_DSN=${SENTRY_DSN}

ENABLE_CACHE=true
ENABLE_SMS=true
ENABLE_EMAIL=true

CORS_ORIGIN=https://staging.wastefi.org
```

### Production

**.env.production:**

```env
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.wastefi.org

DATABASE_URL=postgresql://wastefi:${DB_PASSWORD}@prod-db.wastefi.org:5432/wastefi_prod
DATABASE_SSL=true
DATABASE_POOL_MAX=50

REDIS_URL=redis://:${REDIS_PASSWORD}@prod-redis.wastefi.org:6379

JWT_SECRET=${JWT_SECRET_PROD}
JWT_EXPIRES_IN=7d

STELLAR_NETWORK=public
STELLAR_HORIZON_URL=https://horizon.stellar.org
STELLAR_PLATFORM_SECRET=${STELLAR_SECRET_PROD}

LOG_LEVEL=warn
LOG_FORMAT=json
SENTRY_DSN=${SENTRY_DSN}

ENABLE_CACHE=true
ENABLE_SMS=true
ENABLE_EMAIL=true

CORS_ORIGIN=https://wastefi.org,https://www.wastefi.org

RATE_LIMIT_MAX_REQUESTS=50
```

---

## Generating Secrets

### JWT Secret

```bash
# Generate 32-byte secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Stellar Keypair

```bash
# Using Stellar CLI
stellar keys generate --global platform --network testnet

# Or using Node.js SDK
node -e "const StellarSdk = require('stellar-sdk'); const pair = StellarSdk.Keypair.random(); console.log('Secret:', pair.secret()); console.log('Public:', pair.publicKey());"
```

### API Keys

```bash
# Generate random API key
openssl rand -hex 32

# Or UUID
node -e "console.log(require('crypto').randomUUID())"
```

---

## Troubleshooting

### Common Issues

**"Config validation error"**
- Check all required variables are set
- Verify format (URLs, numbers, etc.)
- Check for typos in variable names

**"Database connection failed"**
- Verify DATABASE_URL is correct
- Check database is running
- Verify credentials
- Check network connectivity

**"Invalid JWT secret"**
- Ensure JWT_SECRET is at least 32 characters
- Check for special characters causing parsing issues
- Regenerate if compromised

**"Stellar transaction failed"**
- Verify STELLAR_NETWORK matches Horizon URL
- Check STELLAR_PLATFORM_SECRET is valid
- Ensure account has enough XLM for fees

---

**Next:** [API Integration Examples](./api-examples.md)
