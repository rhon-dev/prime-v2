# ADR-001 — Deployment Container Strategy

| Field | Value |
|---|---|
| ADR Number | ADR-001 |
| Title | Deployment Container Strategy |
| Status | **ACCEPTED** |
| Date | 2026-07-01 |
| Author | Architect Agent |
| Deciders | Architect Agent, DevOps Agent, Product Owner |

---

## Context

PRIME v2 must be deployed to a Coolify server that has been provisioned and confirmed by the supervisor (2026-07-01). A domain name has also been confirmed (2026-07-01).

`README.md §20.1` identifies two deployment strategies and explicitly recommends one. This ADR records the investigation, the options, and the final binding decision so that Phase 6 implementation proceeds without ambiguity.

The system consists of four distinct runtime components:

| Component | Technology |
|---|---|
| Frontend | React + Vite + TypeScript — served as static assets |
| Backend | Fastify + TypeScript — Node.js API server |
| Database | PostgreSQL 16 — relational data store |
| Object storage | MinIO — S3-compatible file store for attachments |

The question to resolve is: should these four components run inside **one container** or as **separate services**?

---

## Options Considered

### Option A — One Coolify Project, Separate Services (Recommended)

Deploy as a Docker Compose stack with four named services inside one Coolify project:

```
Coolify project: prime-v2
├── prime-frontend   (nginx/Node serving Vite build)
├── prime-backend    (Node 20, Fastify API)
├── prime-postgres   (PostgreSQL 16)
└── prime-minio      (MinIO)
```

Services communicate over an internal Docker network. Only `prime-frontend` and `prime-backend` are exposed through Coolify's reverse proxy via HTTPS. `prime-postgres` and `prime-minio` are internal only.

**Advantages:**

| Advantage | Detail |
|---|---|
| Independent restarts | Restarting the backend does not restart the database or reset object storage |
| Simpler backups | PostgreSQL and MinIO have dedicated, well-documented backup and restore paths |
| Security separation | Database and object storage are never directly reachable from the internet |
| Independent scaling | Backend instances can be scaled without affecting the database service |
| Easier upgrades | PostgreSQL or MinIO can be upgraded independently without rebuilding the application image |
| Standard tooling | Docker Compose is the standard pattern Coolify supports natively |
| Monitoring | Each service emits its own health check, logs, and metrics |
| Lower data-loss risk | Process crash in one service does not corrupt another service's data |

**Disadvantages:**

| Disadvantage | Detail |
|---|---|
| Slightly more complex initial setup | Four services to configure instead of one; requires Docker Compose authoring |
| More environment variables | Each service connection string must be wired correctly |

---

### Option B — Single Literal Container (Not Recommended)

Run all four components — frontend, backend, PostgreSQL, and MinIO — inside one Docker container using a process supervisor (e.g., `supervisor`, `s6`, `foreman`).

**Risks:**

| Risk | Detail |
|---|---|
| Difficult backup and restore | PostgreSQL and MinIO data share a single container; standard pg_dump tooling does not integrate cleanly with a multi-process container |
| Difficult process supervision | A crash in any single process requires care to avoid killing the container and all other processes |
| Larger failure blast radius | A container restart (e.g., for a backend code update) also restarts the database and storage processes |
| Harder upgrades | Upgrading PostgreSQL or MinIO requires rebuilding and restarting the entire container |
| Harder monitoring | Container-level logs mix all four services; no per-service health checks |
| Poor separation of responsibilities | A single container violates the single-responsibility principle at the infrastructure level |
| Increased data-loss risk | Any crash or corruption in the container process can affect all four components |
| Coolify friction | Coolify is designed for per-service management; a multi-process single container bypasses most of its features |

> Source: `README.md §20.1` — "Risks" of Option B as documented in the project README.

---

## Decision

**Option A is chosen.**

PRIME v2 will be deployed as one Coolify project containing four separate Docker services:

1. `prime-frontend` — serves Vite/React build as static assets
2. `prime-backend` — runs the Fastify TypeScript API
3. `prime-postgres` — PostgreSQL 16 database
4. `prime-minio` — MinIO object storage

This matches the architecture recommendation in `README.md §20.1` and the confirmed Coolify server provisioning (supervisor, 2026-07-01).

Option B is formally rejected due to backup complexity, data-loss risk, and poor separation of concerns documented above.

---

## Consequences

### Positive

- Deployment is maintainable by the DevOps Agent and any future team member familiar with Docker Compose.
- PostgreSQL backup and restore procedures can follow the standard `pg_dump` / `pg_restore` path.
- MinIO backup can use `mc mirror` or volume snapshots.
- Each service can be restarted, upgraded, or replaced independently.
- Coolify's health checks, restart policies, environment variable management, and persistent volumes work as intended.
- HTTPS is handled by Coolify's reverse proxy — no TLS configuration needed in the application code.

### Negative / Mitigations

| Consequence | Mitigation |
|---|---|
| Four services to configure | Docker Compose file (`docker-compose.yml`) authored in Phase 6 by DevOps Agent; reviewed before staging deployment |
| Inter-service connection strings must be correct | `.env.example` documents all required variables; validated in Phase 6 foundation setup |
| Internal network requires correct service name resolution | Standard Docker Compose networking handles this; service names used as hostnames |

### Future Considerations

- If the system grows significantly, `prime-backend` can be horizontally scaled (multiple replicas) while `prime-postgres` and `prime-minio` remain single instances — consistent with this architecture.
- Read replicas for PostgreSQL or MinIO replication may be added in a future phase without changing the fundamental service topology.

---

## References

| Reference | Detail |
|---|---|
| `README.md §20.1` | Identifies Option A and Option B; recommends Option A |
| `README.md §20` | Architecture recommendation: "one Coolify project or one Docker Compose stack with separate services" |
| `README.md §27.2` | Coolify requirements — health checks, domain, HTTPS, persistent storage, restart policy |
| Coolify server | Provisioned and confirmed by supervisor, 2026-07-01 |
| Domain name | Confirmed by supervisor, 2026-07-01 |
| `docs/architecture/PRIME-v2-Architecture.md §9` | Full service map and network topology |

---

## Revision History

| Version | Summary | Author | Date |
|---|---|---|---|
| 1.0 | Initial ADR — Option A accepted, Option B rejected | Architect Agent | 2026-07-01 |
