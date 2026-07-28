# Draft: Finalize Phase 16 — Staging Deployment

This draft PR collects the artifacts and checklist required to close Phase 16 (Staging Deployment). It is a work-in-progress placeholder. Do not merge until all artifacts are present and Security + Product have signed off.

What this draft will include (placeholders)

- Smoke-test report folder: docs/deployment/smoke-test-reports/<date>-rc-<tag>/ (placeholder)
- Backup->restore report: docs/deployment/backup-restore/<date>-rc-<tag>/ (placeholder)
- Rollback report: docs/deployment/rollback/<date>-rc-<tag>/ (placeholder)
- Security sign-off: (PR comment or signed checklist) — placeholder
- Product Owner approval: (PR comment) — placeholder

Checklist to complete before final approval

- [ ] Coolify staging project provisioned and domain DNS set
- [ ] HTTPS enabled with valid cert
- [ ] Postgres & MinIO provisioned with backups and retention
- [ ] Secrets configured in Coolify and GitHub Secrets
- [ ] Release-candidate images deployed with immutable tags
- [ ] DB migrations run successfully on staging
- [ ] Playwright smoke tests executed and PASS
- [ ] Backup -> restore executed and PASS on restored clone
- [ ] Rollback dry-run executed and PASS
- [ ] Security Agent sign-off recorded
- [ ] Product Owner sign-off recorded
- [ ] PHASES-REFERENCE.md updated to mark Phase 16 closed
- [ ] TEST-MATRIX.md updated for Phase 16 rows

Notes

- Do not include secret values in any file or commit.
- Place real artifacts under the indicated folders. Replace placeholders with actual relative paths.

Instructions for the reviewer/operator

1. Upload the smoke-test artifacts to docs/deployment/smoke-test-reports/<date>-rc-<tag>/
2. Upload backup/restore logs to docs/deployment/backup-restore/<date>-rc-<tag>/
3. Upload rollback logs to docs/deployment/rollback/<date>-rc-<tag>/
4. Reply to this PR with Security Agent and Product Owner sign-off comments (copy the PR sign-off template if needed).
5. After sign-offs, update PHASES-REFERENCE.md and TEST-MATRIX.md to mark Phase 16 closed and reference the artifact paths.
6. Merge this PR to record final state.
