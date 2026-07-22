# Container Restart Policy

## What the policy does

All four services (`prime-backend`, `prime-frontend`, `prime-postgres`, `prime-minio`) use
`restart: unless-stopped`.

This policy fires on **any process-level exit** that is not an explicit operator stop:

- Process crashes (unhandled exceptions, fatal errors)
- OOM kills
- Node/postgres/minio process exiting with any non-zero code
- Docker daemon restart (e.g. after a host reboot)

The container **will not** restart after:

- `docker stop <container>` — graceful SIGTERM→SIGKILL sequence, treated as intentional
- `docker kill <container>` — external SIGKILL, also treated as intentional
- `docker compose down` — intentional teardown

This is correct Docker behavior, not a misconfiguration. `docker kill` bypasses the restart
logic by design — it is the operator's explicit "stop this now" command.

## What this means in practice

### Local development

If a service crashes naturally (e.g. the backend throws an unhandled exception and the
Node process exits), it will restart automatically within a few seconds.

If you run `docker compose kill prime-backend` to test something, the container stays
stopped — use `docker compose start prime-backend` or `docker compose up -d prime-backend`
to bring it back. This is intentional.

### Production (Coolify)

Coolify manages container lifecycle through its own watchdog, which runs on top of Docker.
Coolify monitors service health independently of Docker's restart policy:

- If a container exits due to a crash, both Docker's `restart: unless-stopped` *and*
  Coolify's watchdog will attempt recovery.
- If a container is stopped via the Coolify dashboard, Coolify marks it as intentionally
  stopped and does not restart it (same intent-detection as `docker stop`).
- If Coolify itself is restarted (e.g. host reboot), it re-evaluates the desired state of
  all managed services on startup and restarts any that should be running.

**Verify with:** `coolify logs <service>` if a service appears stopped in the Coolify
dashboard — the logs will show whether it was stopped intentionally or crashed.

## Live-tested behavior (2026-07-22 QA)

Tested in Docker Desktop (macOS) using a busybox container with `--restart unless-stopped`:

| Trigger | Result |
|---|---|
| `docker kill` (external SIGKILL) | Container stays `Exited (137)` — policy does NOT restart. Correct. |
| Process exits internally (`exit 1`) | Container restarts automatically. `RestartCount=2` after 6s. |

The original QA finding used `docker compose kill` (external SIGKILL path) and concluded
the restart policy "didn't work." The finding was testing the wrong failure mode. Real
production crashes (process-level exits) trigger the policy correctly.

## Recovery commands

If a container is stopped and needs to be brought back manually:

```bash
# Bring back a single stopped service
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d <service-name>

# Bring back all services
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## What this plan does NOT cover

- Coolify-level health monitoring dashboards (out of scope until a Coolify instance exists)
- Auto-scaling or multi-replica recovery (not part of this deployment)
- External process supervisors (systemd, supervisord) — not used here; Docker handles restart
