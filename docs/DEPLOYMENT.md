# Deployment Guide

## Overview
This guide covers deployment strategies for the WEX FSA Provider Substantiation system, from development to production environments.

## Deployment Options

### 1. Development Deployment (Current)

#### Local Development
```bash
# Quick start for development
./start_demo.sh

# Manual start for debugging
cd wex-fsa-provider-substantiation-backend
python3 src/server.py &

cd ../wex-fsa-provider-substantiation-frontend  
python3 -m http.server 3000 &
```

#### Development Environment Variables
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
export BACKEND_PORT=4000
export FRONTEND_PORT=3000
```

### 2. Staging Deployment

#### Docker-based Staging
```dockerfile
# Dockerfile.backend
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 4000

CMD ["python", "src/server.py"]
```

```dockerfile
# Dockerfile.frontend  
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: 
      context: ./wex-fsa-provider-substantiation-backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - FLASK_ENV=staging

  frontend:
    build:
      context: ./wex-fsa-provider-substantiation-frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
```

```bash
# Deploy to staging
docker-compose up -d
docker-compose logs -f
```

### 3. Production Deployment

#### Cloud Deployment (AWS Example)

##### Infrastructure Setup
```yaml
# infrastructure.yml (CloudFormation/Terraform)
Resources:
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: fsa-substantiation
      
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: postgres
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
```

##### ECS Task Definition
```json
{
  "family": "fsa-backend",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry/fsa-backend:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "FLASK_ENV", "value": "production"},
        {"name": "DATABASE_URL", "value": "${database_url}"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fsa-backend",
          "awslogs-region": "us-east-1"
        }
      }
    }
  ]
}
```

#### Kubernetes Deployment
```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: fsa-substantiation

---
# k8s/backend-deployment.yml  
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: fsa-substantiation
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/fsa-backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: FLASK_ENV
          value: "production"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi

---
# k8s/backend-service.yml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: fsa-substantiation
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 4000
  type: ClusterIP

---
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fsa-ingress
  namespace: fsa-substantiation
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - fsa.yourdomain.com
    secretName: fsa-tls
  rules:
  - host: fsa.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
```

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
kubectl get pods -n fsa-substantiation
kubectl logs -f deployment/backend -n fsa-substantiation
```

## Database Setup

### PostgreSQL Production Setup
```sql
-- Create database and user
CREATE DATABASE fsa_substantiation;
CREATE USER fsa_user WITH ENCRYPTED PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE fsa_substantiation TO fsa_user;

-- Create tables
\c fsa_substantiation;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    provider_link_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    provider_name VARCHAR(255),
    date_of_service DATE,
    patient_responsibility DECIMAL(10,2),
    status VARCHAR(50),
    source VARCHAR(255),
    fhir_eob JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### Database Migration Strategy
```python
# migrations/001_initial_schema.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('provider_link_id', sa.String(100)),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now())
    )
    
    op.create_table(
        'transactions',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('provider_name', sa.String(255)),
        sa.Column('date_of_service', sa.Date),
        sa.Column('patient_responsibility', sa.Numeric(10, 2)),
        sa.Column('status', sa.String(50)),
        sa.Column('source', sa.String(255)),
        sa.Column('fhir_eob', sa.JSON),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now())
    )

def downgrade():
    op.drop_table('transactions')
    op.drop_table('users')
```

## Environment Configuration

### Environment Variables
```bash
# Production environment variables
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:pass@host:5432/dbname
export SECRET_KEY=your-secret-key-here
export CORS_ORIGINS=https://yourdomain.com
export LOG_LEVEL=INFO

# Epic FHIR integration
export EPIC_CLIENT_ID=your-epic-client-id
export EPIC_CLIENT_SECRET=your-epic-client-secret
export EPIC_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth

# Monitoring and observability
export SENTRY_DSN=https://your-sentry-dsn
export DATADOG_API_KEY=your-datadog-key
```

### Configuration Management
```python
# config.py
import os
from typing import Optional

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'
    SECRET_KEY = os.environ.get('SECRET_KEY')  # Must be set
    
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable must be set")

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

## Security Hardening

### Production Security Checklist
- [ ] **HTTPS only** with valid SSL certificates
- [ ] **Environment variables** for all secrets
- [ ] **Database connection encryption** enabled
- [ ] **WAF rules** configured for common attacks
- [ ] **Rate limiting** implemented
- [ ] **Input validation** on all endpoints
- [ ] **CORS policy** restricted to known domains
- [ ] **Security headers** implemented
- [ ] **Audit logging** enabled
- [ ] **Vulnerability scanning** automated

### Security Headers Configuration
```python
# security_headers.py
from flask import Flask

def configure_security_headers(app: Flask):
    @app.after_request
    def after_request(response):
        # Force HTTPS
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Prevent MIME sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        
        # XSS protection
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Content Security Policy
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "font-src 'self'"
        )
        
        return response
```

## Monitoring and Observability

### Health Checks
```python
# health.py
from flask import Blueprint, jsonify
import psycopg2
import redis

health_bp = Blueprint('health', __name__)

@health_bp.route('/health')
def health_check():
    """Comprehensive health check"""
    status = {
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'checks': {}
    }
    
    # Database check
    try:
        db.engine.execute('SELECT 1')
        status['checks']['database'] = 'ok'
    except Exception as e:
        status['checks']['database'] = f'error: {str(e)}'
        status['status'] = 'error'
    
    # Redis check (if using)
    try:
        redis_client.ping()
        status['checks']['redis'] = 'ok'
    except Exception as e:
        status['checks']['redis'] = f'error: {str(e)}'
        status['status'] = 'degraded'
    
    return jsonify(status)
```

### Logging Configuration
```python
# logging.py
import logging
import json
from logging.handlers import RotatingFileHandler

def setup_logging(app: Flask):
    if not app.debug:
        # Production logging
        if not os.path.exists('logs'):
            os.mkdir('logs')
            
        file_handler = RotatingFileHandler(
            'logs/fsa-backend.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('FSA Backend startup')
```

## Performance Optimization

### Production WSGI Server
```python
# gunicorn_config.py
import multiprocessing

# Server socket
bind = "0.0.0.0:4000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'fsa-backend'

# Server mechanics
daemon = False
pidfile = '/tmp/gunicorn.pid'
user = 'www-data'
group = 'www-data'
tmp_upload_dir = None
```

```bash
# Start with gunicorn
gunicorn --config gunicorn_config.py src.server:app
```

### Nginx Configuration
```nginx
# nginx.conf
upstream fsa_backend {
    server 127.0.0.1:4000;
    server 127.0.0.1:4001;  # Additional workers
    server 127.0.0.1:4002;
}

server {
    listen 80;
    server_name fsa.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fsa.yourdomain.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    location / {
        proxy_pass http://fsa_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }
    
    # Static assets (if serving separately)
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Deployment Automation

### CI/CD Pipeline (GitHub Actions)
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
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - run: pip install -r requirements.txt
      - run: python -m pytest tests/
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: docker/build-push-action@v2
        with:
          push: true
          tags: your-registry/fsa-backend:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: azure/k8s-deploy@v1
        with:
          manifests: k8s/
          images: your-registry/fsa-backend:${{ github.sha }}
```

### Blue-Green Deployment
```bash
#!/bin/bash
# deploy.sh

# Build new version
docker build -t fsa-backend:$BUILD_NUMBER .

# Deploy to green environment
kubectl set image deployment/backend-green backend=fsa-backend:$BUILD_NUMBER

# Wait for rollout
kubectl rollout status deployment/backend-green

# Health check green environment
if curl -f http://green.internal/health; then
    # Switch traffic to green
    kubectl patch service backend-service -p '{"spec":{"selector":{"version":"green"}}}'
    
    # Scale down blue
    kubectl scale deployment backend-blue --replicas=0
    
    echo "Deployment successful"
else
    echo "Health check failed, rolling back"
    kubectl rollout undo deployment/backend-green
fi
```

## Disaster Recovery

### Backup Strategy
```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump $DATABASE_URL | gzip > backups/db-$(date +%Y%m%d-%H%M%S).sql.gz

# Upload to S3
aws s3 cp backups/ s3://your-backup-bucket/database/ --recursive

# Retain only last 30 days
find backups/ -name "*.sql.gz" -mtime +30 -delete
```

### Recovery Procedures
```bash
# Database recovery
gunzip -c backup-file.sql.gz | psql $DATABASE_URL

# Application recovery
kubectl apply -f k8s/
kubectl rollout restart deployment/backend
```

---

*For development setup, see the [Developer Guide](01-DEVELOPER_GUIDE.md). For troubleshooting deployment issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).*