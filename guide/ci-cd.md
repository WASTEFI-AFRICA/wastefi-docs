# CI/CD Pipeline Guide

## Overview

WasteFi uses GitHub Actions for continuous integration and deployment. This guide covers the complete CI/CD pipeline configuration and workflows.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │    Push / Pull Request     │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │    GitHub Actions Runner   │
         └────────────┬───────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌────────┐    ┌────────┐
   │  Lint  │   │  Test  │    │ Build  │
   └───┬────┘   └───┬────┘    └───┬────┘
       │            │             │
       └────────────┼─────────────┘
                    │
                    ▼
         ┌────────────────────────────┐
         │    Security Scan           │
         │  - Snyk                    │
         │  - SonarCloud              │
         │  - Dependabot              │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │    Deploy (if main branch) │
         │  - Staging (automatic)     │
         │  - Production (manual)     │
         └────────────────────────────┘
```

---

## Workflow Configuration

### Backend CI Workflow

**.github/workflows/backend-ci.yml:**

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'wastefi-backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [main, develop]
    paths:
      - 'wastefi-backend/**'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: wastefi-backend/package-lock.json

      - name: Install dependencies
        working-directory: wastefi-backend
        run: npm ci

      - name: Run ESLint
        working-directory: wastefi-backend
        run: npm run lint

      - name: Run Prettier
        working-directory: wastefi-backend
        run: npm run format:check

  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: wastefi_test
          POSTGRES_USER: wastefi
          POSTGRES_PASSWORD: wastefi
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: wastefi-backend/package-lock.json

      - name: Install dependencies
        working-directory: wastefi-backend
        run: npm ci

      - name: Run unit tests
        working-directory: wastefi-backend
        run: npm run test:unit
        env:
          NODE_ENV: test

      - name: Run integration tests
        working-directory: wastefi-backend
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://wastefi:wastefi@localhost:5432/wastefi_test
          REDIS_URL: redis://localhost:6379

      - name: Generate coverage report
        working-directory: wastefi-backend
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./wastefi-backend/coverage/lcov.info
          flags: backend
          name: backend-coverage

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: wastefi-backend/package-lock.json

      - name: Install dependencies
        working-directory: wastefi-backend
        run: npm ci

      - name: Build
        working-directory: wastefi-backend
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: backend-build
          path: wastefi-backend/dist
          retention-days: 7

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          working-directory: wastefi-backend

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          projectBaseDir: wastefi-backend
```

### Frontend CI Workflow

**.github/workflows/frontend-ci.yml:**

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'wastefi-frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [main, develop]
    paths:
      - 'wastefi-frontend/**'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: wastefi-frontend/package-lock.json

      - name: Install dependencies
        working-directory: wastefi-frontend
        run: npm ci

      - name: Run ESLint
        working-directory: wastefi-frontend
        run: npm run lint

      - name: Run type check
        working-directory: wastefi-frontend
        run: npm run type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: wastefi-frontend/package-lock.json

      - name: Install dependencies
        working-directory: wastefi-frontend
        run: npm ci

      - name: Run unit tests
        working-directory: wastefi-frontend
        run: npm run test:unit

      - name: Install Playwright browsers
        working-directory: wastefi-frontend
        run: npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: wastefi-frontend
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: wastefi-frontend/playwright-report
          retention-days: 30

      - name: Generate coverage report
        working-directory: wastefi-frontend
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./wastefi-frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: wastefi-frontend/package-lock.json

      - name: Install dependencies
        working-directory: wastefi-frontend
        run: npm ci

      - name: Build
        working-directory: wastefi-frontend
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: wastefi-frontend/dist
          retention-days: 7

  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: frontend-build
          path: wastefi-frontend/dist

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './wastefi-frontend/lighthouserc.json'
          uploadArtifacts: true
```

### Smart Contracts CI Workflow

**.github/workflows/contracts-ci.yml:**

```yaml
name: Smart Contracts CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'wastefi-contracts/**'
      - '.github/workflows/contracts-ci.yml'
  pull_request:
    branches: [main, develop]
    paths:
      - 'wastefi-contracts/**'

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          override: true
          components: rustfmt, clippy

      - name: Cache cargo registry
        uses: actions/cache@v3
        with:
          path: ~/.cargo/registry
          key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo index
        uses: actions/cache@v3
        with:
          path: ~/.cargo/git
          key: ${{ runner.os }}-cargo-index-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo build
        uses: actions/cache@v3
        with:
          path: wastefi-contracts/target
          key: ${{ runner.os }}-cargo-build-target-${{ hashFiles('**/Cargo.lock') }}

      - name: Run rustfmt
        working-directory: wastefi-contracts
        run: cargo fmt -- --check

      - name: Run clippy
        working-directory: wastefi-contracts
        run: cargo clippy -- -D warnings

      - name: Run tests
        working-directory: wastefi-contracts
        run: cargo test --verbose

      - name: Generate coverage
        working-directory: wastefi-contracts
        run: |
          cargo install cargo-tarpaulin
          cargo tarpaulin --out Xml

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./wastefi-contracts/cobertura.xml
          flags: contracts
          name: contracts-coverage

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown

      - name: Install Soroban CLI
        run: cargo install --locked soroban-cli

      - name: Build contracts
        working-directory: wastefi-contracts
        run: soroban contract build

      - name: Optimize WASM
        working-directory: wastefi-contracts
        run: soroban contract optimize --wasm target/wasm32-unknown-unknown/release/*.wasm

      - name: Upload contract artifacts
        uses: actions/upload-artifact@v3
        with:
          name: contract-wasm
          path: wastefi-contracts/target/wasm32-unknown-unknown/release/*.wasm
          retention-days: 7
```

---

## Deployment Workflows

### Staging Deployment

**.github/workflows/deploy-staging.yml:**

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  workflow_dispatch:

jobs:
  deploy-backend:
    name: Deploy Backend to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: wastefi-backend-staging
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG wastefi-backend/
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: wastefi-backend-staging
          service: wastefi-backend-staging
          cluster: wastefi-staging
          wait-for-service-stability: true

      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster wastefi-staging \
            --task-definition wastefi-migrations \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"

  deploy-frontend:
    name: Deploy Frontend to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: wastefi-frontend
        run: npm ci

      - name: Build for staging
        working-directory: wastefi-frontend
        run: npm run build
        env:
          VITE_API_URL: https://api-staging.wastefi.org
          VITE_ENVIRONMENT: staging

      - name: Deploy to S3
        run: |
          aws s3 sync wastefi-frontend/dist s3://wastefi-frontend-staging --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID_STAGING }} \
            --paths "/*"

  deploy-contracts:
    name: Deploy Contracts to Testnet
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown

      - name: Install Soroban CLI
        run: cargo install --locked soroban-cli

      - name: Build contracts
        working-directory: wastefi-contracts
        run: soroban contract build

      - name: Deploy to Stellar Testnet
        working-directory: wastefi-contracts
        env:
          SOROBAN_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015"
          SOROBAN_RPC_URL: https://soroban-testnet.stellar.org
          STELLAR_SECRET_KEY: ${{ secrets.STELLAR_DEPLOYER_SECRET_STAGING }}
        run: |
          ./scripts/deploy.sh testnet

  smoke-tests:
    name: Run Smoke Tests
    runs-on: ubuntu-latest
    needs: [deploy-backend, deploy-frontend]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run smoke tests
        run: |
          npm install -g newman
          newman run tests/smoke/staging.postman_collection.json \
            --environment tests/smoke/staging.postman_environment.json

      - name: Notify Slack on success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "✅ Staging deployment successful!",
              attachments: [{
                color: 'good',
                text: `Deployed ${process.env.GITHUB_SHA.substring(0, 7)} to staging`
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Notify Slack on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "❌ Staging deployment failed!",
              attachments: [{
                color: 'danger',
                text: `Failed to deploy ${process.env.GITHUB_SHA.substring(0, 7)}`
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Production Deployment

**.github/workflows/deploy-production.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://wastefi.org
    steps:
      - uses: actions/checkout@v4

      - name: Create deployment
        id: deployment
        uses: actions/create-deployment@v1
        with:
          ref: ${{ github.ref }}
          environment: production
          required_contexts: '[]'
          auto_merge: false

      # Similar steps to staging deployment but with production configs

      - name: Update deployment status (success)
        if: success()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: ${{ steps.deployment.outputs.deployment_id }},
              state: 'success',
              environment_url: 'https://wastefi.org'
            })

      - name: Update deployment status (failure)
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: ${{ steps.deployment.outputs.deployment_id }},
              state: 'failure'
            })
```

---

## Monitoring & Alerts

### Deployment Monitoring

**.github/workflows/monitor.yml:**

```yaml
name: Production Monitoring

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  health-check:
    name: Health Check
    runs-on: ubuntu-latest
    steps:
      - name: Check backend health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api.wastefi.org/health)
          if [ $response -ne 200 ]; then
            echo "Backend health check failed with status $response"
            exit 1
          fi

      - name: Check frontend availability
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://wastefi.org)
          if [ $response -ne 200 ]; then
            echo "Frontend availability check failed with status $response"
            exit 1
          fi

      - name: Alert on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "🚨 Production health check failed!",
              attachments: [{
                color: 'danger',
                text: "Service may be down. Please investigate immediately."
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URGENT }}
```

---

## Security Scanning

### Dependency Scanning

**.github/dependabot.yml:**

```yaml
version: 2
updates:
  # Backend dependencies
  - package-ecosystem: "npm"
    directory: "/wastefi-backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  # Frontend dependencies
  - package-ecosystem: "npm"
    directory: "/wastefi-frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  # Contract dependencies
  - package-ecosystem: "cargo"
    directory: "/wastefi-contracts"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## Branch Protection Rules

**Settings → Branches → Add rule:**

```yaml
Branch name pattern: main

Require pull request reviews before merging: ✓
  Required approving reviews: 2
  Dismiss stale pull request approvals when new commits are pushed: ✓

Require status checks to pass before merging: ✓
  Require branches to be up to date before merging: ✓
  Status checks:
    - backend-lint
    - backend-test
    - backend-build
    - frontend-lint
    - frontend-test
    - frontend-build
    - contracts-test
    - contracts-build
    - security-scan

Require conversation resolution before merging: ✓

Require signed commits: ✓

Include administrators: ✓
```

---

## Best Practices

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add mobile money integration
fix: resolve transaction timeout issue
docs: update API documentation
test: add E2E tests for payment flow
chore: update dependencies
refactor: improve database query performance
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR
4. Wait for CI checks to pass
5. Request reviews (minimum 2)
6. Address feedback
7. Merge when approved

### Release Process

1. Create release branch from `develop`
2. Update version numbers
3. Update changelog
4. Create PR to `main`
5. After merge, tag release
6. Deploy to production
7. Merge `main` back to `develop`

---

## Troubleshooting CI/CD

### Common Issues

**Tests failing in CI but passing locally:**
- Check environment variables
- Verify service dependencies
- Check Node.js/Rust versions

**Build failures:**
- Clear cache and retry
- Check dependency versions
- Review build logs

**Deployment failures:**
- Verify AWS credentials
- Check resource limits
- Review deployment logs

---

**Next:** [API Integration Examples](./api-examples.md)
