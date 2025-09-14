# Master Service

Overview
- Port: 7307
- Stack: Node.js + Fastify + Prisma + PostgreSQL (schema: master)
- Purpose: Centralized master data for FarmIQ: Customer, Farm, House, Flock, Device, Station, Zone, AnimalType, Breed, ReferenceData, SensorType, DeviceType, DeviceHealth
- Docs: http://localhost:7307/docs
- Health: GET /health

Security
- CORS + Helmet enabled
- Some endpoints protected via API key (`X-API-Key`) per service config

Base Routes (prefix: `/api/v1`)
- Customers: `/api/v1/customers`
- Farms: `/api/v1/farms`
- Houses: `/api/v1/houses`
- Flocks: `/api/v1/flocks`
- Devices: `/api/v1/devices`
- Device Health: `/api/v1/device-health`
- Stations: `/api/v1/stations`
- Zones: `/api/v1/zones`
- Reference Data: `/api/v1/reference-data`
- Device Types: `/api/v1/device-types`
- Sensor Types: `/api/v1/sensor-types`
- Animal Types: `/api/v1/animal-types`
- Breeds: `/api/v1/breeds`

Common Patterns
- Standard CRUD operations with pagination/search (where applicable)
- Validation via Fastify schemas/Zod (by route definitions)
- Prisma models map to `master` schema tables

Local Development
- Install: `yarn install`
- Prisma: `yarn db:generate && yarn db:push`
- Run: `yarn dev` (or build+start)

Notes
- Use the Swagger UI for full request/response schema details and testing.
- Ensure DB URL points to `schema=master` in local setups.
