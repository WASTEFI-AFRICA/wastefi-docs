# Production Setup Guide

## Overview

This guide covers deploying WasteFi to production using AWS infrastructure. While we use AWS as an example, the concepts apply to other cloud providers.

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────────┐
│   CloudFlare    │ ← CDN, DDoS Protection, SSL
└────────┬────────┘
         │
    ┌────▼────┐
    │   ALB   │ ← Application Load Balancer
    └────┬────┘
         │
    ┌────▼────────────────┐
    │   ECS Cluster       │
    │  ┌──────┐ ┌──────┐ │
    │  │ API  │ │ API  │ │ ← Auto-scaled containers
    │  │Task 1│ │Task 2│ │
    │  └──────┘ └──────┘ │
    └─────────────────────┘
         │
    ┌────┴────────────┐
    │                 │
┌───▼──────┐    ┌────▼────┐
│    RDS   │    │ Redis   │
│PostgreSQL│    │ Elastic │
│Multi-AZ  │    │  Cache  │
└──────────┘    └─────────┘
```

---

## Part 1: Infrastructure Setup

### 1.1 AWS Account Setup

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

### 1.2 Create VPC and Networking

```bash
# Using Terraform (recommended)
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply infrastructure
terraform apply
```

**Terraform Configuration (vpc.tf):**

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "wastefi-vpc"
  }
}

# Public Subnets (for Load Balancer)
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "wastefi-public-${count.index + 1}"
  }
}

# Private Subnets (for Application and Database)
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "wastefi-private-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "wastefi-igw"
  }
}

# NAT Gateway (for private subnets to access internet)
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "wastefi-nat"
  }
}
```

### 1.3 RDS PostgreSQL Setup

```hcl
# rds.tf

resource "aws_db_subnet_group" "main" {
  name       = "wastefi-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "wastefi-db-subnet"
  }
}

resource "aws_db_instance" "postgresql" {
  identifier             = "wastefi-db"
  engine                = "postgres"
  engine_version        = "15.4"
  instance_class        = "db.t3.large"
  allocated_storage     = 100
  max_allocated_storage = 500
  storage_encrypted     = true
  
  db_name  = "wastefi_production"
  username = "wastefi_admin"
  password = var.db_password  # Use AWS Secrets Manager
  
  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "wastefi-final-snapshot"

  tags = {
    Name = "wastefi-db"
  }
}
```

### 1.4 Redis ElastiCache Setup

```hcl
# elasticache.tf

resource "aws_elasticache_subnet_group" "main" {
  name       = "wastefi-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "wastefi-redis"
  replication_group_description = "Redis cluster for WasteFi"
  
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  number_cache_clusters = 2
  
  port                = 6379
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = var.redis_password

  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"

  tags = {
    Name = "wastefi-redis"
  }
}
```

---

## Part 2: Application Deployment

### 2.1 Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t wastefi-api:latest .

# Tag image
docker tag wastefi-api:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/wastefi-api:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/wastefi-api:latest
```

### 2.2 ECS Task Definition

```json
{
  "family": "wastefi-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/wastefiTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/wastefi-api:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:wastefi/db_url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:wastefi/jwt_secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/wastefi-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health/live || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### 2.3 ECS Service Configuration

```hcl
# ecs.tf

resource "aws_ecs_cluster" "main" {
  name = "wastefi-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "api" {
  name            = "wastefi-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }

  # Auto-scaling
  enable_ecs_managed_tags = true
  propagate_tags         = "SERVICE"

  depends_on = [aws_lb_listener.https]
}

# Auto-scaling
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 10
  min_capacity       = 3
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

---

## Part 3: Security Configuration

### 3.1 Security Groups

```hcl
# security_groups.tf

# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "wastefi-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# API Security Group
resource "aws_security_group" "api" {
  name        = "wastefi-api-sg"
  description = "Security group for API containers"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Database Security Group
resource "aws_security_group" "database" {
  name        = "wastefi-db-sg"
  description = "Security group for PostgreSQL database"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }
}
```

### 3.2 Secrets Management

```bash
# Store secrets in AWS Secrets Manager

# Database URL
aws secretsmanager create-secret \
  --name wastefi/db_url \
  --secret-string "postgresql://user:pass@endpoint:5432/wastefi"

# JWT Secret
aws secretsmanager create-secret \
  --name wastefi/jwt_secret \
  --secret-string "your-super-secret-jwt-key-min-32-chars"

# Stellar Keys
aws secretsmanager create-secret \
  --name wastefi/stellar_secret \
  --secret-string "SXXXXX..."
```

---

## Part 4: Monitoring and Logging

### 4.1 CloudWatch Logs

```hcl
# cloudwatch.tf

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/wastefi-api"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "ErrorCount"
  log_group_name = aws_cloudwatch_log_group.api.name
  pattern        = "[time, request_id, level = ERROR*, ...]"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "WasteFi"
    value     = "1"
  }
}
```

### 4.2 CloudWatch Alarms

```hcl
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "wastefi-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.api.name
  }
}
```

---

## Part 5: CI/CD Pipeline

See full GitHub Actions workflow in [Deployment Guide](/guide/deployment).

---

## Part 6: Post-Deployment

### 6.1 Database Migration

```bash
# Connect to bastion host
ssh -i wastefi-key.pem ec2-user@bastion-ip

# Run migrations
docker run --rm \
  -e DATABASE_URL=postgresql://... \
  wastefi-api:latest \
  npm run db:migrate
```

### 6.2 SSL Certificate

```bash
# Using AWS Certificate Manager
aws acm request-certificate \
  --domain-name api.wastefi.org \
  --subject-alternative-names *.wastefi.org \
  --validation-method DNS
```

### 6.3 DNS Configuration

```
# CloudFlare DNS Records
A     api.wastefi.org    →  ALB IP Address
A     app.wastefi.org    →  CloudFront Distribution
CNAME www.wastefi.org    →  wastefi.org
```

---

## Estimated Costs

| Component | Spec | Monthly Cost |
|-----------|------|--------------|
| ECS Tasks (3x) | 1 vCPU, 2GB | $75 |
| RDS PostgreSQL | db.t3.large, Multi-AZ | $280 |
| ElastiCache | cache.t3.medium, HA | $100 |
| ALB | Standard | $23 |
| NAT Gateway | Single | $32 |
| Data Transfer | 500 GB | $45 |
| CloudWatch | Logs + Metrics | $15 |
| **Total** | | **~$570/month** |

---

## Next Steps

- [Monitoring Setup](/guide/monitoring)
- [Backup Strategy](/guide/backups)
- [Disaster Recovery](/guide/disaster-recovery)
- [Performance Tuning](/guide/performance)

---

## Support

For production deployment support:
- Email: devops@wastefi.org
- Enterprise Support: https://wastefi.org/support