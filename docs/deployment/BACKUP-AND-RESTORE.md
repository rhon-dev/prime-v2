# Backup and Restore

This document tells you exactly how to back up and restore PRIME v2's two data stores
(PostgreSQL and MinIO) and how to verify a restore succeeded. These procedures were
live-tested on 2026-07-22 and confirmed working.

---

## Overview

| Store | Backup tool | Format | Restore tool | Live-tested restore time |
|---|---|---|---|---|
| PostgreSQL (`primev2` DB) | `pg_dump --format=custom` | Binary `.dump` | `pg_restore` | ~1s (7 proposals, 16 users) |
| MinIO (`prime-attachments` bucket) | `mc mirror` | Object copy | `mc mirror` | ~1s (35 objects) |

Both stores must be backed up together for a consistent restore point.

**Who owns this process:** DevOps / system administrator
**Recommended backup frequency:** daily at minimum; before any migration or deployment
**Recommended restore test frequency:** monthly (or after every major deployment)

---

## 1. Back up PostgreSQL

```bash
# Run inside the prime-postgres container.
# Replace /tmp/primev2_backup.dump with your target path.
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  pg_dump -U primev2_user -d primev2 --format=custom -f /tmp/primev2_backup.dump

# Copy the dump file out of the container to your local machine (or backup storage).
docker cp \
  $(docker compose -f docker-compose.yml -f docker-compose.dev.yml ps -q prime-postgres):/tmp/primev2_backup.dump \
  ./primev2_backup_$(date +%Y%m%d_%H%M%S).dump
```

The `--format=custom` flag creates a compressed binary dump that `pg_restore` can
use selectively. It is smaller than plain SQL and faster to restore.

---

## 2. Back up MinIO

```bash
# Set up the MinIO client alias (once per session; uses credentials from .env).
source .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-minio \
  mc alias set local http://localhost:9000 "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

# Mirror the bucket to a backup bucket (or to a local path if mc has host access).
# This copies all objects; re-running it only copies new/changed objects (incremental).
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-minio \
  mc mirror local/prime-attachments local/prime-attachments-backup-$(date +%Y%m%d)
```

For offsite backup, use `mc mirror` to an S3-compatible remote:

```bash
# Add a remote alias once:
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-minio \
  mc alias set remote https://your-s3-endpoint ACCESS_KEY SECRET_KEY

# Then mirror:
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-minio \
  mc mirror local/prime-attachments remote/your-backup-bucket
```

---

## 3. Restore PostgreSQL

**This restores into a clean, empty database. Existing data in the target DB is replaced.**

```bash
# 1. Copy the dump file into the container.
docker cp ./primev2_backup.dump \
  $(docker compose -f docker-compose.yml -f docker-compose.dev.yml ps -q prime-postgres):/tmp/primev2_backup.dump

# 2. Drop and recreate the target database (adapt if restoring to a different DB name).
#    WARNING: this destroys all existing data in primev2.
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  psql -U primev2_user -d postgres -c "DROP DATABASE IF EXISTS primev2;"
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  psql -U primev2_user -d postgres -c "CREATE DATABASE primev2;"

# 3. Restore.
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  pg_restore -U primev2_user -d primev2 /tmp/primev2_backup.dump

# 4. Verify: row counts must match backup source (adapt numbers to your dataset).
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  psql -U primev2_user -d primev2 -tAc \
  "select (select count(*) from users), (select count(*) from proposals), (select count(*) from proposal_versions);"
```

Expected output looks like: `16|7|7` (your numbers will differ — just confirm they match
what you expect from the backup source).

**To restore into a separate database for verification** (without touching the live DB):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  psql -U primev2_user -d postgres -c "CREATE DATABASE restore_test;"

docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  pg_restore -U primev2_user -d restore_test /tmp/primev2_backup.dump

# Check counts match live DB:
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  psql -U primev2_user -d restore_test -tAc \
  "select (select count(*) from users), (select count(*) from proposals);"

# Clean up test DB when satisfied:
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-postgres \
  psql -U primev2_user -d postgres -c "DROP DATABASE restore_test;"
```

---

## 4. Restore MinIO

```bash
# Mirror from backup bucket back to the live bucket.
# Objects already in the live bucket that are also in the backup are skipped (idempotent).
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-minio \
  mc mirror local/prime-attachments-backup-YYYYMMDD local/prime-attachments

# Verify object count matches:
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T prime-minio \
  mc ls local/prime-attachments --recursive | wc -l
```

---

## 5. Verifying a successful restore

A restore is considered successful when:

1. `pg_restore` exits 0 (no error output)
2. Row counts in key tables (`users`, `proposals`, `proposal_versions`) match the source
3. `mc ls --recursive | wc -l` on the restored bucket matches the source object count
4. Application starts and `GET /health` returns `{"status":"ok"}`
5. At least one proposal detail page loads correctly (manual spot-check)

---

## Notes

- The backend container must be stopped before restoring the live database if live traffic
  is running, to avoid writes during restore: `docker compose stop prime-backend`
- Restart the backend after restore: `docker compose up -d prime-backend`
- The `session` table is included in the dump but sessions from before the restore point
  will be invalid — users will be forced to log in again after a restore, which is correct.
- MinIO volumes are Docker named volumes (`prime-minio-data`). The `mc mirror` approach
  above works without needing to access the volume directly.
