# PRIME v2 — Local Development Setup

## Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin v2+)
- Node 20+ (for running tests outside Docker)
- Copy .env.example to .env and fill in all values before starting

## Start the full local stack
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

## Verify health
curl http://localhost:3000/health
Expected response: { "status": "ok", "timestamp": "<ISO string>" }

Frontend: http://localhost:5173

## Run tests outside Docker
cd apps/backend && npm run test -- --run
cd apps/frontend && npm run test -- --run

## TypeScript check
cd apps/backend && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit

## Common issues
- PostgreSQL not ready: run docker compose ps — wait for prime-postgres to show healthy
- MinIO not reachable: check MINIO_ACCESS_KEY and MINIO_SECRET_KEY are set in .env
- Port conflict on 3000 or 5173: stop other local servers using those ports
