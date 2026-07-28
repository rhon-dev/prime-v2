# Staging Environment Checklist — PRIME v2

This checklist is a concise runbook for standing up or validating the staging environment (Phase 16). Use it during the deployment window and attach evidence (screenshots, logs, command output).

Essentials

- [ ] Coolify project created: `prime-v2-staging`
- [ ] Staging domain created and DNS pointing to Coolify (CNAME/A records verified)
- [ ] Team membership: DevOps & SysAdmin (edit), Product Owner (view)
- [ ] HTTPS enabled (valid cert) and forced
- [ ] Health checks configured and reachable: `/api/health`

Database

- [ ] Postgres instance provisioned for staging
- [ ] Credentials stored in Coolify secret store
- [ ] Network rules: only backend service can access DB
- [ ] Automated backups enabled with retention policy
- [ ] Point-in-time recovery enabled if available

Object storage (MinIO)

- [ ] MinIO or S3 bucket provisioned: `prime-attachments-staging`
- [ ] Access/secret keys stored in secret store
- [ ] Bucket policies configured to prevent public listing
- [ ] MinIO public endpoint configured for presigned URLs
- [ ] Backups/replication configured and tested

Secrets & env vars

- [ ] Environment variables added to inventory (names only)
- [ ] All secret values added to Coolify secret store (do not commit)
- [ ] Google OAuth client ID/secret separate from prod/dev
- [ ] SMTP credentials added for staging

Security

- [ ] Secure headers enabled (HSTS, CSP, X-Frame-Options, Referrer-Policy)
- [ ] Rate limiting enabled on backend
- [ ] MinIO admin credentials are not exposed to frontend
- [ ] Inactive/deactivated user checks validated

Monitoring & logging

- [ ] Logs routed to centralized log provider (or Coolify logs archived)
- [ ] Metrics enabled and dashboard created (error rate, latency)
- [ ] Alerts configured (error spike, high latency, DB unreachable)

Backups & restore

- [ ] Backups configured for Postgres and MinIO
- [ ] Test restore performed (backup->restore cycle completed)
- [ ] Restore verification smoke tests passed against restored instance

Smoke tests

- [ ] Health endpoint OK
- [ ] Staff login (email/password) — pass
- [ ] Applicant Google login — pass
- [ ] Create proposal + save draft — pass
- [ ] Submit proposal — pass
- [ ] Workflow transition (one role) — pass
- [ ] File upload/download via presigned URL — pass
- [ ] Export trigger (/api/export) produces retrievable artifact — pass

Rollback

- [ ] Rollback procedure documented and available
- [ ] Rollback dry-run executed and validated

Sign-off

- [ ] Security Agent sign-off
- [ ] DevOps Agent sign-off
- [ ] Product Owner sign-off (release to UAT)

Notes / evidence

- Attach smoke-test artifacts and links to logs here.