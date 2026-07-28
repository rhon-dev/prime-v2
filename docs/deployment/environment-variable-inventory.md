# Environment Variable Inventory — PRIME v2 (Staging)

This document lists the environment variable NAMES required by PRIME v2 for staging. Do NOT commit or store secret VALUES here.

Add values only in the Coolify secret store or the approved secret manager.

Core variables (names only)

- DATABASE_URL
- DATABASE_SSLMODE
- DATABASE_MAX_CONNECTIONS
- SESSION_SECRET
- JWT_SECRET

MinIO / Object storage

- MINIO_ENDPOINT
- MINIO_PUBLIC_ENDPOINT
- MINIO_ACCESS_KEY
- MINIO_SECRET_KEY
- MINIO_BUCKET

OAuth / Auth

- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- OAUTH_REDIRECT_URL

Email / Notifications

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- EMAIL_FROM_ADDRESS

Third-party / Monitoring

- SENTRY_DSN
- PROMETHEUS_PUSHGATEWAY_URL
- MONITORING_API_KEY

Other

- NODE_ENV (set to 'production' in staging environment)
- NEXT_PUBLIC_API_BASE_URL (frontend-only; ensure no secret included)

Guidelines

- Never commit real secret values to Git.
- Frontend-only variables must begin with NEXT_PUBLIC_ (or the project convention) and must not include secrets.
- All secret values must be rotated per org policy and stored in Coolify secret manager.

Add provider-specific variable names below (examples). Remove or edit entries as appropriate for your provider choices.

Provider-specific examples

AWS RDS (if using RDS):

- RDS_INSTANCE_IDENTIFIER
- RDS_ENDPOINT
- RDS_REGION

AWS S3 (if using S3 instead of MinIO):

- AWS_S3_BUCKET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

MinIO (self-hosted / container) extras:

- MINIO_ROOT_USER
- MINIO_ROOT_PASSWORD
- MINIO_REGION

SMTP provider (examples)

- SENDGRID_API_KEY
- MAILGUN_API_KEY
- SES_ACCESS_KEY_ID
- SES_SECRET_ACCESS_KEY

Monitoring / APM examples

- DATADOG_API_KEY
- SENTRY_DSN (already listed)

CI/CD / Registry

- CONTAINER_REGISTRY_URL
- CONTAINER_REGISTRY_USERNAME
- CONTAINER_REGISTRY_PASSWORD

Notes

- Only record variable NAMES here. Do not place values in this repository.
- Remove any provider-specific entries you do not use to keep the inventory concise.
- When onboarding a provider, add a quick note linking to the provider console and the team member who owns the credentials.