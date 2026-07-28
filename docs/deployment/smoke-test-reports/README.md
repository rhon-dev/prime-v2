# Smoke Test Reports — PRIME v2 Staging

This folder stores artifacts produced by automated smoke tests for staging deployments. Keep a single report per deploy in a subfolder named by the date and image tag, for example:

`docs/deployment/smoke-test-reports/2026-07-28-rc-YYYYMMDD/`

Each report folder should include:

- `summary.md` — brief pass/fail summary and list of checks
- `artifacts/` — screenshots, Playwright traces, curl outputs
- `health.json` — output from /api/health
- `logs/` — relevant log snippets captured during the run

Example summary.md

- Deploy tag: rc-YYYYMMDD
- Time: 2026-07-28T15:00:00Z
- Result: PASS
- Checks executed:
  - health endpoint (OK)
  - staff login (OK)
  - applicant Google login (OK)
  - create proposal + save draft (OK)
  - submit proposal (OK)
  - workflow transition (OK)
  - file upload/download (OK)
  - export generation (OK)

Store smoke-test artifacts in the report folder and reference the folder in the Phase 16 sign-off request.
