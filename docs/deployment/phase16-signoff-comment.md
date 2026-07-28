Phase 16 Staging deployment: Request for Security + Product sign-off

Summary

Phase 16 (Staging Deployment) artifacts have been prepared and are ready for validation. This PR contains:

- Deployment guide and checklist: docs/deployment/PRIME-v2-Deployment-Guide.md
- Staging checklist: docs/deployment/staging-environment-checklist.md
- Rollback procedure: docs/deployment/rollback-procedure.md
- Environment variable inventory: docs/deployment/environment-variable-inventory.md
- Playwright smoke-test scaffold: tools/smoke/playwright/
- CI workflow to run smoke tests: .github/workflows/staging-smoke.yml (and self-hosted fallback .github/workflows/staging-smoke-selfhosted.yml)

Requested actions for Security and Product

Security Agent (@security):
- Review the security checklist and confirm OAuth client separation, secret handling, rate limiting, secure headers, inactive-user checks, and logs. Mark sign-off in this PR by replying with the checklist status and any remaining findings.

Product Owner (@product):
- After Security sign-off and successful smoke tests + backup/restore + rollback dry-run, please confirm acceptance so we can close Phase 16 and promote to Phase 17 (UAT).

Artifacts to attach

- Smoke-test report folder: docs/deployment/smoke-test-reports/<date>-rc-<tag>/
- Backup->restore report: docs/deployment/backup-restore/<date>-rc-<tag>/
- Rollback report: docs/deployment/rollback/<date>-rc-<tag>/

Suggested comment to approve and close Phase 16

Security Agent: "Security review completed, no open findings. Signed off: [name/date]"
Product Owner: "Staging validated, smoke tests and backups passed. Approved for UAT: [name/date]"

If there are objections or findings, please list them here and tag the responsible owner.