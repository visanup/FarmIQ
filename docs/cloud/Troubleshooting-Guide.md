# FarmIQ Cloud Layer - Troubleshooting Guide

## เธ เธฒเธเธฃเธงเธก

เธเธนเนเธกเธทเธญเธเธตเนเธเธฃเธญเธเธเธฅเธธเธกเธเธฒเธฃเนเธเนเนเธเธเธฑเธเธซเธฒเธ—เธตเนเธเธเธเนเธญเธขเนเธ FarmIQ Cloud Layer เนเธฅเธฐเธงเธดเธเธตเธเธฒเธฃเธงเธดเธเธดเธเธเธฑเธขเธเธฑเธเธซเธฒ

## เธเธฒเธฃเธงเธดเธเธดเธเธเธฑเธขเธเธฑเธเธซเธฒเน€เธเธทเนเธญเธเธ•เนเธ

### 1. เธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐเธฃเธฐเธเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐ services เธ—เธฑเนเธเธซเธกเธ”
docker-compose ps

# เธ•เธฃเธงเธเธชเธญเธ logs
docker-compose logs -f

# เธ•เธฃเธงเธเธชเธญเธ resource usage
docker stats
```

### 2. เธ•เธฃเธงเธเธชเธญเธ Health Checks
```bash
# Auth Service
curl http://localhost:7300/health

# Master Service
curl http://localhost:7301/health

# Sensor Streamer
curl http://localhost:7302/health

# Monitoring Service
curl http://localhost:7303/health

# Analytics API
curl http://localhost:7306/v1/health
```

### 3. เธ•เธฃเธงเธเธชเธญเธ Network Connectivity
```bash
# เธ•เธฃเธงเธเธชเธญเธ port เธ—เธตเนเน€เธเธดเธ”
netstat -tulpn | grep -E ":(7300|7301|7302|7303|7304|7305|7306|7307)"

# เธ•เธฃเธงเธเธชเธญเธ Docker network
docker network ls
docker network inspect farmiq_cloud_default
```

## เธเธฑเธเธซเธฒเธ—เธตเนเธเธเธเนเธญเธข

### 1. Service เนเธกเนเธชเธฒเธกเธฒเธฃเธ– Start เนเธ”เน

#### เธญเธฒเธเธฒเธฃ
- Service container เธซเธขเธธเธ”เธ—เธณเธเธฒเธ
- Error message เนเธ logs
- Port conflicts

#### เธเธฒเธฃเนเธเนเนเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธ logs
docker-compose logs auth-service

# เธ•เธฃเธงเธเธชเธญเธ port conflicts
sudo lsof -i :7300

# เธ•เธฃเธงเธเธชเธญเธ resource usage
docker stats auth-service

# Restart service
docker-compose restart auth-service

# Rebuild เนเธฅเธฐ restart
docker-compose up -d --build auth-service
```

#### เธชเธฒเน€เธซเธ•เธธเธ—เธตเนเน€เธเนเธเนเธเนเธ”เน
- Port เธ–เธนเธเนเธเนเธเธฒเธเธญเธขเธนเน
- Memory เธซเธฃเธทเธญ CPU เนเธกเนเน€เธเธตเธขเธเธเธญ
- Environment variables เนเธกเนเธ–เธนเธเธ•เนเธญเธ
- Database connection เธฅเนเธกเน€เธซเธฅเธง

### 2. Database Connection Issues

#### เธญเธฒเธเธฒเธฃ
- "Connection refused" error
- "Database not found" error
- Timeout errors

#### เธเธฒเธฃเนเธเนเนเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธ database status
docker exec -it timescaledb pg_isready -U postgres

# เธ•เธฃเธงเธเธชเธญเธ database logs
docker-compose logs timescaledb

# เธ•เธฃเธงเธเธชเธญเธ network connectivity
docker exec -it auth-service ping timescaledb

# เธ•เธฃเธงเธเธชเธญเธ environment variables
docker exec -it auth-service env | grep DATABASE

# Test database connection
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT 1;"
```

#### เธชเธฒเน€เธซเธ•เธธเธ—เธตเนเน€เธเนเธเนเธเนเธ”เน
- Database service เนเธกเนเธ—เธณเธเธฒเธ
- Network connectivity issues
- Wrong database credentials
- Database schema เนเธกเนเธ–เธนเธเธ•เนเธญเธ

### 3. Kafka Connection Issues

#### เธญเธฒเธเธฒเธฃ
- "Connection refused" error
- "Broker not available" error
- Message publishing/consuming เธฅเนเธกเน€เธซเธฅเธง

#### เธเธฒเธฃเนเธเนเนเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธ Kafka status
docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# เธ•เธฃเธงเธเธชเธญเธ Kafka logs
docker-compose logs kafka

# เธ•เธฃเธงเธเธชเธญเธ consumer groups
docker exec -it kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# Test Kafka connectivity
docker exec -it kafka kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test-topic
```

#### เธชเธฒเน€เธซเธ•เธธเธ—เธตเนเน€เธเนเธเนเธเนเธ”เน
- Kafka service เนเธกเนเธ—เธณเธเธฒเธ
- Wrong broker configuration
- Network connectivity issues
- Topic เนเธกเนเธ–เธนเธเธชเธฃเนเธฒเธ

### 4. Redis Connection Issues

#### เธญเธฒเธเธฒเธฃ
- "Connection refused" error
- Cache operations เธฅเนเธกเน€เธซเธฅเธง
- Session storage issues

#### เธเธฒเธฃเนเธเนเนเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธ Redis status
docker exec -it redis redis-cli ping

# เธ•เธฃเธงเธเธชเธญเธ Redis logs
docker-compose logs redis

# เธ•เธฃเธงเธเธชเธญเธ Redis memory usage
docker exec -it redis redis-cli info memory

# Test Redis operations
docker exec -it redis redis-cli set test "hello"
docker exec -it redis redis-cli get test
```

### 5. Authentication Issues

#### เธญเธฒเธเธฒเธฃ
- "Invalid token" error
- "Token expired" error
- Login เธฅเนเธกเน€เธซเธฅเธง

#### เธเธฒเธฃเนเธเนเนเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธ JWT secret
docker exec -it auth-service env | grep JWT_SECRET

# เธ•เธฃเธงเธเธชเธญเธ token format
curl -H "Authorization: Bearer <token>" http://localhost:7300/api/auth/me

# เธ•เธฃเธงเธเธชเธญเธ database
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM auth.users LIMIT 5;"

# Test login
curl -X POST http://localhost:7300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

#### เธชเธฒเน€เธซเธ•เธธเธ—เธตเนเน€เธเนเธเนเธเนเธ”เน
- JWT secret เนเธกเนเธ•เธฃเธเธเธฑเธ
- Token format เนเธกเนเธ–เธนเธเธ•เนเธญเธ
- User เนเธกเนเธกเธตเธญเธขเธนเนเนเธ database
- Password hash เนเธกเนเธ–เธนเธเธ•เนเธญเธ

### 6. API Response Issues

#### เธญเธฒเธเธฒเธฃ
- 500 Internal Server Error
- 404 Not Found
- Slow response times

#### เธเธฒเธฃเนเธเนเนเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธ API logs
docker-compose logs customer-service

# เธ•เธฃเธงเธเธชเธญเธ database queries
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM pg_stat_activity;"

# เธ•เธฃเธงเธเธชเธญเธ slow queries
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Test API endpoint
curl -v http://localhost:7301/api/customers
```

### 7. Frontend Issues

#### เธญเธฒเธเธฒเธฃ
- CORS errors
- API calls เธฅเนเธกเน€เธซเธฅเธง
- UI components เนเธกเนเนเธชเธ”เธ

#### เธเธฒเธฃเนเธเนเนเธ
```bash
# เธ•เธฃเธงเธเธชเธญเธ CORS configuration
docker exec -it customer-service env | grep CORS

# เธ•เธฃเธงเธเธชเธญเธ API connectivity
curl -H "Origin: http://localhost:3000" http://localhost:7301/api/customers

# เธ•เธฃเธงเธเธชเธญเธ frontend logs
# เน€เธเธดเธ” browser developer tools เนเธฅเธฐเธ”เธน console logs
```

## เธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธ Performance

### 1. Database Performance
```sql
-- เธ•เธฃเธงเธเธชเธญเธ slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- เธ•เธฃเธงเธเธชเธญเธ table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname IN ('auth', 'customer', 'sensors', 'analytics')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- เธ•เธฃเธงเธเธชเธญเธ active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- เธ•เธฃเธงเธเธชเธญเธ locks
SELECT * FROM pg_locks WHERE NOT granted;
```

### 2. Service Performance
```bash
# เธ•เธฃเธงเธเธชเธญเธ memory usage
docker stats --no-stream

# เธ•เธฃเธงเธเธชเธญเธ CPU usage
docker exec auth-service top

# เธ•เธฃเธงเธเธชเธญเธ network connections
docker exec auth-service netstat -tulpn

# เธ•เธฃเธงเธเธชเธญเธ file descriptors
docker exec auth-service lsof | wc -l
```

### 3. Kafka Performance
```bash
# เธ•เธฃเธงเธเธชเธญเธ topic partitions
docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic sensors.device.readings.v1

# เธ•เธฃเธงเธเธชเธญเธ consumer lag
docker exec -it kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group analytics-worker-group --describe

# เธ•เธฃเธงเธเธชเธญเธ broker metrics
docker exec -it kafka kafka-log-dirs.sh --bootstrap-server localhost:9092 --describe
```

## เธเธฒเธฃเนเธเนเนเธเธเธฑเธเธซเธฒเน€เธเธเธฒเธฐ Service

### Auth Service
```bash
# เธ•เธฃเธงเธเธชเธญเธ JWT configuration
docker exec -it auth-service cat /app/.env | grep JWT

# เธ•เธฃเธงเธเธชเธญเธ database connection
docker exec -it auth-service node -e "console.log(process.env.DATABASE_URL)"

# Test authentication flow
curl -X POST http://localhost:7300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Customer Service
```bash
# เธ•เธฃเธงเธเธชเธญเธ tenant isolation
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT tenant_id, count(*) FROM customers.customers GROUP BY tenant_id;"

# เธ•เธฃเธงเธเธชเธญเธ subscription data
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM customers.subscriptions LIMIT 5;"
```

### Sensor Streamer Service
```bash
# เธ•เธฃเธงเธเธชเธญเธ TimescaleDB hypertables
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM timescaledb_information.hypertables;"

# เธ•เธฃเธงเธเธชเธญเธ sensor data
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM sensors.sensor_readings ORDER BY timestamp DESC LIMIT 5;"

# Test sensor data ingestion
curl -X POST http://localhost:7302/api/sensor-readings/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-key" \
  -d '[{"deviceId":"test-device","sensorType":"temperature","value":25.5,"unit":"celsius"}]'
```

### Analytics Services
```bash
# เธ•เธฃเธงเธเธชเธญเธ analytics data
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM analytics.analytics_agg ORDER BY bucket_start DESC LIMIT 5;"

# เธ•เธฃเธงเธเธชเธญเธ anomalies
docker exec -it timescaledb psql -U postgres -d farmiq_cloud -c "SELECT * FROM analytics.analytics_anomaly ORDER BY timestamp DESC LIMIT 5;"

# Test analytics API
curl "http://localhost:7305/v1/agg?tenant_id=test&factory_id=test&machine_id=test&metric=temp&window_s=60&start=2024-01-01T00:00:00Z&end=2024-01-02T00:00:00Z"
```

## เธเธฒเธฃเนเธเนเนเธเธเธฑเธเธซเธฒเน€เธเธเธฒเธฐ Environment

### Development Environment
```bash
# เธ•เธฃเธงเธเธชเธญเธ development setup
yarn --version
node --version
docker --version
docker-compose --version

# เธ•เธฃเธงเธเธชเธญเธ environment variables
cat cloud/.env

# เธ•เธฃเธงเธเธชเธญเธ port conflicts
sudo lsof -i :7300-7315
```

### Production Environment
```bash
# เธ•เธฃเธงเธเธชเธญเธ system resources
free -h
df -h
top

# เธ•เธฃเธงเธเธชเธญเธ service status
systemctl status docker
systemctl status nginx

# เธ•เธฃเธงเธเธชเธญเธ logs
journalctl -u docker
tail -f /var/log/nginx/error.log
```

## เธเธฒเธฃ Backup เนเธฅเธฐ Recovery

### Database Backup
```bash
# Create full backup
docker exec timescaledb pg_dump -U postgres farmiq_cloud > backup_$(date +%Y%m%d_%H%M%S).sql

# Create schema-only backup
docker exec timescaledb pg_dump -U postgres -s farmiq_cloud > schema_backup_$(date +%Y%m%d_%H%M%S).sql

# Create data-only backup
docker exec timescaledb pg_dump -U postgres -a farmiq_cloud > data_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Application Recovery
```bash
# Restore database
docker exec -i timescaledb psql -U postgres farmiq_cloud < backup_20240115_120000.sql

# Restart services
docker-compose restart

# Verify recovery
curl http://localhost:7300/health
```

## เธเธฒเธฃ Monitor เนเธฅเธฐ Alert

### Prometheus Metrics
```bash
# เธ•เธฃเธงเธเธชเธญเธ metrics
curl http://localhost:9090/metrics

# เธ•เธฃเธงเธเธชเธญเธ service metrics
curl http://localhost:7300/metrics
curl http://localhost:7301/metrics
```

### Log Analysis
```bash
# เธ•เธฃเธงเธเธชเธญเธ error logs
docker-compose logs | grep ERROR

# เธ•เธฃเธงเธเธชเธญเธ access logs
docker-compose logs | grep "GET\|POST\|PUT\|DELETE"

# เธ•เธฃเธงเธเธชเธญเธ performance logs
docker-compose logs | grep "slow\|timeout"
```

## เธเธฒเธฃเธ•เธดเธ”เธ•เนเธญ Support

### เธเนเธญเธกเธนเธฅเธ—เธตเนเธ•เนเธญเธเน€เธ•เธฃเธตเธขเธก
1. **Error Messages**: เธเนเธญเธเธงเธฒเธก error เธ—เธตเนเธเธฑเธ”เน€เธเธ
2. **Logs**: Log files เธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธ
3. **Environment**: OS, Docker version, Node.js version
4. **Steps to Reproduce**: เธเธฑเนเธเธ•เธญเธเธเธฒเธฃเธ—เธณเธเนเธณเธเธฑเธเธซเธฒ
5. **Expected vs Actual**: เธเธฅเธฅเธฑเธเธเนเธ—เธตเนเธเธฒเธ”เธซเธงเธฑเธ vs เธเธฅเธฅเธฑเธเธเนเธเธฃเธดเธ

### เธเธฒเธฃเธฃเธงเธเธฃเธงเธกเธเนเธญเธกเธนเธฅ
```bash
# Collect system information
uname -a
docker --version
docker-compose --version
node --version
yarn --version

# Collect service logs
docker-compose logs > farmiq_logs_$(date +%Y%m%d_%H%M%S).txt

# Collect configuration
cp cloud/.env farmiq_config_$(date +%Y%m%d_%H%M%S).env

# Collect database schema
docker exec timescaledb pg_dump -U postgres -s farmiq_cloud > farmiq_schema_$(date +%Y%m%d_%H%M%S).sql
```

---

*เน€เธญเธเธชเธฒเธฃเธเธตเนเนเธ”เนเธฃเธฑเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”: 2024-01-15*

