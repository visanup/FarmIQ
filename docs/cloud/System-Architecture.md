# System Architecture

This document outlines the FarmIQ Cloud Layer architecture and data flow across core services.

## Components
- Auth Service (7300): Authentication, JWT, users, RBAC
- Master Service (7307): Centralized master data (customers, farms, houses, devices, etc.)
- Sensor Streamer (7302): Sensor ingestion → Kafka, time-series storage (TimescaleDB)
- Analytics Platform (7303–7306): Stream, Worker, API, Alerts
- Infrastructure: TimescaleDB/Postgres, Kafka, Redis (as used), Prometheus, Grafana

## Data Flow (high level)
```mermaid
flowchart LR
  subgraph Edge/Devices
    D[IoT Devices]
  end
  subgraph Cloud
    S[SENSOR STREAMER (7302)]
    K[(Kafka)]
    T[(TimescaleDB/Postgres)]
    A1[Analytics Stream (7303)]
    A2[Analytics Worker (7304)]
    A3[Analytics API (7305)]
    A4[Analytics Alerts (7306)]
    MS[Master Service (7307)]
    AU[Auth Service (7300)]
  end
  D --> S
  S --> K
  K --> A1
  K --> A2
  A2 --> T
  A3 --> T
  A4 --> K
  MS --> T
```

## Integration Boundaries
- Auth issues and validates JWTs. Other services verify JWT (or API key where configured).
- Master is the source of truth for master data; other services read via API or Kafka snapshots where applicable.
- Sensor Streamer publishes readings/events to Kafka and persists time-series to TimescaleDB.
- Analytics services consume Kafka, persist/compute features, and expose read APIs and alerts.

## Observability & Ops
- Metrics endpoints (e.g., `/metrics`) scraped by Prometheus; dashboards in Grafana.
- Health endpoints: `/health`; readiness (where available): `/ready`.
- CORS and Helmet enabled on external-facing services.
