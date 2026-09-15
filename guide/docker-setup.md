# Local Development with Docker

## Overview

This guide helps developers set up a complete WasteFi development environment using Docker. All services run in containers for consistency across different machines.

## Prerequisites

### Required Software

**Docker Desktop:**
- Download: https://www.docker.com/products/docker-desktop
- Version: 20.10+ (with Docker Compose)
- RAM: Minimum 8GB (16GB recommended)
- Storage: 20GB free space

**Git:**
- Download: https://git-scm.com
- Version: 2.30+

**Code Editor (Recommended):**
- VS Code: https://code.visualstudio.com
- Extensions:
  - Docker
  - Remote - Containers
  - ESLint
  - Prettier

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Storage | 20 GB | 50 GB SSD |
| OS | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest |

---

## Quick Start

### 1. Clone Repositories

```bash
# Create workspace directory
mkdir wastefi-dev
cd wastefi-dev

# Clone all repositories
git clone https://github.com/wastefi/wastefi-backend.git
git clone https://github.com/wastefi/wastefi-frontend.git
git clone https://github.com/wastefi/wastefi-contracts.git
git clone https://github.com/wastefi/wastefi-docs.git
```

### 2. Start All Services

```bash
# Navigate to backend (contains docker-compose)
cd wastefi-backend

# Copy environment template
cp .env.example .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Verify Setup

```bash
# Check all services are running
curl http://localhost:3000/health      # Backend API
curl http://localhost:5173             # Frontend (VitePress)
curl http://localhost:5432             # PostgreSQL
curl http://localhost:6379             # Redis
```

**Expected output:**
```json
{
  "status": "healthy",
  "timestamp": "2024-09-15T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "stellar": "connected"
  }
}
```

---

## Docker Architecture

### Container Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Backend    │  │   Frontend   │  │  PostgreSQL  │ │
│  │   Node.js    │  │     Vue 3    │  │   Database   │ │
│  │  Port: 3000  │  │  Port: 5173  │  │  Port: 5432  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Redis     │  │   Stellar    │  │   Mailhog    │ │
│  │    Cache     │  │  Quickstart  │  │  Mail Test   │ │
│  │  Port: 6379  │  │  Port: 8000  │  │  Port: 8025  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Adminer    │  │  Prometheus  │                    │
│  │  DB Admin    │  │  Monitoring  │                    │
│  │  Port: 8080  │  │  Port: 9090  │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Service Details

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| Backend API | 3000 | REST API, business logic | `/health` |
| Frontend Dev | 5173 | Vue 3 PWA, hot reload | `/` |
| PostgreSQL | 5432 | Main database | `pg_isready` |
| Redis | 6379 | Cache, sessions, queues | `redis-cli ping` |
| Stellar Quickstart | 8000 | Local Stellar testnet | `/` |
| Mailhog | 8025 | Email testing UI | `/` |
| Adminer | 8080 | Database management | `/` |
| Prometheus | 9090 | Metrics and monitoring | `/` |

---

## Configuration

### Environment Variables

**Backend (.env):**

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://wastefi:wastefi@postgres:5432/wastefi_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://redis:6379
REDIS_PREFIX=wastefi:

# Stellar Network
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=http://stellar:8000
STELLAR_PLATFORM_SECRET=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Mobile Money (Test Mode)
MPESA_CONSUMER_KEY=your_test_key
MPESA_CONSUMER_SECRET=your_test_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox

MTN_API_KEY=your_test_key
MTN_API_SECRET=your_test_secret
MTN_ENVIRONMENT=sandbox

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email (Mailhog)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@wastefi.local

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Feature Flags
ENABLE_SMS=false
ENABLE_CARBON_CREDITS=true
ENABLE_REFERRALS=true
```

**Frontend (.env):**

```env
# API
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000

# Stellar
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=http://localhost:8000

# Maps
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# Environment
VITE_ENVIRONMENT=development
```

### Docker Compose File

**docker-compose.yml:**

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: wastefi-db
    environment:
      POSTGRES_DB: wastefi_dev
      POSTGRES_USER: wastefi
      POSTGRES_PASSWORD: wastefi
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wastefi"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - wastefi-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: wastefi-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - wastefi-network

  # Stellar Quickstart (Local Testnet)
  stellar:
    image: stellar/quickstart:latest
    container_name: wastefi-stellar
    ports:
      - "8000:8000"  # Horizon API
      - "11626:11626" # Stellar Core
    command: --testnet
    volumes:
      - stellar_data:/opt/stellar
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - wastefi-network

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: wastefi-backend
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
    volumes:
      - .:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - wastefi-network

  # Frontend Dev Server
  frontend:
    build:
      context: ../wastefi-frontend
      dockerfile: Dockerfile.dev
    container_name: wastefi-frontend
    ports:
      - "5173:5173"
    volumes:
      - ../wastefi-frontend:/app
      - /app/node_modules
    env_file:
      - ../wastefi-frontend/.env
    depends_on:
      - backend
    command: npm run dev -- --host
    networks:
      - wastefi-network

  # Mailhog (Email Testing)
  mailhog:
    image: mailhog/mailhog:latest
    container_name: wastefi-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - wastefi-network

  # Adminer (Database Admin)
  adminer:
    image: adminer:latest
    container_name: wastefi-adminer
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    depends_on:
      - postgres
    networks:
      - wastefi-network

  # Prometheus (Metrics)
  prometheus:
    image: prom/prometheus:latest
    container_name: wastefi-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - wastefi-network

volumes:
  postgres_data:
  redis_data:
  stellar_data:
  prometheus_data:

networks:
  wastefi-network:
    driver: bridge
```

---

## Development Workflow

### Starting Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check status
docker-compose ps
```

### Making Changes

**Backend Development:**

```bash
# Changes auto-reload via nodemon
# Edit files in wastefi-backend/src/
# See changes reflected immediately

# Run migrations
docker-compose exec backend npm run migrate

# Run seeds
docker-compose exec backend npm run seed

# Access backend shell
docker-compose exec backend sh
```

**Frontend Development:**

```bash
# Changes hot-reload via Vite
# Edit files in wastefi-frontend/src/
# Browser auto-refreshes

# Access frontend shell
docker-compose exec frontend sh

# Build for production (test)
docker-compose exec frontend npm run build
```

### Database Operations

**Access PostgreSQL:**

```bash
# Using docker-compose
docker-compose exec postgres psql -U wastefi -d wastefi_dev

# Using Adminer (Web UI)
# Navigate to: http://localhost:8080
# Server: postgres
# Username: wastefi
# Password: wastefi
# Database: wastefi_dev
```

**Run Migrations:**

```bash
# Create new migration
docker-compose exec backend npm run migrate:create add_new_feature

# Run pending migrations
docker-compose exec backend npm run migrate:up

# Rollback last migration
docker-compose exec backend npm run migrate:down

# Check migration status
docker-compose exec backend npm run migrate:status
```

**Database Backup:**

```bash
# Backup
docker-compose exec postgres pg_dump -U wastefi wastefi_dev > backup.sql

# Restore
docker-compose exec -T postgres psql -U wastefi wastefi_dev < backup.sql
```

### Testing

**Run Backend Tests:**

```bash
# All tests
docker-compose exec backend npm test

# Watch mode
docker-compose exec backend npm run test:watch

# Coverage
docker-compose exec backend npm run test:coverage

# Specific test file
docker-compose exec backend npm test -- users.test.js

# E2E tests
docker-compose exec backend npm run test:e2e
```

**Run Frontend Tests:**

```bash
# Unit tests
docker-compose exec frontend npm test

# Component tests
docker-compose exec frontend npm run test:component

# E2E tests (Playwright)
docker-compose exec frontend npm run test:e2e

# E2E UI mode
docker-compose exec frontend npm run test:e2e:ui
```

### Debugging

**Backend (Node.js):**

1. VS Code `launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Backend",
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}/wastefi-backend",
      "protocol": "inspector",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

2. Set breakpoints in VS Code
3. Start debugging (F5)
4. Debugger attaches to running container

**Frontend (Chrome DevTools):**

1. Open http://localhost:5173
2. Open Chrome DevTools (F12)
3. Source maps enabled automatically
4. Debug as normal web app

---

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**

```bash
# Find process using port
# Linux/Mac:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Kill process or change port in docker-compose.yml
```

#### Container Keeps Restarting

**Solution:**

```bash
# Check logs for errors
docker-compose logs backend

# Common causes:
# - Missing environment variables
# - Database connection failure
# - Syntax error in code

# Restart specific service
docker-compose restart backend
```

#### Database Connection Failed

**Solution:**

```bash
# Ensure postgres is healthy
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Test connection
docker-compose exec backend npm run db:ping

# Recreate database
docker-compose down -v
docker-compose up -d
```

#### Changes Not Reflecting

**Solution:**

```bash
# Backend - ensure nodemon is watching
docker-compose logs backend | grep nodemon

# Frontend - clear Vite cache
docker-compose exec frontend rm -rf node_modules/.vite

# Rebuild containers
docker-compose up -d --build
```

#### Out of Disk Space

**Solution:**

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

---

## Advanced Configuration

### Multi-Stage Build

**Dockerfile.dev:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Development
FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "dev"]
```

### Docker Compose Profiles

**Use profiles for optional services:**

```yaml
services:
  # ... other services ...

  grafana:
    image: grafana/grafana:latest
    profiles: ["monitoring"]
    ports:
      - "3001:3000"
    # ... config ...

  jaeger:
    image: jaegertracing/all-in-one:latest
    profiles: ["tracing"]
    ports:
      - "16686:16686"
    # ... config ...
```

**Start with profiles:**

```bash
# Normal development
docker-compose up -d

# With monitoring
docker-compose --profile monitoring up -d

# With monitoring and tracing
docker-compose --profile monitoring --profile tracing up -d
```

### Environment-Specific Overrides

**docker-compose.override.yml:**

```yaml
version: '3.9'

services:
  backend:
    environment:
      LOG_LEVEL: debug
    volumes:
      - ./custom-config.json:/app/config.json
```

**docker-compose.ci.yml (for CI/CD):**

```yaml
version: '3.9'

services:
  backend:
    command: npm run test:ci
  
  frontend:
    command: npm run build
```

---

## VS Code Integration

### Recommended Extensions

**Install these extensions:**

```json
{
  "recommendations": [
    "ms-azuretools.vscode-docker",
    "ms-vscode-remote.remote-containers",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Dev Container Configuration

**.devcontainer/devcontainer.json:**

```json
{
  "name": "WasteFi Development",
  "dockerComposeFile": ["../docker-compose.yml"],
  "service": "backend",
  "workspaceFolder": "/app",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  },
  "forwardPorts": [3000, 5173, 8080],
  "postCreateCommand": "npm install"
}
```

---

## Performance Optimization

### Improve Build Times

**Use BuildKit:**

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Faster builds with cache
docker-compose build --parallel
```

**Optimize Dockerfile:**

```dockerfile
# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source code last
COPY . .
```

### Reduce Resource Usage

**Limit container resources:**

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Next Steps

- [Testing Documentation](./testing.md)
- [CI/CD Pipeline](./ci-cd.md)
- [API Integration Examples](./api-examples.md)
- [Production Deployment](./production-setup.md)

---

**Happy coding! 🚀**
