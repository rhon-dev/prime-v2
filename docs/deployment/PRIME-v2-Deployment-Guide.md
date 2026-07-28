# PRIME v2 — Deployment Guide (Staging + Production)

Purpose

This guide documents how to deploy PRIME v2 to staging and production. It is an operator-run guide (DevOps / System Administrator). It contains no credentials or secret values — those live only in the environment secret store.

Scope

- Staging deployment (Phase 16) — primary focus of this document
- Production deployment (summary pointers; full production runbook is a separate document)

Prerequisites

- Access to the Coolify account/project for this organization with appropriate permissions
- DNS control for the staging domain (example: staging.prime.example.org)
- Container images for release candidate pushed to a registry (immutable tags)
- Access to managed Postgres or the chosen database offering and to MinIO or S3-compatible storage
- Shared list of environment variable NAMES (inventory) — see environment-variable-inventory.md

High-level flow

1. Create/configure the staging project in Coolify and add team members.
2. Provision DB (Postgres) and object storage (MinIO/S3). 
3. Add secrets/environment variables to Coolify secret store.
4. Deploy release-candidate images using immutable tags.
5. Run DB migrations and health checks.
6. Configure backups, monitoring, and alerts.
7. Run scripted smoke tests and capture artifacts.
8. Execute backup->restore and rollback dry-runs.
9. Request sign-offs and hand off to UAT (Phase 17) after Security and Product approval.

Release candidate artifacts

- Registry path(s) and tag names (example only — DO NOT include secret tokens):
  - ghcr.io/<org>/prime-backend:rc-YYYYMMDD
  - ghcr.io/<org>/prime-frontend:rc-YYYYMMDD

Deploy checklist (operator)

- Confirm image tags are available in registry
- Confirm DNS entry for staging domain exists and points to Coolify
- Confirm secrets names are present in inventory and values are ready for Coolify secret store
- Deploy backend with env vars wired to secret store
- Deploy frontend; ensure no server-side secrets bundled into assets
- Run migrations: `npx prisma migrate deploy` (backend container)
- Validate health endpoint: `curl -fsS https://staging.example.org/api/health`
- Run smoke tests (see smoke-test-reports)

Rollback and upgrade strategy

- Use immutable image tags for deployments. To rollback, redeploy the previous immutable tag.
- If migrations are not backward compatible, restore database snapshot to a pre-deploy backup and redeploy the previous image.
- Rollback runbook is documented in rollback-procedure.md and must be dry-run before sign-off.

Where to find logs and artifacts

- Coolify build and deploy logs (primary)
- Centralized log sink (if configured) — link or location
- Smoke-test artifacts: docs/deployment/smoke-test-reports/

Contacts and escalation

- DevOps Agent: @devops
- System Administrator: @sysadmin
- Security Owner: @security
- Product Owner: @product

(Placeholders above should be replaced with team members or on-call rotation links.)


---

Last updated: (fill date) — commit PR with updates when you change process steps or commands.