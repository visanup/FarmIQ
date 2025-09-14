# FarmIQ Cloud Layer — Service Overview

This document summarizes active microservices, their roles, ports, and key notes for the current (reduced) architecture.

## Core Services

### Auth Service
- Port: 7300
- Stack: Node.js + Fastify + Prisma + PostgreSQL (schema: auth)
- Purpose: Authentication (JWT access + refresh rotation), user management, RBAC, email verification and password reset
- Docs: http://localhost:7300/api-docs
- Health: /health, /ready; Metrics: /metrics

### Master Service
- Port: 7307
- Stack: Node.js + Fastify + Prisma + PostgreSQL (schema: master)
- Purpose: Centralized master data (Customer, Farm, House, Flock, Device, Station, Zone, AnimalType, Breed, Reference data, Sensor/Device types, Device health)
- Base Routes: /api/v1/* (e.g. /api/v1/customers, /api/v1/farms, ...)
- Docs: http://localhost:7307/docs
- Health: /health

### Sensor Streamer Service
- Port: 7302
- Stack: Node.js + Fastify + Prisma + TimescaleDB (schema: sensors) + Kafka
- Purpose: Sensor data ingestion (HTTP), streaming to Kafka, time-series optimized storage and utilities
- Docs: http://localhost:7302/api-docs
- Health: /health

## Analytics Platform (stream + batch + API + alerts)

### Analytics Stream
- Port: 7303
- Stack: Node.js + KafkaJS + Redis + WebSockets
- Purpose: Real-time stream processing/aggregation, downstream feeds to dashboards

### Analytics Worker
- Port: 7304
- Stack: Python + FastAPI + Kafka + TimescaleDB
- Purpose: Batch processing, features, inference, scheduled jobs

### Analytics API
- Port: 7305
- Stack: Python + FastAPI + TimescaleDB
- Purpose: Read API for dashboards, reporting, time-series queries

### Analytics Alerts
- Port: 7306
- Stack: Node.js + Kafka
- Purpose: Alert rules, real-time alerting, notifications

## Cross-cutting
- Database: TimescaleDB/PostgreSQL (schemas: auth, master, sensors, analytics, monitoring as applicable)
- Messaging: Kafka (single-broker in local dev), topics versioned with .v1 suffix where relevant
- Observability: Prometheus (metrics endpoints), Grafana dashboards
- Security: JWT (Auth), API key (selected services), CORS/Helmet enabled
