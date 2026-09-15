# Local Development Setup

## Overview

This guide will help you set up a complete WasteFi development environment on your local machine.

## Prerequisites

### Required Software

```bash
# Node.js 18+
node --version  # Should be v18 or higher

# npm 9+
npm --version

# Docker Desktop
docker --version
docker-compose --version

# Git
git --version

# PostgreSQL client tools (optional, for debugging)
psql --version
```

### Installation Links

- [Node.js](https://nodejs.org/) (v18 LTS recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended IDE)

---

## Quick Start with Docker Compose

### 1. Clone Repositories

```bash
# Create workspace directory
mkdir wastefi-dev && cd wastefi-dev

# Clone backend
git clone https://github.com/wastefi/wastefi-backend.git
cd wastefi-backend

# Clone frontend (optional)
cd ..
git clone https://github.com/wastefi/wastefi-frontend.git
```

### 2. Set Up Environment

```bash
cd wastefi-backend

# Copy environment template
cp .env.example .env.local

# Edit environment variables
# Use your preferred editor
code .env.local  # or nano, vim, etc.
```

### 3. Configure Environment Variables

```bash
# .env.local

# Application
NODE_ENV=development
PORT=3000

# Database (Docker will create this)
DATABASE_URL=postgresql://wastefi:password@localhost:5432/wastefi_dev
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis (Docker will create this)
REDIS_URL=redis://localhost:6379

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your_development_jwt_secret_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Stellar (Use testnet for development)
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
PLATFORM_STELLAR_SECRET=SXXXXX_GET_FROM_STELLAR_LABORATORY
PLATFORM_STELLAR_PUBLIC=GXXXXX_GET_FROM_STELLAR_LABORATORY

# Mobile Money (Use sandbox credentials)
MPESA_CONSUMER_KEY=your_sandbox_key
MPESA_CONSUMER_SECRET=your_sandbox_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_sandbox_passkey
MPESA_ENVIRONMENT=sandbox

# SMS (Twilio trial account)
TWILIO_ACCOUNT_SID=your_trial_sid
TWILIO_AUTH_TOKEN=your_trial_token
TWILIO_PHONE_NUMBER=+15005550006  # Twilio test number

# Storage (Local MinIO)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=wastefi-dev
S3_FORCE_PATH_STYLE=true

# Monitoring (Optional for local dev)
SENTRY_DSN=  # Leave empty for local
LOG_LEVEL=debug

# Security (Development only)
ENCRYPTION_KEY=dev_encryption_key_32_characters
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_DISABLED=true
```

### 4. Start Services with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# Expected output:
# NAME                  STATUS          PORTS
# wastefi-api          running         0.0.0.0:3000->3000/tcp
# wastefi-db           running         0.0.0.0:5432->5432/tcp
# wastefi-redis        running         0.0.0.0:6379->6379/tcp
# wastefi-minio        running         0.0.0.0:9000->9000/tcp
```

### 5. Run Database Migrations

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

### 6. Start Development Server

```bash
# Start API with hot reload
npm run dev

# API will be available at http://localhost:3000
```

### 7. Verify Installation

```bash
# Health check
curl http://localhost:3000/health/live

# Should return: {"status":"ok"}

# Test API
curl http://localhost:3000/v1/materials

# Should return list of materials
```

---

## Manual Setup (Without Docker)

### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql-15

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database

```bash
# Create user
createuser -P wastefi
# Enter password: wastefi_dev_password

# Create database
createdb -O wastefi wastefi_dev

# Test connection
psql -U wastefi -d wastefi_dev -h localhost
```

### 3. Install Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Windows
# Use WSL or download from https://redis.io/download
```

### 4. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd ../wastefi-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# .env.local
VITE_API_URL=http://localhost:3000/v1
VITE_STELLAR_NETWORK=TESTNET
VITE_ENVIRONMENT=development
```

### 4. Start Development Server

```bash
npm run dev

# Frontend will be available at http://localhost:5173
```

---

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "visualstudioexptteam.vscodeintellicode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker"
  ]
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Debugging Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/server.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "envFile": "${workspaceFolder}/.env.local"
    }
  ]
}
```

---

## Common Development Tasks

### Database Operations

```bash
# Reset database
npm run db:reset

# Create new migration
npm run db:migrate:create -- add_new_table

# Rollback migration
npm run db:migrate:down

# View migrations status
npm run db:migrate:status
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- users.test.ts

# Run with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck
```

### Generate Test Data

```bash
# Seed database with test data
npm run db:seed

# Generate specific data
npm run generate:users -- --count 100
npm run generate:transactions -- --count 1000
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/new-feature
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation

### 3. Test Changes

```bash
# Run tests
npm test

# Test manually
curl http://localhost:3000/v1/your-endpoint
```

### 4. Commit and Push

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature
```

### 5. Create Pull Request

Go to GitHub and create a pull request from your branch.

---

## Debugging

### API Debugging

```bash
# Start with debug logging
LOG_LEVEL=debug npm run dev

# Use VS Code debugger (F5)

# Or use Node inspector
node --inspect dist/server.js
# Then open chrome://inspect
```

### Database Debugging

```bash
# Connect to database
psql -U wastefi -d wastefi_dev

# View tables
\dt

# Describe table
\d users

# Query data
SELECT * FROM users LIMIT 10;

# View active queries
SELECT * FROM pg_stat_activity;
```

### Redis Debugging

```bash
# Connect to Redis
redis-cli

# List keys
KEYS *

# Get value
GET session:abc123

# Monitor commands
MONITOR
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Reset Docker
docker-compose down -v
docker-compose up -d

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f api
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -U wastefi

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### npm Install Fails

```bash
# Clear cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Tips

### Database Query Optimization

```bash
# Enable query logging
# Add to .env.local:
DB_LOG_QUERIES=true

# Analyze slow queries
npm run db:analyze
```

### Hot Reload Speed

```bash
# Use ts-node-dev for faster reload
npm install -D ts-node-dev

# Update package.json
"dev": "ts-node-dev --respawn src/server.ts"
```

---

## Next Steps

- [API Development Guide](/guide/api-development)
- [Testing Guide](/guide/testing)
- [Production Deployment](/guide/production-setup)
- [Contributing Guidelines](/CONTRIBUTING.md)

---

## Getting Help

- Documentation: https://docs.wastefi.org
- Discord: https://discord.gg/wastefi
- GitHub Issues: https://github.com/wastefi/issues
- Email: dev@wastefi.org