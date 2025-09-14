# FarmIQ Cloud - Services (reduced set)

- auth-service: port 7300
- master-service: port 7307
- sensor-streamer-service: port 7302
- analytics-alerts: port 7306

Compose usage:
- Infrastructure: `docker-compose -f cloud/docker-compose.infra.yml up -d`
- Applications: `docker-compose -f cloud/docker-compose.apps.yml up -d`
