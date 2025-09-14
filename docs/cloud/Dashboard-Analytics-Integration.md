# Dashboard ↔ Analytics API Integration

This guide explains how the `frontend/dashboard` uses data from `cloud/services/analytic` (Analytics API) and how to configure it locally.

## Overview

- Backend: FastAPI service in `cloud/services/analytic/services/analytics-api` (default port `7305`).
- Frontend: Vite + React app in `frontend/dashboard`.
- New wiring: The Analytics page now includes a "Live Analytics (Cloud)" chart that calls the Analytics API `/v1/agg` endpoint. Hooks and an API client were added for broader use.

## Prerequisites

- Python env to run Analytics API; TimescaleDB/DB must be reachable per service config.
- Node.js 18+ for the dashboard.

### Verify Analytics API

```bash
curl http://localhost:7305/v1/health
```

Expected: `{ "status": "healthy", "service": "analytics-api", ... }`

## Frontend Configuration

Set the following variables in `frontend/dashboard/.env` (already present by default):

- `VITE_ANALYTICS_API_URL=http://localhost:7305`
- `VITE_DEFAULT_TENANT_ID=tenant-a` (adjust to your dataset)

Optional:

- `VITE_API_URL` and `VITE_WEBSOCKET_URL` for other parts of the dashboard (unrelated to analytics integration).

## What Was Added

- `src/services/api/analyticsClient.ts`: Lightweight fetch client for Analytics API (`/v1/agg`, `/v1/kpi`, `/v1/anomalies`, `/fcr`, `/size-distribution`).
- `src/types/analytics.ts`: Strong types for responses.
- `src/hooks/useAnalytics.ts`: React Query hooks (`useAgg`, `useKpi`, `useAnomalies`, `useFcr`, `useSizeDistribution`, `useAnalyticsHealth`, `useFactories`, `useMachines`, `useMetricsCatalog`).
- `src/pages/analytics/AnalyticsPage.tsx`: New "Live Analytics (Cloud)" section with selectors (tenant/factory/machine/metric, window, range hours) and a line chart fed by `/v1/agg`. Selectors now fetch options from the API.

## New Catalog Endpoints (Analytics API)

Added to `cloud/services/analytic/services/analytics-api`:

- `GET /v1/catalog/factories?tenant_id=` → `string[]`
- `GET /v1/catalog/machines?tenant_id=&factory_id=` → `string[]`
- `GET /v1/catalog/metrics?tenant_id=&factory_id=&machine_id=` → `string[]`

These endpoints read distinct values from `analytics.analytics_agg` and are used by the dashboard to populate selector options. If no rows exist for the filters, the UI falls back to default lists.

## Using the Hooks

Example (24h temperature average for a machine):

```ts
const now = new Date();
const end = now.toISOString();
const start = new Date(now.getTime() - 24*60*60*1000).toISOString();
const { data, isLoading, error } = useAgg({
  factory_id: 'factory-1',
  machine_id: 'machine-1',
  metric: 'temperature',
  window_s: 300,
  start,
  end,
});
```

`tenant_id` defaults to `VITE_DEFAULT_TENANT_ID` if omitted.

## Adjusting Parameters When Data Is Missing

If your database doesn’t contain data for the defaults shown in the UI, use the selectors at the top of the "Live Analytics (Cloud)" card:

- Change `Tenant` to match your dataset (configured by `VITE_DEFAULT_TENANT_ID`).
- Switch `Factory` / `Machine` to IDs that exist in your data.
- Try different `metric` names that your pipeline writes (e.g., `temperature`, `humidity`, `weight`, `feed_intake`, `water_intake`).
- Increase `Range (hours)` or use a larger `Window (s)` to align with your aggregation cadence.

When the selections are valid and data exists in `analytics.analytics_agg`, the chart will populate automatically.

### Quick SQL checks

```sql
-- Verify rows exist for the chosen parameters
SELECT bucket_start, window_s, tenant_id, factory_id, machine_id, sensor_id, metric, count_n, avg_val
FROM analytics.analytics_agg
WHERE tenant_id = 'tenant-a'         -- adjust
  AND factory_id = 'factory-1'       -- adjust
  AND machine_id = 'machine-1'       -- adjust
  AND metric = 'temperature'         -- adjust
ORDER BY bucket_start DESC
LIMIT 50;
```

If empty, either adjust parameters or ensure your ingest/aggregation jobs are running and producing data.

## Seeding / Producing Data

- Ensure upstream services (stream/worker) that populate `analytics.analytics_agg` are running and reading sensor topics.
- Backfill: If you have raw events, re-run rollups to populate aggregates for the period you want to visualize.
- Minimal smoke test: Manually insert a couple of aggregate rows for your tenant/factory/machine/metric to validate the dashboard chart renders.

## Running Locally

1) Start Analytics API (ensure DB connectivity):

```bash
# from cloud/services/analytic/services/analytics-api
uvicorn app.main:app --reload --port 7305
```

2) Start Dashboard:

```bash
cd frontend/dashboard
yarn install
yarn dev
# open http://localhost:3001
```

## Troubleshooting

- 404/500 from `/v1/agg`: Check that the database has analytics data for your tenant/factory/machine/metric and the time window you query.
- CORS errors: Ensure Analytics API allows the dashboard origin; update FastAPI CORS settings if needed.
- Empty charts: Try different `metric`, `factory_id`, `machine_id`, or a longer time window.
