# Deployment Overview

## Introduction

This guide covers deploying the WasteFi platform across different environments. WasteFi consists of multiple components that can be deployed independently or together.

## Components

```
┌────────────────────────────────────────────────────────┐
│                  WasteFi Platform                      │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │   Mobile    │  │   Backend   │  │   Smart      │ │
│  │   PWA App   │  │   API       │  │   Contracts  │ │
│  └─────────────┘  └─────────────┘  └──────────────┘ │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │  Admin      │  │  Database   │  │   Redis      │ │
│  │  Dashboard  │  │ PostgreSQL  │  │   Cache      │ │
│  └─────────────┘  └─────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Deployment Environments

### 1. Local Development
- Run all services on localhost
- Docker Compose for easy setup
- Hot reload for rapid development
- Test data seeding

### 2. Staging
- Mirrors production setup
- Stellar testnet
- Separate database
- Used for testing before production

### 3. Production
- Full redundancy and backups
- Stellar mainnet
- CDN for static assets
- Auto-scaling enabled

---

## Prerequisites

### Required Tools
```bash
# Install required tools
node --version       # v18+ required
npm --version        # v9+ required
docker --version     # v24+ required
git --version        # v2.40+ required
```

### Required Accounts
- AWS Account (for cloud hosting)
- Stellar Account (for blockchain)
- Twilio Account (for SMS)
- Mobile Money API credentials
- Domain name and SSL certificate

---

## Quick Start Deployment

### Option 1: Docker Compose (Recommended for Testing)

```bash
# Clone repository
git clone https://github.com/wastefi/wastefi-backend.git
cd wastefi-backend

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

### Option 2: Manual Deployment

See detailed guides:
- [Local Development Setup](/guide/local-development)
- [Production Deployment](/guide/production-setup)

---

## Environment Variables

### Backend API (.env)

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/wastefi
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Stellar
STELLAR_NETWORK=PUBLIC  # or TESTNET
STELLAR_HORIZON_URL=https://horizon.stellar.org
PLATFORM_STELLAR_SECRET=SXXXXXXXXXXXXXXXXXXXXX
PLATFORM_STELLAR_PUBLIC=GXXXXXXXXXXXXXXXXXXXXX

# Mobile Money
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

MTN_API_KEY=your_mtn_key
MTN_API_USER=your_mtn_user
MTN_SUBSCRIPTION_KEY=your_subscription_key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=wastefi-storage

# Monitoring
SENTRY_DSN=https://your_sentry_dsn
LOG_LEVEL=info

# Security
ENCRYPTION_KEY=your_encryption_key_32_chars
CORS_ORIGIN=https://app.wastefi.org
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend PWA (.env)

```bash
VITE_API_URL=https://api.wastefi.org/v1
VITE_STELLAR_NETWORK=PUBLIC
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Set all environment variables
- [ ] Configure database connection
- [ ] Set up Redis cache
- [ ] Configure Stellar accounts
- [ ] Set up mobile money integrations
- [ ] Configure SMS provider
- [ ] Set up S3 or storage solution
- [ ] Configure monitoring (Sentry)
- [ ] Set up logging
- [ ] Configure CDN (CloudFlare)

### Security

- [ ] Generate strong secrets (min 32 chars)
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up VPC (if using AWS)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up backup encryption
- [ ] Enable audit logging

### Testing

- [ ] Run unit tests (`npm test`)
- [ ] Run integration tests
- [ ] Test database migrations
- [ ] Test API endpoints
- [ ] Test mobile money integration
- [ ] Test SMS notifications
- [ ] Load testing
- [ ] Security scan

### Monitoring

- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Set up log aggregation
- [ ] Configure uptime monitoring
- [ ] Set up alerts
- [ ] Create dashboards

---

## Deployment Architecture

### Production Infrastructure (AWS)

```
                    ┌──────────────┐
                    │  CloudFlare  │
                    │   CDN + WAF  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │Application   │
                    │Load Balancer │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │API Server │   │API Server │   │API Server │
    │ (ECS Task)│   │ (ECS Task)│   │ (ECS Task)│
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌─────▼──────┐   ┌────▼──────┐
    │PostgreSQL │   │   Redis    │   │    S3     │
    │    RDS    │   │ElastiCache │   │  Storage  │
    └───────────┘   └────────────┘   └───────────┘
```

---

## Database Migration

### Initial Setup

```bash
# Install migration tool
npm install -g db-migrate

# Create database
createdb wastefi_production

# Run migrations
db-migrate up

# Seed initial data (optional)
npm run db:seed
```

### Migration Files

```javascript
// migrations/20240915000001-initial-schema.js
exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone VARCHAR(20) UNIQUE NOT NULL,
      pin_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = function(db) {
  return db.runSql('DROP TABLE users;');
};
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: wastefi/api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-def.json
          service: wastefi-api
          cluster: wastefi-production
          wait-for-service-stability: true
```

---

## Health Checks

### Liveness Check
```bash
curl https://api.wastefi.org/health/live
# Response: {"status": "ok"}
```

### Readiness Check
```bash
curl https://api.wastefi.org/health/ready
# Response: 
# {
#   "status": "ok",
#   "checks": {
#     "database": "ok",
#     "redis": "ok",
#     "stellar": "ok"
#   }
# }
```

---

## Rollback Procedure

### Application Rollback

```bash
# List recent deployments
aws ecs list-task-definitions --family wastefi-api

# Rollback to previous version
aws ecs update-service \
  --cluster wastefi-production \
  --service wastefi-api \
  --task-definition wastefi-api:PREVIOUS_VERSION
```

### Database Rollback

```bash
# Rollback last migration
db-migrate down

# Rollback to specific version
db-migrate down --count 3
```

---

## Backup and Restore

### Database Backup

```bash
# Automated daily backup
pg_dump -Fc wastefi_production > backup_$(date +%Y%m%d).dump

# Upload to S3
aws s3 cp backup_*.dump s3://wastefi-backups/database/
```

### Database Restore

```bash
# Download backup
aws s3 cp s3://wastefi-backups/database/backup_20240915.dump ./

# Restore
pg_restore -d wastefi_production backup_20240915.dump
```

---

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Application**
   - Response time (p50, p95, p99)
   - Error rate
   - Request throughput
   - CPU and memory usage

2. **Database**
   - Connection pool usage
   - Query performance
   - Replication lag
   - Disk space

3. **Business**
   - Transactions per minute
   - Payment success rate
   - User sign-ups
   - Average transaction value

### Alert Configuration

```javascript
// Example alert rules
{
  "alerts": [
    {
      "name": "High Error Rate",
      "condition": "error_rate > 5%",
      "for": "5m",
      "severity": "critical",
      "notify": ["pagerduty", "slack"]
    },
    {
      "name": "Database Connection Pool Full",
      "condition": "db_connections > 90%",
      "for": "2m",
      "severity": "warning",
      "notify": ["slack"]
    },
    {
      "name": "Payment Failure Rate",
      "condition": "payment_failure_rate > 10%",
      "for": "10m",
      "severity": "critical",
      "notify": ["pagerduty", "slack", "email"]
    }
  ]
}
```

---

## Scaling Strategy

### Horizontal Scaling

```bash
# Scale API servers
aws ecs update-service \
  --cluster wastefi-production \
  --service wastefi-api \
  --desired-count 5
```

### Auto-Scaling Policy

```json
{
  "scalingPolicies": [
    {
      "name": "ScaleUpOnHighCPU",
      "metricType": "ECSServiceAverageCPUUtilization",
      "targetValue": 70,
      "scaleOutCooldown": 60,
      "scaleInCooldown": 300
    }
  ]
}
```

---

## Cost Optimization

### Estimated Monthly Costs (AWS)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| ECS (API) | 3 x t3.medium | $75 |
| RDS PostgreSQL | db.t3.large | $140 |
| ElastiCache Redis | cache.t3.medium | $50 |
| S3 Storage | 100 GB | $2.30 |
| CloudFront CDN | 500 GB transfer | $42.50 |
| Load Balancer | ALB | $16 |
| **Total** | | **~$325/month** |

### Cost Saving Tips

1. Use reserved instances (save 30-50%)
2. Auto-scale down during low traffic
3. Use S3 lifecycle policies
4. Compress and optimize images
5. Cache aggressively

---

## Troubleshooting

### Common Issues

**Issue: API not responding**
```bash
# Check service status
docker ps
# or
aws ecs describe-services --cluster wastefi-production --services wastefi-api

# Check logs
docker logs wastefi-api
# or
aws logs tail /aws/ecs/wastefi-api --follow
```

**Issue: Database connection failed**
```bash
# Test connection
psql -h your-db-host -U your-user -d wastefi_production

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

**Issue: High memory usage**
```bash
# Check container memory
docker stats

# Restart service
docker-compose restart api
```

---

## Next Steps

- [Local Development Setup](/guide/local-development) - Set up dev environment
- [Production Setup](/guide/production-setup) - Detailed production guide
- [Monitoring Guide](/guide/monitoring) - Set up monitoring
- [Security Best Practices](/guide/security) - Secure your deployment

---

## Support

- Documentation: https://docs.wastefi.org
- Issues: https://github.com/wastefi/issues
- Email: devops@wastefi.org
- Discord: https://discord.gg/wastefi