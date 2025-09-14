# FarmIQ Cloud Layer - Deployment Guide

## เธ เธฒเธเธฃเธงเธกเธเธฒเธฃ Deploy

เธเธนเนเธกเธทเธญเธเธตเนเธเธฃเธญเธเธเธฅเธธเธกเธเธฒเธฃเธ•เธดเธ”เธ•เธฑเนเธเนเธฅเธฐ deploy FarmIQ Cloud Layer เธ—เธฑเนเธเนเธเธชเธ เธฒเธเนเธงเธ”เธฅเนเธญเธก development เนเธฅเธฐ production

## Prerequisites

### System Requirements

#### Development Environment
- **OS**: Windows 10+, macOS 10.15+, เธซเธฃเธทเธญ Ubuntu 20.04+
- **RAM**: 8GB+ (เนเธเธฐเธเธณ 16GB)
- **Storage**: 20GB+ free space
- **CPU**: 4 cores+ (เนเธเธฐเธเธณ 8 cores)

#### Production Environment
- **OS**: Ubuntu 20.04+ LTS (เนเธเธฐเธเธณ)
- **RAM**: 32GB+ (เนเธเธฐเธเธณ 64GB)
- **Storage**: 100GB+ SSD
- **CPU**: 8 cores+ (เนเธเธฐเธเธณ 16 cores)
- **Network**: 1Gbps+ bandwidth

### Software Requirements

#### Core Software
```bash
# Node.js & Yarn
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g yarn@1.22.19

# Python (เธชเธณเธซเธฃเธฑเธ Analytics services)
sudo apt-get install python3.11 python3.11-venv python3-pip

# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo apt-get install git

# Additional tools
sudo apt-get install curl wget unzip
```

#### Database & Infrastructure
- **PostgreSQL**: 15+ with TimescaleDB 2.11+
- **Redis**: 7.0+
- **Apache Kafka**: 3.5+
- **Nginx**: 1.24+ (เธชเธณเธซเธฃเธฑเธ production)

## Development Deployment

### 1. Clone Repository
```bash
git clone <repository-url>
cd FarmIQ
```

### 2. Environment Setup
```bash
# Copy environment template
cp cloud/.env.example cloud/.env

# Edit environment variables
nano cloud/.env
```

### 3. Start Infrastructure
```bash
# Start core infrastructure
docker-compose -f cloud/docker-compose.infra.yml up -d

# Wait for services to be ready
docker-compose -f cloud/docker-compose.infra.yml logs -f
```

### 4. Database Setup
```bash
# Connect to database
docker exec -it timescaledb psql -U postgres -d farmiq_cloud

# Run database schemas
\i /docker-entrypoint-initdb.d/00_create_database.sql
\i /docker-entrypoint-initdb.d/01_schema_timeseries.sql
\i /docker-entrypoint-initdb.d/02_auth_db.sql
\i /docker-entrypoint-initdb.d/03_master_db.sql
\i /docker-entrypoint-initdb.d/11_analytics_ultimate_schema.sql
```

### 5. Start Services
```bash
# Start all services
docker-compose -f cloud/docker-compose.yml up -d

# Or start specific services
docker-compose -f cloud/docker-compose.yml up -d auth-service master-service
```

### 6. Verify Installation
```bash
# Check service health
curl http://localhost:7300/health  # Auth Service
curl http://localhost:7301/health  # Customer Service
curl http://localhost:7302/health  # Sensor Streamer

# Check API documentation
open http://localhost:7300/api-docs  # Auth Service API
open http://localhost:7301/api-docs  # Customer Service API
```

## Production Deployment

### 1. Server Preparation

#### Ubuntu Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget unzip git nginx certbot python3-certbot-nginx

# Create application user
sudo useradd -m -s /bin/bash farmiq
sudo usermod -aG docker farmiq
```

#### Firewall Configuration
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 7300:7315  # Service ports
sudo ufw enable
```

### 2. Docker Installation
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Application Deployment

#### Clone and Setup
```bash
# Switch to application user
sudo su - farmiq

# Clone repository
git clone <repository-url>
cd FarmIQ

# Create production environment
cp cloud/.env.example cloud/.env.production
nano cloud/.env.production
```

#### Production Environment Configuration
```env
# Production Environment Variables
NODE_ENV=production
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://postgres:password@timescaledb:5432/farmiq_cloud
DB_HOST=timescaledb
DB_PORT=5432
DB_NAME=farmiq_cloud
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Kafka
KAFKA_BROKERS=kafka:9092
KAFKA_SSL=false

# Redis
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET_KEY=your-super-secure-jwt-secret-key
JWT_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
CORS_ALLOW_CREDENTIALS=true

# Monitoring
ENABLE_PROMETHEUS=true
PROMETHEUS_PORT=9090
```

#### Start Production Services
```bash
# Start infrastructure
docker-compose -f cloud/docker-compose.infra.yml up -d

# Wait for infrastructure to be ready
sleep 30

# Start application services
docker-compose -f cloud/docker-compose.yml up -d

# Check service status
docker-compose -f cloud/docker-compose.yml ps
```

### 4. Nginx Configuration

#### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/farmiq
```

```nginx
upstream auth-service {
    server localhost:7300;
}

upstream customer-service {
    server localhost:7301;
}

upstream sensor-streamer {
    server localhost:7302;
}

upstream analytics-api {
    server localhost:7305;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Auth Service
    location /api/auth/ {
        proxy_pass http://auth-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Customer Service
    location /api/customers/ {
        proxy_pass http://customer-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sensor Streamer
    location /api/sensors/ {
        proxy_pass http://sensor-streamer;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Analytics API
    location /api/analytics/ {
        proxy_pass http://analytics-api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (if serving from same server)
    location / {
        root /var/www/farmiq/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/farmiq /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. SSL Certificate
```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d app.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Monitoring Setup

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'farmiq-services'
    static_configs:
      - targets: ['localhost:7300', 'localhost:7301', 'localhost:7302', 'localhost:7305']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

#### Start Monitoring
```bash
# Start Prometheus and Grafana
docker-compose -f cloud/docker-compose.monitoring.yml up -d
```

## Docker Compose Configurations

### Infrastructure Services
```yaml
# docker-compose.infra.yml
version: '3.8'

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    container_name: timescaledb
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: farmiq_cloud
    ports:
      - "5432:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data
      - ./cloud/db:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d farmiq_cloud"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  kafka:
    image: bitnami/kafka:3.5
    container_name: kafka
    environment:
      - KAFKA_ENABLE_KRAFT=yes
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
    ports:
      - "9092:9092"
    volumes:
      - kafka_data:/bitnami/kafka

volumes:
  timescale_data:
  redis_data:
  kafka_data:
```

### Application Services
```yaml
# docker-compose.yml
version: '3.8'

services:
  auth-service:
    build:
      context: ./cloud/services/auth-service
      dockerfile: Dockerfile
    container_name: auth-service
    ports:
      - "7300:7300"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@timescaledb:5432/farmiq_cloud
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      timescaledb:
        condition: service_healthy
    networks:
      - farmiq-network

  customer-service:
    build:
      context: ./cloud/services/customer-service
      dockerfile: Dockerfile
    container_name: customer-service
    ports:
      - "7301:7301"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@timescaledb:5432/farmiq_cloud
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      timescaledb:
        condition: service_healthy
    networks:
      - farmiq-network

  sensor-streamer:
    build:
      context: ./cloud/services/sensor-streamer-service
      dockerfile: Dockerfile
    container_name: sensor-streamer
    ports:
      - "7302:7302"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@timescaledb:5432/farmiq_cloud
      - KAFKA_BROKERS=kafka:9092
    depends_on:
      timescaledb:
        condition: service_healthy
      kafka:
        condition: service_started
    networks:
      - farmiq-network

networks:
  farmiq-network:
    external: true
```

## Service-Specific Deployment

### Node.js Services
```bash
# Build service
cd cloud/services/auth-service
yarn install
yarn build

# Create Docker image
docker build -t farmiq/auth-service:latest .

# Run container
docker run -d \
  --name auth-service \
  -p 7300:7300 \
  -e DATABASE_URL=postgresql://postgres:password@timescaledb:5432/farmiq_cloud \
  -e JWT_SECRET_KEY=your-secret-key \
  farmiq/auth-service:latest
```

### Python Services
```bash
# Build service
cd cloud/services/analytics-worker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create Docker image
docker build -t farmiq/analytics-worker:latest .

# Run container
docker run -d \
  --name analytics-worker \
  -p 7304:7304 \
  -e DATABASE_URL=postgresql://postgres:password@timescaledb:5432/farmiq_cloud \
  -e KAFKA_BROKERS=kafka:9092 \
  farmiq/analytics-worker:latest
```

## Health Checks & Monitoring

### Service Health Endpoints
```bash
# Check all services
curl http://localhost:7300/health  # Auth Service
curl http://localhost:7301/health  # Customer Service
curl http://localhost:7302/health  # Sensor Streamer
curl http://localhost:7303/health  # Analytics Stream
curl http://localhost:7304/v1/health  # Analytics Worker
curl http://localhost:7305/v1/health  # Analytics API
curl http://localhost:7306/health  # Analytics Alerts
```

### Database Health
```bash
# Check PostgreSQL
docker exec -it timescaledb pg_isready -U postgres

# Check TimescaleDB
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM timescaledb_information.hypertables;"
```

### Kafka Health
```bash
# Check Kafka topics
docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check consumer groups
docker exec -it kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

### Redis Health
```bash
# Check Redis
docker exec -it redis redis-cli ping
```

## Backup & Recovery

### Database Backup
```bash
# Create backup
docker exec timescaledb pg_dump -U postgres farmiq_cloud > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker exec -i timescaledb psql -U postgres farmiq_cloud < backup_20240115_120000.sql
```

### Application Backup
```bash
# Backup application data
tar -czf farmiq_app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /opt/farmiq/

# Backup Docker volumes
docker run --rm -v farmiq_timescale_data:/data -v $(pwd):/backup alpine tar czf /backup/timescale_data_backup.tar.gz -C /data .
```

## Scaling & Performance

### Horizontal Scaling
```bash
# Scale specific service
docker-compose up -d --scale auth-service=3

# Load balancer configuration
# Update Nginx upstream configuration
```

### Vertical Scaling
```bash
# Increase container resources
docker run -d \
  --name auth-service \
  --memory=2g \
  --cpus=2 \
  -p 7300:7300 \
  farmiq/auth-service:latest
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs auth-service

# Check resource usage
docker stats

# Check port conflicts
netstat -tulpn | grep :7300
```

#### Database Connection Issues
```bash
# Check database status
docker exec -it timescaledb pg_isready -U postgres

# Check network connectivity
docker exec -it auth-service ping timescaledb

# Check environment variables
docker exec -it auth-service env | grep DATABASE
```

#### Kafka Issues
```bash
# Check Kafka status
docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check consumer lag
docker exec -it kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group analytics-worker-group --describe
```

### Performance Optimization

#### Database Optimization
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname IN ('auth', 'customer', 'sensors', 'analytics')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Service Optimization
```bash
# Check service metrics
curl http://localhost:7300/metrics

# Check memory usage
docker exec auth-service ps aux

# Check network connections
docker exec auth-service netstat -tulpn
```

## Security Considerations

### Network Security
- เนเธเน firewall เน€เธเธทเนเธญเธเธณเธเธฑเธ”เธเธฒเธฃเน€เธเนเธฒเธ–เธถเธ
- เนเธเน VPN เธชเธณเธซเธฃเธฑเธเธเธฒเธฃเน€เธเนเธฒเธ–เธถเธเธเธฒเธเธ เธฒเธขเธเธญเธ
- เนเธเน TLS/SSL เธชเธณเธซเธฃเธฑเธเธเธฒเธฃเธชเธทเนเธญเธชเธฒเธฃ

### Application Security
- เนเธเน environment variables เธชเธณเธซเธฃเธฑเธ secrets
- เนเธเน strong passwords เนเธฅเธฐ JWT secrets
- เน€เธเธดเธ”เนเธเน CORS เธญเธขเนเธฒเธเน€เธซเธกเธฒเธฐเธชเธก
- เนเธเน rate limiting

### Database Security
- เนเธเน strong database passwords
- เธเธณเธเธฑเธ”เธเธฒเธฃเน€เธเนเธฒเธ–เธถเธ database
- เนเธเน SSL เธชเธณเธซเธฃเธฑเธ database connections
- เน€เธเธดเธ”เนเธเน audit logging

---

*เน€เธญเธเธชเธฒเธฃเธเธตเนเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”: 2024-01-15*

