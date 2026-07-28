# Rollback Procedure — PRIME v2 Staging

Purpose

Document a safe, repeatable rollback procedure for staging deployments. This procedure covers two rollback types:

A. Application-level rollback (redeploy previous immutable image tag)
B. Schema-level rollback (restore DB and storage from snapshot)

Preconditions

- Previous known-good immutable image tag is available in registry
- Backups were taken immediately before deployment (DB snapshot + MinIO snapshot)
- Team on-call / approvers ready for the maintenance window

Application-level rollback (fast path)

1. Identify previous image tag, e.g., `ghcr.io/<org>/prime-backend:rc-YYYYMMDD-previous`.
2. In Coolify, update the backend service deployment to use the previous tag (or use the rollback button if provided).
3. Wait for deployment to finish and verify health endpoint: `curl -fsS https://staging.example.org/api/health`.
4. Run quick smoke tests (health, login, one API flow).
5. If OK, document time-to-rollback and close incident.

Schema-level rollback (when migrations are incompatible)

1. Put application into maintenance or readonly mode (if supported).
2. Restore Postgres from the snapshot taken before the release (follow DB provider console steps).
3. Restore MinIO bucket from its snapshot/replica into a fresh bucket or same bucket after confirming object consistency.
4. Re-deploy previous application image tag.
5. Run full smoke tests against restored instance.
6. If recovery is successful, exit maintenance mode and notify stakeholders.

Rollback dry-run guidance

- Perform a dry-run on a staging clone: restore backups to a temporary cluster and validate the smoke tests run.
- Capture timings for restore and application start; record any manual intervention steps.

Post-rollback steps

- Investigate root cause and determine whether forward fix (patch) or roll-forward migration is appropriate.
- If a forward fix is chosen, create a branch, implement fix, run tests, and deploy to staging for re-validation.
- Update this document with lessons learned (time, failures, manual steps).

Important notes

- Do not perform schema destructive actions in production without a tested rollback path.
- Always preserve the pre-deploy backup until the release is confirmed healthy for the agreed retention window.

Contacts

- DevOps Agent: @devops
- System Administrator: @sysadmin
- Database Owner: @dba
- Security Owner: @security